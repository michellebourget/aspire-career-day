import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const StudentSignupForm = () => {
  const [student, setStudent] = useState({ name: '', email: '', sessions: [] });
  const [sessions, setSessions] = useState([]);
  const [signups, setSignups] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [deadlinePassed, setDeadlinePassed] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const sessionsSnap = await getDocs(collection(db, 'sessions'));
      const sessionData = sessionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSessions(sessionData);

      const signupsSnap = await getDocs(collection(db, 'signups'));
      const signupData = signupsSnap.docs.map(doc => doc.data());
      setSignups(signupData);

      const deadlineDoc = await getDocs(query(collection(db, 'settings')));
      const deadline = deadlineDoc.docs.find(doc => doc.id === 'signup')?.data()?.deadline;
      if (deadline && Timestamp.now().toDate() > deadline.toDate()) {
        setDeadlinePassed(true);
      }
    };

    fetchData();
  }, []);

  const toggleSession = (sessionName) => {
    setStudent(prev => {
      const exists = prev.sessions.includes(sessionName);
      const updated = exists
        ? prev.sessions.filter(s => s !== sessionName)
        : [...prev.sessions, sessionName];

      return { ...prev, sessions: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!student.name || !student.email) {
      return setError('Please enter your name and email.');
    }
    if (student.sessions.length !== 3) {
      return setError('Please select exactly 3 sessions.');
    }

    try {
      await addDoc(collection(db, 'signups'), student);
      setSubmitted(true);
      setError('');
    } catch (err) {
      console.error('Error saving signup:', err);
      setError('Something went wrong. Please try again.');
    }
  };

  const getRemainingSpots = (sessionName, capacity) => {
    const enrolled = signups.filter(s => s.sessions?.includes(sessionName)).length;
    return capacity - enrolled;
  };

  if (deadlinePassed) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}><h3>Signups are now closed.</h3></div>;
  }

  if (submitted) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}><h3>✅ Thank you for signing up!</h3></div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Student Signup</h2>
      <form onSubmit={handleSubmit}>
        <label>Name:</label>
        <input
          type="text"
          value={student.name}
          onChange={e => setStudent({ ...student, name: e.target.value })}
        />

        <label>Email:</label>
        <input
          type="email"
          value={student.email}
          onChange={e => setStudent({ ...student, email: e.target.value })}
        />

        <p style={{ marginTop: '1rem' }}><strong>Select 3 sessions:</strong></p>
        {sessions.map(session => {
          const isChecked = student.sessions.includes(session.name);
          const spotsLeft = getRemainingSpots(session.name, session.capacity);

          return (
            <div key={session.id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleSession(session.name)}
                  disabled={
                    (!isChecked && student.sessions.length >= 3) ||
                    spotsLeft <= 0
                  }
                  style={{ marginRight: '1rem' }}
                />
                <div>
                  <strong>{session.name}</strong>
                  <div style={{ fontSize: '0.9rem', color: '#555', marginTop: '0.25rem' }}>
                    {session.description || 'No description provided.'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: spotsLeft <= 0 ? 'red' : '#666', marginTop: '0.25rem' }}>
                    {spotsLeft > 0
                      ? `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left`
                      : 'Full'}
                  </div>
                  {session.imageUrl && (
                    <img src={session.imageUrl} alt={session.name} style={{ marginTop: '0.5rem', maxWidth: '100%', borderRadius: '6px' }} />
                  )}
                </div>
              </label>
            </div>
          );
        })}

        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
        <button type="submit" style={{ marginTop: '1rem' }}>Submit</button>
      </form>
    </div>
  );
};

export default StudentSignupForm;
