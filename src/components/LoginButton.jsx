import React, { useEffect, useState } from 'react';
import { auth, provider } from '../firebase/firebase.js';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const LoginButton = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    signInWithPopup(auth, provider).catch((error) => {
      console.error('Login error:', error);
      alert('Google Sign-in failed.');
    });
  };

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      {user ? (
        <div>
          <span>Signed in as <strong>{user.displayName}</strong></span>
          <button onClick={handleLogout} style={{ marginLeft: '1rem' }}>
            Logout
          </button>
        </div>
      ) : (
        <button onClick={handleLogin}>
          Sign in with Google
        </button>
      )}
    </div>
  );
};

export default LoginButton;
