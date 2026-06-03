export type AdminMicrofrontend = {
  name: string;
  route: string;
  remoteUrl: string;
  description: string;
};

export const adminMicrofrontends: AdminMicrofrontend[] = [
  { name: 'User Management', route: '/users', remoteUrl: 'http://localhost:5201/assets/remoteEntry.js', description: 'Manage customer and admin accounts' },
  { name: 'Rider Management', route: '/riders', remoteUrl: 'http://localhost:5202/assets/remoteEntry.js', description: 'Manage rider profiles, online status, and KYC' },
  { name: 'Trip Monitoring', route: '/trips', remoteUrl: 'http://localhost:5203/assets/remoteEntry.js', description: 'Monitor active trips and live tracking' },
  { name: 'Wallet Management', route: '/wallets', remoteUrl: 'http://localhost:5204/assets/remoteEntry.js', description: 'Review wallets and transactions' },
  { name: 'Analytics Dashboard', route: '/analytics', remoteUrl: 'http://localhost:5205/assets/remoteEntry.js', description: 'Operational and revenue analytics' },
  { name: 'Notification Center', route: '/notifications', remoteUrl: 'http://localhost:5206/assets/remoteEntry.js', description: 'Send push notifications' },
  { name: 'Support System', route: '/support', remoteUrl: 'http://localhost:5207/assets/remoteEntry.js', description: 'Customer and rider support workflows' }
];
