// Trigger redeploy
import './firebase/firebase.js';
import React from 'react';
import StudentSignupForm from './components/StudentSignupForm';

function App() {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Aspire Career Day</h1>
      <StudentSignupForm />
    </main>
  );
}
export default App;
