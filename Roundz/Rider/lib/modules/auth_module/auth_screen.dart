import 'package:flutter/material.dart';
import '../../core/app_theme.dart';
import '../../core/api_client.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});
  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final api = RoundzApiClient();
  String status = 'Ready to sign in through /v1/auth/login';
  Future<void> login() async {
    try {
      final response = await api.login('demo@roundz.app', 'Password123!');
      setState(() => status = response.data.toString());
    } catch (error) {
      setState(() => status = error.toString());
    }
  }
  @override
  Widget build(BuildContext context) => Scaffold(
    body: SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: RoundzRiderTheme.primary,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: const [BoxShadow(color: Color(0x44F97316), blurRadius: 22, offset: Offset(0, 10))],
                  ),
                  child: const Icon(Icons.delivery_dining_rounded, color: Colors.white),
                ),
                const SizedBox(width: 12),
                Text('Roundz Rider', style: Theme.of(context).textTheme.titleLarge),
              ],
            ),
            const SizedBox(height: 32),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFFF97316), Color(0xFF0EA5E9)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(32),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.navigation_rounded, color: Colors.white, size: 40),
                  const SizedBox(height: 28),
                  Text(
                    'Go online, accept trips, and track earnings in real time.',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(color: Colors.white),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Connected to live rider, trip, tracking, and wallet services through the gateway.',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.white.withOpacity(0.88)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Service connection', style: Theme.of(context).textTheme.titleLarge),
                    const SizedBox(height: 10),
                    Text(status),
                    const SizedBox(height: 18),
                    SizedBox(
                      width: double.infinity,
                      child: FilledButton.icon(
                        onPressed: login,
                        icon: const Icon(Icons.bolt_rounded),
                        label: const Text('Test gateway login'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    ),
  );
}
