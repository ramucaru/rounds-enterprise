import { createDomainEvent, EventTopics, requireDb, startService, withTransaction } from '@roundz/common';
import { WalletLedgerEntrySchema } from '@roundz/dto';

void startService({
  name: 'wallet-service',
  defaultPort: 3016,
  async registerRoutes(app, context) {
    app.get('/v1/wallets/:userId', async (request) => {
      const { userId } = request.params as { userId: string };
      const result = await requireDb(context).query('SELECT * FROM wallets WHERE user_id = $1', [userId]);
      return result.rows[0] ?? null;
    });

    app.post('/v1/wallets/ledger', async (request, reply) => {
      const dto = WalletLedgerEntrySchema.parse(request.body);
      const db = requireDb(context);
      const entry = await withTransaction(db, async (tx) => {
        const walletResult = await tx.query('INSERT INTO wallets (user_id) VALUES ($1) ON CONFLICT (user_id) DO UPDATE SET updated_at = now() RETURNING *', [dto.userId]);
        const wallet = walletResult.rows[0];
        const signedAmount = dto.entryType === 'credit' ? dto.amountCents : -dto.amountCents;
        await tx.query('UPDATE wallets SET balance_cents = balance_cents + $2, updated_at = now() WHERE id = $1', [wallet.id, signedAmount]);
        const ledgerResult = await tx.query(
          'INSERT INTO wallet_ledger_entries (wallet_id, amount_cents, entry_type, reference, metadata) VALUES ($1,$2,$3,$4,$5) RETURNING *',
          [wallet.id, dto.amountCents, dto.entryType, dto.reference, dto.metadata]
        );
        return ledgerResult.rows[0];
      });
      await context.bus.publish(createDomainEvent(EventTopics.WalletLedgerPosted, entry.id, entry));
      return reply.code(201).send(entry);
    });
  }
});
