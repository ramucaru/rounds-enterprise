import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app_storage.dart';

class RoundzMobileState {
  const RoundzMobileState({this.userId, this.riderId, this.tripId, this.online = false});
  final String? userId;
  final String? riderId;
  final String? tripId;
  final bool online;

  RoundzMobileState copyWith({String? userId, String? riderId, String? tripId, bool? online}) => RoundzMobileState(
    userId: userId ?? this.userId,
    riderId: riderId ?? this.riderId,
    tripId: tripId ?? this.tripId,
    online: online ?? this.online,
  );
}

class RoundzMobileController extends StateNotifier<RoundzMobileState> {
  RoundzMobileController(this.storage) : super(const RoundzMobileState()) { hydrate(); }
  final RoundzAppStorage storage;

  Future<void> hydrate() async {
    state = state.copyWith(userId: await storage.userId, riderId: await storage.riderId, tripId: await storage.selectedTripId);
  }

  Future<void> setUserId(String userId) async { await storage.setUserId(userId); state = state.copyWith(userId: userId); }
  Future<void> setRiderId(String riderId) async { await storage.setRiderId(riderId); state = state.copyWith(riderId: riderId); }
  Future<void> setTripId(String tripId) async { await storage.setSelectedTripId(tripId); state = state.copyWith(tripId: tripId); }
  void setOnline(bool online) => state = state.copyWith(online: online);
}

final roundzStorageProvider = Provider<RoundzAppStorage>((ref) => RoundzAppStorage.instance);
final roundzMobileStateProvider = StateNotifierProvider<RoundzMobileController, RoundzMobileState>((ref) => RoundzMobileController(ref.watch(roundzStorageProvider)));
