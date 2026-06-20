import React from "react";
import "./TournamentsMenu.css";
import UpcomingOtherTournaments from "./UpcomingOtherTournaments";
import UpcomingTournament from "./UpcomingTournament";
import TournamentSearch from "./TournamentSearch";
import CompletedTournament from "./CompletedTournament";

export default function TournamentsMenu({ currentUser }) {
  const [activeTab, setActiveTab] = React.useState('upcoming');

  return (
    <div className="tournaments-menu-container">
      <div className="tournament-tabs">
        <button
          className={"tournament-tab-btn" + (activeTab === 'upcoming' ? ' active' : '')}
          style={{
            border: '1px solid #1976d2',
            borderRight: 'none',
            borderRadius: '8px 0 0 8px',
            padding: '12px 32px',
            background: activeTab === 'upcoming' ? '#1976d2' : '#fff',
            color: activeTab === 'upcoming' ? '#fff' : '#1976d2',
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none',
            fontSize: 18
          }}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming Ladders
        </button>
        <button
          className={"tournament-tab-btn" + (activeTab === 'upcomingOther' ? ' active' : '')}
          style={{
            border: '1px solid #1976d2',
            borderLeft: 'none',
            borderRight: 'none',
            borderRadius: 0,
            padding: '12px 32px',
            background: activeTab === 'upcomingOther' ? '#1976d2' : '#fff',
            color: activeTab === 'upcomingOther' ? '#fff' : '#1976d2',
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none',
            fontSize: 18
          }}
          onClick={() => setActiveTab('upcomingOther')}
        >
          Upcoming Tournaments
        </button>
        <button
          className={"tournament-tab-btn" + (activeTab === 'completed' ? ' active' : '')}
          style={{
            border: '1px solid #1976d2',
            borderLeft: 'none',
            borderRight: 'none',
            borderRadius: 0,
            padding: '12px 32px',
            background: activeTab === 'completed' ? '#1976d2' : '#fff',
            color: activeTab === 'completed' ? '#fff' : '#1976d2',
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none',
            fontSize: 18
          }}
          onClick={() => setActiveTab('completed')}
        >
          Completed Ladders
        </button>
        <button
          className={"tournament-tab-btn" + (activeTab === 'completedTournament' ? ' active' : '')}
          style={{
            border: '1px solid #1976d2',
            borderLeft: 'none',
            borderRadius: '0 8px 8px 0',
            padding: '12px 32px',
            background: activeTab === 'completedTournament' ? '#1976d2' : '#fff',
            color: activeTab === 'completedTournament' ? '#fff' : '#1976d2',
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none',
            fontSize: 18
          }}
          onClick={() => setActiveTab('completedTournament')}
        >
          Completed Tournaments
        </button>
      </div>
      <div style={{ marginTop: 32 }}>
        {activeTab === 'upcoming' && <UpcomingTournament currentUser={currentUser} />}
        {activeTab === 'upcomingOther' && <UpcomingOtherTournaments currentUser={currentUser} />}
        {activeTab === 'completed' && <TournamentSearch />}
        {activeTab === 'completedTournament' && <CompletedTournament />}
      </div>
    </div>
  );
}
