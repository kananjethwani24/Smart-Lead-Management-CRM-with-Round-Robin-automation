'use client';

import { useState, useEffect, useCallback } from 'react';

const LANGUAGES = ['Hindi', 'English', 'Marathi', 'Kannada', 'Tamil', 'Telugu', 'Bengali', 'Gujarati', 'Malayalam', 'Punjabi'];
const STATES = ['Maharashtra', 'Karnataka', 'Kerala', 'Tamil Nadu', 'Andhra Pradesh', 'Telangana', 'Gujarat', 'Rajasthan', 'Delhi', 'Uttar Pradesh', 'West Bengal', 'Punjab', 'Haryana', 'Madhya Pradesh', 'Bihar'];

export default function CallersPage() {
    const [callers, setCallers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCaller, setEditingCaller] = useState(null);
    const [toast, setToast] = useState(null);

    const [form, setForm] = useState({
        name: '',
        role: '',
        languages: [],
        daily_lead_limit: 60,
        assigned_states: [],
    });

    const fetchCallers = useCallback(async () => {
        const res = await fetch('/api/callers');
        const data = await res.json();
        setCallers(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchCallers();
    }, [fetchCallers]);

    const showToast = (message, type) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const resetForm = () => {
        setForm({ name: '', role: '', languages: [], daily_lead_limit: 60, assigned_states: [] });
        setEditingCaller(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (caller) => {
        setEditingCaller(caller);
        setForm({
            name: caller.name,
            role: caller.role || '',
            languages: caller.languages || [],
            daily_lead_limit: caller.daily_lead_limit || 60,
            assigned_states: caller.assigned_states || [],
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) {
            showToast('Identifier required', 'error');
            return;
        }

        try {
            const url = editingCaller ? `/api/callers/${editingCaller.id}` : '/api/callers';
            const method = editingCaller ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                showToast(editingCaller ? 'Specialist Refined' : 'Specialist Assigned', 'success');
                setShowModal(false);
                resetForm();
                fetchCallers();
            } else {
                const data = await res.json();
                showToast(data.error || 'Operation Terminated', 'error');
            }
        } catch {
            showToast('Database Comm Error', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('DECOMMISSION SPECIALIST? THIS ACTION CANNOT BE REVERSED.')) return;
        try {
            const res = await fetch(`/api/callers/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast('Specialist Decommsioned', 'success');
                fetchCallers();
            }
        } catch {
            showToast('Decomm failed', 'error');
        }
    };

    const toggleArrayItem = (field, item) => {
        setForm(prev => ({
            ...prev,
            [field]: prev[field].includes(item)
                ? prev[field].filter(i => i !== item)
                : [...prev[field], item],
        }));
    };

    return (
        <div className="fade-in-up">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 className="page-title">Network Specialists</h1>
                    <p className="page-subtitle">Oversight and configuration of regional sales assets and performance metrics</p>
                </div>
                <button className="btn btn-primary" onClick={openAddModal} id="add-caller-btn">
                    + ASSIGN NEW SPECIALIST
                </button>
            </div>

            <div className="card-container">
                <div className="table-wrapper">
                    {loading ? (
                        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--indigo-400)', fontWeight: 800 }}>AUDITING NETWORK NODES...</div>
                    ) : callers.length > 0 ? (
                        <table>
                            <thead>
                                <tr>
                                    <th>Identifier</th>
                                    <th>Role / Class</th>
                                    <th>Linguistic Skills</th>
                                    <th>Volume Limit</th>
                                    <th>Assigned Domains</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {callers.map(caller => (
                                    <tr key={caller.id}>
                                        <td style={{ fontWeight: 800, color: 'white' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--emerald-500)', boxShadow: '0 0 8px var(--emerald-500)' }}></div>
                                                {caller.name}
                                            </div>
                                        </td>
                                        <td><span style={{ fontSize: '13px', fontWeight: 600 }}>{caller.role || 'CORE ASSET'}</span></td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                {(caller.languages || []).map(lang => (
                                                    <span key={lang} className="badge badge-brand">{lang}</span>
                                                ))}
                                                {(!caller.languages || caller.languages.length === 0) && '—'}
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: 700 }}>{caller.daily_lead_limit} / DAY</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                {(caller.assigned_states || []).map(state => (
                                                    <span key={state} className="badge badge-emerald">{state}</span>
                                                ))}
                                                {(!caller.assigned_states || caller.assigned_states.length === 0) && (
                                                    <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--slate-500)' }}>GLOBAL DOMAIN</span>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button
                                                    className="btn btn-secondary"
                                                    style={{ padding: '6px 14px', fontSize: '11px' }}
                                                    onClick={() => openEditModal(caller)}
                                                >
                                                    REFINE
                                                </button>
                                                <button
                                                    className="btn"
                                                    style={{ padding: '6px 14px', fontSize: '11px', background: 'rgba(244, 63, 94, 0.1)', color: 'var(--rose-500)' }}
                                                    onClick={() => handleDelete(caller.id)}
                                                >
                                                    DECOMM
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{ padding: '80px', textAlign: 'center' }}>
                            <div style={{ fontSize: '40px', marginBottom: '16px' }}>📞</div>
                            <p style={{ color: 'var(--text-muted)', fontWeight: 700 }}>NO ACTIVE SPECIALISTS REGISTERED IN NETWORK.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal - Redesigned as Premium Overlay */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zindex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowModal(false)}>
                    <div className="auth-card fade-in-up" style={{ maxWidth: '560px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'white', marginBottom: '32px', textAlign: 'center' }}>
                            {editingCaller ? 'REFINE ASSET CONFIG' : 'INITIALIZE NEW ASSET'}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div className="form-field">
                                <label className="form-label">Specialist Identifier</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={form.name}
                                    onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Full Identity Name"
                                    autoFocus
                                />
                            </div>

                            <div className="form-field">
                                <label className="form-label">Classification / Role</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={form.role}
                                    onChange={e => setForm(prev => ({ ...prev, role: e.target.value }))}
                                    placeholder="e.g. Regional Lead, Senior Specialist"
                                />
                            </div>

                            <div className="form-field">
                                <label className="form-label">Daily Throttling Limit (Leads)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={form.daily_lead_limit}
                                    onChange={e => setForm(prev => ({ ...prev, daily_lead_limit: parseInt(e.target.value) || 0 }))}
                                />
                            </div>

                            <div className="form-field">
                                <label className="form-label">Linguistic Capacities</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px' }}>
                                    {LANGUAGES.map(lang => (
                                        <button
                                            key={lang}
                                            type="button"
                                            className="btn"
                                            style={{
                                                fontSize: '11px',
                                                padding: '8px',
                                                background: form.languages.includes(lang) ? 'var(--indigo-600)' : 'rgba(255,255,255,0.03)',
                                                border: `1px solid ${form.languages.includes(lang) ? 'var(--indigo-400)' : 'var(--border-medium)'}`,
                                                color: 'white'
                                            }}
                                            onClick={() => toggleArrayItem('languages', lang)}
                                        >
                                            {lang}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-field">
                                <label className="form-label">Assigned Territorial Domains</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '8px' }}>
                                    {STATES.map(state => (
                                        <button
                                            key={state}
                                            type="button"
                                            className="btn"
                                            style={{
                                                fontSize: '11px',
                                                padding: '8px',
                                                background: form.assigned_states.includes(state) ? 'var(--emerald-500)' : 'rgba(255,255,255,0.03)',
                                                border: `1px solid ${form.assigned_states.includes(state) ? 'var(--success)' : 'var(--border-medium)'}`,
                                                color: 'white'
                                            }}
                                            onClick={() => toggleArrayItem('assigned_states', state)}
                                        >
                                            {state}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '32px' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    TERMINATE
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >
                                    SAVE CONFIG
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {toast && (
                <div className={`toast toast-${toast.type}`}>
                    {toast.message}
                </div>
            )}
        </div>
    );
}
