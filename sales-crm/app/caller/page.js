'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function CallerDashboard() {
    const [user, setUser] = useState(null);
    const [leads, setLeads] = useState([]);
    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/login');
        } else {
            const parsed = JSON.parse(storedUser);
            if (parsed.role !== 'caller') router.push('/');
            setUser(parsed);
        }
    }, [router]);

    const fetchData = useCallback(async () => {
        if (!user) return;
        const leadsRes = await fetch('/api/leads');
        const leadsData = await leadsRes.json();
        const myLeads = Array.isArray(leadsData) ? leadsData.filter(l => l.caller?.name === user.name) : [];
        setLeads(myLeads);

        const updatesRes = await fetch('/api/updates');
        const updatesData = await updatesRes.json();
        setUpdates(Array.isArray(updatesData) ? updatesData : []);
        setLoading(false);
    }, [user]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, [fetchData]);

    if (!user || loading) return <div className="loading" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--indigo-400)', fontWeight: 800 }}>SYNCHRONIZING PROFILE...</div>;

    return (
        <div className="caller-portal fade-in-up">
            <div className="ticker-box">
                <div className="ticker-label">MISSION DIRECTIVES</div>
                <div className="ticker-content">
                    {updates.length > 0 ? (
                        <span>{updates.map(u => u.content).join(' • ERROR: ENCRYPTED • ')}</span>
                    ) : (
                        <span>System Status: Online • Performance: Optimal • Multi-Region Distribution Active • Data Ingestion Ready</span>
                    )}
                </div>
            </div>

            <div className="page-header" style={{ marginTop: '32px' }}>
                <h1 className="page-title">Sales Specialist Profile</h1>
                <p className="page-subtitle">Welcome, <span style={{ color: 'var(--indigo-400)', fontWeight: 800 }}>{user.name}</span>. Here is your target pipeline.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '24px' }}>
                <div className="card-column">
                    <div className="card-container">
                        <div className="card-header">
                            <h2 className="card-title">Assigned Territory Leads</h2>
                        </div>
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Target Identity</th>
                                        <th>Contact Key</th>
                                        <th>Region Code</th>
                                        <th>Origin</th>
                                        <th>Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leads.length > 0 ? (
                                        leads.map(lead => (
                                            <tr key={lead.id}>
                                                <td style={{ fontWeight: 800, color: 'white' }}>{lead.name}</td>
                                                <td>{lead.phone}</td>
                                                <td><span className="badge badge-indigo">{lead.state}</span></td>
                                                <td style={{ fontSize: '12px', fontWeight: 700 }}>{lead.lead_source || 'CORE'}</td>
                                                <td style={{ color: 'var(--text-muted)' }}>{new Date(lead.created_at).toLocaleDateString()}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>No targets currently assigned to your specialist ID.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="sidebar-column">
                    <div className="card-container" style={{ marginBottom: '24px' }}>
                        <div className="card-header">
                            <h2 className="card-title" style={{ fontSize: '14px' }}>Attendance Log</h2>
                        </div>
                        <div style={{ padding: '16px' }}>
                            <div className="cal-view">
                                {[...Array(28)].map((_, i) => (
                                    <div key={i} className={`cal-node ${i + 1 === new Date().getDate() ? 'active' : ''} ${i < new Date().getDate() ? 'done' : ''}`}>
                                        {i + 1}
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: '20px', fontSize: '11px', fontWeight: 800, color: 'var(--emerald-500)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                STATUS: ACTIVE DUTY
                            </div>
                        </div>
                    </div>

                    <div className="card-container" id="updates">
                        <div className="card-header">
                            <h2 className="card-title" style={{ fontSize: '14px' }}>Directives Archive</h2>
                        </div>
                        <div style={{ padding: '16px' }}>
                            {updates.length > 0 ? (
                                updates.map(update => (
                                    <div key={update.id} style={{ marginBottom: '16px', padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', borderLeft: '2px solid var(--indigo-500)' }}>
                                        <p style={{ fontSize: '13px', lineHeight: 1.5, color: 'white', marginBottom: '4px' }}>{update.content}</p>
                                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>{new Date(update.created_at).toLocaleTimeString()}</span>
                                    </div>
                                ))
                            ) : (
                                <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' }}>No historical data.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
