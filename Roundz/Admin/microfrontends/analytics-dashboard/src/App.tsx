import { Card, Badge } from '@roundz/admin-design-system';

export function AnalyticsDashboard() {
  return <Card title="Analytics Dashboard">
    <Badge>Microfrontend</Badge>
    <p>This module is independently deployable and connected through the admin registry.</p>
    <p>Primary API surface: <code>/api/analytics/analytics/overview</code></p>
  </Card>;
}
