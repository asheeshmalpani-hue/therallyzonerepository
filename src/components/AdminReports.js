
import React, { useState } from "react";
import "./AdminReports.css";


function AdminReports() {
  // For first report: month/year selection and report data
  const [selectedMonth, setSelectedMonth] = useState( (new Date().getMonth() + 1).toString() );
  const [selectedYear, setSelectedYear] = useState( new Date().getFullYear().toString() );
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];
  // Years: from 2022 to current year + 1
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2021 + 2 }, (_, i) => (2022 + i).toString());

  const handleViewReport = async () => {
    setLoading(true);
    setError("");
    setReportData(null);
    try {
      const res = await fetch(`/api/reports/monthly-player-performance?month=${selectedMonth}&year=${selectedYear}`);
      if (!res.ok) throw new Error("Failed to fetch report");
      const data = await res.json();
      const sortedData = Array.isArray(data)
        ? data.sort((a, b) => {
            const drawA = (a.draw_name || '').toLowerCase();
            const drawB = (b.draw_name || '').toLowerCase();
            if (drawA !== drawB) return drawA.localeCompare(drawB);
            const winsA = Number(a.total_win) || 0;
            const winsB = Number(b.total_win) || 0;
            if (winsA !== winsB) return winsB - winsA;
            const lossesA = Number(a.total_loss) || 0;
            const lossesB = Number(b.total_loss) || 0;
            if (lossesA !== lossesB) return lossesA - lossesB;
            return (a.player_name || '').toLowerCase().localeCompare((b.player_name || '').toLowerCase());
          })
        : [];
      setReportData(sortedData);
    } catch (e) {
      setError("Failed to load report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Export reportData as CSV
  const handleExportCSV = () => {
    if (!reportData || reportData.length === 0) return;
    const header = ['Draw Name', 'Player Name', 'Match Results', 'Total Win', 'Total Loss'];
    const rows = reportData.map(row => [
      row.draw_name || '',
      row.player_name,
      '"' + (row.match_results || '').replace(/"/g, '""') + '"',
      row.total_win,
      row.total_loss
    ]);
    const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `player_performance_${selectedMonth}_${selectedYear}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const groupedReportData = reportData
    ? reportData.reduce((groups, row) => {
        const draw = row.draw_name || 'Unspecified draw';
        if (!groups[draw]) groups[draw] = [];
        groups[draw].push(row);
        return groups;
      }, {})
    : {};

  return (
    <div className="admin-reports-container">
      <h2>Admin Reports</h2>
      <ul className="admin-reports-list">
        <li>
          <strong>Monthly Player Performance - Matches</strong>
          <div className="report-desc">View player match performance for the selected month and year.</div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
            <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
              {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button className="view-report-btn" onClick={handleViewReport} disabled={loading}>
              {loading ? 'Loading...' : 'View Report'}
            </button>
            {reportData && reportData.length > 0 && (
              <button className="view-report-btn" style={{ background: '#388e3c', marginLeft: 8 }} onClick={handleExportCSV}>
                Export CSV
              </button>
            )}
          </div>
          {error && <div style={{ color: '#b71c1c', marginBottom: 8 }}>{error}</div>}
          {reportData && reportData.length === 0 && <div style={{ color: '#555', marginBottom: 8 }}>No matches found for this month.</div>}
          {reportData && reportData.length > 0 && (
            <div className="report-table-wrapper">
              {Object.entries(groupedReportData).map(([drawName, rows]) => (
                <div key={drawName} style={{ marginBottom: 30 }}>
                  <h3 style={{ margin: '16px 0 8px', color: '#1a237e' }}>{drawName}</h3>
                  <table className="report-table" style={{ minWidth: 900 }}>
                    <thead>
                      <tr>
                        <th>Player Name</th>
                        <th>Match Results</th>
                        <th>Total Win</th>
                        <th>Total Loss</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, idx) => (
                        <tr key={`${drawName}-${row.player_name}-${idx}`}>
                          <td>{row.player_name}</td>
                          <td style={{ fontSize: '0.98em' }}>{row.match_results}</td>
                          <td style={{ textAlign: 'center' }}>{row.total_win}</td>
                          <td style={{ textAlign: 'center' }}>{row.total_loss}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </li>
        <li>
          <strong>Monthly Player Performance - Ranking</strong>
          <div className="report-desc">View player ranking changes for the selected month.</div>
          <button className="view-report-btn" onClick={() => alert('Show Monthly Player Performance - Ranking report')}>View Report</button>
        </li>
      </ul>
    </div>
  );
}

export default AdminReports;
