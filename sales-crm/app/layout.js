'use client';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import './globals.css';

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, [pathname]);

  const isLoginPage = pathname === '/login';

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    router.push('/login');
  };

  if (loading) return <html lang="en"><body className="bg-darker"></body></html>;

  return (
    <html lang="en">
      <head>
        <title>BlocCRM | Integrated Sales Infrastructure</title>
      </head>
      <body>
        {isLoginPage ? (
          <main>{children}</main>
        ) : (
          <div className="layout">
            <aside className="sidebar">
              <div className="sidebar-logo">
                Bloc<span>CRM</span>
              </div>
              <nav className="sidebar-nav">
                {user?.role === 'admin' ? (
                  <>
                    <a href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
                      <span className="nav-icon">📊</span>
                      <span>Operations Center</span>
                    </a>
                    <a href="/leads" className={`nav-link ${pathname === '/leads' ? 'active' : ''}`}>
                      <span className="nav-icon">👥</span>
                      <span>Identity Archive</span>
                    </a>
                    <a href="/callers" className={`nav-link ${pathname === '/callers' ? 'active' : ''}`}>
                      <span className="nav-icon">📞</span>
                      <span>Network Specialist</span>
                    </a>
                  </>
                ) : (
                  <>
                    <a href="/caller" className={`nav-link ${pathname === '/caller' ? 'active' : ''}`}>
                      <span className="nav-icon">🏠</span>
                      <span>Specialist Mission</span>
                    </a>
                    <a href="/caller/directives" className={`nav-link ${pathname === '/caller/directives' ? 'active' : ''}`}>
                      <span className="nav-icon">📢</span>
                      <span>Directives Hub</span>
                    </a>
                  </>
                )}

                <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    onClick={handleLogout}
                    className="nav-link"
                    style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <span className="nav-icon" style={{ color: 'var(--rose-500)' }}>🚪</span>
                    <span>Terminate Session</span>
                  </button>
                </div>
              </nav>
            </aside>
            <main className="main-content">
              {children}
            </main>
          </div>
        )}
      </body>
    </html>
  );
}
