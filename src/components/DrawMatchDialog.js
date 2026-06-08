import React from 'react';
import './DrawMatchDialog.css';

function DrawMatchDialog({ playerList = [], drawRounds = [], addMatch, addRound, updateMatch, removeMatch, handleSave, onClose, players = [] }) {
  // Helper to filter players already selected in other matches, and prevent Player 1/2 from being the same
  // playerList is now array of objects: { username, ranking, display }
  const getAvailablePlayers = (roundIndex, matchIdx, field, currentMatch) => {
  const currentRoundMatches = drawRounds[roundIndex]?.matches || [];

  // Players already selected in OTHER matches of same round
  const selected = currentRoundMatches
    .filter((_, idx) => idx !== matchIdx)
    .flatMap(m => [m.player1, m.player2])
    .filter(Boolean);

  let available = playerList.filter(
    p => !selected.includes(p.username)
  );
  // Prevent same player on both sides of same match
  if (field === "player1" && currentMatch.player2) {
    available = available.filter(
      p => p.username !== currentMatch.player2
    );
  }

  if (field === "player2" && currentMatch.player1) {
    available = available.filter(
      p => p.username !== currentMatch.player1
    );
  }

  return available;
};


  // Helper to get ranking for a username
  const getRanking = (username) => {
    const playerObj = players.find(p => p.username === username);
    return playerObj ? playerObj.ranking : '';
  };
  return (
    <div
      className="draw-dialog-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        overflowY: 'auto',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div className="draw-dialog-box" onClick={e => e.stopPropagation()}>
        <div className="draw-dialog-header">
          <h3>Create Match Schedule</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="draw-dialog-content">
          {drawRounds.map((round, roundIndex) => (
  <div key={roundIndex} style={{ marginBottom: "30px" }}>
    <h3>Round {round.roundNumber}</h3>

    <button
      type="button"
      onClick={() => addMatch(roundIndex)}
      className="add-match-btn"
    >
      + Add Match
    </button>
          <table style={{ width: '100%', marginBottom: 8 }}>
            <thead>
              <tr>
                <th>Team 1</th>
                <th>Team 2</th>
                <th>Date</th>
                <th>Court</th>
                <th>Time Slot</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {round.matches.map((match, matchIdx) => (
          <tr key={match.id || matchIdx}>
            <td>
              <select
                value={match.player1}
                onChange={(e) =>
                  updateMatch(roundIndex, matchIdx, "player1", e.target.value)
                }
              >
                <option value="">Select</option>

                {getAvailablePlayers(
                  roundIndex,
                  matchIdx,
                  "player1",
                  match
                ).map((p) => (
                  <option key={p.username} value={p.username}>
                    {p.display || p.username}
                  </option>
                ))}
                </select>
            </td>

            <td>
              <select
                value={match.player2}
                onChange={(e) =>
                  updateMatch(roundIndex, matchIdx, "player2", e.target.value)
                }
              >
                <option value="">Select</option>

                {getAvailablePlayers(
                  roundIndex,
                  matchIdx,
                  "player2",
                  match
                ).map((p) => (
                  <option key={p.username} value={p.username}>
                    {p.display || p.username}
                  </option>
                  ))}
              </select>
            </td>

            <td>
              <input
                type="date"
                value={match.date}
                onChange={(e) =>
                  updateMatch(roundIndex, matchIdx, "date", e.target.value)
                }
              />
            </td>
            <td>
              <input
                type="text"
                value={match.court}
                onChange={(e) =>
                  updateMatch(roundIndex, matchIdx, "court", e.target.value)
                }
              />
            </td>

            <td>
              <input
                type="text"
                value={match.timeSlot}
                onChange={(e) =>
                  updateMatch(roundIndex, matchIdx, "timeSlot", e.target.value)
                }
              />
            </td>
            <td>
              <button
                type="button"
                onClick={() => removeMatch(roundIndex, matchIdx)}
              >
                Remove
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
))}
<button
  type="button"
  onClick={addRound}
  className="add-round-btn"
>
  + Add Round
</button>
            <div className="draw-dialog-actions">
            <button className="save-btn" onClick={handleSave}>Save Schedule</button>
            <button className="cancel-btn" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
  }

// Removed duplicate export default
export default DrawMatchDialog;
