import React from "react";
import "./Home.css";

function Home() {
  return (
    <main className="home-page">
      <section className="hero-section" style={{ padding: '0', margin: 0 }}>
        <div className="hero-content" style={{ textAlign: 'center', padding: '32px 0 16px 0' }}>
          <img
            src={require('../assets/homepage.png')}
            alt="Tennis Hero"
            style={{ maxWidth: '100%', height: 'auto', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.10)', marginBottom: 24 }}
          />
          <h1 style={{ fontSize: '2.8rem', color: '#1a237e', margin: 0, fontWeight: 700, letterSpacing: 1 }}>Welcome to the Tennis Tournament Portal</h1>
          <div className="subtitle" style={{ fontSize: '1.2rem', color: '#37474f', margin: '16px 0 0 0' }}>
            Discover, compete, and track your tennis journey!
          </div>
        </div>
      </section>
      <div className="home-layout">
        {/* ...existing code for header, footer, etc... */}
      </div>
    </main>
  );
}

export default Home;