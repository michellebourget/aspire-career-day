import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, deleteDoc, addDoc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';

const AdminDashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [newSession, setNewSession] = useState({ name: '', description: '', teacherEmail: '', imageUrl: '', capacity: '' });
  const [sessionEdits, setSessionEdits] = useState({});
  const [signupEdits, setSignupEdits] = useState({});
  const [newSignup, setNewSignup] = useState({ name: '', email: '', sessions: [] });
  const [selectedFilter, setSelectedFilter] = useState('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const [sessionsSnap, attendanceSnap, signupsSnap] = await Promise.all([
        getDocs(collection(db, 'sessions')),
        getDocs(collection(db, 'attendance')),
        getDocs(collection(db, 'signups'))
      ]);

      const deadlineDoc = await getDoc(doc(db, 'settings', 'signup'));

      setSessions(sessionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setAttendanceRecords(attendanceSnap.docs.map(doc => doc.data()));
      setStudents(signupsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      if (deadlineDoc.exists()) {
        const deadlineTimestamp = deadlineDoc.data().deadline;
        if (deadlineTimestamp) {
          setDeadline(new Date(deadlineTimestamp.toDate()).toISOString().slice(0, 16));
        }
      }
    };
    fetchData();
  }, []);

  const handleDeadlineChange = (e) => {
    setDeadline(e.target.value);
  };

  const saveDeadline = async () => {
    if (!deadline) return;
    try {
      await setDoc(doc(db, 'settings', 'signup'), {
        deadline: new Date(deadline)
      });
      alert('Signup deadline updated successfully.');
    } catch (err) {
      console.error('Error saving deadline:', err);
      alert('Failed to save deadline.');
    }
  };

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

  const handleSignupChange = (id, field, value) => {
    setSignupEdits(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleUpdateSignup = async (id) => {
    const updated = signupEdits[id];
    if (!updated || updated.sessions.length > 3) return alert('Max 3 sessions');
    try {
      await updateDoc(doc(db, 'signups', id), updated);
      setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
      alert('Signup updated.');
    } catch (err) {
      console.error('Error updating signup:', err);
    }
  };

  const handleDeleteSignup = async (id) => {
    if (!window.confirm('Delete this student signup?')) return;
    try {
      await deleteDoc(doc(db, 'signups', id));
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Error deleting signup:', err);
    }
  };

  const handleNewSignupChange = (field, value) => {
    setNewSignup(prev => ({ ...prev, [field]: value }));
  };

  const handleNewSignupSessionToggle = (sessionName) => {
    setNewSignup(prev => {
      const exists = prev.sessions.includes(sessionName);
      return {
        ...prev,
        sessions: exists ? prev.sessions.filter(s => s !== sessionName) : [...prev.sessions, sessionName]
      };
    });
  };

  const handleAddSignup = async () => {
    if (!newSignup.name || !newSignup.email || newSignup.sessions.length === 0 || newSignup.sessions.length > 3) return alert('All fields required, max 3 sessions');
    try {
      const docRef = await addDoc(collection(db, 'signups'), newSignup);
      setStudents(prev => [...prev, { ...newSignup, id: docRef.id }]);
      setNewSignup({ name: '', email: '', sessions: [] });
      alert('Student added.');
    } catch (err) {
      console.error('Error adding student:', err);
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
      >Sign Out</button>

      {/* Settings */}
      <div style={{ marginBottom: '2rem' }}>
        <h3>Signup Deadline</h3>
        <input type="datetime-local" value={deadline} onChange={handleDeadlineChange} />
        <button onClick={saveDeadline} style={{ marginLeft: '1rem' }}>Save Deadline</button>
      </div>

      {/* Manage Sessions */}
      <div>
        <h3>Manage Sessions</h3>
        <div style={{ marginBottom: '1rem' }}>
          <h4>Add New Session</h4>
          <input name="name" placeholder="Session Name" value={newSession.name} onChange={handleNewSessionChange} /><br />
          <input name="teacherEmail" placeholder="Teacher Email" value={newSession.teacherEmail} onChange={handleNewSessionChange} /><br />
          <input name="description" placeholder="Description" value={newSession.description} onChange={handleNewSessionChange} /><br />
          <input name="imageUrl" placeholder="Image URL" value={newSession.imageUrl} onChange={handleNewSessionChange} /><br />
          <input name="capacity" type="number" placeholder="Capacity" value={newSession.capacity} onChange={handleNewSessionChange} /><br />
          <button onClick={handleAddSession}>Add Session</button>
        </div>

        {sessions.map(session => (
          <div key={session.id} style={{ marginBottom: '1rem' }}>
            <h4>{session.name}</h4>
            <input value={sessionEdits[session.id]?.name ?? session.name} onChange={e => handleEditSessionChange(session.id, 'name', e.target.value)} placeholder="Name" /><br />
            <input value={sessionEdits[session.id]?.teacherEmail ?? session.teacherEmail} onChange={e => handleEditSessionChange(session.id, 'teacherEmail', e.target.value)} placeholder="Teacher Email" /><br />
            <input value={sessionEdits[session.id]?.description ?? session.description} onChange={e => handleEditSessionChange(session.id, 'description', e.target.value)} placeholder="Description" /><br />
            <input value={sessionEdits[session.id]?.imageUrl ?? (session.imageUrl || '')} onChange={e => handleEditSessionChange(session.id, 'imageUrl', e.target.value)} placeholder="Image URL" /><br />
            <input type="number" value={sessionEdits[session.id]?.capacity ?? (session.capacity || 0)} onChange={e => handleEditSessionChange(session.id, 'capacity', e.target.value)} placeholder="Capacity" /><br />
            <button onClick={() => handleUpdateSession(session.id)}>Update</button>
            <button onClick={() => handleDeleteSession(session.id)} style={{ backgroundColor: '#dc3545', color: '#fff' }}>Delete</button>
          </div>
        ))}
      </div>

      {/* Manage Student Signups */}
      <div style={{ marginTop: '2rem' }}>
        <h3>Manage Student Signups</h3>

        <div style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
          <h4>Add New Student</h4>
          <input placeholder="Name" value={newSignup.name} onChange={e => handleNewSignupChange('name', e.target.value)} /><br />
          <input placeholder="Email" value={newSignup.email} onChange={e => handleNewSignupChange('email', e.target.value)} /><br />
          <p>Select up to 3 sessions:</p>
          {sessions.map(session => (
            <label key={session.name} style={{ display: 'block' }}>
              <input
                type="checkbox"
                checked={newSignup.sessions.includes(session.name)}
                onChange={() => handleNewSignupSessionToggle(session.name)}
              /> {session.name}
            </label>
          ))}
          <button onClick={handleAddSignup} style={{ marginTop: '0.5rem' }}>Add Student</button>
        </div>

        {students.map(student => {
          const current = signupEdits[student.id] || student;
          return (
            <div key={student.id} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ccc' }}>
              <input value={current.name} onChange={e => handleSignupChange(student.id, 'name', e.target.value)} placeholder="Name" /><br />
              <input value={current.email} onChange={e => handleSignupChange(student.id, 'email', e.target.value)} placeholder="Email" /><br />
              <p>Sessions (max 3):</p>
              {sessions.map(session => (
                <label key={session.name} style={{ display: 'block' }}>
                  <input
                    type="checkbox"
                    checked={current.sessions?.includes(session.name)}
                    onChange={() => {
                      const updated = current.sessions?.includes(session.name)
                        ? current.sessions.filter(s => s !== session.name)
                        : [...(current.sessions || []), session.name];
                      handleSignupChange(student.id, 'sessions', updated);
                    }}
                  /> {session.name}
                </label>
              ))}
              <button onClick={() => handleUpdateSignup(student.id)}>Update</button>
              <button onClick={() => handleDeleteSignup(student.id)} style={{ backgroundColor: '#dc3545', color: '#fff', marginLeft: '0.5rem' }}>Delete</button>
            </div>
          );
        })}
      </div>

      {/* View Attendance */}
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
