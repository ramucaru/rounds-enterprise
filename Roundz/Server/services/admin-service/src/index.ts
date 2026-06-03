import { requireDb, startService } from '@roundz/common';

void startService({
  name: 'admin-service',
  defaultPort: 3020,
  async registerRoutes(app, context) {
    app.get('/v1/admin/operations', async () => {
      const db = requireDb(context);
      const [openTrips, pendingKyc, openTickets] = await Promise.all([
        db.query("SELECT * FROM trips WHERE status IN ('requested','matched','accepted','in_progress') ORDER BY requested_at DESC LIMIT 50"),
        db.query("SELECT * FROM kyc_submissions WHERE status = 'submitted' ORDER BY created_at DESC LIMIT 50"),
        db.query("SELECT * FROM support_tickets WHERE status = 'open' ORDER BY created_at DESC LIMIT 50")
      ]);
      return { openTrips: openTrips.rows, pendingKyc: pendingKyc.rows, openTickets: openTickets.rows };
    });
  }
});
