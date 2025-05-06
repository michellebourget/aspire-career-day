import React, { useState } from 'react';

const StudentSignupForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return submitted ? (
    <div style={{ color: 'green', fontWeight: 'bold' }}>
      Thank you for signing up!
    </div>
  ) : (
    <form onSubmit={handleSubmit}>
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
      <button type="submit" style={{ padding: '0.5rem 1rem', background: '#007bff', color: '#fff', border: 'none' }}>
        Submit
      </button>
    </form>
  );
};

export default StudentSignupForm;

