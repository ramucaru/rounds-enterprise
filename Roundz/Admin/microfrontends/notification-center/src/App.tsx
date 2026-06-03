import { Card, Badge } from '@roundz/admin-design-system';

export function NotificationCenter() {
  return <Card title="Notification Center">
    <Badge>Microfrontend</Badge>
    <p>This module is independently deployable and connected through the admin registry.</p>
    <p>Primary API surface: <code>/api/notifications/notifications/send</code></p>
  </Card>;
}
