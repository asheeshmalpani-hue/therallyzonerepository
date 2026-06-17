import React, { useState } from 'react';
import './Register.css';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    phone_number: '',
    gender: '', // Default to empty
    date_of_birth: '',
  });
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Registering...');
    setIsSuccess(false);

    try {
      const response = await fetch('https://therallyzonebackendrepository-production.up.railway.app/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setMessage(data.message || 'Registration successful!');
        // Clear form after successful registration
        setFormData({ username: '', password: '', full_name: '', phone_number: '', gender: '', date_of_birth: '' });
      } else {
        setIsSuccess(false);
        setMessage(data.message || 'Registration failed. Please check your details.');
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage('Network error. Could not connect to the server.');
      console.error('Registration failed:', error);
    }
  };

  return (
    <main className="register-container">
      <div className="register-card">
        <h1>Player Registration</h1>
        
        {message && (
          <p className={`status-message ${isSuccess ? 'success' : 'error'}`}>
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="full_name">Full Name</label>
            <input type="text" id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone_number">Phone Number</label>
              <input type="tel" id="phone_number" name="phone_number" value={formData.phone_number} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select id="gender" name="gender" value={formData.gender} onChange={handleChange} required>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="date_of_birth">Date of Birth (Relevant for age-group eligibility)</label>
            <input type="date" id="date_of_birth" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} required />
          </div>

          <button type="submit" className="register-button">Register Account</button>
        </form>
      </div>
    </main>
  );
}

export default Register;