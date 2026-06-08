import React, { useState } from "react";

function PartnerSelectionDialog({ open, onClose, onSelect, playerList, currentUser }) {
  const [selectedPartner, setSelectedPartner] = useState("");

  if (!open) return null;

  // Exclude current user from partner list
  const filteredPlayers = playerList.filter(p => p !== currentUser);

  return (
    <div className="partner-dialog-backdrop" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="partner-dialog" style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 320, boxShadow: '0 2px 16px rgba(0,0,0,0.18)' }}>
        <h2>Select Your Partner</h2>
        <div style={{ margin: '16px 0' }}>
          <select
            value={selectedPartner}
            onChange={e => setSelectedPartner(e.target.value)}
            style={{ width: '100%', padding: 8, fontSize: 16 }}
          >
            <option value="">-- Select Partner --</option>
            {filteredPlayers.map((name, idx) => (
              <option key={idx} value={name}>{name}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button onClick={onClose} style={{ padding: '6px 18px' }}>Cancel</button>
          <button
            onClick={() => onSelect(selectedPartner)}
            style={{ padding: '6px 18px' }}
          >
            Confirm
          </button>
        </div>
        <div style={{ marginTop: 12, fontSize: 13, color: '#888' }}>
          You can select your partner now or later from your attendance record.
        </div>
      </div>
    </div>
  );
}

export default PartnerSelectionDialog;
