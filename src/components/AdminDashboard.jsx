// Trigger redeploy
import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, deleteDoc, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [roleUpdates, setRoleUpdates] = useState({});
  const [loading, setLoading] = useState(true);
  const [newSession, setNewSession] = useState({ name: '', description: '', teacherEmail: '', imageUrl: '' });
  const [sessionEdits, setSessionEdits] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [signupsSnap, sessionsSnap, attendanceSnap, usersSnap] = await Promise.all([
          getDocs(collection(db, 'signups')),
          getDocs(collection(db, 'sessions')),
          getDocs(collection(db, 'attendance')),
          getDocs(collection(db, 'users')),
        ]);

        setStudents(signupsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setSessions(sessionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setAttendanceRecords(attendanceSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setUsers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const exportToCSV = (sessionId, sessionName) => {
    const rows = attendanceRecords
      .filter(record => record.sessionId === sessionId)
      .map(record => [record.studentEmail, record.present ? 'Present' : 'Absent']);

    const csvContent = [
      ['Student Email', 'Present'].join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${sessionName}-attendance.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRoleChange = (userId, newRole) => {
    setRoleUpdates(prev => ({ ...prev, [userId]: newRole }));
  };

  const handleUpdateRole = async (userId) => {
    const newRole = roleUpdates[userId];
    if (!newRole) return;
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      alert('Role updated successfully.');
    } catch (err) {
      console.error('Error updating role:', err);
      alert('Failed to update role.');
    }
  };

  const handleNewSessionChange = (e) => {
    const { name, value } = e.target;
    setNewSession(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSession = async () => {
    if (!newSession.name || !newSession.teacherEmail) return alert('Name and Teacher Email required');
    try {
      const docRef = await addDoc(collection(db, 'sessions'), newSession);
      setSessions(prev => [...prev, { ...newSession, id: docRef.id }]);
      setNewSession({ name: '', description: '', teacherEmail: '', imageUrl: '' });
    } catch (err) {
      console.error('Error adding session:', err);
    }
  };

  const handleEditSessionChange = (id, field, value) => {
    setSessionEdits(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleUpdateSession = async (sessionId) => {
    const updated = sessionEdits[sessionId];
    if (!updated) return;
    try {
      await updateDoc(doc(db, 'sessions', sessionId), updated);
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, ...updated } : s));
      alert('Session updated.');
    } catch (err) {
      console.error('Error updating session:', err);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this session?')) return;
    try {
      await deleteDoc(doc(db, 'sessions', sessionId));
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (err) {
      console.error('Error deleting session:', err);
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading Admin Dashboard...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Admin Dashboard</h2>
      <button
        onClick={() => auth.signOut()}
        style={{ marginBottom: '1rem', padding: '0.5rem 1rem', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px' }}
      >Sign Out</button>

      {/* --- All previous sections remain unchanged --- */}

      {/* --- Manage Sessions --- */}
      <div style={{ marginTop: '2rem' }}>
        <h3>Manage Sessions</h3>

        <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '6px' }}>
          <h4>Add New Session</h4>
          <input name="name" placeholder="Session Name" value={newSession.name} onChange={handleNewSessionChange} /><br />
          <input name="teacherEmail" placeholder="Teacher Email" value={newSession.teacherEmail} onChange={handleNewSessionChange} /><br />
          <input name="description" placeholder="Description" value={newSession.description} onChange={handleNewSessionChange} /><br />
          <input name="imageUrl" placeholder="Image URL" value={newSession.imageUrl} onChange={handleNewSessionChange} /><br />
          <button onClick={handleAddSession} style={{ marginTop: '0.5rem' }}>Add Session</button>
        </div>

        {sessions.map(session => (
          <div key={session.id} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '6px' }}>
            <h4>{session.name}</h4>
            <label>Name: <input value={sessionEdits[session.id]?.name || session.name} onChange={e => handleEditSessionChange(session.id, 'name', e.target.value)} /></label><br />
            <label>Teacher Email: <input value={sessionEdits[session.id]?.teacherEmail || session.teacherEmail} onChange={e => handleEditSessionChange(session.id, 'teacherEmail', e.target.value)} /></label><br />
            <label>Description: <input value={sessionEdits[session.id]?.description || session.description} onChange={e => handleEditSessionChange(session.id, 'description', e.target.value)} /></label><br />
            <label>Image URL: <input value={sessionEdits[session.id]?.imageUrl || session.imageUrl || ''} onChange={e => handleEditSessionChange(session.id, 'imageUrl', e.target.value)} /></label><br />
            <button onClick={() => handleUpdateSession(session.id)} style={{ marginTop: '0.5rem', marginRight: '0.5rem' }}>Update</button>
            <button onClick={() => handleDeleteSession(session.id)} style={{ marginTop: '0.5rem', backgroundColor: '#dc3545', color: 'white' }}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
