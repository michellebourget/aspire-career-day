import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const TeacherDashboard = ({ user }) => {
  const [sessions, setSessions] = useState([]);
  const [signups, setSignups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.email) return;

      try {
        const q = query(
          collection(db, 'sessions'),
          where('teacherEmail', '==', user.email)
        );
        const snapshot = await getDocs(q);
        const sessionData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSessions(sessionData);
        setLoading(false);
      } catch (err) {
        console.error('Firestore fetch error:', err);
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

      {sessions.length === 0 ? (
        <p>No sessions found for this teacher.</p>
      ) : (
        <ul>
          {sessions.map(session => (
            <li key={session.id}>{session.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TeacherDashboard;
