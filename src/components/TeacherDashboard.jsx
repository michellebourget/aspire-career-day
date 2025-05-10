import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

const TeacherDashboard = ({ user }) => {
  const [sessions, setSessions] = useState([]);
  const [signups, setSignups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.email) return;

      try {
        const sessionQuery = query(
          collection(db, 'sessions'),
          where('teacherEmail', '==', user.email)
        );
        const sessionSnapshot = await getDocs(sessionQuery);
        const teacherSessions = sessionSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSessions(teacherSessions);

        const sessionNames = teacherSessions.map(s => s.name);

        const signupSnapshot = await getDocs(collection(db, 'signups'));
        const allSignups = signupSnapshot.docs.map(doc => doc.data());

        const relevant = allSignups.filter(signup =>
          signup.sessions?.some(session => sessionNames.includes(session))
        );
        setSignups(relevant);
      } catch (err) {
        console.error('Error loading teacher data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) return <div style={{ padding: '20px' }}>Loading your sessions...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Teacher Dashboard</h2>
      <p>Welcome, {user.displayName || user.email}!</p>

      <button
        onClick={() => auth.signOut()}
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          background: '#dc3545',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
        }}
      >
        Sign Out
      </button>

      {sessions.length === 0 ? (
        <p style={{ marginTop: '2rem' }}>You have no assigned sessions.</p>
      ) : (
        sessions.map(session => (
          <div key={session.id} style={{ marginTop: '2rem' }}>
            <h3>{session.name}</h3>
            <ul style={{ paddingLeft: '1rem' }}>
              {signups
                .filter(signup => signup.sessions.includes(session.name))
                .map((signup, i) => (
                  <li key={i}>
                    {signup.name} — {signup.email}
                  </li>
                ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
};

export default TeacherDashboard;
