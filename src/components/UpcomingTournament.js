
import React, { useState, useEffect, useRef } from "react";
import PartnerSelectionDialog from "./PartnerSelectionDialog";
import { useNavigate } from "react-router-dom";
import DrawMatchDialog from "./DrawMatchDialog";
import MatchScheduleDialog from "./MatchScheduleDialog";
import "./Home.css";
import ReactDOM from "react-dom";

function UpcomingTournament({ currentUser }) {
  const navigate = useNavigate();
  // State for DrawMatchDialog editing (matches: flat array)
  const [drawMatches, setDrawMatches] = useState([]);
  const [drawRounds, setDrawRounds] = useState([
  {
    roundNumber: 1,
    matches: []
  }
]);
  // State for partner selection dialog
  const [partnerDialog, setPartnerDialog] = useState({ open: false, tournamentId: null, tournamentName: null, playerList: [], eventType: '', callback: null });

    // Handlers for DrawMatchDialog (rounds)
    //const addMatch = () => {
    //  const today = new Date();
    //  const yyyy = today.getFullYear();
    //  const mm = String(today.getMonth() + 1).padStart(2, '0');
    //  const dd = String(today.getDate()).padStart(2, '0');
    //  const todayStr = `${yyyy}-${mm}-${dd}`;
    //  setDrawMatches(prev => [...prev, { id: Date.now(), player1: '', player2: '', date: todayStr, court: '', timeSlot: '' }]);
    //};
  const addMatch = (roundIndex) => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;
  setDrawRounds(prev =>
    prev.map((round, idx) =>
      idx === roundIndex
        ? {
            ...round,
            matches: [
              ...round.matches,
              {
                id: Date.now(),
                player1: '',
                player2: '',
                date: todayStr,
                court: '',
                timeSlot: ''
              }
            ]
          }
        : round
    )
  );
};
const addRound = () => {
  setDrawRounds(prev => [
    ...prev,
    {
      roundNumber: prev.length + 1,
      matches: []
    }
  ]);
};
const isDuplicatePair = (player1, player2) => {
  const pair1 = `${player1}|${player2}`;
  const pair2 = `${player2}|${player1}`;

  for (const round of drawRounds) {
    for (const match of round.matches) {
      const existing = `${match.player1}|${match.player2}`;
      if (existing === pair1 || existing === pair2) {
        return true;
      }
    }
  }

  return false;
};
    //const updateMatch = (matchIdx, field, value) => setDrawMatches(prev => prev.map((m, j) => j === matchIdx ? { ...m, [field]: value } : m));
    const updateMatch = (roundIndex, matchIdx, field, value) => {
  setDrawRounds(prev =>
    prev.map((round, rIdx) =>
      rIdx === roundIndex
        ? {
            ...round,
            matches: round.matches.map((match, mIdx) =>
              mIdx === matchIdx
                ? { ...match, [field]: value }
                : match
            )
          }
        : round
    )
  );
};
    //const removeMatch = (matchIdx) => setDrawMatches(prev => prev.filter((_, j) => j !== matchIdx));
    const removeMatch = (roundIndex, matchIdx) => {
  setDrawRounds(prev =>
    prev.map((round, rIdx) =>
      rIdx === roundIndex
        ? {
            ...round,
            matches: round.matches.filter(
              (_, mIdx) => mIdx !== matchIdx
            )
          }
        : round
    )
  );
};
    const handleSave = async () => {
  if (!drawDialog.draw_id) {
    showMessage('Draw information missing.');
    return;
  }
  const matches = drawRounds.flatMap(round =>
    round.matches.map(m => ({
      draw_id: drawDialog.draw_id,

      player1: m.player1,
      player2: m.player2,

      date: m.date,
      court: m.court,
      time_slot: m.timeSlot,

      winner: m.winner || '',
      match_score: m.match_score || '',
      match_status: m.match_status || 'scheduled'
    }))
  );

  if (matches.length === 0) {
    showMessage('Please add at least one match.');
    return;
  }
      try {
        const res = await fetch('https://therallyzonebackendrepository-production.up.railway.app/api/match-draw', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            draw_id: drawDialog.draw_id,
            tournamentId: drawDialog.tournamentId,
            //tournamentName: drawDialog.tournamentName,
            matches
          })
        });
        if (!res.ok) throw new Error('Failed to save match schedule');
        showMessage('Match schedule saved successfully.');
        closeDrawDialog();
      } catch (error) {
        showMessage('Error saving match schedule.');
      }
    };
  const [tournaments, setTournaments] = useState([]);
  const [eventNames, setEventNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userList, setUserList] = useState([]);
  const [attendance, setAttendance] = useState(() => {
    try {
      const raw = localStorage.getItem('attendanceStatus');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
  const [authDialog, setAuthDialog] = useState({ open: false, tournamentId: null, status: null, tournamentName: null });
  // Store pending attendance action if login is required
  const pendingActionRef = useRef(null);
  const [rankings, setRankings] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [attendanceLog, setAttendanceLog] = useState([]);
  const [messageDialog, setMessageDialog] = useState({ open: false, message: '', onConfirm: null });
  const [openMenuId, setOpenMenuId] = useState(null);
  const [drawDialog, setDrawDialog] = useState({ open: false, tournamentId: null, draw_id: null, players: [] });
  const [matchScheduleDialog, setMatchScheduleDialog] = useState({ open: false, tournamentId: null, tournamentName: null, tournamentCategory: null, matches: [], resultsOnly: false });

  // Fetch rankings from backend (same as Home.js)
  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const res = await fetch('https://therallyzonebackendrepository-production.up.railway.app/api/user-rankings');
        if (!res.ok) throw new Error('Failed to fetch rankings');
        const data = await res.json();
        setRankings(data);
        setLastUpdated(new Date());
      } catch (error) {
        setRankings([]);
        setLastUpdated(new Date());
      }
    };
    fetchRankings();
    // Optionally, refresh rankings every week (same as Home.js)
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const id = setInterval(fetchRankings, weekMs);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://therallyzonebackendrepository-production.up.railway.app/api/tournaments");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        // Map backend fields to expected frontend names (like Home.js)
        setTournaments(data.map(row => ({
          id: row.id,
          name: row.name,
          category: row.category,
          ageCriteria: row.Age_criteria,
          Location: row.Location,
          status: row.status,
          date: row.date,
          fees: row.fee,
          draw_id: row.draw_id,
          draw_name: row.draw_name
        })));
        // Fetch event names for each tournament
        data.forEach(row => {
          fetch(`https://therallyzonebackendrepository-production.up.railway.app/api/tournament-event-name/${row.id}`)
            .then(res => res.ok ? res.json() : null)
            .then(ev => {
              if (ev && ev.event_name) {
                setEventNames(prev => ({ ...prev, [row.id]: ev.event_name }));
              }
            });
        });
        setError(null);
      } catch (e) {
        setError("Failed to load tournaments. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('https://therallyzonebackendrepository-production.up.railway.app/api/users');
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();
        setUserList(data);
      } catch (e) {
        setUserList([]);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await fetch('https://therallyzonebackendrepository-production.up.railway.app/api/attendance');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setAttendanceLog(data);
      } catch (e) {
        setAttendanceLog([]);
      }
    };
    fetchAttendance();
  }, []);

  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem('authToken');
      const user = localStorage.getItem('user');
      if (token && user) setIsLoggedIn(true);
      else setIsLoggedIn(false);
    };
    checkLogin();
    window.addEventListener('userLoggedIn', checkLogin);
    window.addEventListener('userLoggedOut', checkLogin);
    return () => {
      window.removeEventListener('userLoggedIn', checkLogin);
      window.removeEventListener('userLoggedOut', checkLogin);
    };
  }, []);

  const toggleMenu = (tournamentId) => {
    setOpenMenuId(openMenuId === tournamentId ? null : tournamentId);
  };

  // Show message dialog
  const showMessage = (msg) => setMessageDialog({ open: true, message: msg, onConfirm: null });

  // Fetch and show match schedule
  const viewMatchSchedule = async (tournamentId, tournamentName, draw_id) => {
    try {
      const res = await fetch(`https://therallyzonebackendrepository-production.up.railway.app/api/match-draw/${draw_id}`);
      if (!res.ok) throw new Error('Failed to fetch match schedule');
      let matches = await res.json();
      if (matches.length === 0) {
        showMessage('No match schedule available yet. Please create a draw first.');
        return;
      }
      //console.log('MATCHES FROM API:', matches);
      const tournament = tournaments.find(t => t.id === tournamentId);
      const tournamentCategory = tournament?.category || tournament?.tournament_category || '';
      const tournamentLocation = tournament?.Location || tournament?.location || '';
      const drawName = tournament?.draw_name || '';
      // Map player rankings for each match, filter by category and location
      const lowestRanking = rankings.length > 0 ? Math.max(...rankings.map(r => r.ranking)) : 'N/A';
      matches = matches.map(match => {
      const user1 = userList.find(u => u.username === match.player1);
      const user1Partner = userList.find(u => u.username === match.player1_p);

      const user2 = userList.find(u => u.username === match.player2);
      const user2Partner = userList.find(u => u.username === match.player2_p);

      const user1Id = user1 ? user1.id : null;
      const user1PartnerId = user1Partner ? user1Partner.id : null;

      const user2Id = user2 ? user2.id : null;
      const user2PartnerId = user2Partner ? user2Partner.id : null;
      const rank1 = rankings.find(
        r =>
          r.user_id === user1Id &&
          r.tournament_category === tournamentCategory &&
          r.Location === tournamentLocation &&
          r.draw_name === drawName
      );

  const rank1Partner = rankings.find(
    r =>
      r.user_id === user1PartnerId &&
      r.tournament_category === tournamentCategory &&
      r.Location === tournamentLocation &&
      r.draw_name === drawName
  );
  const rank2 = rankings.find(
    r =>
      r.user_id === user2Id &&
      r.tournament_category === tournamentCategory &&
      r.Location === tournamentLocation &&
      r.draw_name === drawName
  );

  const rank2Partner = rankings.find(
    r =>
      r.user_id === user2PartnerId &&
      r.tournament_category === tournamentCategory &&
      r.Location === tournamentLocation &&
      r.draw_name === drawName
  );

  let player1Display = match.player1;
  let player2Display = match.player2;
  if (match.player1_p) {
    player1Display =
      `${match.player1} (${rank1 ? rank1.ranking : lowestRanking})` +
      ` & ${match.player1_p} (${rank1Partner ? rank1Partner.ranking : lowestRanking})`;
  } else {
    player1Display =
      `${match.player1} (${rank1 ? rank1.ranking : lowestRanking})`;
  }

  if (match.player2_p) {
    player2Display =
      `${match.player2} (${rank2 ? rank2.ranking : lowestRanking})` +
      ` & ${match.player2_p} (${rank2Partner ? rank2Partner.ranking : lowestRanking})`;
  } else {
    player2Display =
      `${match.player2} (${rank2 ? rank2.ranking : lowestRanking})`;
  }
        return {
          ...match,
          player1Display,
          player2Display,
          player1Ranking: rank1 ? rank1.ranking : lowestRanking,
          player2Ranking: rank2 ? rank2.ranking : lowestRanking
        };
      });
      setMatchScheduleDialog({ open: true, tournamentId, tournamentName, tournamentCategory, tournamentLocation, matches, resultsOnly: false });
    } catch (error) {
      showMessage('Failed to load match schedule.');
    }
  };

  // Fetch and show match results
  const viewMatchResults = async (tournamentId, tournamentName, draw_id) => {
    try {
      const res = await fetch(`https://therallyzonebackendrepository-production.up.railway.app/api/match-draw/${draw_id}`);
      if (!res.ok) throw new Error('Failed to fetch match results');
      const allMatches = await res.json();
      const completedMatches = allMatches.filter(m => m.winner);
      if (completedMatches.length === 0) {
        showMessage('No match results available yet. Complete some matches first.');
        return;
      }
      const tournament = tournaments.find(t => t.id === tournamentId);
      const tournamentCategory = tournament?.category || tournament?.tournament_category || '';
      const tournamentLocation = tournament?.Location || tournament?.location || '';
      const drawName = tournament?.draw_name || '';
      const lowestRanking =
  rankings.length > 0
    ? Math.max(...rankings.map(r => r.ranking))
    : 'N/A';

const formattedMatches = completedMatches.map(match => {
  const user1 = userList.find(u => u.username === match.player1);
  const user2 = userList.find(u => u.username === match.player2);

  const user1Id = user1 ? user1.id : null;
  const user2Id = user2 ? user2.id : null;

  const rank1 = rankings.find(
    r =>
      r.user_id === user1Id &&
      r.tournament_category === tournamentCategory &&
      r.Location === tournamentLocation &&
      r.draw_name === drawName
  );
  const rank2 = rankings.find(
    r =>
      r.user_id === user2Id &&
      r.tournament_category === tournamentCategory &&
      r.Location === tournamentLocation &&
      r.draw_name === drawName
  );
 let player1Display = match.player1;
let player2Display = match.player2;

if (match.player1_p && match.player1_p.trim() !== '') {
  player1Display =
    `${match.player1} & ${match.player1_p}`;
}

if (match.player2_p && match.player2_p.trim() !== '') {
  player2Display =
    `${match.player2} & ${match.player2_p}`;
}
 
  return {
    ...match,
    player1Display,
    player2Display,
    player1Ranking: rank1 ? rank1.ranking : lowestRanking,
    player2Ranking: rank2 ? rank2.ranking : lowestRanking
  };
});
      setMatchScheduleDialog({ open: true, tournamentId, tournamentName, tournamentCategory, matches: formattedMatches, tournamentLocation, resultsOnly: true });
    } catch (error) {
      showMessage('Failed to load match results.');
    }
  };

  // Open Draw dialog (admin only)
  const openDrawDialog = async (tournamentId, draw_id) => {
    console.log('openDrawDialog called', { draw_id });
    if (!currentUser?.isAdmin) {
      showMessage('Only administrators can create or edit match schedules.');
      return;
    }
    setDrawRounds([
    {
      roundNumber: 1,
      matches: []
    }
  ]);
  const tournament = tournaments.find(t => t.id === tournamentId);
  const tournamentCategory =
  tournament?.category || tournament?.tournament_category || '';
  const tournamentLocation =
  tournament?.Location || tournament?.location || '';
  const drawName =
  tournament?.draw_name || '';  
  const tournamentAttendance = attendanceLog.filter(a => a.draw_id === draw_id);
    const inPlayers = tournamentAttendance.filter(a => a.in_user).map(a => a.in_user);
            if (inPlayers.length < 2) {
      showMessage('At least 2 players must mark attendance as "In" to create a draw.');
      return;
    }
    //const tournament = tournaments.find(t => t.id === tournamentId);
    //const tournamentCategory = tournament?.category || tournament?.tournament_category || '';
    // Build player objects with ranking and display (like Home.js)
    //const playerObjs = inPlayers.map(username => {
    //  const userObj = userList.find(u => u.username === username);
    //  const userId = userObj ? userObj.id : null;
    //  const rankObj = rankings.find(r => r.user_id === userId);
    //  const ranking = rankObj ? rankObj.ranking : 'N/A';
    //  return {
     //   username,
     //   ranking,
     //   display: `${username} (${ranking})`
       const playerObjs = tournamentAttendance.filter(a => a.in_user).map(a => {
    // Ranking for in_user
    const user1 = userList.find(u => u.username === a.in_user);
    const user1Id = user1 ? user1.id : null;
    const rank1Obj = rankings.find(r => r.user_id === user1Id &&
    r.tournament_category === tournamentCategory &&
    r.Location === tournamentLocation &&
    r.draw_name === drawName 
  );
    const rank1 = rank1Obj ? rank1Obj.ranking : 'N/A';
    let displayName = `${a.in_user} (${rank1})`;
    let usernameValue = a.in_user;
    // Ranking for in_partner if exists
    if (a.in_partner && a.in_partner.trim() !== "") {
      const user2 = userList.find(u => u.username === a.in_partner);
      const user2Id = user2 ? user2.id : null;
      const rank2Obj = rankings.find(r => r.user_id === user2Id &&
        r.tournament_category === tournamentCategory &&
        r.Location === tournamentLocation &&
        r.draw_name === drawName
      );
      const rank2 = rank2Obj ? rank2Obj.ranking : 'N/A';
      displayName = `${a.in_user} (${rank1}) & ${a.in_partner} (${rank2})`;
      // THIS is important
      usernameValue = `${a.in_user}::${a.in_partner}`;
    }
    return {
      //username: displayName,
      username: usernameValue,
      display: displayName 
        };
    });
    // Always start with a single empty round for new draw
    //setDrawMatches([]);
    setDrawRounds([
  {
    roundNumber: 1,
    matches: []
  }
]);
    setDrawDialog({ open: true, tournamentId, draw_id, players: playerObjs });
  };

  // Open Edit Schedule dialog (admin only)
  const openEditScheduleDialog = async (tournamentId, tournamentName, draw_id) => {
    console.log('openEditScheduleDialog called', { tournamentId, tournamentName, draw_id });
    if (!currentUser?.isAdmin) {
      showMessage('Only administrators can edit match schedules.');
      return;
    }
    const tournament = tournaments.find(t => t.id === tournamentId);
    const tournamentCategory = tournament?.category || tournament?.tournament_category || '';
    const tournamentLocation = tournament?.Location || tournament?.location || '';
    const drawName = tournament?.draw_name || '';
    try {
      const res = await fetch(`https://therallyzonebackendrepository-production.up.railway.app/api/match-draw/${draw_id}`);
      if (res.ok) {
        const existingMatches = await res.json();

  const mappedMatches = existingMatches.map((m, idx) => ({
    id: m.id || m.match_id || `edit-${Date.now()}-${idx}`,
    player1:
    m.player1_p && m.player1_p.trim() !== ''
    ? `${m.player1}::${m.player1_p}`
    : (m.player1 || ''),

    player1_p: m.player1_p || '',

    player2:
    m.player2_p && m.player2_p.trim() !== ''
    ? `${m.player2}::${m.player2_p}`
    : (m.player2 || ''),

    player2_p: m.player2_p || '',
    date: m.match_date || m.date || '',
    court: m.court || '',
    timeSlot: m.time_slot || m.timeSlot || '',
    draw_id: m.draw_id || draw_id
        }));
        //setDrawMatches(mappedMatches);
        setDrawRounds([
      {
        roundNumber: 1,
        matches: mappedMatches
      }
    ]);
        // Build player list from all unique player1/player2 in matches
        //const allPlayers = Array.from(new Set(existingMatches.flatMap(m => [m.player1, m.player2]).filter(Boolean)));
        //setDrawDialog({ open: true, tournamentId, draw_id, players: allPlayers });
        //return;
        const playerMap = new Map();

mappedMatches.forEach(match => {

  // PLAYER 1 TEAM
  let player1Username = match.player1;
  let player1Display = match.player1;

  if (match.player1_p) {
    player1Username =
      `${match.player1}::${match.player1_p}`;

    player1Display =
      `${match.player1} & ${match.player1_p}`;
  }

  playerMap.set(player1Username, {
    username: player1Username,
    display: player1Display
  });
  // PLAYER 2 TEAM
  let player2Username = match.player2;
  let player2Display = match.player2;

  if (match.player2_p) {
    player2Username =
      `${match.player2}::${match.player2_p}`;

    player2Display =
      `${match.player2} & ${match.player2_p}`;
  }

  playerMap.set(player2Username, {
    username: player2Username,
    display: player2Display
  });

});

const allPlayers = Array.from(playerMap.values());

        setDrawDialog({ open: true, tournamentId, draw_id, players: allPlayers });
        return;
      }
    } catch (error) {}
    showMessage('No existing match schedule to edit. Please create a draw first.');
  };

  // Updated menu handler to use new logic
  const handleMenuOption = (tournamentId, option) => {
    setOpenMenuId(null);
    const tournament = tournaments.find(t => t.id === tournamentId);
    //console.log('TOURNAMENT OBJECT:', tournament);
    const tournamentName = tournament?.name || '';
    const draw_id = tournament?.draw_id || null;
    switch(option) {
      case 'schedule':
        viewMatchSchedule(tournamentId, tournamentName, draw_id);
        break;
      case 'results':
        viewMatchResults(tournamentId, tournamentName, draw_id);
        break;
      case 'draw':
        openDrawDialog(tournamentId, draw_id);
        break;
      case 'edit-schedule':
        openEditScheduleDialog(tournamentId, tournamentName, draw_id);
        break;
      case 'details':
        showMessage('Tournament details coming soon!');
        break;
      default:
        break;
    }
  };

  const handleAttendanceClick = async (tournamentId, status, tournamentName) => {
    if (!isLoggedIn || !currentUser) {
      // Store pending action
      pendingActionRef.current = { tournamentId, status, tournamentName };
      setAuthDialog({ open: true, tournamentId, status, tournamentName });
      return;
    }
    const userName = currentUser.fullName || currentUser.username;
    const eventType = eventNames[tournamentId] || '';
    const tournament = tournaments.find(t => t.id === tournamentId);
    const draw_id = tournament && tournament.draw_id ? tournament.draw_id : null;
    const tournamentAttendance = attendanceLog.filter(a => a.tournament_name === tournamentName && a.draw_id === draw_id);
    if (status === 'out') {
      // Find if user is in_user or in_partner
      const found = tournamentAttendance.find(a => a.in_user === userName || a.in_partner === userName);
      if (found) {
        // Move user to out_user or out_partner
        const isInUser = found.in_user === userName;
        await saveAttendanceWithPartner(tournamentId, tournamentName, status, null, found.id, isInUser ? 'in_user' : 'in_partner');
        return;
      } else {
        setMessageDialog({ open: true, message: 'You are not entered. If you want to enter, click on In button.', onConfirm: null });
        return;
      }
    }

    // If user is already entered as in_user
    const alreadyIn = tournamentAttendance.find(a => a.in_user === userName);
    if (status === 'in' && alreadyIn) {
      if (eventType.toLowerCase() === 'doubles' || eventType.toLowerCase() === 'mixed doubles') {
        // Allow to add/change partner
        const inUsersNoPartner = tournamentAttendance.filter(a => a.in_user && (!a.in_partner || a.in_partner === "")).map(a => a.in_user);
        setPartnerDialog({
          open: true,
          tournamentId,
          tournamentName,
          playerList: inUsersNoPartner.filter(u => u !== userName),
          eventType,
          callback: async (selectedPartner) => {
            await saveAttendanceWithPartner(tournamentId, tournamentName, status, selectedPartner);
          }
        });
        return;
      } else {
        setMessageDialog({ open: true, message: 'You are already entered. If you want to exit, click on Out button.', onConfirm: null });
        return;
      }
    }

    // Only users who are 'in' and do not already have a partner
    const inUsersNoPartner = tournamentAttendance.filter(a => a.in_user && (!a.in_partner || a.in_partner === "")).map(a => a.in_user);
    if (status === 'in' && (eventType.toLowerCase() === 'doubles' || eventType.toLowerCase() === 'mixed doubles')) {
      setPartnerDialog({
        open: true,
        tournamentId,
        tournamentName,
        playerList: inUsersNoPartner.filter(u => u !== userName),
        eventType,
        callback: async (selectedPartner) => {
          await saveAttendanceWithPartner(tournamentId, tournamentName, status, selectedPartner);
        }
      });
      return;
    }
    await saveAttendanceWithPartner(tournamentId, tournamentName, status, null);
  };

  // Helper to save attendance, with or without partner
  const saveAttendanceWithPartner = async (tournamentId, tournamentName, status, partnerName, attendanceId = null, moveFrom = null) => {
    try {
      const userName = currentUser.fullName || currentUser.username;
      // Get draw_id from tournaments state
      const tournament = tournaments.find(t => t.id === tournamentId);
      const draw_id = tournament && tournament.draw_id ? tournament.draw_id : null;
      if (!draw_id) {
        setMessageDialog({ open: true, message: 'No draw is available for this tournament. Please contact the administrator.', onConfirm: null });
        return;
      }
      let debugPayload = {};
      let res;
      if (status === 'out' && attendanceId && moveFrom) {
        // Move user from in_user/in_partner to out_user/out_partner
        const attendanceRecord = attendanceLog.find(a => a.id === attendanceId);
        if (!attendanceRecord) throw new Error('Attendance record not found');
        debugPayload = {
          status,
          in_user: moveFrom === 'in_user' ? '' : attendanceRecord.in_user,
          in_partner: moveFrom === 'in_partner' ? '' : attendanceRecord.in_partner,
          out_user: moveFrom === 'in_user' ? userName : attendanceRecord.out_user,
          out_partner: moveFrom === 'in_partner' ? userName : attendanceRecord.out_partner,
          tournamentName,
          draw_id
        };
        // eslint-disable-next-line no-console
        console.log('Submitting OUT attendance:', debugPayload);
        res = await fetch(`https://therallyzonebackendrepository-production.up.railway.app/api/attendance/${attendanceId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(debugPayload)
        });
      } else {
        // Normal IN logic
        debugPayload = {
          status,
          in_user: userName,
          in_partner: partnerName || '',
          out_user: '',
          out_partner: '',
          tournamentName,
          draw_id
        };
        // eslint-disable-next-line no-console
        console.log('Submitting attendance:', debugPayload);
        // Find if attendance record exists for this tournament and user (either as in_user or in_partner)
        const existing = attendanceLog.find(a => a.tournament_name === tournamentName && (a.in_user === userName || a.in_partner === userName || a.out_user === userName || a.out_partner === userName));
        if (existing) {
          res = await fetch(`https://therallyzonebackendrepository-production.up.railway.app/api/attendance/${existing.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(debugPayload)
          });
        } else {
          res = await fetch('https://therallyzonebackendrepository-production.up.railway.app/api/attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(debugPayload)
          });
        }
      }
      if (!res.ok) {
        throw new Error('Failed to update attendance');
      }
      // If partner was selected, remove them from in_user attendance (to avoid duplicate)
      if (partnerName) {
        const partnerRecord = attendanceLog.find(a => a.tournament_name === tournamentName && a.in_user === partnerName);
        if (partnerRecord) {
          await fetch(`https://therallyzonebackendrepository-production.up.railway.app/api/attendance/${partnerRecord.id}`, {
            method: 'DELETE'
          });
        }
      }
      // Refresh attendance log from backend
      const attRes = await fetch('https://therallyzonebackendrepository-production.up.railway.app/api/attendance');
      if (attRes.ok) {
        const data = await attRes.json();
        setAttendanceLog(data);
      }
      setAttendance(prev => {
        const next = { ...prev, [tournamentId]: status };
        try { localStorage.setItem('attendanceStatus', JSON.stringify(next)); } catch (e) {}
        return next;
      });
    } catch (error) {
      setMessageDialog({ open: true, message: 'Failed to update attendance. Please try again.', onConfirm: null });
    }
    setPartnerDialog({ open: false, tournamentId: null, tournamentName: null, playerList: [], eventType: '', callback: null });
  };
  // Render PartnerSelectionDialog
  const renderPartnerDialog = () => (
    <PartnerSelectionDialog
      open={partnerDialog.open}
      onClose={() => setPartnerDialog({ open: false, tournamentId: null, tournamentName: null, playerList: [], eventType: '', callback: null })}
      onSelect={partner => {
        if (partnerDialog.callback) partnerDialog.callback(partner);
      }}
      playerList={partnerDialog.playerList}
      currentUser={currentUser ? (currentUser.fullName || currentUser.username) : ''}
    />
  );

  const closeAuthDialog = () => setAuthDialog({ open: false, tournamentId: null, status: null, tournamentName: null });
  const closeMessageDialog = () => setMessageDialog({ open: false, message: '', onConfirm: null });
  const closeDrawDialog = () => {
    setDrawDialog({ open: false, tournamentId: null, tournamentName: null, players: [] });
    setDrawMatches([]);
  };
  const closeMatchScheduleDialog = () => setMatchScheduleDialog({ open: false, tournamentId: null, tournamentName: null, tournamentCategory: null, matches: [], resultsOnly: false });

  // Helper to render DrawMatchDialog as a portal
  const renderDrawMatchDialog = () => {
    if (!drawDialog.open) return null;
    return ReactDOM.createPortal(
      <DrawMatchDialog
        //tournamentId={drawDialog.tournamentId}
        //tournamentName={drawDialog.tournamentName}
        //tournamentCategory={drawDialog.tournamentCategory}
        draw_id={drawDialog.draw_id}
        players={drawDialog.players}
        //matches={drawMatches}
        drawRounds={drawRounds}
        playerList={drawDialog.players || []}
        addMatch={addMatch}
        addRound={addRound}
        updateMatch={updateMatch}
        removeMatch={removeMatch}
        handleSave={handleSave}
        onClose={closeDrawDialog}
      />,
      document.body
    );
  };

  //const saveAttendanceWithPartner = async (tournamentId, tournamentName, status, partnerName, recordId = null, inField = null) => {
   // try {
    //  const userName = currentUser.fullName || currentUser.username;
     // const tournament = tournaments.find(t => t.id === tournamentId);
      //const draw_id = tournament && tournament.draw_id ? tournament.draw_id : null;
      //if (!draw_id) {
       // setMessageDialog({ open: true, message: 'No draw is available for this tournament. Please contact the administrator.', onConfirm: null });
        //return;
      //}
      //let debugPayload;
      //if (status === 'out' && recordId && inField) {
        //// Move user from in_user/in_partner to out_user/out_partner
       // debugPayload = {
        //  status,
         // in_user: inField === 'in_user' ? '' : undefined,
          //in_partner: inField === 'in_partner' ? '' : undefined,
          //out_user: inField === 'in_user' ? userName : '',
          //out_partner: inField === 'in_partner' ? userName : '',
          //tournamentName,
          //draw_id
        //};
        //// Update the record
        //const res = await fetch(`https://therallyzonebackendrepository-production.up.railway.app/api/attendance/${recordId}`, {
         // method: 'PUT',
          //headers: { 'Content-Type': 'application/json' },
          //body: JSON.stringify(debugPayload)
        //});
        //if (!res.ok) throw new Error('Failed to update attendance');
      //} else {
       // // Normal logic for In or new Out
        //debugPayload = {
         // status,
          //in_user: status === 'in' ? userName : '',
          //in_partner: status === 'in' ? (partnerName || '') : '',
          //out_user: status === 'out' ? userName : '',
          //out_partner: '',
          //tournamentName,
         // draw_id
        //};
        //let res;
        //if (recordId) {
         // res = await fetch(`https://therallyzonebackendrepository-production.up.railway.app/api/attendance/${recordId}`, {
          //  method: 'PUT',
           // headers: { 'Content-Type': 'application/json' },
            //body: JSON.stringify(debugPayload)
          //});
        //} else {
         // res = await fetch('https://therallyzonebackendrepository-production.up.railway.app/api/attendance', {
          //  method: 'POST',
           // headers: { 'Content-Type': 'application/json' },
            //body: JSON.stringify(debugPayload)
          //});
        //}
        //if (!res.ok) throw new Error('Failed to update attendance');
      //}
      //// If partner was selected, remove them from in_user attendance (to avoid duplicate)
      //if (partnerName) {
      //  const partnerRecord = attendanceLog.find(a => a.tournament_name === tournamentName && a.in_user === partnerName);
      //  if (partnerRecord) {
       //   await fetch(`https://therallyzonebackendrepository-production.up.railway.app/api/attendance/${partnerRecord.id}`, {
        //    method: 'DELETE'
         // });
        //}
      //}
      // Refresh attendance log from backend
      //const attRes = await fetch('https://therallyzonebackendrepository-production.up.railway.app/api/attendance');
      //if (attRes.ok) {
       // const data = await attRes.json();
        //setAttendanceLog(data);
      //}
    //} catch (error) {
      //setMessageDialog({ open: true, message: 'Failed to update attendance. Please try again.', onConfirm: null });
    //}
  //};

  // Helper to render MatchScheduleDialog as a portal
  const renderMatchScheduleDialog = () => {
    if (!matchScheduleDialog.open) return null;
    return ReactDOM.createPortal(
      <MatchScheduleDialog
        tournamentId={matchScheduleDialog.tournamentId}
        tournamentName={matchScheduleDialog.tournamentName}
        tournamentCategory={matchScheduleDialog.tournamentCategory}
        tournamentLocation={matchScheduleDialog.tournamentLocation}
        matches={matchScheduleDialog.matches}
        onClose={closeMatchScheduleDialog}
        resultsOnly={matchScheduleDialog.resultsOnly}
        isAdmin={currentUser?.isAdmin || false}
        userList={userList}
        rankings={rankings}
        onRefresh={async () => {
          // Refresh match schedule data after saving results
          if (matchScheduleDialog.tournamentId) {
            const tournamentId = matchScheduleDialog.tournamentId;
            const tournamentName = matchScheduleDialog.tournamentName;
            const tournamentCategory = matchScheduleDialog.tournamentCategory;
            const resultsOnly = matchScheduleDialog.resultsOnly;
  
            const drawId = matchScheduleDialog.matches && 
            matchScheduleDialog.matches.length > 0
            ? matchScheduleDialog.matches[0].draw_id
            : null;
            const tournament = tournaments.find(t => t.id === tournamentId);
            const tournamentLocation = tournament ? (tournament.location || tournament.Location) : undefined;
            try {
              // Fetch latest rankings
              const rankingsRes = await fetch('https://therallyzonebackendrepository-production.up.railway.app/api/user-rankings');
              let latestRankings = rankings;
              if (rankingsRes.ok) {
                latestRankings = await rankingsRes.json();
                setRankings(latestRankings);
              }
              // Fetch latest matches
              if (!drawId) {
                throw new Error('Draw ID not found');
            }
              const res = await fetch(`https://therallyzonebackendrepository-production.up.railway.app/api/match-draw/${drawId}`);
              if (!res.ok) throw new Error('Failed to refresh matches');
              let allMatches = await res.json();
              //console.log('REFRESH MATCHES:', allMatches);
              let matches = resultsOnly ? allMatches.filter(m => m.winner) : allMatches;
              // Re-map player rankings for each match using latestRankings
              const lowestRanking = latestRankings.length > 0 ? Math.max(...latestRankings.map(r => r.ranking)) : 'N/A';
              matches = matches.map(match => {
                const user1 = userList.find(u => u.username === match.player1);
                const user2 = userList.find(u => u.username === match.player2);
                const user1Id = user1 ? user1.id : null;
                const user2Id = user2 ? user2.id : null;
                const rank1 = latestRankings.find(r => r.user_id === user1Id && r.tournament_category === tournamentCategory && r.Location === tournamentLocation && r.draw_name === match.draw_name);
                const rank2 = latestRankings.find(r => r.user_id === user2Id && r.tournament_category === tournamentCategory && r.Location === tournamentLocation && r.draw_name === match.draw_name);
                //return {
                //  ...match,
                //  player1: match.player1 || '-',
                //  player2: match.player2 || '-',
                //  player1Ranking: rank1 ? rank1.ranking : lowestRanking,
                //  player2Ranking: rank2 ? rank2.ranking : lowestRanking,
                //};
                return {
                  ...match,
                  player1: match.player1,
                  player2: match.player2,
                  player1Ranking: rank1 ? rank1.ranking : '',
                  player2Ranking: rank2 ? rank2.ranking : '',
          };
              });
              setMatchScheduleDialog({
                open: true,
                tournamentId,
                tournamentName,
                tournamentCategory,
                tournamentLocation,
                matches,
                resultsOnly
              });
            } catch (error) {
              // Optionally handle error
            }
          }
        }}
      />,
      document.body
    );
  };

  return (
    <main className="home-page">
      {renderPartnerDialog()}
      <div className="home-layout">
        <div className="main-column">
          <section className="hero-section">
            <div className="hero-content"></div>
            {/* Removed duplicate heading for cleaner tab UI */}
            {loading && <p>Loading tournaments...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {!loading && !error && (
              <div>
                {tournaments.filter(t => t.status && (['open','started'].includes(t.status.toLowerCase())) && t.category && t.category.toLowerCase() === 'ladder').length === 0 ? (
                  <p>No tournaments available.</p>
                ) : (
                  tournaments
                    .filter(t => t.status && (['open','started'].includes(t.status.toLowerCase())) && t.category && t.category.toLowerCase() === 'ladder')
                    .map(t => {
                    const tournamentAttendance = attendanceLog.filter(a => a.tournament_name === t.name);
                    const rulebookLink = t.rulebookUrl || t.rulebook_url || t.rulebookLink || '/Weekly Ladder League -Rules and Regulations.pdf';
                    // Use the 'pair' field to display attendance as pairs or singles
                    const inUsers = tournamentAttendance.filter(a => a.in_user).map(a => a.pair);
                    // Display both out_user and out_partner as pairs or solos (show all records with out_user or out_partner)
                    const outUsers = attendanceLog
                      .filter(a => a.tournament_name === t.name && (a.out_user || a.out_partner))
                      .map(a => {
                        if (a.out_user && a.out_partner) return `${a.out_user} & ${a.out_partner}`;
                        return a.out_user || a.out_partner;
                      });
                    let dateStr = t.date ? t.date : '2026-03-05';
                    const [year, month, day] = dateStr.split('-');
                    const monthAbbr = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(month,10)-1];
                    const dayNum = parseInt(day,10);
                    const attendanceDisabled = t.status && t.status.toLowerCase() !== 'open';
                    return (
  <div
    key={t.id}
    className="tournament-item"
    style={{
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch'
    }}
  >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 8, width: '100%' }}>
                          <div style={{ fontWeight: 700, fontSize: '1.13rem', color: '#fff', background: '#ff9800', padding: '6px 14px', borderRadius: '7px', textAlign: 'left', letterSpacing: '1px', boxShadow: '0 2px 8px rgba(255, 152, 0, 0.10)', flex: '1 1 auto', minWidth: 0 }}>
                            {t.name}
                          </div>
                          {rulebookLink ? (
                            <a
                              href={encodeURI(rulebookLink)}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '8px 14px',
                                background: '#1976d2',
                                color: '#fff',
                                textDecoration: 'none',
                                borderRadius: '8px',
                                fontWeight: 700,
                                fontSize: '0.95rem',
                                whiteSpace: 'nowrap',
                                flex: '0 0 auto'
                              }}
                              title="Open Ladder rulebook"
                            >
                              📄 Rulebook
                            </a>
                          ) : null}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 0 }}>
                          <div style={{ minWidth: 56, textAlign: 'center', marginRight: 12 }}>
                            <div style={{ fontSize: 18, fontWeight: 600, color: '#ff9800', lineHeight: 1 }}>{monthAbbr}</div>
                            <div style={{ fontSize: 32, fontWeight: 700, color: '#ff9800', lineHeight: 1 }}>{dayNum}</div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', minWidth: 90, marginRight: 0 }}>
                            <div style={{ fontSize: '0.97rem', color: '#607d8b', fontWeight: 500, marginBottom: 2, textAlign: 'left', alignSelf: 'flex-start', display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
                              <span>
                                <span style={{ fontWeight: 600 }}>Category:</span>
                                <span style={{ fontSize: '0.92rem', color: '#1976d2', fontWeight: 600, background: '#f5f5f5', borderRadius: 6, padding: '1px 8px', marginLeft: 8 }}>{t.category || '-'}</span>
                              </span>
                              <span>
                                <span style={{ fontWeight: 600 }}>Status:</span>
                                <span style={{ fontSize: '0.92rem', color: t.status ? (t.status.toLowerCase() === 'open' ? '#388e3c' : t.status.toLowerCase() === 'inprogress' ? '#fbc02d' : '#b71c1c') : '#b71c1c', fontWeight: 600, background: '#f5f5f5', borderRadius: 6, padding: '1px 8px', marginLeft: 8 }}>{t.status ? (t.status.charAt(0).toUpperCase() + t.status.slice(1)) : '-'}</span>
                              </span>
                              <span>
                                <span style={{ fontWeight: 600 }}>Age Criteria:</span>
                                <span style={{ fontSize: '0.92rem', color: '#fb8c00', fontWeight: 600, background: '#f5f5f5', borderRadius: 6, padding: '1px 8px', marginLeft: 8 }}>{t.ageCriteria || '-'}</span>
                              </span>
                              <span>
                                <span style={{ fontWeight: 600 }}>Fees:</span>
                                <span style={{ fontSize: '0.92rem', color: '#8bc34a', fontWeight: 600, background: '#f5f5f5', borderRadius: 6, padding: '1px 8px', marginLeft: 8 }}>{(typeof t.fees !== 'undefined' && t.fees !== null && t.fees !== '') ? `₹${t.fees}` : '-'}</span>
                              </span>
                            </div>
                            {t.Location && (
                              <div style={{ fontSize: '0.97rem', color: '#607d8b', fontWeight: 500, marginTop: 2, textAlign: 'left', alignSelf: 'flex-start', display: 'flex', gap: 8, alignItems: 'center', paddingLeft: 0 }}>
                                <span style={{ fontWeight: 600 }}>Location:</span>
                                <span style={{ fontSize: '1.08rem', color: '#1976d2', fontWeight: 600, background: '#f5f5f5', borderRadius: 6, padding: '1px 8px', marginLeft: 8 }}>{t.Location}</span>
                                {eventNames[t.id] && (
                                  <>
                                    <span style={{ fontWeight: 600, marginLeft: 16 }}>Event:</span>
                                    <span style={{ fontSize: '1.08rem', color: '#009688', fontWeight: 600, background: '#e0f7fa', borderRadius: 6, padding: '1px 8px', marginLeft: 8 }}>{eventNames[t.id]}</span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                          {/* Menu button at far right */}
                          <div style={{ position: 'relative', marginLeft: 'auto', marginRight: 8, alignSelf: 'flex-start' }}>
                            <button
                              className="tournament-menu-btn"
                              onClick={() => toggleMenu(t.id)}
                              aria-label="Tournament options"
                              title="Options"
                            >
                              ⋮
                            </button>
                            {openMenuId === t.id && (
                              <div className="tournament-menu-dropdown">
                                <button onClick={() => handleMenuOption(t.id, 'schedule')}>
                                  📅 Match Schedule
                                </button>
                                <button onClick={() => handleMenuOption(t.id, 'results')}>
                                  🏆 Match Results
                                </button>
                                {isLoggedIn && currentUser?.isAdmin && (
                                  <>
                                    <button
                                      onClick={() => handleMenuOption(t.id, 'draw')}
                                      disabled={t.status && t.status.toLowerCase() !== 'open'}
                                      title={t.status && t.status.toLowerCase() !== 'open' ? 'Match schedule already drawn' : ''}
                                    >
                                      🎯 Draw the Match schedule
                                    </button>
                                    <button onClick={() => handleMenuOption(t.id, 'edit-schedule')}>
                                      ✏️ Edit the Match schedule
                                    </button>
                                  </>
                                )}
                                <button onClick={() => handleMenuOption(t.id, 'details')}>
                                  ℹ️ Tournament Details
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="tournament-attendance" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 120, margin: '8px 0 0 0' }}>
                          <div className="attendance-controls" style={{ display: 'flex', gap: 24, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                            <div className="attendance-column" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 500, boxSizing: 'border-box' }}>
                              <button
                                className={`attendance-btn in ${attendance[t.id] === 'in' ? 'active' : ''}`}
                                type="button"
                                onClick={() => handleAttendanceClick(t.id, 'in', t.name)}
                                aria-label="Mark In (thumbs up)"
                                title="In"
                                disabled={attendanceDisabled}
                                style={{ marginBottom: 2, width: '100%' }}
                              >
                                <span className="emoji">👍</span>
                                <span className="label">In</span>
                              </button>
                              <div style={{ minHeight: 18, maxHeight: 48, width: '100%', overflowY: 'visible' }}>
                                {inUsers.length > 0 && (
                                  <div className="attendance-names in" style={{ fontSize: '0.93em', marginTop: 2, textAlign: 'left', wordBreak: 'break-word', whiteSpace: 'normal', width: '100%', minWidth: '100%' }}>
                                    {inUsers.map((pair, idx) => `${pair}${idx < inUsers.length - 1 ? ', ' : ''}`)}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="attendance-column" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 200, boxSizing: 'border-box' }}>
                              <button
                                className={`attendance-btn out ${attendance[t.id] === 'out' ? 'active' : ''}`}
                                type="button"
                                onClick={() => handleAttendanceClick(t.id, 'out', t.name)}
                                aria-label="Mark Out (thumbs down)"
                                title="Out"
                                disabled={attendanceDisabled}
                                style={{ marginBottom: 2, width: '100%' }}
                              >
                                <span className="emoji">👎</span>
                                <span className="label">Out</span>
                              </button>
                              <div style={{ minHeight: 18, maxHeight: 48, width: '100%', overflowY: 'visible' }}>
                                {outUsers.length > 0 && (
                                  <div className="attendance-names out" style={{ fontSize: '0.93em', marginTop: 2, textAlign: 'left', wordBreak: 'break-word', whiteSpace: 'normal', width: '100%', minWidth: '100%' }}>
                                    {outUsers.map((pair, idx) => `${pair}${idx < outUsers.length - 1 ? ', ' : ''}`)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </section>
        </div>
      </div>
      {authDialog.open && (
        <div className="auth-dialog-overlay" role="dialog" aria-modal="true">
          <div className="auth-dialog-box">
            <h4>Sign in or Register</h4>
            <p>To mark attendance for this tournament please login or register.</p>
            <div className="auth-dialog-actions">
              <button type="button" className="auth-btn login" onClick={() => {
                // Store pending action in sessionStorage for cross-page persistence
                if (authDialog.tournamentId && authDialog.status && authDialog.tournamentName) {
                  sessionStorage.setItem('pendingAttendance', JSON.stringify({
                    tournamentId: authDialog.tournamentId,
                    status: authDialog.status,
                    tournamentName: authDialog.tournamentName
                  }));
                }
                closeAuthDialog();
                navigate('/login', { state: { from: window.location.pathname } });
              }}>Login</button>
              <button type="button" className="auth-btn register" onClick={() => {
                if (authDialog.tournamentId && authDialog.status && authDialog.tournamentName) {
                  sessionStorage.setItem('pendingAttendance', JSON.stringify({
                    tournamentId: authDialog.tournamentId,
                    status: authDialog.status,
                    tournamentName: authDialog.tournamentName
                  }));
                }
                closeAuthDialog();
                navigate('/register', { state: { from: window.location.pathname } });
              }}>Register</button>
              <button type="button" className="auth-btn cancel" onClick={closeAuthDialog}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {messageDialog.open && (
        <div className="auth-dialog-overlay" role="dialog" aria-modal="true">
          <div className="auth-dialog-box">
            <p style={{ whiteSpace: 'pre-line', marginTop: 0 }}>{messageDialog.message}</p>
            <div className="auth-dialog-actions">
              {messageDialog.onConfirm ? (
                <>
                  <button type="button" className="auth-btn login" onClick={closeMessageDialog}>Yes</button>
                  <button type="button" className="auth-btn cancel" onClick={closeMessageDialog}>Cancel</button>
                </>
              ) : (
                <button type="button" className="auth-btn login" onClick={closeMessageDialog}>OK</button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Render dialogs as overlays using portals */}
      {renderDrawMatchDialog()}
      {renderMatchScheduleDialog()}
    </main>
  );
}

export default UpcomingTournament;
