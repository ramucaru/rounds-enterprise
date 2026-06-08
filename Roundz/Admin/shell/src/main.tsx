import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { loadAdminEnv, moduleCards, RoundzApiClient, useRoundzAdminStore, useRoundzRealtime } from '@roundz/admin-shared';
import './styles.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, refetchOnWindowFocus: false },
    mutations: { retry: 1 }
  }
});

const remotes = {
  '/users': React.lazy(() => import('userManagement/Module')),
  '/riders': React.lazy(() => import('riderManagement/Module')),
  '/trips': React.lazy(() => import('tripMonitoring/Module')),
  '/wallets': React.lazy(() => import('walletManagement/Module')),
  '/analytics': React.lazy(() => import('analyticsDashboard/Module')),
  '/notifications': React.lazy(() => import('notificationCenter/Module')),
  '/support': React.lazy(() => import('supportSystem/Module'))
};

function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const enableRealtime = loadAdminEnv().VITE_ENABLE_REALTIME;
  const connect = useRoundzRealtime();
  const token = useRoundzAdminStore((state) => state.auth.token);

  useEffect(() => {
    if (!enableRealtime || !token) return undefined;
    return connect();
  }, [connect, enableRealtime, token]);

  return children;
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const env = useMemo(() => loadAdminEnv(), []);
  const auth = useRoundzAdminStore((state) => state.auth);
  const setAuth = useRoundzAdminStore((state) => state.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  if (!env.VITE_AUTH_ENABLED || auth.token) return children;

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(undefined);
    try {
      const response = await new RoundzApiClient().login(email, password);
      const user = response.user as { role?: string; roles?: string[] } | undefined;
      setAuth({
        token: response.token,
        user: response.user,
        roles: user?.roles ?? (user?.role ? [user.role] : []),
        permissions: []
      });
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">Secure admin access</p>
        <h1>Sign in to Roundz Operations</h1>
        <p className="hero-copy">Use a real backend account. Credentials are sent to <code>/v1/auth/login</code>; no demo credentials are embedded in the frontend.</p>
        <form className="module-controls stacked" onSubmit={login}>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Admin email" required />
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" required />
          <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
        </form>
        {error && <p role="alert" className="empty-state">{error}</p>}
      </section>
    </main>
  );
}

function Home() {
  return (
    <>
      <section className="hero">
        <p className="eyebrow">Roundz control plane</p>
        <h1>Operate trips, riders, wallets, support and notifications from one console.</h1>
        <p className="hero-copy">Each card opens a federated operations module connected to the live Fastify gateway.</p>
      </section>
      <section className="grid">
        {moduleCards.map((card) => (
          <Link className="card" key={card.path} to={card.path}>
            <span className="card-kicker">Module</span>
            <strong>{card.title}</strong>
            <span className="card-action">Open workspace</span>
          </Link>
        ))}
      </section>
    </>
  );
}

function App() {
  const auth = useRoundzAdminStore((state) => state.auth);
  const realtime = useRoundzAdminStore((state) => state.realtime);
  const reset = useRoundzAdminStore((state) => state.reset);
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <header>
          <Link className="brand" to="/">Roundz Admin</Link>
          <span>Enterprise Operations Console</span>
          {auth.token && <span className="status-pill">{realtime.connected ? 'Realtime connected' : 'Realtime offline'}</span>}
          {auth.token && <button className="header-action" onClick={() => reset()}>Sign out</button>}
        </header>
        <AuthGate>
          <RealtimeProvider>
            <main>
              <Suspense fallback={<div className="card">Loading remote module...</div>}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  {Object.entries(remotes).map(([path, Component]) => <Route key={path} path={`${path}/*`} element={<Component />} />)}
                </Routes>
              </Suspense>
            </main>
          </RealtimeProvider>
        </AuthGate>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
