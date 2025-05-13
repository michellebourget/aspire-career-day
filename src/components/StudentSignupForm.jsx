import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const StudentSignupForm = () => {
  const [sessions, setSessions] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedSessions, setSelectedSessions] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchSessions = async () => {
      const snapshot = await getDocs(collection(db, 'sessions'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSessions(data);
    };
    fetchSessions();
  }, []);

  const handleSelect = (sessionName) => {
    if (selectedSessions.includes(sessionName)) {
      setSelectedSessions(prev => prev.filter(s => s !== sessionName));
    } else {
      if (selectedSessions.length >= 3) return alert('You can only select 3 sessions.');
      setSelectedSessions(prev => [...prev, sessionName]);
    }
  };

  const handleSubmit = async () => {
    if (!name || !email || selectedSessions.length === 0) {
      alert('Please complete all fields and select at least one session.');
      return;
    }

    try {
      // Save to Firestore
      await addDoc(collection(db, 'signups'), {
        name,
        email,
        sessions: selectedSessions,
      });

      // Send to Google Sheets Webhook
      await fetch('https://script.google.com/macros/s/AKfycb.../exec', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          sessions: selectedSessions,
        }),
      });

      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting signup:', err);
      alert('Something went wrong. Please try again.');
    }
  };

  if (submitted) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Thank you for signing up!</h2>
        <p>You'll receive a confirmation email shortly.</p>
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
        style={{ display: 'block', marginBottom: '20px' }}
      />

      <h3>Select up to 3 sessions:</h3>
      {sessions.length === 0 ? <p>Loading sessions...</p> : (
        <div>
          {sessions.map(session => (
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
              <button
                onClick={() => handleSelect(session.name)}
                style={{ marginTop: '5px' }}
              >
                {selectedSessions.includes(session.name) ? 'Remove' : 'Select'}
              </button>
            </div>
          ))}
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
