import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/api_client.dart';
import '../../core/app_state.dart';

class WalletScreen extends ConsumerStatefulWidget {
  const WalletScreen({required this.userId, super.key});
  final String userId;
  @override
  ConsumerState<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends ConsumerState<WalletScreen> {
  late final RoundzApiClient api;
  Object? wallet;
  String? error;

  @override
  void initState() {
    super.initState();
    api = RoundzApiClient(storage: ref.read(roundzStorageProvider));
    Future.microtask(loadWallet);
  }

  Future<void> loadWallet() async {
    try {
      final storedUserId = ref.read(roundzMobileStateProvider).userId ?? await ref.read(roundzStorageProvider).userId;
      final effectiveUserId = widget.userId == 'me' ? storedUserId : widget.userId;
      if (effectiveUserId == null || effectiveUserId.isEmpty) {
        setState(() => error = 'No user id stored. Sign in first or open /wallet/:userId.');
        return;
      }
      await ref.read(roundzStorageProvider).setWalletUserId(effectiveUserId);
      final response = await api.wallet(effectiveUserId);
      await ref.read(roundzStorageProvider).cacheJson('roundz.wallet.$effectiveUserId', response.data);
      setState(() { wallet = response.data; error = null; });
    } catch (exception) {
      setState(() => error = exception.toString());
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Wallet')),
    body: RefreshIndicator(
      onRefresh: loadWallet,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Card(child: Padding(padding: const EdgeInsets.all(20), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Stored wallet data', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12),
            if (error != null) Text(error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
            if (wallet == null && error == null) const Text('Loading wallet from persisted user id...'),
            if (wallet != null) Text(wallet.toString()),
            const SizedBox(height: 12),
            FilledButton.icon(onPressed: loadWallet, icon: const Icon(Icons.refresh_rounded), label: const Text('Refresh wallet')),
          ]))),
        ],
      ),
    ),
  );
}
