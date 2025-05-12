import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';
  // adjust the import path to your Firebase config

const AdminDashboard = () => {
  // State for sessions data and loading status
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all sessions from Firestore when component mounts
    const fetchSessions = async () => {
      try {
        // Retrieve all documents from the "sessions" collection
        const querySnapshot = await getDocs(collection(db, 'sessions'));
        // Map over documents to get an array of session objects {id, ...data}
        const sessionsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSessions(sessionsData);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        // Ensure loading is set to false whether fetch succeeds or fails
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);  // Empty dependency array -> run once on mount

  return (
    <div style={{ padding: '20px' }}>
      <h1>Admin Dashboard</h1>

      {/* Sessions Section */}
      <div style={{ marginTop: '20px' }}>
        <h2>All Sessions</h2>
        {loading ? (
          // Loading state
          <p>Loading sessions...</p>
        ) : sessions.length === 0 ? (
          // Empty state
          <p>No sessions available.</p>
        ) : (
          // Loaded state: display list of session cards
          <div>
            {sessions.map(session => (
              <div 
                key={session.id} 
                style={{
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '12px',
                  background: '#f9f9f9'
                }}
              >
                <h3>{session.name}</h3>
                <p><strong>Teacher:</strong> {session.teacherEmail}</p>
                <p>{session.description}</p>
                {session.imageUrl && (
                  <img 
                    src={session.imageUrl} 
                    alt={`${session.name} session`} 
                    style={{ maxWidth: '150px', height: 'auto', display: 'block', marginTop: '8px' }} 
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
