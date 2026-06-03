import { readServiceConfig, startService, type RouteInstaller } from '@roundz/server-common';

const routes: RouteInstaller = async (app, runtime) => {
  app.get('/analytics/overview', async () => {
    const [users, riders, trips, revenue] = await Promise.all([
      runtime.db.query('SELECT role, count(*)::int AS count FROM users GROUP BY role'),
      runtime.db.query('SELECT count(*)::int AS online FROM rider_profiles WHERE available = true'),
      runtime.db.query('SELECT status, count(*)::int AS count FROM trips GROUP BY status'),
      runtime.db.query("SELECT COALESCE(sum(amount_cents), 0)::int AS cents FROM payments WHERE status = 'completed'")
    ]);
    return { users: users.rows, riders: riders.rows[0], trips: trips.rows, revenue: revenue.rows[0] };
  });
};

await startService(readServiceConfig('analytics-service', 4110), routes);
