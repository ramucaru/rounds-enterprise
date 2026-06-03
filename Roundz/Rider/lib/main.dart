import 'package:flutter/material.dart';
import 'core/api_client.dart';

void main() {
  runApp(const RoundzRiderApp());
}

class RoundzRiderApp extends StatelessWidget {
  const RoundzRiderApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Roundz Rider',
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
      appBar: AppBar(title: const Text('Roundz Rider')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Connected modules', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          ListTile(title: Text('Auth Module'), subtitle: Text('Backend-connected auth-module workflow')),
          ListTile(title: Text('Kyc Module'), subtitle: Text('Backend-connected kyc-module workflow')),
          ListTile(title: Text('Trip Request Module'), subtitle: Text('Backend-connected trip-request-module workflow')),
          ListTile(title: Text('Navigation Module'), subtitle: Text('Backend-connected navigation-module workflow')),
          ListTile(title: Text('Earnings Module'), subtitle: Text('Backend-connected earnings-module workflow')),
          ListTile(title: Text('Wallet Module'), subtitle: Text('Backend-connected wallet-module workflow')),
          ListTile(title: Text('Notification Module'), subtitle: Text('Backend-connected notification-module workflow')),
          ListTile(title: Text('Tracking Module'), subtitle: Text('Backend-connected tracking-module workflow')),
          ListTile(title: Text('Online Status Module'), subtitle: Text('Backend-connected online-status-module workflow')),
          Text('Gateway: ${api.baseUrl}'),
        ],
      ),
    );
  }
}
