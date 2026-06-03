import { Card, Badge } from '@roundz/admin-design-system';

export function TripMonitoring() {
  return <Card title="Trip Monitoring">
    <Badge>Microfrontend</Badge>
    <p>This module is independently deployable and connected through the admin registry.</p>
    <p>Primary API surface: <code>/api/trips/trips/sample</code></p>
  </Card>;
}
