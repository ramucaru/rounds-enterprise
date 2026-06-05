import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

class RoundzAppStorage {
  RoundzAppStorage._();
  static final RoundzAppStorage instance = RoundzAppStorage._();

  static const _secureStorage = FlutterSecureStorage();
  SharedPreferences? _preferences;

  Future<SharedPreferences> get _prefs async => _preferences ??= await SharedPreferences.getInstance();

  Future<String?> get accessToken => _secureStorage.read(key: 'roundz.accessToken');
  Future<String?> get refreshToken => _secureStorage.read(key: 'roundz.refreshToken');
  Future<String?> get userId async => (await _prefs).getString('roundz.userId');
  Future<String?> get riderId async => (await _prefs).getString('roundz.riderId');
  Future<String?> get selectedTripId async => (await _prefs).getString('roundz.selectedTripId');

  Future<void> saveAuthResponse(Map<String, dynamic> payload) async {
    final token = payload['token']?.toString();
    final refresh = payload['refreshToken']?.toString();
    final user = payload['user'];
    if (token != null && token.isNotEmpty) await _secureStorage.write(key: 'roundz.accessToken', value: token);
    if (refresh != null && refresh.isNotEmpty) await _secureStorage.write(key: 'roundz.refreshToken', value: refresh);
    if (user is Map<String, dynamic>) {
      final id = user['id']?.toString();
      if (id != null) await setUserId(id);
      await cacheJson('roundz.userProfile', user);
    }
  }

  Future<void> setUserId(String value) async => (await _prefs).setString('roundz.userId', value);
  Future<void> setRiderId(String value) async => (await _prefs).setString('roundz.riderId', value);
  Future<void> setSelectedTripId(String value) async => (await _prefs).setString('roundz.selectedTripId', value);
  Future<void> setWalletUserId(String value) async => (await _prefs).setString('roundz.walletUserId', value);

  Future<void> cacheJson(String key, Object? value) async => (await _prefs).setString(key, jsonEncode(value));

  Future<Map<String, dynamic>?> readJsonMap(String key) async {
    final raw = (await _prefs).getString(key);
    if (raw == null) return null;
    final decoded = jsonDecode(raw);
    return decoded is Map<String, dynamic> ? decoded : null;
  }

  Future<void> rememberApiPayload(String endpoint, Object? payload) async {
    await cacheJson('roundz.cache.$endpoint', payload);
    await _extractIds(payload);
  }

  Future<void> _extractIds(Object? payload) async {
    if (payload is List) {
      for (final item in payload) {
        await _extractIds(item);
      }
      return;
    }
    if (payload is! Map) return;
    for (final entry in payload.entries) {
      final key = entry.key.toString();
      final value = entry.value;
      if (value is String && value.isNotEmpty) {
        if (key == 'userId' || key == 'customerId' || key == 'customer_id' || key == 'user_id') await setUserId(value);
        if (key == 'riderId' || key == 'rider_id') await setRiderId(value);
        if (key == 'tripId' || key == 'trip_id') await setSelectedTripId(value);
      }
      await _extractIds(value);
    }
  }

  Future<void> clear() async {
    await _secureStorage.delete(key: 'roundz.accessToken');
    await _secureStorage.delete(key: 'roundz.refreshToken');
    final prefs = await _prefs;
    for (final key in prefs.getKeys().where((key) => key.startsWith('roundz.')).toList()) {
      await prefs.remove(key);
    }
  }
}
