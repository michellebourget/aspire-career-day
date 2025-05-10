import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import App from './App';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { auth } from './firebase/firebase';
import { db } from './firebase/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const RoutesWithAuth = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const q = query(collection(db, 'users'), where('uid', '==', currentUser.uid));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const userData = snapshot.docs[0].data();
          const userRole = userData.role;
          setRole(userRole);

          if (userRole === 'admin') navigate('/admin');
          else if (userRole === 'teacher') navigate('/teacher');
          else navigate('/');
        } else {
          setRole(null);
        }
      } else {
        setRole(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) return <div>Loading...</div>;

  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute user={user} role={role} requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher"
        element={
          <ProtectedRoute user={user} role={role} requiredRole="teacher">
            <TeacherDashboard user={user} />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <RoutesWithAuth />
    </BrowserRouter>
  </React.StrictMode>
);
