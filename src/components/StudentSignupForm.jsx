import React, { useState } from 'react';

const StudentSignupForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted:', { name, email });
    setSubmitted(true);
  };

  return submitted ? (
    <div className="text-green-600 font-semibold">Thank you for signing up!</div>
  ) : (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block">Name:</label>
        <input
          className="border rounded px-2 py-1 w-full"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block">Email:</label>
        <input
          className="border rounded px-2 py-1 w-full"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Submit
      </button>
    </form>
  );
};

export default StudentSignupForm;
