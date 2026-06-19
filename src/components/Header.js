import { Link, useNavigate } from "react-router-dom"; 
import { useState, useEffect } from "react";
import ChangePasswordDialog from "./ChangePasswordDialog";
import "./Header.css";

function Header({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const checkLoginStatus = () => {
      const authToken = localStorage.getItem('authToken');
      const user = localStorage.getItem('user');
      
      if (authToken && user) {
        setIsLoggedIn(true);
        try {
          setCurrentUser(JSON.parse(user));
        } catch (e) {
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    };

    checkLoginStatus();

    // Listen for custom login event from Login component
    window.addEventListener('userLoggedIn', checkLoginStatus);
    
    // Also listen for logout event
    window.addEventListener('userLoggedOut', checkLoginStatus);
    
    return () => {
      window.removeEventListener('userLoggedIn', checkLoginStatus);
      window.removeEventListener('userLoggedOut', checkLoginStatus);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('attendanceStatus');
    localStorage.removeItem('pendingAttendance');
    setIsLoggedIn(false);
    setCurrentUser(null);
    setShowUserMenu(false);
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('userLoggedOut'));
    navigate('/');
  };

  return (
    <div className="header-wrapper">
      <div className="top-header">
        <button className="hamburger-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          ☰
    </button>
        <div className="site-branding">
          <h1 className="site-title">The Rally Zone Sports Management</h1>
        </div>
        <div className="logo-placeholder">
          Logo
        </div>
      </div>
      <div className="layout-row">
        <aside className={`sidebar ${mobileMenuOpen ? "open" : ""}`}>
          <nav className="main-nav">
            <Link to="/" onClick={() => { window.dispatchEvent(new Event('homeLinkClicked')); }}>Home</Link>
          <Link to="/tournaments">Tournaments</Link>
          <Link to="/player-rankings">Player Rankings</Link>
          <Link to="/register">Register</Link>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact</Link>
          {/* Only show Admin Reset Password link for admins, with correct label */}
          {isLoggedIn && currentUser && currentUser.isAdmin === true && (
            <>
              <Link to="/admin-reset-password">Admin Reset Password</Link>
              <Link to="/admin-reports">Admin Reports</Link>
              <Link to="/admin-dashboard">Add Tournaments</Link>
            </>
          )}
          {isLoggedIn ? (
            <div className="user-menu-container">
              <button 
                className="user-menu-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                {(
                  typeof currentUser?.username === 'string' &&
                  currentUser.username.trim() !== '' &&
                  currentUser.username !== '0' &&
                  currentUser.username !== 0
                ) ? currentUser.username :
                  (typeof currentUser?.fullName === 'string' && currentUser.fullName.trim() !== '' && currentUser.fullName !== '0' && currentUser.fullName !== 0)
                    ? currentUser.fullName
                    : (typeof currentUser?.name === 'string' && currentUser.name.trim() !== '' && currentUser.name !== '0' && currentUser.name !== 0)
                      ? currentUser.name
                      : 'User'} ▼
              </button>
              {showUserMenu && (
                <div className="user-dropdown">
                  <button onClick={() => setShowChangePassword(true)} className="change-password-btn">
                    Change Password
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/my-profile');
                    }}
                    className="profile-btn"
                  >
                    My Profile
                  </button>
                  <button onClick={handleLogout} className="logout-btn">
                    Logout
                  </button>
                </div>
              )}
              {showChangePassword && (
                <ChangePasswordDialog open={showChangePassword} onClose={() => setShowChangePassword(false)} />
              )}
            </div>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </nav>
      </aside>
      {children}
      </div>
    </div>
  );
}

export default Header;