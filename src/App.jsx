import React from 'react';
import StudentSignupForm from './components/StudentSignupForm';
import LoginButton from './components/LoginButton';

function App() {
  return (
    <main style={{ padding: '20px' }}>
      <LoginButton />
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        Welcome to Aspire Career Day
      </h1>
      <StudentSignupForm />
    </main>
  );
}

export default App;


