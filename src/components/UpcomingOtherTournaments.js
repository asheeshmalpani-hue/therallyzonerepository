
import React, { useState, useEffect } from "react";
import "./Home.css";

function UpcomingOtherTournaments() {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTournaments = async () => {
            try {
                setLoading(true);
                const response = await fetch("https://therallyzonebackendrepository-production.up.railway.app/api/tournaments");
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setTournaments(data.filter(row => row.category && row.category.toLowerCase() !== 'ladder').map(row => ({
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
                setError("Failed to load tournaments. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchTournaments();
    }, []);

    if (loading) return <div>Loading Upcoming Tournaments...</div>;
    if (error) return <div style={{color:'red'}}>{error}</div>;

    return (
        <main className="home-page">
            <div className="home-layout">
                <div className="main-column">
                    <section className="hero-section">
                        <div className="hero-content"></div>
                        {tournaments.length === 0 ? (
                            <p>No tournaments available.</p>
                        ) : (
                            tournaments.map(t => {
                                let dateStr = t.date ? t.date : '2026-03-05';
                                const [year, month, day] = dateStr.split('-');
                                const monthAbbr = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(month,10)-1];
                                const dayNum = parseInt(day,10);
                                return (
                                    <div key={t.id} className="tournament-item">
                                        <div style={{ fontWeight: 700, fontSize: '1.13rem', marginBottom: 8, color: '#fff', background: '#ff9800', padding: '3px 14px', borderRadius: '7px', width: 'calc(100% - 8px)', maxWidth: 'none', marginLeft: '4px', marginRight: '0', textAlign: 'left', letterSpacing: '1px', boxShadow: '0 2px 8px rgba(255, 152, 0, 0.10)' }}>{t.name}</div>
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
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}

export default UpcomingOtherTournaments;