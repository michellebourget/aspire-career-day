import React from 'react';

const StudentSignupForm = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Student Session Signup</h2>
      <p>Please use the button below to sign up for Aspire Career Day sessions.</p>
      <a
        https://docs.google.com/forms/d/e/1FAIpQLSdkQg_FUNJPPE3s36_3z15VKgViIuQqHovsLTFs3JLkXggnrg/viewform?usp=header
        
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-block',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#007bff',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px',
          marginTop: '1rem'
        }}
      >
        Go to Sign-Up Form
      </a>
    </div>
  );
};

export default StudentSignupForm;
