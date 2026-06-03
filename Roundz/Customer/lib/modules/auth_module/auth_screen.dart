import 'package:flutter/material.dart';
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
  Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: const Text('Roundz Customer')), body: Center(child: Column(mainAxisSize: MainAxisSize.min, children: [Text(status), FilledButton(onPressed: login, child: const Text('Test gateway login'))])));
}
