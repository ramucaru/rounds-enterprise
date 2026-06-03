import { requireDb, startService } from '@roundz/common';

void startService({
  name: 'analytics-service',
  defaultPort: 3019,
  async registerRoutes(app, context) {
    app.get('/v1/analytics/summary', async () => {
      const db = requireDb(context);
      const [users, trips, revenue, riders] = await Promise.all([
        db.query('SELECT role, count(*)::int AS count FROM users GROUP BY role'),
        db.query('SELECT status, count(*)::int AS count FROM trips GROUP BY status'),
        db.query("SELECT COALESCE(sum(amount_cents), 0)::int AS captured_revenue_cents FROM payments WHERE status = 'captured'"),
        db.query('SELECT online_status, count(*)::int AS count FROM rider_profiles GROUP BY online_status')
      ]);
      return { users: users.rows, trips: trips.rows, revenue: revenue.rows[0], riders: riders.rows };
    });
  }
});
