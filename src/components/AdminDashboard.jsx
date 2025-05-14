import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, deleteDoc, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';

const AdminDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [newSession, setNewSession] = useState({ name: '', description: '', teacherEmail: '', imageUrl: '', capacity: '' });
  const [sessionEdits, setSessionEdits] = useState({});
  const [selectedFilter, setSelectedFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const sessionsSnap = await getDocs(collection(db, 'sessions'));
      const attendanceSnap = await getDocs(collection(db, 'attendance'));

      setSessions(sessionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setAttendanceRecords(attendanceSnap.docs.map(doc => doc.data()));
    };
    fetchData();
  }, []);

  const handleNewSessionChange = (e) => {
    const { name, value } = e.target;
    setNewSession(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSession = async () => {
    if (!newSession.name || !newSession.teacherEmail) return alert('Name and Teacher Email required');
    try {
      const docRef = await addDoc(collection(db, 'sessions'), {
        ...newSession,
        capacity: parseInt(newSession.capacity) || 0
      });
      setSessions(prev => [...prev, { ...newSession, id: docRef.id }]);
      setNewSession({ name: '', description: '', teacherEmail: '', imageUrl: '', capacity: '' });
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
      await updateDoc(doc(db, 'sessions', sessionId), {
        ...updated,
        capacity: parseInt(updated.capacity) || 0
      });
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

  const filteredAttendance = selectedFilter
    ? attendanceRecords.filter(record => {
        const session = sessions.find(s => s.id === record.sessionId);
        return session && (session.name === selectedFilter || session.teacherEmail === selectedFilter);
      })
    : attendanceRecords;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Admin Dashboard</h2>

      <button
        onClick={() => auth.signOut()}
        style={{ marginBottom: '1rem', padding: '0.5rem 1rem', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px' }}
      >
        Sign Out
      </button>

      {/* --- Manage Sessions --- */}
      <div style={{ marginTop: '2rem' }}>
        <h3>Manage Sessions</h3>

        <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '6px' }}>
          <h4>Add New Session</h4>
          <input name="name" placeholder="Session Name" value={newSession.name} onChange={handleNewSessionChange} /><br />
          <input name="teacherEmail" placeholder="Teacher Email" value={newSession.teacherEmail} onChange={handleNewSessionChange} /><br />
          <input name="description" placeholder="Description" value={newSession.description} onChange={handleNewSessionChange} /><br />
          <input name="imageUrl" placeholder="Image URL" value={newSession.imageUrl} onChange={handleNewSessionChange} /><br />
          <input name="capacity" type="number" placeholder="Capacity" value={newSession.capacity} onChange={handleNewSessionChange} /><br />
          <button onClick={handleAddSession} style={{ marginTop: '0.5rem' }}>Add Session</button>
        </div>

        {sessions.map(session => (
          <div key={session.id} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '6px' }}>
            <h4>{session.name}</h4>
            <label>Name: <input value={sessionEdits[session.id]?.name ?? session.name} onChange={e => handleEditSessionChange(session.id, 'name', e.target.value)} /></label><br />
            <label>Teacher Email: <input value={sessionEdits[session.id]?.teacherEmail ?? session.teacherEmail} onChange={e => handleEditSessionChange(session.id, 'teacherEmail', e.target.value)} /></label><br />
            <label>Description: <input value={sessionEdits[session.id]?.description ?? session.description} onChange={e => handleEditSessionChange(session.id, 'description', e.target.value)} /></label><br />
            <label>Image URL: <input value={sessionEdits[session.id]?.imageUrl ?? (session.imageUrl || '')} onChange={e => handleEditSessionChange(session.id, 'imageUrl', e.target.value)} /></label><br />
            <label>Capacity: <input type="number" value={sessionEdits[session.id]?.capacity ?? (session.capacity || 0)} onChange={e => handleEditSessionChange(session.id, 'capacity', e.target.value)} /></label><br />
            <button onClick={() => handleUpdateSession(session.id)} style={{ marginTop: '0.5rem', marginRight: '0.5rem' }}>Update</button>
            <button onClick={() => handleDeleteSession(session.id)} style={{ marginTop: '0.5rem', backgroundColor: '#dc3545', color: 'white' }}>Delete</button>
          </div>
        ))}
      </div>

      {/* --- Attendance Viewer --- */}
      <div style={{ marginTop: '3rem' }}>
        <h3>View Attendance</h3>
        <label>Filter by session or teacher: </label>
        <select value={selectedFilter} onChange={e => setSelectedFilter(e.target.value)}>
          <option value="">All</option>
          {sessions.map(session => (
            <React.Fragment key={session.id}>
              <option value={session.name}>{session.name}</option>
              <option value={session.teacherEmail}>{session.teacherEmail}</option>
            </React.Fragment>
          ))}
        </select>

        <ul style={{ marginTop: '1rem' }}>
          {filteredAttendance.map((record, index) => {
            const session = sessions.find(s => s.id === record.sessionId);
            return (
              <li key={index}>
                <strong>{record.studentEmail}</strong> — {record.present ? '✅ Present' : '❌ Absent'}
                {session && <span> ({session.name}, {session.teacherEmail})</span>}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;

