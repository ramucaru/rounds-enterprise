import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/app_theme.dart';
import '../../core/api_client.dart';
import '../../core/app_state.dart';

class AuthScreen extends ConsumerStatefulWidget {
  const AuthScreen({super.key});
  @override
  ConsumerState<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends ConsumerState<AuthScreen> {
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  late final RoundzApiClient api;
  String status = 'Enter credentials to sign in through /v1/auth/login';

  @override
  void initState() {
    super.initState();
    api = RoundzApiClient(storage: ref.read(roundzStorageProvider));
  }

  @override
  void dispose() {
    emailController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  Future<void> login() async {
    try {
      final response = await api.login(emailController.text.trim(), passwordController.text);
      await ref.read(roundzMobileStateProvider.notifier).hydrate();
      setState(() => status = response.data.toString());
    } catch (error) {
      setState(() => status = error.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    final appState = ref.watch(roundzMobileStateProvider);
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(color: RoundzCustomerTheme.primary, borderRadius: BorderRadius.circular(16)),
                    child: const Icon(Icons.route_rounded, color: Colors.white),
                  ),
                  const SizedBox(width: 12),
                  Text('Roundz Customer', style: Theme.of(context).textTheme.titleLarge),
                ],
              ),
              const SizedBox(height: 24),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Sign in with backend credentials', style: Theme.of(context).textTheme.titleLarge),
                      const SizedBox(height: 14),
                      TextField(controller: emailController, keyboardType: TextInputType.emailAddress, decoration: const InputDecoration(labelText: 'Email', border: OutlineInputBorder())),
                      const SizedBox(height: 12),
                      TextField(controller: passwordController, obscureText: true, decoration: const InputDecoration(labelText: 'Password', border: OutlineInputBorder())),
                      const SizedBox(height: 16),
                      SizedBox(width: double.infinity, child: FilledButton.icon(onPressed: login, icon: const Icon(Icons.login_rounded), label: const Text('Sign in and persist session'))),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('Persisted mobile state', style: Theme.of(context).textTheme.titleLarge),
                    const SizedBox(height: 8),
                    Text('User: ${appState.userId ?? 'not stored'}'),
                    Text('Rider: ${appState.riderId ?? 'not stored'}'),
                    Text('Trip: ${appState.tripId ?? 'not stored'}'),
                    const SizedBox(height: 12),
                    Text(status),
                  ]),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
