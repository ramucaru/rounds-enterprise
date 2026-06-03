import { Card, Badge } from '@roundz/admin-design-system';

export function SupportSystem() {
  return <Card title="Support System">
    <Badge>Microfrontend</Badge>
    <p>This module is independently deployable and connected through the admin registry.</p>
    <p>Primary API surface: <code>/api/admin/admin/dashboard</code></p>
  </Card>;
}
