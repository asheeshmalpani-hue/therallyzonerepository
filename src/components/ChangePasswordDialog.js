import React, { useState } from 'react';

function ChangePasswordDialog({ open, onClose }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const userStr = localStorage.getItem('user');
  let user = null;
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch {
      user = null;
    }
  }

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    setLoading(true);
    if (!user) {
      setStatus('User not logged in.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`https://therallyzonebackendrepository-production.up.railway.app/api/users/${user.id}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('Password changed successfully!');
        setSuccess(true);
        setTimeout(() => {
          setStatus('');
          setSuccess(false);
          setOldPassword('');
          setNewPassword('');
          if (onClose) onClose();
        }, 2000);
      } else {
        setStatus(data.message || 'Failed to change password.');
      }
    } catch (err) {
      setStatus('Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-dialog" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', padding: 32, borderRadius: 12, minWidth: 340, boxShadow: '0 8px 32px rgba(26,35,126,0.18)', border: '2px solid #8bc34a', color: '#111', maxWidth: 400 }}>
        <h2 style={{ color: '#1a237e', marginBottom: 18, textAlign: 'center', letterSpacing: 1 }}>Change Password</h2>
        <div style={{ marginBottom: 18, fontWeight: 600, fontSize: 17, color: '#333', textAlign: 'center' }}>
          Username: {user && (user.username || user.name || user.fullName || 'User')}
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ color: '#222', fontWeight: 500 }}>Old Password:</label>
            <input
              type="password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              required
              style={{ width: '100%', padding: 10, marginTop: 6, color: '#111', border: '1px solid #bdbdbd', borderRadius: 5, fontSize: 15 }}
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ color: '#222', fontWeight: 500 }}>New Password:</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              minLength={6}
              style={{ width: '100%', padding: 10, marginTop: 6, color: '#111', border: '1px solid #bdbdbd', borderRadius: 5, fontSize: 15 }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 10 }}>
            <button type="submit" disabled={loading || success} style={{ padding: '10px 22px', background: '#1a237e', color: '#fff', border: 'none', borderRadius: 5, fontWeight: 600, fontSize: 15, cursor: loading || success ? 'not-allowed' : 'pointer', opacity: loading || success ? 0.7 : 1 }}>
              {loading ? 'Changing...' : 'Change Password'}
            </button>
            <button type="button" onClick={onClose} disabled={loading || success} style={{ padding: '10px 22px', background: '#eee', color: '#333', border: 'none', borderRadius: 5, fontWeight: 600, fontSize: 15, cursor: loading || success ? 'not-allowed' : 'pointer', opacity: loading || success ? 0.7 : 1 }}>
              Cancel
            </button>
          </div>
        </form>
        {status && (
          <div style={{ marginTop: 18, color: status.includes('success') ? '#388e3c' : '#d32f2f', textAlign: 'center', fontWeight: 600, fontSize: 15 }}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChangePasswordDialog;
