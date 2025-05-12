import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [signupsSnap, sessionsSnap, attendanceSnap] = await Promise.all([
          getDocs(collection(db, 'signups')),
          getDocs(collection(db, 'sessions')),
          getDocs(collection(db, 'attendance')),
        ]);

        setStudents(signupsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setSessions(sessionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setAttendanceRecords(attendanceSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const exportToCSV = (sessionId, sessionName) => {
    const rows = attendanceRecords
      .filter(record => record.sessionId === sessionId)
      .map(record => [record.studentEmail, record.present ? 'Present' : 'Absent']);

    const csvContent = [
      ['Student Email', 'Present'].join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${sessionName}-attendance.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading Admin Dashboard...</div>;

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

      {/* Student Signups */}
      <div style={{ marginBottom: '2rem' }}>
        <h3>All Student Signups</h3>
        {students.length === 0 ? <p>No signups yet.</p> : (
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

      {/* Sessions View */}
      <div style={{ marginBottom: '2rem' }}>
        <h3>All Sessions</h3>
        {sessions.length === 0 ? <p>No sessions available.</p> : (
          sessions.map(session => (
            <div key={session.id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', marginBottom: '12px', background: '#f9f9f9' }}>
              <h4>{session.name}</h4>
              <p><strong>Teacher:</strong> {session.teacherEmail}</p>
              <p>{session.description}</p>
              {session.imageUrl && <img src={session.imageUrl} alt={session.name} style={{ maxWidth: '150px' }} />}
            </div>
          ))
        )}
      </div>

      {/* Signups per Session */}
      <div style={{ marginBottom: '2rem' }}>
        <h3>Signups Per Session</h3>
        {sessions.map(session => {
          const signedUp = students.filter(s => s.sessions?.includes(session.name));
          return (
            <div key={session.id} style={{ borderTop: '2px solid #007bff', marginTop: '1rem', paddingTop: '1rem' }}>
              <h4>{session.name}</h4>
              {signedUp.length === 0 ? <p>No students signed up.</p> : (
                <ul>
                  {signedUp.map(s => <li key={s.email}>{s.name} — {s.email}</li>)}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* Attendance Records */}
      <div>
        <h3>Attendance Records</h3>
        {sessions.map(session => {
          const records = attendanceRecords.filter(r => r.sessionId === session.id);
          return (
            <div key={session.id} style={{ borderTop: '2px solid green', marginTop: '1rem', paddingTop: '1rem' }}>
              <h4>{session.name}</h4>
              {records.length === 0 ? <p>No attendance recorded.</p> : (
                <>
                  <ul>
                    {records.map((r, i) => (
                      <li key={i}>{r.studentEmail} — {r.present ? '✅ Present' : '❌ Absent'}</li>
                    ))}
                  </ul>
                  <button
                    onClick={() => exportToCSV(session.id, session.name)}
                    style={{ marginTop: '0.5rem', padding: '0.4rem 0.8rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
                  >
                    Download CSV
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminDashboard;
