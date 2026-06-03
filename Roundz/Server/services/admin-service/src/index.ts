import { readServiceConfig, startService, type RouteInstaller } from '@roundz/server-common';

const routes: RouteInstaller = async (app, runtime) => {
  app.get('/admin/dashboard', async () => {
    const [users, trips, payments, kyc] = await Promise.all([
      runtime.db.query('SELECT count(*)::int AS total FROM users'),
      runtime.db.query('SELECT status, count(*)::int AS total FROM trips GROUP BY status'),
      runtime.db.query("SELECT COALESCE(sum(amount_cents), 0)::int AS total_cents FROM payments WHERE status = 'completed'"),
      runtime.db.query("SELECT status, count(*)::int AS total FROM kyc_records GROUP BY status")
    ]);
    return { users: users.rows[0], trips: trips.rows, payments: payments.rows[0], kyc: kyc.rows };
  });
};

await startService(readServiceConfig('admin-service', 4111), routes);
