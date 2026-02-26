'use client';

import { useState, useEffect, useCallback } from 'react';

export default function LeadsPage() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterState, setFilterState] = useState('');
    const [filterAssigned, setFilterAssigned] = useState('');

    const fetchLeads = useCallback(async () => {
        const res = await fetch('/api/leads');
        const data = await res.json();
        setLeads(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchLeads();
        const interval = setInterval(fetchLeads, 10000);
        return () => clearInterval(interval);
    }, [fetchLeads]);

    const safeLeads = Array.isArray(leads) ? leads : [];
    const states = [...new Set(safeLeads.map(l => l.state).filter(Boolean))].sort();

    const filteredLeads = safeLeads.filter(lead => {
        const matchSearch = !search ||
            lead.name?.toLowerCase().includes(search.toLowerCase()) ||
            lead.phone?.includes(search) ||
            lead.city?.toLowerCase().includes(search.toLowerCase());

        const matchState = !filterState || lead.state === filterState;

        const matchAssigned = !filterAssigned ||
            (filterAssigned === 'assigned' && lead.caller) ||
            (filterAssigned === 'unassigned' && !lead.caller);

        return matchSearch && matchState && matchAssigned;
    });

    return (
        <div className="fade-in-up">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 className="page-title">Identity Archive</h1>
                    <p className="page-subtitle">Centralized database for lead intelligence and distribution tracking</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--indigo-400)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--indigo-400)', boxShadow: '0 0 10px var(--indigo-400)' }}></div>
                    Live Ledger Sync
                </div>
            </div>

            {/* Premium Filtering System */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '16px', marginBottom: '32px', alignItems: 'center' }}>
                <div className="form-field" style={{ marginBottom: 0 }}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by Identity, Coordinates or Region..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        id="search-leads"
                    />
                </div>
                <select
                    className="form-control"
                    value={filterState}
                    onChange={e => setFilterState(e.target.value)}
                    style={{ width: '180px' }}
                    id="filter-state"
                >
                    <option value="">All Regions</option>
                    {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select
                    className="form-control"
                    value={filterAssigned}
                    onChange={e => setFilterAssigned(e.target.value)}
                    style={{ width: '180px' }}
                    id="filter-assigned"
                >
                    <option value="">Full Pool</option>
                    <option value="assigned">Active Assets</option>
                    <option value="unassigned">Unassigned</option>
                </select>
                <div style={{ color: 'var(--slate-500)', fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    RECORDS: {filteredLeads.length} / {leads.length}
                </div>
            </div>

            <div className="card-container">
                <div className="table-wrapper">
                    {loading ? (
                        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--indigo-400)', fontWeight: 800 }}>SYNCHRONIZING REPOSITORY...</div>
                    ) : filteredLeads.length > 0 ? (
                        <table>
                            <thead>
                                <tr>
                                    <th>Index</th>
                                    <th>Subject Identity</th>
                                    <th>Coordinates</th>
                                    <th>Region</th>
                                    <th>Status</th>
                                    <th>Assigned Specialist</th>
                                    <th>Timestamp</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLeads.map((lead, i) => (
                                    <tr key={lead.id}>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>#{i + 1}</td>
                                        <td style={{ fontWeight: 800, color: 'white' }}>{lead.name}</td>
                                        <td>{lead.phone || '—'}</td>
                                        <td><span className="badge badge-indigo">{lead.state || 'GLOBAL'}</span></td>
                                        <td>
                                            {lead.caller ? (
                                                <span className="badge badge-emerald">ENGAGED</span>
                                            ) : (
                                                <span className="badge badge-amber">PENDING</span>
                                            )}
                                        </td>
                                        <td style={{ fontWeight: 700 }}>{lead.caller?.name || 'QUEUED'}</td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                                            {lead.created_at ? new Date(lead.created_at).toLocaleString() : '—'}
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-secondary"
                                                style={{ padding: '4px 12px', fontSize: '10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                                                onClick={async () => {
                                                    if (confirm('Permanently purge this record from repository?')) {
                                                        const res = await fetch(`/api/leads/${lead.id}`, { method: 'DELETE' });
                                                        if (res.ok) fetchLeads();
                                                    }
                                                }}
                                            >
                                                PURGE
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{ padding: '80px', textAlign: 'center' }}>
                            <div style={{ fontSize: '40px', marginBottom: '16px' }}>📂</div>
                            <div style={{ color: 'var(--text-muted)', fontWeight: 700 }}>
                                {leads.length === 0
                                    ? 'REPOSITORY EMPTY. INITIATE DATA SYNC FROM OPERATIONS CENTER.'
                                    : 'NO CORRESPONDING RECORDS FOUND FOR CURRENT PARAMETERS.'}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
