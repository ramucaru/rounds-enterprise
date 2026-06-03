import { useQuery } from '@tanstack/react-query';
import { Card, Badge } from '@roundz/admin-design-system';
import { adminMicrofrontends, createAdminApi } from '@roundz/admin-shared';

const api = createAdminApi();

export function App() {
  const dashboard = useQuery({ queryKey: ['admin-dashboard'], queryFn: () => api.get('/api/admin/admin/dashboard') });

  return <main style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: 32, background: '#f7f9fc', minHeight: '100vh' }}>
    <header style={{ marginBottom: 24 }}>
      <Badge>Roundz Admin</Badge>
      <h1>Enterprise Operations Console</h1>
      <p>Connected to the Fastify gateway, service APIs, and real-time Socket.IO tracking.</p>
    </header>

    <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
      <Card title="Live platform health">
        <pre>{JSON.stringify(dashboard.data ?? dashboard.error ?? { loading: true }, null, 2)}</pre>
      </Card>
      {adminMicrofrontends.map((mfe) => <Card key={mfe.route} title={mfe.name}>
        <p>{mfe.description}</p>
        <a href={mfe.route}>Open module</a>
      </Card>)}
    </div>
  </main>;
}
