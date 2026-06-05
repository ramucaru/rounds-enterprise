import { useState } from 'react';
import { useRoundzAdminStore, useSendNotification } from '@roundz/admin-shared';

export default function Module() {
  const selectedUserId = useRoundzAdminStore((state) => state.selectedUserId);
  const notifications = useRoundzAdminStore((state) => state.notifications);
  const mutation = useSendNotification();
  const [title, setTitle] = useState('Roundz update');
  const [body, setBody] = useState('Your trip status changed.');

  return (
    <section className="card">
      <h1>Notification Center</h1>
      <p>Send event-driven notifications to the currently selected user and store realtime notification events.</p>
      <div className="module-controls stacked">
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Notification title" />
        <textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="Notification body" />
        <button disabled={!selectedUserId || mutation.isPending} onClick={() => mutation.mutate({ userId: selectedUserId, channel: 'in_app', title, body })}>Send notification</button>
      </div>
      {!selectedUserId && <p className="empty-state">Select a user before sending a notification.</p>}
      {mutation.error && <p role="alert">Notification failed: {(mutation.error as Error).message}</p>}
      {mutation.data !== undefined && <pre>{JSON.stringify(mutation.data, null, 2)}</pre>}
      <h2>Realtime notifications</h2>
      {notifications.length === 0 ? <p className="empty-state">No realtime notifications received yet.</p> : <pre>{JSON.stringify(notifications, null, 2)}</pre>}
    </section>
  );
}
