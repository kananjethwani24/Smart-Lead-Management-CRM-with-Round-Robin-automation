'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [toast, setToast] = useState(null);
  const [newUpdate, setNewUpdate] = useState('');
  const router = useRouter();

  useEffect(() => {
    const userStored = localStorage.getItem('user');
    if (!userStored) {
      router.push('/login');
    } else {
      const parsed = JSON.parse(userStored);
      if (parsed.role !== 'admin') router.push('/caller');
    }
  }, [router]);

  const fetchStats = useCallback(async () => {
    const res = await fetch('/api/stats');
    const data = await res.json();
    setStats(data);
  }, []);

  const fetchLeads = useCallback(async () => {
    const res = await fetch('/api/leads');
    const data = await res.json();
    setLeads(Array.isArray(data) ? data : []);
  }, []);

  const syncLeads = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/sync-leads', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showToast(`${data.message}`, 'success');
        fetchStats();
        fetchLeads();
      } else {
        showToast(data.error || 'Sync failed', 'error');
      }
    } catch { showToast('Sync failed', 'error'); }
    setSyncing(false);
  };

  const postUpdate = async (e) => {
    e.preventDefault();
    if (!newUpdate.trim()) return;
    try {
      const res = await fetch('/api/updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newUpdate }),
      });
      if (res.ok) {
        showToast('System broadcasted successful!', 'success');
        setNewUpdate('');
      } else { showToast('Broadcast failed', 'error'); }
    } catch { showToast('Transmission failed', 'error'); }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchStats();
    fetchLeads();
    const interval = setInterval(() => {
      fetchStats();
      fetchLeads();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchStats, fetchLeads]);

  const recentLeads = Array.isArray(leads) ? leads.slice(0, 10) : [];

  return (
    <div className="admin-page fade-in-up">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">Operations Center</h1>
          <p className="page-subtitle">Master oversight and intelligent lead management</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--emerald-500)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--emerald-500)', boxShadow: '0 0 10px var(--emerald-500)' }}></div>
            Live Monitoring
          </div>
          <button
            className="btn btn-primary"
            onClick={syncLeads}
            disabled={syncing}
            id="sync-btn"
          >
            {syncing ? 'UPDATING ORIGIN...' : 'RE-SYNC CORE DATA'}
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Volume</div>
          <div className="stat-value">{stats?.totalLeads || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Daily Intake</div>
          <div className="stat-value">{stats?.todayLeads || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Assigned Assets</div>
          <div className="stat-value success">{stats?.assignedLeads || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Unprocessed Pool</div>
          <div className="stat-value" style={{ color: 'var(--amber-500)' }}>{stats?.unassignedLeads || 0}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        <div className="card-container">
          <div className="card-header">
            <h2 className="card-title">Recent Activity Log</h2>
            <a href="/leads" className="btn btn-secondary" style={{ fontSize: '11px', padding: '6px 12px' }}>FULL ARCHIVE →</a>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Identity</th>
                  <th>Origin</th>
                  <th>Territory</th>
                  <th>Status</th>
                  <th>Specialist</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.length > 0 ? (
                  recentLeads.map(lead => (
                    <tr key={lead.id}>
                      <td style={{ fontWeight: 800, color: 'white' }}>{lead.name}</td>
                      <td><span className="badge badge-indigo">{lead.lead_source || 'DIRECT'}</span></td>
                      <td>{lead.state || 'GLOBAL'}</td>
                      <td>
                        {lead.caller ? (
                          <span className="badge badge-emerald">ACTIVE</span>
                        ) : (
                          <span className="badge badge-amber">PENDING</span>
                        )}
                      </td>
                      <td style={{ fontWeight: 600 }}>{lead.caller?.name || 'QUEUED'}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Baseline data synchronization required.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card-container">
          <div className="card-header">
            <h2 className="card-title">Command Channel</h2>
          </div>
          <div style={{ padding: '24px' }}>
            <p style={{ fontSize: '12px', color: 'var(--slate-500)', fontWeight: 600, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>GLOBAL BROADCAST</p>
            <form onSubmit={postUpdate}>
              <textarea
                className="form-control"
                placeholder="Compose directive for caller network..."
                value={newUpdate}
                onChange={(e) => setNewUpdate(e.target.value)}
                style={{ minHeight: '180px', marginBottom: '16px', fontSize: '14px', lineHeight: 1.5 }}
                required
              ></textarea>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                PUSH BROADCAST
              </button>
            </form>
          </div>
        </div>
      </div>

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
