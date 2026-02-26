'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DirectivesHub() {
    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUpdates = async () => {
            const res = await fetch('/api/updates');
            const data = await res.json();
            setUpdates(Array.isArray(data) ? data : []);
            setLoading(false);
        };
        fetchUpdates();
    }, []);

    return (
        <div className="directives-hub fade-in-up">
            <div className="page-header">
                <h1 className="page-title">Mission Directives Hub</h1>
                <p className="page-subtitle">Historical archive of all system-wide broadcasts and operational instructions</p>
            </div>

            <div className="directives-list-container">
                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: 'var(--indigo-400)', fontWeight: 800 }}>RECOVREING ARCHIVES...</div>
                ) : updates.length > 0 ? (
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {updates.map((update, index) => (
                            <div key={update.id} className="card-container animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                                <div style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '12px',
                                        background: 'rgba(99, 102, 241, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '20px',
                                        border: '1px solid var(--border-accent)'
                                    }}>
                                        📢
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--indigo-400)', letterSpacing: '1px' }}>SYSTEM BROADCAST</span>
                                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(update.created_at).toLocaleString()}</span>
                                        </div>
                                        <p style={{ fontSize: '16px', color: 'white', lineHeight: 1.6, fontWeight: 500 }}>
                                            {update.content}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card-container" style={{ padding: '80px', textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>📡</div>
                        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>No Active Directives</h3>
                        <p style={{ color: 'var(--text-muted)' }}>The mission frequency is currently silent. Stand by for Administrator instructions.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
