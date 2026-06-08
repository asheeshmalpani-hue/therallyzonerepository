import React, { useState } from 'react';
import AddTournamentDialog from './AddTournamentDialog';


function AdminDashboard() {
  const [showAddTournament, setShowAddTournament] = useState(false);
  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: 32 }}>
      <h1 style={{ textAlign: 'center', color: '#1a237e', marginBottom: 32 }}>Admin Dashboard</h1>
      <div style={{ marginBottom: 40 }}>
        <h3>Add Tournaments</h3>
        <button onClick={() => setShowAddTournament(true)}>Add Tournament</button>
        <AddTournamentDialog open={showAddTournament} onClose={() => setShowAddTournament(false)} />
      </div>
      {/* Future admin features can be added here as more sections */}
    </div>
  );
}

export default AdminDashboard;
