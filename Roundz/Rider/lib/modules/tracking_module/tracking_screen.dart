import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/app_state.dart';
import '../../core/realtime_client.dart';

class TrackingScreen extends ConsumerStatefulWidget {
  const TrackingScreen({required this.tripId, super.key});
  final String tripId;
  @override
  ConsumerState<TrackingScreen> createState() => _TrackingScreenState();
}

class _TrackingScreenState extends ConsumerState<TrackingScreen> {
  RoundzRealtimeClient? realtime;
  String latest = 'Waiting for location updates';

  @override
  void initState() {
    super.initState();
    Future.microtask(() async {
      final storedTripId = ref.read(roundzMobileStateProvider).tripId ?? await ref.read(roundzStorageProvider).selectedTripId;
      final effectiveTripId = widget.tripId == 'current' ? storedTripId : widget.tripId;
      if (effectiveTripId == null || effectiveTripId.isEmpty) {
        setState(() => latest = 'No trip id stored. Select or create a trip first.');
        return;
      }
      await ref.read(roundzMobileStateProvider.notifier).setTripId(effectiveTripId);
      realtime = RoundzRealtimeClient()..connectToTrip(effectiveTripId)..onPosition((payload) async {
        await ref.read(roundzStorageProvider).rememberApiPayload('socket:tracking:position', payload);
        setState(() => latest = payload.toString());
      });
    });
  }

  @override
  void dispose() { realtime?.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Live tracking')),
    body: Padding(
      padding: const EdgeInsets.all(20),
      child: Card(child: Padding(padding: const EdgeInsets.all(20), child: Text(latest))),
    ),
  );
}
