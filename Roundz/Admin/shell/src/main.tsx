import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { moduleCards } from '@roundz/admin-shared';
import './styles.css';

const remotes = {
  '/users': React.lazy(() => import('userManagement/Module')),
  '/riders': React.lazy(() => import('riderManagement/Module')),
  '/trips': React.lazy(() => import('tripMonitoring/Module')),
  '/wallets': React.lazy(() => import('walletManagement/Module')),
  '/analytics': React.lazy(() => import('analyticsDashboard/Module')),
  '/notifications': React.lazy(() => import('notificationCenter/Module')),
  '/support': React.lazy(() => import('supportSystem/Module'))
};

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
  return (
    <QueryClientProvider client={new QueryClient()}>
      <BrowserRouter>
        <header>
          <Link className="brand" to="/">Roundz Admin</Link>
          <span>Enterprise Operations Console</span>
        </header>
        <main>
          <Suspense fallback={<div className="card">Loading remote module...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              {Object.entries(remotes).map(([path, Component]) => <Route key={path} path={`${path}/*`} element={<Component />} />)}
            </Routes>
          </Suspense>
        </main>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
