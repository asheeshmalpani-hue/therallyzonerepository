import React, { useState, useEffect } from "react";

function PlayerRankings() {
  const [userList, setUserList] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDraw, setSelectedDraw] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    // Fetch users for display names
    fetch("/api/users")
      .then(res => res.json())
      .then(setUserList)
      .catch(() => setUserList([]));
    // Fetch rankings
    fetch("/api/user-rankings")
      .then(res => res.json())
      .then(data => {
        setRankings(data);
        setLastUpdated(new Date());
      })
      .catch(() => {
        setRankings([]);
        setLastUpdated(new Date());
      });
  }, []);

  // Support both 'Location' and 'location' fields from backend
  const getLocation = r => r.Location || r.location || '';
  const locations = [...new Set(rankings.map(getLocation).filter(Boolean))];
  console.log(rankings);
console.log(locations);
  const categories = [...new Set(rankings.filter(r => getLocation(r) === selectedLocation).map(r => r.tournament_category))];
  const draws = [...new Set(
    rankings
      .filter(r => getLocation(r) === selectedLocation && r.tournament_category === selectedCategory)
      .map(r => r.draw_name)
      .filter(Boolean)
  )];

  const filteredRankings = rankings
    .filter(r =>
      getLocation(r) === selectedLocation &&
      r.tournament_category === selectedCategory &&
      (selectedDraw ? r.draw_name === selectedDraw : true)
    )
    .sort((a, b) => (a.ranking ?? 9999) - (b.ranking ?? 9999));

  return (
    <main className="player-rankings-page">
      <div className="player-rankings-container" style={{ maxWidth: 600, margin: '8px auto 24px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', padding: 24, minHeight: 400 }}>
        <h2 style={{ marginTop: 0, marginBottom: 12 }}>Player Rankings</h2>
        {/* compact inline controls (Location / Category / Draw) */}
        {/* Controls: Location, Category, Draw (inline to save vertical space) */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
          <div>
            <select
              value={selectedLocation}
              onChange={e => {
                setSelectedLocation(e.target.value);
                setSelectedCategory("");
                setSelectedDraw("");
              }}
              style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.9rem', minWidth: 160 }}
              disabled={locations.length === 0}
            >
              <option value="">Select Location</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {selectedLocation && categories.length > 0 && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {categories.map(cat => (
                <a
                  key={cat}
                  href="#"
                  style={{
                    color: selectedCategory === cat ? '#fb8c00' : '#1976d2',
                    textDecoration: selectedCategory === cat ? 'underline' : 'none',
                    fontWeight: selectedCategory === cat ? 700 : 500,
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                  }}
                  onClick={e => {
                    e.preventDefault();
                    setSelectedCategory(cat);
                    setSelectedDraw("");
                  }}
                >
                  {cat}
                </a>
              ))}
            </div>
          )}

          {selectedCategory && (
            <div>
              <select
                value={selectedDraw}
                onChange={e => setSelectedDraw(e.target.value)}
                style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.9rem', minWidth: 180 }}
                disabled={draws.length === 0}
              >
                <option value="">Select Draw</option>
                {draws.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          )}
        </div>
        <div className="table-scroll">
          {filteredRankings.length === 0 ? (
            <div style={{ color: '#666' }}>No rankings available yet.</div>
          ) : (
            <table className="excel-table">
              <thead>
                <tr>
                  <th style={{ paddingRight: 32 }}>Rank</th>
                  <th>Player Name</th>
                </tr>
              </thead>
              <tbody>
                {filteredRankings.map((rank, index) => {
                  const userObj = userList.find(u => u.id === rank.user_id);
                  const displayName = userObj ? (userObj.full_name || userObj.username) : rank.username;
                  return (
                    <tr key={rank.id}>
                      <td style={{ paddingRight: 32 }}>{rank.ranking}</td>
                      <td>{displayName}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}

export default PlayerRankings;
