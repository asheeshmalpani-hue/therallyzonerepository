import React, { useState } from 'react';

export default function AddTournamentDialog({ open, onClose }) {
  const [tournament, setTournament] = useState({
    name: '',
    date: '',
    category: 'Individual',
    fee: '',
    status: 'Open',
    location: '',
    Age_criteria: 'Open'
  });
  const [teams, setTeams] = useState([
    {
      team_name: 'Individual',
      events: [
        {
          event_type: 'Singles',
          draws: [
            { draw_name: '', draw_size: '', winner: '', runnersup: '', prize_money: '' }
          ]
        }
      ]
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const validateTeams = (teams) => {
  for (const team of teams) {
    for (const event of team.events || []) {
      for (const draw of event.draws || []) {
        if (!draw.draw_name || !draw.draw_name.toString().trim()) {
          return false;
        }
      }
    }
  }
  return true;
};

  const handleTournamentChange = e => {
    setTournament({ ...tournament, [e.target.name]: e.target.value });
  };

  // Team handlers
  const handleTeamNameChange = (teamIdx, e) => {
    const updated = [...teams];
    updated[teamIdx].team_name = e.target.value;
    setTeams(updated);
  };
  const addTeam = () => {
    setTeams([...teams, {
      team_name: 'Individual',
      events: [
        {
          event_type: 'Singles',
          draws: [
            { draw_name: '', draw_size: '', winner: '', runnersup: '', prize_money: '' }
          ]
        }
      ]
    }]);
  };
  const removeTeam = idx => {
    setTeams(teams.filter((_, i) => i !== idx));
  };
  // Event handlers (per team)
  const handleEventChange = (teamIdx, eventIdx, e) => {
    const updated = [...teams];
    updated[teamIdx].events[eventIdx][e.target.name] = e.target.value;
    setTeams(updated);
  };
  const addEvent = teamIdx => {
    const updated = [...teams];
    updated[teamIdx].events.push({
      event_type: 'Singles',
      draws: [
        { draw_name: '', draw_size: '', winner: '', runnersup: '', prize_money: '' }
      ]
    });
    setTeams(updated);
  };
  const removeEvent = (teamIdx, eventIdx) => {
    const updated = [...teams];
    updated[teamIdx].events = updated[teamIdx].events.filter((_, i) => i !== eventIdx);
    setTeams(updated);
  };
  // Draw handlers (per event per team)
  const handleDrawChange = (teamIdx, eventIdx, drawIdx, e) => {
    const updated = [...teams];
    updated[teamIdx].events[eventIdx].draws[drawIdx][e.target.name] = e.target.value;
    setTeams(updated);
  };
  const addDraw = (teamIdx, eventIdx) => {
    const updated = [...teams];
    updated[teamIdx].events[eventIdx].draws.push({ draw_name: '', draw_size: '', winner: '', runnersup: '', prize_money: '' });
    setTeams(updated);
  };
  const removeDraw = (teamIdx, eventIdx, drawIdx) => {
    const updated = [...teams];
    updated[teamIdx].events[eventIdx].draws = updated[teamIdx].events[eventIdx].draws.filter((_, i) => i !== drawIdx);
    setTeams(updated);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    if (!validateTeams(teams)) {
      setError('Please enter a Draw Name for every draw.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/admin/add-tournament-with-events-draws', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournament, teams })
      });
      if (!res.ok) throw new Error('Failed to add tournament');
      setSuccess(true);
      setTournament({ name: '', date: '', category: '', fee: '', status: '', location: '', Age_criteria: '' });
      setTeams([
        {
          team_name: '',
          events: [
            {
              event_type: 'Singles',
              draws: [
                { draw_name: '', draw_size: '', winner: '', runnersup: '', prize_money: '' }
              ]
            }
          ]
        }
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="dialog-backdrop">
      <div className="dialog">
        <h2>Add Tournament</h2>
        <form onSubmit={handleSubmit}>
          <h4>Tournament Details</h4>
          <div>
            <label>Category:
              <select name="category" value={tournament.category} onChange={e => setTournament({ ...tournament, category: e.target.value })} required>
                <option value="Individual">Individual</option>
                <option value="Ladder">Ladder</option>
                <option value="Team">Team</option>
              </select>
            </label>
          </div>
          <div>
            <label>Date: <input type="date" name="date" value={tournament.date} onChange={e => setTournament({ ...tournament, date: e.target.value })} required /></label>
          </div>
          <div>
            <label>Name: <input name="name" value={tournament.name} onChange={e => setTournament({ ...tournament, name: e.target.value })} required /></label>
          </div>
          <div>
            <label>Fee: <input name="fee" value={tournament.fee} onChange={e => setTournament({ ...tournament, fee: e.target.value })} required /></label>
          </div>
          <div>
            <label>Status: <input name="status" value={tournament.status} onChange={e => setTournament({ ...tournament, status: e.target.value })} required /></label>
          </div>
          <div>
            <label>Location: <input name="location" value={tournament.location} onChange={e => setTournament({ ...tournament, location: e.target.value })} required /></label>
          </div>
          <div>
            <label>Age criteria: <input name="Age_criteria" value={tournament.Age_criteria} onChange={e => setTournament({ ...tournament, Age_criteria: e.target.value })} required /></label>
          </div>
          <h4>Teams</h4>
          {teams.map((team, teamIdx) => (
            <div key={teamIdx} style={{ border: '2px solid #1976d2', margin: 12, padding: 12, borderRadius: 8 }}>
              <label>Team Name: <input name="team_name" value={team.team_name} onChange={e => handleTeamNameChange(teamIdx, e)} required /></label>
              <button type="button" onClick={() => removeTeam(teamIdx)} disabled={teams.length === 1}>Remove Team</button>
              <h5>Events</h5>
              {team.events.map((event, eventIdx) => (
                <div key={eventIdx} style={{ border: '1px solid #ccc', margin: 8, padding: 8 }}>
                  <label>Event Type:
                    <select name="event_type" value={event.event_type} onChange={e => handleEventChange(teamIdx, eventIdx, e)} required>
                      <option value="Singles">Singles</option>
                      <option value="Doubles">Doubles</option>
                      <option value="Mixed Doubles">Mixed Doubles</option>
                    </select>
                  </label>
                  <button type="button" onClick={() => removeEvent(teamIdx, eventIdx)} disabled={team.events.length === 1}>Remove Event</button>
                  <h6>Draws</h6>
                  {event.draws.map((draw, drawIdx) => (
                    <div key={drawIdx} style={{ marginLeft: 16 }}>
                      {Object.keys(draw).map(field => (
                        <label key={field}>{field === 'draw_name' ? 'Draw Name' : field.replace('_', ' ')}: <input name={field} value={draw[field]} onChange={e => handleDrawChange(teamIdx, eventIdx, drawIdx, e)} required={field==='draw_name'} /></label>
                      ))}
                      <button type="button" onClick={() => removeDraw(teamIdx, eventIdx, drawIdx)} disabled={event.draws.length === 1}>Remove Draw</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addDraw(teamIdx, eventIdx)}>Add Draw</button>
                </div>
              ))}
              <button type="button" onClick={() => addEvent(teamIdx)}>Add Event</button>
            </div>
          ))}
          <button type="button" onClick={addTeam}>Add Team</button>
          <div style={{ marginTop: 16 }}>
            <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Tournament'}</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
          {error && <div style={{ color: 'red' }}>{error}</div>}
          {success && <div style={{ color: 'green' }}>Tournament added successfully!</div>}
        </form>
      </div>
      <style>{`
        .dialog-backdrop { position: fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.2); display:flex; align-items:center; justify-content:center; z-index:1000; }
        .dialog { background:#fff; padding:24px; border-radius:8px; min-width:350px; max-width:90vw; max-height:90vh; overflow:auto; }
        label { display:block; margin:4px 0; }
        input, select { margin-left:8px; }
        button { margin:4px; }
      `}</style>
    </div>
  );
}
