import React, { useState, useEffect } from 'react';
import './MatchScheduleDialog.css';


function MatchScheduleDialog({ tournamentId, tournamentName, tournamentCategory, tournamentLocation, matches, onClose, onRefresh, resultsOnly, isAdmin, userList, rankings }) {
  // Complete Tournament handler with confirmation dialog
  const handleCompleteTournament = () => {
    if (window.confirm('Are you sure you want to mark this tournament as closed? This action cannot be undone.')) {
      async function completeTournament() {
        try {
          //const tournamentId = matches && matches.length > 0 ? matches[0].tournament_id : null;
          if (!tournamentId) {
            alert('Tournament ID not found.');
            onClose();
            return;
          }
          const res = await fetch(`http://localhost:5000/api/tournaments/${tournamentId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Closed' })
          });
          if (!res.ok) {
            alert('Failed to update tournament status.');
          }
          if (typeof onRefresh === 'function') onRefresh();
          onClose();
        } catch (e) {
          alert('Error completing tournament.');
          onClose();
        }
      }
      completeTournament();
    }
  };
    // Show Complete Tournament button when all matches have a winner
    useEffect(() => {
      if (!resultsOnly && isAdmin && matches && matches.length > 0) {
        const allCompleted = matches.every(m => m.winner);
        setShowCompleteBtn(allCompleted);
      } else {
        setShowCompleteBtn(false);
      }
    }, [matches, resultsOnly, isAdmin]);
  // Batch editing state
  const [editedResults, setEditedResults] = useState(() => {
    const obj = {};
    matches.forEach(m => {
      obj[m.id] = {
        winner: m.winner || '',
        matchScore: m.match_score || '',
      };
    });
    return obj;
  });
  useEffect(() => {
  const obj = {};

  matches.forEach(m => {
    obj[m.id] = {
      winner: m.winner || '',
      matchScore: m.match_score || '',
    };
  });

  setEditedResults(obj);
}, [matches]);

  const [playerRankings, setPlayerRankings] = useState(() => {
    const obj = {};
    matches.forEach(m => {
      obj[m.id] = {
        player1Ranking: m.player1Ranking || '',
        player2Ranking: m.player2Ranking || '',
      };
    });
    return obj;
  });
  useEffect(() => {
  const obj = {};

  matches.forEach(m => {
    obj[m.id] = {
      player1Ranking: m.player1Ranking || '',
      player2Ranking: m.player2Ranking || '',
    };
  });

  setPlayerRankings(obj);
}, [matches]);

  // Batch save handler
  const [showCompleteBtn, setShowCompleteBtn] = useState(false);
  const handleBatchSaveResults = async () => {
    let updatedCount = 0;
    // Defensive: ensure matches is array
    const safeMatches = Array.isArray(matches) ? matches : [];
    // For each match, if winner or score is edited, send PUT request
    for (const match of safeMatches) {
      const edited = editedResults[match.id] || {};
      //const winner = edited.winner || '';
      let winner = '';
      let winner_p = '';

      if (edited.winner === match.player1) {
        winner = match.player1;
        winner_p = match.player1_p || '';
      } else if (edited.winner === match.player2) {
        winner = match.player2;
        winner_p = match.player2_p || '';
      }
      const matchScore = edited.matchScore || '';
      // Only update if winner is selected
      if (winner) {
        try {
          const res = await fetch(`http://localhost:5000/api/match-draw/${match.id}/result`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              winner,
              winner_p,
              match_score: matchScore,
              player1Ranking: playerRankings[match.id]?.player1Ranking,
              player2Ranking: playerRankings[match.id]?.player2Ranking,
              tournamentCategory,
              tournamentLocation
            })
          });
          if (!res.ok) {
            console.error("Failed for match:", match.id);
            continue;
          }
          updatedCount++; // increment ONLY on success
        } catch (e) {
          // Optionally handle error per match
          console.error("Error saving match:", match.id, e);
        }
      }
    }
    alert(`${updatedCount} result(s) saved successfully.`);
    if (typeof onRefresh === 'function') {
      await onRefresh();
    }
    // Optionally, close dialog after save
    // onClose();
  };

  // Defensive coding: ensure matches is always an array
  const safeMatches = Array.isArray(matches) ? matches : [];

  return (
    <div className="schedule-dialog-overlay" onClick={onClose}>
      <div className="schedule-dialog-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 1100, width: '95vw' }}>
        <div className="schedule-dialog-header">
          <h3>{resultsOnly ? 'Match Results' : 'Match Schedule'}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="schedule-dialog-content">
          <p className="tournament-info"><strong>{tournamentName}</strong></p>
          <p className="match-count">Total Matches: {safeMatches.length}</p>
          <div className="schedule-table-container">
            <table className="schedule-table">
              <thead>
                <tr>
                  <th>Match #</th>
                  <th>Player 1</th>
                  <th>Ranking</th>
                  <th>Player 2</th>
                  <th>Ranking</th>
                  <th>Match Date</th>
                  <th>Court</th>
                  <th>Time</th>
                  <th>Winner</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {safeMatches.map((match, index) => (
                  <tr key={match.id}>
                    <td className="match-number">{index + 1}</td>
                    <td className="player-name">{match.player1Display || match.player1}</td>
                    <td className="ranking-cell">
                      {isAdmin && !resultsOnly ? (
                        <input
                          type="number"
                          min={1}
                          value={playerRankings[match.id]?.player1Ranking || ''}
                          onChange={e => {
                            const val = e.target.value;
                            if (val === '' || (Number(val) > 0 && Number.isInteger(Number(val)))) {
                              setPlayerRankings(prev => ({ ...prev, [match.id]: { ...prev[match.id], player1Ranking: val } }));
                            }
                          }}
                          className="ranking-input"
                          style={{ width: 60 }}
                        />
                      ) : (
                        match.player1Ranking
                      )}
                    </td>
                    <td className="player-name">{match.player2Display || match.player2}</td>
                    <td className="ranking-cell">
                      {isAdmin && !resultsOnly ? (
                        <input
                          type="number"
                          min={1}
                          value={playerRankings[match.id]?.player2Ranking || ''}
                          onChange={e => {
                            const val = e.target.value;
                            if (val === '' || (Number(val) > 0 && Number.isInteger(Number(val)))) {
                              setPlayerRankings(prev => ({ ...prev, [match.id]: { ...prev[match.id], player2Ranking: val } }));
                            }
                          }}
                          className="ranking-input"
                          style={{ width: 60 }}
                        />
                      ) : (
                        match.player2Ranking
                      )}
                    </td>
                    <td className="match-date">{match.match_date ? match.match_date : 'N/A'}</td>
                    <td className="court-info">{match.court}</td>
                    <td className="time-info">{match.time_slot || 'N/A'}</td>
                    <td className="winner-cell">
                      {isAdmin && !resultsOnly ? (
                        <select
                          value={editedResults[match.id]?.winner || ''}
                          onChange={e => setEditedResults(prev => ({ ...prev, [match.id]: { ...prev[match.id], winner: e.target.value } }))}
                          className="winner-select"
                        >
                          <option value="">Select Winner</option>
                          <option value={match.player1}>{match.player1Display || match.player1}</option>
                          <option value={match.player2}>{match.player2Display || match.player2}</option>
                        </select>
                      ) : (
                        match.winner || '-'
                      )}
                    </td>
                    <td className="score-cell">
                      {isAdmin && !resultsOnly ? (
                        <input
                          type="text"
                          value={editedResults[match.id]?.matchScore || ''}
                          onChange={e => setEditedResults(prev => ({ ...prev, [match.id]: { ...prev[match.id], matchScore: e.target.value } }))}
                          placeholder="6-4, 6-3"
                          className="score-input"
                        />
                      ) : (
                        match.match_score || '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="schedule-dialog-actions">
          {isAdmin && !resultsOnly && (
            <>
              <button className="save-all-results-btn" onClick={handleBatchSaveResults} style={{ marginRight: 12 }}>
                Save All Results
              </button>
              {showCompleteBtn && (
                <button className="complete-tournament-btn" onClick={handleCompleteTournament} style={{ marginRight: 12 }}>
                  Complete the tournament
                </button>
              )}
            </>
          )}
          <button className="close-dialog-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default MatchScheduleDialog;
