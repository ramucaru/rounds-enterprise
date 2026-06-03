import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../modules/auth_module/auth_screen.dart';
import '../modules/tracking_module/tracking_screen.dart';
import '../modules/wallet_module/wallet_screen.dart';

class RiderApp extends StatelessWidget {
  const RiderApp({super.key});

  @override
  Widget build(BuildContext context) {
    final router = GoRouter(routes: [
      GoRoute(path: '/', builder: (_, __) => const AuthScreen()),
      GoRoute(path: '/tracking/:tripId', builder: (_, state) => TrackingScreen(tripId: state.pathParameters['tripId']!)),
      GoRoute(path: '/wallet/:userId', builder: (_, state) => WalletScreen(userId: state.pathParameters['userId']!)),
    ]);
    return MaterialApp.router(title: 'Roundz Rider', theme: ThemeData(colorSchemeSeed: Colors.blue), routerConfig: router);
  }
}
