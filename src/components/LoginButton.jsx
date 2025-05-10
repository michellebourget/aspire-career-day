import React, { useEffect, useState } from 'react';
import { auth, provider, db } from '../firebase/firebase.js';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

const LoginButton = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const q = query(
          collection(db, 'users'),
          where('uid', '==', currentUser.uid)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const userData = snapshot.docs[0].data();
          setRole(userData.role);
        } else {
          setRole('unknown');
        }
      } else {
        setRole(null);
      }
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
          <span>
            Signed in as <strong>{user.displayName}</strong> ({role})
          </span>
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
