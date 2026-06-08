
import React, { useState, useEffect } from 'react';
import MatchScheduleDialog from "./MatchScheduleDialog";
import "./TournamentSearch.css";

function TournamentSearch() {
  const [matchResultsDialog, setMatchResultsDialog] = useState({
    open: false,
    tournamentId: null,
    tournamentName: null,
    tournamentCategory: null,
    tournamentLocation: null,
    matches: [],
    drawOptions: [],
    selectedDrawId: '',
    selectedDrawName: '',
    loadingDrawMatches: false
  });

  const viewMatchResults = tournament => {
    const drawOptions = Array.isArray(tournament.draws) && tournament.draws.length > 0
      ? tournament.draws
      : [];

    setMatchResultsDialog({
      open: true,
      tournamentId: tournament.id,
      tournamentName: tournament.name,
      tournamentCategory: tournament.category,
      tournamentLocation: tournament.Location || tournament.location || '',
      matches: [],
      drawOptions,
      selectedDrawId: '',
      selectedDrawName: '',
      loadingDrawMatches: false
    });
  };

  const loadMatchesForDraw = async drawId => {
    if (!drawId) return;

    setMatchResultsDialog(prev => ({
      ...prev,
      loadingDrawMatches: true,
      matches: []
    }));

    try {
      const res = await fetch(`http://localhost:5000/api/match-draw/${drawId}`);
      if (!res.ok) throw new Error('Failed to fetch draw matches');
      const allMatches = await res.json();
      setMatchResultsDialog(prev => ({
        ...prev,
        matches: allMatches,
        loadingDrawMatches: false
      }));
    } catch (error) {
      setMatchResultsDialog(prev => ({ ...prev, loadingDrawMatches: false }));
      alert('Failed to load draw matches.');
    }
  };

  const handleDrawChange = async e => {
    const selectedDrawId = e.target.value;
    const selectedDraw = matchResultsDialog.drawOptions.find(draw => String(draw.draw_id) === String(selectedDrawId));
    setMatchResultsDialog(prev => ({
      ...prev,
      selectedDrawId,
      selectedDrawName: selectedDraw ? selectedDraw.draw_name : '',
      matches: []
    }));

    if (selectedDrawId) {
      await loadMatchesForDraw(selectedDrawId);
    }
  };

  const closeMatchResultsDialog = () => setMatchResultsDialog({
    open: false,
    tournamentId: null,
    tournamentName: null,
    tournamentCategory: null,
    tournamentLocation: null,
    matches: [],
    drawOptions: [],
    selectedDrawId: '',
    selectedDrawName: '',
    loadingDrawMatches: false
  });
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState('');

  // Get unique locations for the top filter dropdown
  const locations = Array.from(new Set(tournaments.map(t => t.Location).filter(Boolean)));

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/tournaments/closed');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setTournaments(data);
        setError(null);
      } catch (e) {
        setError("Failed to load tournaments. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  const filteredTournaments = tournaments.filter(t => {
    return (
      (location === '' || t.Location === location) &&
      t.category && t.category.toLowerCase() === 'ladder' &&
      t.status && t.status.toLowerCase() === 'closed'
    );
  });

  const formatDate = rawDate => {
    if (!rawDate) return 'N/A';
    const date = new Date(rawDate);
    if (Number.isNaN(date.getTime())) return rawDate;
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const resultsForSelectedDraw = matchResultsDialog.selectedDrawId
    ? matchResultsDialog.matches
    : [];

  if (loading) {
    return <main className="search-page-container"><h1 className="page-title">Loading Tournaments...</h1></main>;
  }
  if (error) {
    return <main className="search-page-container"><h1 className="page-title" style={{color: 'red'}}>{error}</h1></main>;
  }

  return (
    <main className="search-page-container">
      <div className="search-header-row">
        <h1 className="page-title">🔍 Completed Ladders</h1>
        <div className="filter-panel-inline">
          <div className="filter-group">
            <label htmlFor="location-filter">Location</label>
            <select id="location-filter" value={location} onChange={e => setLocation(e.target.value)}>
              <option value="">All Locations</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <section className={`search-tournament-list${filteredTournaments.length > 0 ? ' has-items' : ''}`}> 
        {filteredTournaments.map(tournament => (
          <div key={tournament.id} className="tournament-item">
            <div className="item-details">
              <h3>{tournament.name}</h3>
              <p style={{ margin: '6px 0', color: '#555' }}><b>Date:</b> {formatDate(tournament.date)}</p>
            </div>
            <div className="item-actions">
              <button className="details-button" onClick={() => viewMatchResults(tournament)}>
                Match Results
              </button>
              {matchResultsDialog.open && matchResultsDialog.tournamentId === tournament.id && (
                <div className="draw-selector-panel">
                  <div className="draw-selector-row">
                    <span>Choose draw:</span>
                    <select
                      value={matchResultsDialog.selectedDrawId}
                      onChange={handleDrawChange}
                    >
                      <option value="">Select draw</option>
                      {matchResultsDialog.drawOptions.map(draw => (
                        <option key={draw.draw_id} value={draw.draw_id}>{draw.draw_name}</option>
                      ))}
                    </select>
                    <button type="button" onClick={closeMatchResultsDialog} className="details-button" style={{ padding: '8px 14px' }}>
                      Close
                    </button>
                  </div>
                  {matchResultsDialog.drawOptions.length === 0 && (
                    <div className="draw-selector-message">
                      No draw names found for this tournament.
                    </div>
                  )}
                  {matchResultsDialog.loadingDrawMatches && (
                    <div className="draw-selector-message">
                      Loading draw matches...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </section>
      {matchResultsDialog.open && matchResultsDialog.selectedDrawId && (
        <MatchScheduleDialog
          tournamentName={matchResultsDialog.tournamentName}
          tournamentCategory={matchResultsDialog.tournamentCategory}
          matches={resultsForSelectedDraw}
          onClose={closeMatchResultsDialog}
          resultsOnly={true}
          isAdmin={false}
        />
      )}
    </main>
  );
}

export default TournamentSearch;