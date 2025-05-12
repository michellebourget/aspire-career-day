import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';

const TeacherDashboard = ({ user }) => {
  const [sessions, setSessions] = useState([]);
  const [signups, setSignups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.email) return;

      try {
        // Step 1: Get this teacher’s sessions
        const q = query(
          collection(db, 'sessions'),
          where('teacherEmail', '==', user.email)
        );
        const sessionSnapshot = await getDocs(q);
        const sessionData = sessionSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSessions(sessionData);

        // Step 2: Get all student signups
        const signupSnapshot = await getDocs(collection(db, 'signups'));
        const signupData = signupSnapshot.docs.map(doc => doc.data());
        setSignups(signupData);
      } catch (err) {
        console.error('Firestore fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Teacher Dashboard</h2>
      <p>Signed in as: {user.email}</p>

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
        <p style={{ marginTop: '2rem' }}>You don’t have any assigned sessions.</p>
      ) : (
        sessions.map(session => (
          <div key={session.id} style={{ marginTop: '2rem' }}>
            <h3>{session.name}</h3>
            <ul>
              {signups
                .filter(s => s.sessions?.includes(session.name))
                .map((s, i) => (
                  <li key={i}>
                    {s.name} — {s.email}
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

