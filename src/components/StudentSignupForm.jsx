import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, query, where, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const StudentSignupForm = () => {
  const [sessions, setSessions] = useState([]);
  const [signups, setSignups] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedSessions, setSelectedSessions] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [signupDeadlinePassed, setSignupDeadlinePassed] = useState(false);
  const [existingDocId, setExistingDocId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const sessionSnapshot = await getDocs(collection(db, 'sessions'));
      const signupSnapshot = await getDocs(collection(db, 'signups'));
      setSessions(sessionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setSignups(signupSnapshot.docs.map(doc => doc.data()));

      const deadlineDoc = await getDoc(doc(db, 'settings', 'signup'));
      if (deadlineDoc.exists()) {
        const deadline = deadlineDoc.data().deadline?.toDate();
        const now = new Date();
        if (deadline && now > deadline) {
          setSignupDeadlinePassed(true);
        }
      }
    };

    fetchData();
  }, []);

  const getSignupCount = (sessionName) => {
    return signups.filter(s => s.sessions?.includes(sessionName)).length;
  };

  const isSessionFull = (session) => {
    const count = getSignupCount(session.name);
    return session.capacity && count >= session.capacity;
  };

  const handleSelect = (sessionName) => {
    if (selectedSessions.includes(sessionName)) {
      setSelectedSessions(prev => prev.filter(s => s !== sessionName));
    } else {
      if (selectedSessions.length >= 3) return alert('You can only select 3 sessions.');
      setSelectedSessions(prev => [...prev, sessionName]);
    }
  };

  const loadExistingSignup = async (email) => {
    const q = query(collection(db, 'signups'), where('email', '==', email));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docData = snapshot.docs[0].data();
      setName(docData.name);
      setSelectedSessions(docData.sessions);
      setExistingDocId(snapshot.docs[0].id);
    }
  };

  const handleEmailBlur = () => {
    if (email) {
      loadExistingSignup(email);
    }
  };

  const handleSubmit = async () => {
    if (!name || !email || selectedSessions.length === 0) {
      alert('Please complete all fields and select at least one session.');
      return;
    }

    const signupData = { name, email, sessions: selectedSessions };

    try {
      if (existingDocId) {
        await updateDoc(doc(db, 'signups', existingDocId), signupData);
      } else {
        await addDoc(collection(db, 'signups'), signupData);
      }

      await fetch('/api/signup-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting signup:', err);
      alert('Something went wrong. Please try again.');
    }
  };

  if (signupDeadlinePassed) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Sign-ups are now closed.</h2>
        <p>The deadline to choose your sessions has passed.</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Thank you for signing up, {name}!</h2>
        <p>A confirmation has been sent to <strong>{email}</strong>.</p>

        <h3>Your Sessions:</h3>
        <ul>
          {selectedSessions.map((s, index) => (
            <li key={index}>{s}</li>
          ))}
        </ul>

        <button onClick={() => window.print()} style={{ marginTop: '1rem' }}>
          Print Confirmation
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Student Session Signup</h2>

      <input
        placeholder="Your Name"
        value={name}
        onChange={e => setName(e.target.value)}
        style={{ display: 'block', marginBottom: '10px' }}
      />
      <input
        placeholder="Your Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        onBlur={handleEmailBlur}
        style={{ display: 'block', marginBottom: '20px' }}
      />

      <h3>Select up to 3 sessions:</h3>
      {sessions.length === 0 ? <p>Loading sessions...</p> : (
        <div>
          {sessions.map(session => {
            const count = getSignupCount(session.name);
            const full = isSessionFull(session);
            return (
              <div
                key={session.id}
                style={{
                  border: '1px solid #ccc',
                  padding: '10px',
                  marginBottom: '10px',
                  background: selectedSessions.includes(session.name) ? '#e0ffe0' : '#fff'
                }}
              >
                <h4>{session.name}</h4>
                <p><strong>Teacher:</strong> {session.teacherEmail}</p>
                {session.description && <p><em>{session.description}</em></p>}
                {session.imageUrl && <img src={session.imageUrl} alt={session.name} style={{ maxWidth: '150px' }} />}
                <p><strong>Spots Filled:</strong> {count} / {session.capacity || '∞'}</p>
                {full ? (
                  <p style={{ color: 'red', fontWeight: 'bold' }}>Full</p>
                ) : (
                  <button
                    onClick={() => handleSelect(session.name)}
                    style={{ marginTop: '5px' }}
                  >
                    {selectedSessions.includes(session.name) ? 'Remove' : 'Select'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={handleSubmit}
        style={{ marginTop: '20px', padding: '0.5rem 1rem' }}
      >
        Submit
      </button>
    </div>
  );
};

export default StudentSignupForm;
