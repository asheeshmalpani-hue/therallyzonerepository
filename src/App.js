import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./components/Home";
import TournamentSearch from "./components/TournamentSearch";
import Register from "./components/Register";
import Login from "./components/Login"; // 👈 Import the new component

import Footer from "./components/Footer";
import AdminResetPassword from "./components/AdminResetPassword";
import AdminReports from "./components/AdminReports";
import AdminDashboard from "./components/AdminDashboard";
import MyProfile from "./components/MyProfile";
import UpcomingTournament from "./components/UpcomingTournament";
import PlayerRankings from "./components/PlayerRankings";
import TournamentsMenu from "./components/TournamentsMenu";
import About from "./components/About";
import Contact from "./components/Contact";

import SessionTimeout from "./components/SessionTimeout";

import React, { useState, useEffect } from "react";

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleLogin = () => {
      try {
        const raw = localStorage.getItem('user');
        setCurrentUser(raw ? JSON.parse(raw) : null);
      } catch {
        setCurrentUser(null);
      }
    };
    window.addEventListener('userLoggedIn', handleLogin);
    window.addEventListener('userLoggedOut', () => setCurrentUser(null));
    return () => {
      window.removeEventListener('userLoggedIn', handleLogin);
      window.removeEventListener('userLoggedOut', () => setCurrentUser(null));
    };
  }, []);

  return (
    <BrowserRouter>
      <SessionTimeout />
      <div className="app-shell">
        <Header>
          <main className="app-content">
            <Routes>
              <Route path="/" element={<Home currentUser={currentUser} setShowProfile={() => {}} />} />
              <Route path="/tournaments" element={<TournamentsMenu currentUser={currentUser} />} />
              <Route path="/search" element={<TournamentSearch />} />
              <Route path="/upcoming-tournaments" element={<UpcomingTournament currentUser={currentUser} />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/my-profile" element={<MyProfile currentUser={currentUser} />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              {/* Admin Reset Password Route */}
              <Route path="/admin-reset-password" element={<AdminResetPassword />} />
              <Route path="/player-rankings" element={<PlayerRankings />} />
              <Route path="/admin-reports" element={<AdminReports />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
            </Routes>
            <Footer />
          </main>
        </Header>
      </div>
    </BrowserRouter>
  );
}

export default App;