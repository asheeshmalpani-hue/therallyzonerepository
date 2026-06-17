import React, { useState, useEffect } from 'react';
import MatchScheduleDialog from "./MatchScheduleDialog";
import "./TournamentSearch.css";

function CompletedTournament() {
  // --- Copied and adapted from CompletedLadders.js ---
  const [completedTournaments, setCompletedTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompleted = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://therallyzonebackendrepository-production.up.railway.app/api/tournaments/closed");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setCompletedTournaments(data.filter(row => row.category && row.category.toLowerCase() !== 'ladder').map(row => ({
          id: row.id,
          name: row.name,
          category: row.category,
          ageCriteria: row.Age_criteria,
          Location: row.Location,
          status: row.status,
          date: row.date,
          fees: row.fee
        })));
        setError(null);
      } catch (e) {
        setError("Failed to load completed tournaments. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchCompleted();
  }, []);

  if (loading) return <div>Loading Completed Tournaments...</div>;
  if (error) return <div style={{color:'red'}}>{error}</div>;
  return (
    <div>
      <div>Completed Tournaments ({completedTournaments.length})</div>
      <table className="tournament-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Age Criteria</th>
            <th>Location</th>
            <th>Status</th>
            <th>Date</th>
            <th>Fee</th>
          </tr>
        </thead>
        <tbody>
          {completedTournaments.map(tournament => (
            <tr key={tournament.id}>
              <td>{tournament.name}</td>
              <td>{tournament.category}</td>
              <td>{tournament.ageCriteria}</td>
              <td>{tournament.Location}</td>
              <td>{tournament.status}</td>
              <td>{tournament.date ? new Date(tournament.date).toLocaleDateString() : ''}</td>
              <td>{tournament.fees}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CompletedTournament;
