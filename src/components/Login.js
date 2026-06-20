import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import './Login.css'; // We'll reuse the Register.css file name, but create a new one for clarity

function Login() {
  const location = useLocation();
  // Get redirect path from state or default to home
  const redirectPath = location.state && location.state.from ? location.state.from : "/";
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate(); // Hook for navigation after login

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Logging in...');
    setIsError(false);

    try {
      const response = await fetch('https://therallyzonebackendrepository-production.up.railway.app/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Successful Login
        setMessage(`Welcome, ${data.user.username || data.user.fullName || data.user.name || 'User'}! Redirecting...`);
        setIsError(false);
        // Save the token/user data to localStorage
        localStorage.setItem('authToken', data.token || 'logged-in');
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Dispatch custom event to notify Header component
        window.dispatchEvent(new Event('userLoggedIn'));
        
        // Redirect to the home page or a dashboard after a delay
        setTimeout(() => {
  navigate(redirectPath);

  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 100);
}, 1500);

      } else {
        // Failed Login (Invalid credentials)
        setIsError(true);
        setMessage(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      setIsError(true);
      setMessage('Network error. Could not connect to the server.');
      console.error('Login failed:', error);
    }
  };

  return (
    <main className="login-container">
      <div className="login-card">
        <h1>Member Login</h1>
        
        {message && (
          <p className={`status-message ${isError ? 'error' : 'success'}`}>
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>

          <button type="submit" className="login-button">Log In</button>
        </form>
        
        <p className="register-redirect">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </main>
  );
}

export default Login;