// src/components/TeacherDashboard.jsx

import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';

const TeacherDashboard = ({ user }) => {
  const [sessions, setSessions] = useState([]);
  const [signups, setSignups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.email) return;

      try {
        // Fetch sessions assigned to the teacher
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

        // Fetch all student signups
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

  // Handle attendance checkbox changes
  const handleAttendanceChange = (sessionId, studentEmail) => {
    setAttendance(prev => {
      const sessionAttendance = prev[sessionId] || {};
      return {
        ...prev,
        [sessionId]: {
          ...sessionAttendance,
          [studentEmail]: !sessionAttendance[studentEmail]
        }
      };
    });
  };

  // Optional: Submit attendance data
  const handleSubmitAttendance = (sessionId) => {
    const sessionAttendance = attendance[sessionId] || {};
    const presentStudents = Object.entries(sessionAttendance)
      .filter(([_, isPresent]) => isPresent)
      .map(([email]) => email);

    console.log(`Attendance for session ${sessionId}:`, presentStudents);
    // TODO: Send this data to your backend or Firestore
  };

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
        sessions.map(session => {
          const enrolledStudents = signups.filter(s => s.sessions?.includes(session.name));
          const sessionAttendance = attendance[session.id] || {};

          return (
            <div key={session.id} style={{ marginTop: '2rem' }}>
              <h3>{session.name}</h3>
              {enrolledStudents.length === 0 ? (
                <p>No students signed up for this session.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Student Email</th>
                      <th>Present</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrolledStudents.map((student, i) => (
                      <tr key={i}>
                        <td>{student.name}</td>
                        <td>{student.email}</td>
                        <td>
                          <input
                            type="checkbox"
                            checked={!!sessionAttendance[student.email]}
                            onChange={() => handleAttendanceChange(session.id, student.email)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <button
                onClick={() => handleSubmitAttendance(session.id)}
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  background: '#28a745',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                }}
              >
                Submit Attendance
              </button>
            </div>
          );
        })
      )}
    </div>
  );
};

export default TeacherDashboard;
