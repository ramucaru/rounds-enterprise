import 'package:flutter/material.dart';
import '../../core/api_client.dart';

class WalletScreen extends StatelessWidget {
  const WalletScreen({required this.userId, super.key});
  final String userId;
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Wallet')),
    body: FutureBuilder(
      future: RoundzApiClient().wallet(userId),
      builder: (context, snapshot) => Center(child: Text(snapshot.hasData ? snapshot.data!.data.toString() : 'Loading wallet from /v1/wallets/$userId')),
    ),
  );
}
