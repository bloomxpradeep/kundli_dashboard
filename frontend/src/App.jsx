import React, { useState, useEffect } from 'react';
import Login from './components/Login/Login';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import UserDashboard from './components/UserDashboard/UserDashboard';
import Toast from './components/Shared/Toast/Toast';

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  // Toast Management
  const addToast = (message, type = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchSession = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Session invalid');
      }

      const data = await response.json();
      setSession({ user: data.user, token });
      setProfile(data.profile);
    } catch (err) {
      console.error('Session error:', err);
      localStorage.removeItem('auth_token');
      setSession(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const handleLoginSuccess = (user, loggedInProfile) => {
    const token = localStorage.getItem('auth_token');
    setSession({ user, token });
    setProfile(loggedInProfile);
    addToast('Signed in successfully!', 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setSession(null);
    setProfile(null);
    addToast('Signed out successfully!', 'success');
  };

  if (loading) {
    return (
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: 'var(--bg-base)',
          color: 'var(--text-main)',
          gap: '1rem'
        }}
      >
        <div 
          className="spinner"
          style={{
            width: '40px',
            height: '40px',
            border: '4px solid var(--border-color)',
            borderTop: '4px solid var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}
        />
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}} />
        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
          Connecting to secure backend...
        </span>
      </div>
    );
  }

  // Router based on Session & Roles
  return (
    <>
      {!session ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : profile?.role === 'admin' ? (
        <AdminDashboard onLogout={handleLogout} addToast={addToast} profile={profile} />
      ) : (
        <UserDashboard user={session.user} profile={profile} onLogout={handleLogout} addToast={addToast} />
      )}
      
      {/* Toast Alert System overlay */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </>
  );
}
