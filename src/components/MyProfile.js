import React, { useState, useEffect } from 'react';
import './MyProfile.css';

function MyProfile({ currentUser }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [careerStats, setCareerStats] = useState({ wins: 0, losses: 0 });
  const [yearStats, setYearStats] = useState({ wins: 0, losses: 0 });
  const [userMatches, setUserMatches] = useState([]);
  
  useEffect(() => {
    if (!currentUser?.username && !currentUser?.fullName) return;
    const userName = currentUser.username || currentUser.fullName;
    fetch(`https://therallyzonebackendrepository-production.up.railway.app/api/user-matches/${userName}`)
      .then(res => res.ok ? res.json() : [])
      .then(matches => {
        setUserMatches(matches);
        // Career stats
        let wins = 0, losses = 0;
        // Current year stats
        let yearWins = 0, yearLosses = 0;
        const currentYear = new Date().getFullYear();
        matches.forEach(match => {
          if (!match.winner) return;
          // If user is player1 or player2
          const isPlayer1 = match.player1 === userName;
          const isPlayer2 = match.player2 === userName;
          // Win/loss logic
          const matchYear = match.match_date ? new Date(match.match_date).getFullYear() : null;
          if (match.winner === userName) {
            wins++;
            if (matchYear === currentYear) yearWins++;
          } else if (isPlayer1 || isPlayer2) {
            losses++;
            if (matchYear === currentYear) yearLosses++;
          }
        });
        setCareerStats({ wins, losses });
        setYearStats({ wins: yearWins, losses: yearLosses });
      })
      .catch(() => {
        setCareerStats({ wins: 0, losses: 0 });
        setYearStats({ wins: 0, losses: 0 });
        setUserMatches([]);
      });
  }, [currentUser]);

  const userName =
  currentUser?.username ||
  currentUser?.fullName ||
  '';
  const statsMap = {};

userMatches.forEach(match => {
  if (!match.winner) return;

  const category = match.tournament_category || 'Unknown';
  const event = match.event_name || 'Unknown';

  const key = `${category}__${event}`;

  if (!statsMap[key]) {
    statsMap[key] = {
      category,
      eventName: event,
      wins: 0,
      losses: 0,
      yearWins: 0,
      yearLosses: 0
    };
  }
  const matchYear = match.match_date
    ? new Date(match.match_date).getFullYear()
    : null;

  const currentYear = new Date().getFullYear();

  const isWin = match.winner === userName;

  if (isWin) {
    statsMap[key].wins++;

    if (matchYear === currentYear) {
      statsMap[key].yearWins++;
    }
  } else {
    statsMap[key].losses++;

    if (matchYear === currentYear) {
      statsMap[key].yearLosses++;
    }
  }
});
const categoryEventStats = Object.values(statsMap);
  
const groupedMatches = {};

userMatches
  .filter(match => match.winner)
  .forEach(match => {
    const category = match.tournament_category || 'Unknown';
    const eventName = match.event_name || 'Unknown';

    const key = `${category}__${eventName}`;

    if (!groupedMatches[key]) {
      groupedMatches[key] = {
        category,
        eventName,
        matches: []
      };
    }

    groupedMatches[key].matches.push(match);
  });

  return (
    <div className="my-profile-page">
      <h2>My Profile</h2>
      <div className="profile-tabs">
        <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={activeTab === 'performance' ? 'active' : ''} onClick={() => setActiveTab('performance')}>MyPerformance</button>
        <button className={activeTab === 'tournaments' ? 'active' : ''} onClick={() => setActiveTab('tournaments')}>My Tournaments</button>
        <button className={activeTab === 'ranking' ? 'active' : ''} onClick={() => setActiveTab('ranking')}>Ranking</button>
      </div>
      <div className="profile-tab-content">
        {activeTab === 'overview' && (
          <div>
            <p><strong>Username:</strong> {currentUser?.username || ''}</p>
            <p><strong>Name:</strong> {currentUser?.fullName || currentUser?.name || ''}</p>
            <p><strong>Date of Birth:</strong> {currentUser?.dateOfBirth || ''}</p>
            <div style={{ marginTop: 24 }}>
              <strong>Career Win/Loss:</strong> {careerStats.wins}/{careerStats.losses}
            </div>
            <div style={{ marginTop: 8 }}>
              <strong>Current Year Win/Loss:</strong> {yearStats.wins}/{yearStats.losses}
            </div>
            <div style={{ marginTop: 24 }}>
  <h4>Category/Event Performance</h4>

  {categoryEventStats.map((stat, index) => (
    <div key={index} style={{ marginBottom: 12 }}>
      <div>
        <strong>
          {stat.category} - {stat.eventName}
        </strong>
      </div>

      <div>
        Career Win/Loss: {stat.wins}/{stat.losses}
      </div>

      <div>
        Current Year Win/Loss: {stat.yearWins}/{stat.yearLosses}
      </div>
    </div>
  ))}
</div>
          </div>
        )}
        {activeTab === 'performance' && (
  <div>

    {Object.values(groupedMatches).length === 0 ? (
      <p>No completed matches found for this user.</p>
    ) : (

      Object.values(groupedMatches).map((group, index) => (

        <div key={index} style={{ marginBottom: '32px' }}>

          <h3>
            {group.category} - {group.eventName}
          </h3>

          <table
            className="user-matches-table"
            style={{
              borderCollapse: 'separate',
              borderSpacing: '0 8px',
              width: '100%'
            }}
            >

            <thead>
              <tr>
                <th style={{ padding: '8px 16px' }}>Match Date</th>
                <th style={{ padding: '8px 16px' }}>Tournament</th>
                <th style={{ padding: '8px 16px' }}>Player 1</th>
                <th style={{ padding: '8px 16px' }}>Player 2</th>
                <th style={{ padding: '8px 16px' }}>Winner</th>
                <th style={{ padding: '8px 16px' }}>Score</th>
              </tr>
            </thead>
            <tbody>

              {group.matches
                .sort((a, b) =>
                  (b.match_date || '')
                    .localeCompare(a.match_date || '')
                )
                .map(match => (

                  <tr key={match.id}>

                    <td style={{ padding: '8px 16px' }}>
                      {match.match_date || '-'}
                    </td>

                    <td style={{ padding: '8px 16px' }}>
                      {match.tournament_name}
                    </td>
                    <td style={{ padding: '8px 16px' }}>
                      {match.player1_p
    ? `${match.player1} & ${match.player1_p}`
    : match.player1}
                    </td>

                    <td style={{ padding: '8px 16px' }}>
                      {match.player2_p
    ? `${match.player2} & ${match.player2_p}`
    : match.player2}
                    </td>

                    <td style={{ padding: '8px 16px' }}>
                      {match.winner}
                    </td>

                    <td style={{ padding: '8px 16px' }}>
                      {match.match_score || '-'}
                    </td>

                  </tr>

              ))}

            </tbody>

          </table>

        </div>

      ))

    )}

  </div>
)}

        {activeTab === 'tournaments' && (
          <div>
            <h3>My Tournaments</h3>
            {/* TODO: Fetch and display user's tournaments */}
            <p>No tournaments data yet.</p>
          </div>
        )}
        {activeTab === 'ranking' && (
          <div>
            <h3>Ranking</h3>
            {/* TODO: Fetch and display user's ranking */}
            <p>No ranking data yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyProfile;
