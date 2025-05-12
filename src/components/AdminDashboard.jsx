import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  useEffect(() => {
    // Fetch student signups
    const fetchSignups = async () => {
      const snapshot = await getDocs(collection(db, 'signups'));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStudents(data);
    };

    // Fetch all sessions
    const fetchSessions = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'sessions'));
        const sessionData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSessions(sessionData);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setLoadingSessions(false);
      }
    };

    fetchSignups();
    fetchSessions();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Admin Dashboard</h2>

      <button
        onClick={() => auth.signOut()}
        style={{
          marginBottom: '1rem',
          padding: '0.5rem 1rem',
          background: '#dc3545',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
        }}
      >
        Sign Out
      </button>

      {/* --- Student Signups --- */}
      <div style={{ marginBottom: '2rem' }}>
        <h3>All Student Signups</h3>
        {students.length === 0 ? (
          <p>No signups yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            {students.map((student) => (
              <li key={student.id} style={{ marginBottom: '1.5rem' }}>
                <strong>{student.name}</strong> — {student.email}
                {student.sessions && (
                  <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                    {student.sessions.map((session, index) => (
                      <li key={index}>🗓 {session}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* --- Sessions View --- */}
      <div>
        <h3>All Sessions</h3>
        {loadingSessions ? (
          <p>Loading sessions...</p>
        ) : sessions.length === 0 ? (
          <p>No sessions available.</p>
        ) : (
          <div>
            {sessions.map(session => (
              <div
                key={session.id}
                style={{
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '12px',
                  background: '#f9f9f9'
                }}
              >
                <h4>{session.name}</h4>
                <p><strong>Teacher:</strong> {session.teacherEmail}</p>
                <p>{session.description}</p>
                {session.imageUrl && (
                  <img
                    src={session.imageUrl}
                    alt={`${session.name} session`}
                    style={{ maxWidth: '150px', height: 'auto', marginTop: '8px' }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
