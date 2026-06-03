import { Card, Badge } from '@roundz/admin-design-system';

export function WalletManagement() {
  return <Card title="Wallet Management">
    <Badge>Microfrontend</Badge>
    <p>This module is independently deployable and connected through the admin registry.</p>
    <p>Primary API surface: <code>/api/wallets/wallets/users/sample</code></p>
  </Card>;
}
