import { z } from 'zod';
import { DEFAULT_CURRENCY, ROUNDZ_EVENT_TOPICS } from '@roundz/shared';
import { readServiceConfig, startService, type RouteInstaller } from '@roundz/server-common';

const transactionSchema = z.object({ amountCents: z.number().int().positive(), kind: z.enum(['credit', 'debit']), reference: z.string().min(1) });

const routes: RouteInstaller = async (app, runtime) => {
  app.get('/wallets/users/:userId', async (request) => {
    const { userId } = request.params as { userId: string };
    const wallet = await ensureWallet(runtime.db, userId);
    const tx = await runtime.db.query('SELECT * FROM wallet_transactions WHERE wallet_id = $1 ORDER BY created_at DESC LIMIT 50', [wallet.id]);
    return { wallet, transactions: tx.rows };
  });

  app.post('/wallets/users/:userId/transactions', async (request) => {
    const { userId } = request.params as { userId: string };
    const input = transactionSchema.parse(request.body);
    const wallet = await ensureWallet(runtime.db, userId);
    const signedAmount = input.kind === 'credit' ? input.amountCents : -input.amountCents;
    const updated = await runtime.db.query('UPDATE wallets SET balance_cents = balance_cents + $2, updated_at = now() WHERE id = $1 RETURNING *', [wallet.id, signedAmount]);
    const tx = await runtime.db.query(
      'INSERT INTO wallet_transactions (wallet_id, amount_cents, currency, kind, reference) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [wallet.id, input.amountCents, DEFAULT_CURRENCY, input.kind, input.reference]
    );
    if (input.kind === 'credit') {
      await runtime.events.publish(ROUNDZ_EVENT_TOPICS.walletCredited, 'wallet.credited', { userId, amountCents: input.amountCents, reference: input.reference });
    }
    return { wallet: updated.rows[0], transaction: tx.rows[0] };
  });
};

async function ensureWallet(db: any, userId: string) {
  await db.query('INSERT INTO wallets (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING', [userId]);
  const result = await db.query('SELECT * FROM wallets WHERE user_id = $1', [userId]);
  return result.rows[0];
}

await startService(readServiceConfig('wallet-service', 4107), routes);
