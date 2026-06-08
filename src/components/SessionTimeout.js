import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const SESSION_TIMEOUT_MINUTES = 15; // Set timeout duration here

export default function SessionTimeout() {
  const timeoutRef = useRef(null);
  const navigate = useNavigate();

  // Logout function
  const handleAutoLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('attendanceStatus');
    localStorage.removeItem('pendingAttendance');
    window.dispatchEvent(new Event('userLoggedOut'));
    navigate('/login');
    alert('You have been logged out due to inactivity.');
  };

  // Reset timer on user activity
  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    // Only set timer if user is logged in
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      timeoutRef.current = setTimeout(handleAutoLogout, SESSION_TIMEOUT_MINUTES * 60 * 1000);
    }
  };

  useEffect(() => {
    // Listen for user activity
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    // Listen for login/logout to reset timer
    window.addEventListener('userLoggedIn', resetTimer);
    window.addEventListener('userLoggedOut', resetTimer);
    // Set timer on mount
    resetTimer();
    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      window.removeEventListener('userLoggedIn', resetTimer);
      window.removeEventListener('userLoggedOut', resetTimer);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line
  }, []);

  return null;
}
