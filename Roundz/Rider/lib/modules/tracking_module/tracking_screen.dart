import 'package:flutter/material.dart';
import '../../core/realtime_client.dart';

class TrackingScreen extends StatefulWidget {
  const TrackingScreen({required this.tripId, super.key});
  final String tripId;
  @override
  State<TrackingScreen> createState() => _TrackingScreenState();
}

class _TrackingScreenState extends State<TrackingScreen> {
  late final RoundzRealtimeClient realtime;
  String latest = 'Waiting for location updates';
  @override
  void initState() {
    super.initState();
    realtime = RoundzRealtimeClient()..connectToTrip(widget.tripId)..onPosition((payload) => setState(() => latest = payload.toString()));
  }
  @override
  void dispose() { realtime.dispose(); super.dispose(); }
  @override
  Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: const Text('Live tracking')), body: Center(child: Text(latest)));
}
