// src/components/TeacherDashboard.jsx

import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  deleteDoc
} from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard = ({ user }) => {
  const [sessions, setSessions] = useState([]);
  const [signups, setSignups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.email) return;

      try {
        // Step 1: Fetch sessions
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

        // Step 2: Fetch signups
        const signupSnapshot = await getDocs(collection(db, 'signups'));
        const signupData = signupSnapshot.docs.map(doc => doc.data());
        setSignups(signupData);

        // Step 3: Fetch previously saved attendance
        const attendanceSnapshot = await getDocs(collection(db, 'attendance'));
        const attendanceData = {};

        attendanceSnapshot.forEach(doc => {
          const record = doc.data();
          if (!attendanceData[record.sessionId]) {
            attendanceData[record.sessionId] = {};
          }
          attendanceData[record.sessionId][record.studentEmail] = record.present;
        });

        setAttendance(attendanceData);
        console.log("Loaded attendance from Firestore:", attendanceData);

      } catch (err) {
        console.error('Firestore fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.email) {
      fetchData();
    }
  }, [user]);

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

  const handleSubmitAttendance = async (sessionId) => {
    const sessionAttendance = attendance[sessionId] || {};
    console.log("Submitting attendance for session:", sessionId);
    console.log("Data to write:", sessionAttendance);

    try {
      const q = query(
        collection(db, 'attendance'),
        where('sessionId', '==', sessionId)
      );
      const snapshot = await getDocs(q);
      const deletions = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletions);

      const writes = Object.entries(sessionAttendance).map(([email, present]) => {
        console.log("Saving to Firestore:", { sessionId, email, present });
        return addDoc(collection(db, 'attendance'), {
          sessionId,
          studentEmail: email,
          present,
          timestamp: new Date()
        });
      });

      await Promise.all(writes);
      console.log(`✅ Attendance for ${sessionId} saved.`);
    } catch (error) {
      console.error('❌ Error saving attendance:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      console.log("Signing out...");
      await auth.signOut();
      navigate('/');
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Teacher Dashboard</h2>
      <p>Signed in as: {user.email}</p>

      <button
        onClick={handleSignOut}
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
