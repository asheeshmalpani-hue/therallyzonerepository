import React, { useState, useEffect } from 'react';

function AdminResetPassword() {
  const [userId, setUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Get user object from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsAdmin(user && user.isAdmin === true);
      } catch {
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    setLoading(true);
    try {
      // Get user object from localStorage
      const userStr = localStorage.getItem('user');
      let user = null;
      if (userStr) {
        try {
          user = JSON.parse(userStr);
        } catch {
          user = null;
        }
      }
      if (!user || !user.isAdmin) {
        setStatus('You are not authorized to perform this action.');
        setLoading(false);
        return;
      }
      const res = await fetch(`https://therallyzonebackendrepository-production.up.railway.app/api/users/${userId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword, user })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('Password reset successfully!');
      } else {
        setStatus(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      setStatus('Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, border: '1px solid #ccc', borderRadius: 8 }}>
        <h2>Admin: Reset User Password</h2>
        <div style={{ color: 'red', marginTop: 16 }}>You must be an admin to access this page.</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 24, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Admin: Reset User Password</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label>Username:</label>
          <input
            type="text"
            value={userId}
            onChange={e => setUserId(e.target.value)}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>New Password:</label>
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
            minLength={6}
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ padding: '8px 16px', background: '#1a237e', color: '#fff', border: 'none', borderRadius: 4 }}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
      {status && <div style={{ marginTop: 16, color: status.includes('success') ? 'green' : 'red' }}>{status}</div>}
    </div>
  );
}

export default AdminResetPassword;
