import { Card, Badge } from '@roundz/admin-design-system';

export function RiderManagement() {
  return <Card title="Rider Management">
    <Badge>Microfrontend</Badge>
    <p>This module is independently deployable and connected through the admin registry.</p>
    <p>Primary API surface: <code>/api/riders/riders/available</code></p>
  </Card>;
}
