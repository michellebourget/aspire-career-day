import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchSignups = async () => {
      const snapshot = await getDocs(collection(db, 'signups'));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStudents(data);
    };

    fetchSignups();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Admin Dashboard</h2>
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
  );
};

export default AdminDashboard;
