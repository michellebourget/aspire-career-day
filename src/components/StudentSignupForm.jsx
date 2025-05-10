import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import sessionOptions from '../data/sessions';

const StudentSignupForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedSessions, setSelectedSessions] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const handleCheckboxChange = (session) => {
    if (selectedSessions.includes(session)) {
      setSelectedSessions(selectedSessions.filter((s) => s !== session));
    } else if (selectedSessions.length < 3) {
      setSelectedSessions([...selectedSessions, session]);
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
          {sessionOptions.map((session) => (
            <li key={session}>
              <label>
                <input
                  type="checkbox"
                  value={session}
                  checked={selectedSessions.includes(session)}
                  onChange={() => handleCheckboxChange(session)}
                  disabled={
                    !selectedSessions.includes(session) &&
                    selectedSessions.length >= 3
                  }
                />
                {' '}
                {session}
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
