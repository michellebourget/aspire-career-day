import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const StudentSignupForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedSessions, setSelectedSessions] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [sessions, setSessions] = useState([]);

  // Fetch sessions from Firestore
  useEffect(() => {
    const fetchSessions = async () => {
      const snapshot = await getDocs(collection(db, 'sessions'));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setSessions(data);
    };

    fetchSessions();
  }, []);

  const handleCheckboxChange = (sessionName) => {
    if (selectedSessions.includes(sessionName)) {
      setSelectedSessions(selectedSessions.filter((s) => s !== sessionName));
    } else if (selectedSessions.length < 3) {
      setSelectedSessions([...selectedSessions, sessionName]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, 'signups'), {
        name,
        email,
        sessions: selectedSessions,
        timestamp: new Date(),
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Error saving to Firestore:', error);
      alert('There was a problem saving your signup. Please try again.');
    }
  };

  return submitted ? (
    <div style={{ color: 'green', fontWeight: 'bold' }}>
      Thank you for signing up!
    </div>
  ) : (
    <form onSubmit={handleSubmit} style={{ maxWidth: '500px' }}>
      <div style={{ marginBottom: '1rem' }}>
        <label>Name:</label><br />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ padding: '0.5rem', width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Email:</label><br />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '0.5rem', width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>Choose up to 3 sessions:</label>
        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
          {sessions.map((session) => (
            <li key={session.id}>
              <label>
                <input
                  type="checkbox"
                  value={session.name}
                  checked={selectedSessions.includes(session.name)}
                  onChange={() => handleCheckboxChange(session.name)}
                  disabled={
                    !selectedSessions.includes(session.name) &&
                    selectedSessions.length >= 3
                  }
                />
                {' '}
                {session.name}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <button type="submit" style={{ padding: '0.5rem 1rem', background: '#007bff', color: '#fff', border: 'none' }}>
        Submit
      </button>
    </form>
  );
};

export default StudentSignupForm;
