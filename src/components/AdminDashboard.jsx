import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase.js';

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      const querySnapshot = await getDocs(collection(db, 'signups'));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(data);
    };

    fetchStudents();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Admin Dashboard</h2>
      {students.length === 0 ? (
        <p>No signups yet.</p>
      ) : (
        <ul>
          {students.map(student => (
            <li key={student.id} style={{ marginBottom: '1rem' }}>
              <strong>{student.name}</strong> — {student.email}
              {student.sessions && student.sessions.length > 0 && (
                <ul style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
                  {student.sessions.map((s, index) => (
                    <li key={index}>🗓 {s}</li>
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

