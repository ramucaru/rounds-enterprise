import 'package:flutter/material.dart';
import 'core/api_client.dart';

void main() {
  runApp(const RoundzCustomerApp());
}

class RoundzCustomerApp extends StatelessWidget {
  const RoundzCustomerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Roundz Customer',
      theme: ThemeData(colorSchemeSeed: Colors.indigo, useMaterial3: true),
      home: RoundzHome(api: RoundzApiClient(baseUrl: const String.fromEnvironment('ROUNDZ_API_URL', defaultValue: 'http://localhost:8080'))),
    );
  }
}

class RoundzHome extends StatelessWidget {
  const RoundzHome({required this.api, super.key});
  final RoundzApiClient api;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Roundz Customer')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Connected modules', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          ListTile(title: Text('Auth Module'), subtitle: Text('Backend-connected auth-module workflow')),
          ListTile(title: Text('Booking Module'), subtitle: Text('Backend-connected booking-module workflow')),
          ListTile(title: Text('Tracking Module'), subtitle: Text('Backend-connected tracking-module workflow')),
          ListTile(title: Text('Wallet Module'), subtitle: Text('Backend-connected wallet-module workflow')),
          ListTile(title: Text('Notification Module'), subtitle: Text('Backend-connected notification-module workflow')),
          ListTile(title: Text('Trip History Module'), subtitle: Text('Backend-connected trip-history-module workflow')),
          ListTile(title: Text('Profile Module'), subtitle: Text('Backend-connected profile-module workflow')),
          ListTile(title: Text('Support Module'), subtitle: Text('Backend-connected support-module workflow')),
          Text('Gateway: ${api.baseUrl}'),
        ],
      ),
    );
  }
}
