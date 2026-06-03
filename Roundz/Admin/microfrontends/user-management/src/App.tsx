import { Card, Badge } from '@roundz/admin-design-system';

export function UserManagement() {
  return <Card title="User Management">
    <Badge>Microfrontend</Badge>
    <p>This module is independently deployable and connected through the admin registry.</p>
    <p>Primary API surface: <code>/api/users</code></p>
  </Card>;
}
