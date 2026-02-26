'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [role, setRole] = useState('caller');
    const [name, setName] = useState('');
    const router = useRouter();

    const handleLogin = (e) => {
        e.preventDefault();
        const userData = { role, name: role === 'admin' ? 'Administrator' : name };
        localStorage.setItem('user', JSON.stringify(userData));
        router.push(role === 'admin' ? '/' : '/caller');
    };

    return (
        <div className="auth-page">
            <div className="auth-card fade-in-up">
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-2px', color: 'white', marginBottom: '8px' }}>
                        Bloc<span>CRM</span>
                    </h1>
                    <p style={{ color: 'var(--slate-500)', fontSize: '14px', fontWeight: '600', letterSpacing: '0.5px' }}>
                        SECURE SALES ACCESS PORTAL
                    </p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="form-field">
                        <label className="form-label">System Role Access</label>
                        <select
                            className="form-control"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="caller">Sales Specialist</option>
                            <option value="admin">System Administrator</option>
                        </select>
                    </div>

                    {role === 'caller' && (
                        <div className="form-field">
                            <label className="form-label">Specialist Identifier</label>
                            <input
                                className="form-control"
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: '12px' }}>
                        AUTHENTICATE
                    </button>
                    <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--slate-500)', marginTop: '24px', letterSpacing: '0.5px' }}>
                        ENCRYPTED ACCESS ONLY • VERSION 2.0.1
                    </p>
                </form>
            </div>
        </div>
    );
}
