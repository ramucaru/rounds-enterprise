import 'package:dio/dio.dart';

import 'app_storage.dart';

class RoundzApiClient {
  RoundzApiClient({String baseUrl = 'http://10.0.2.2:3000', RoundzAppStorage? storage})
      : storage = storage ?? RoundzAppStorage.instance,
        _dio = Dio(BaseOptions(baseUrl: baseUrl, contentType: 'application/json', connectTimeout: const Duration(seconds: 12), receiveTimeout: const Duration(seconds: 20))) {
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await this.storage.accessToken;
        if (token != null && token.isNotEmpty) options.headers['Authorization'] = 'Bearer $token';
        handler.next(options);
      },
      onResponse: (response, handler) async {
        await this.storage.rememberApiPayload(response.requestOptions.path, response.data);
        handler.next(response);
      },
      onError: (error, handler) async {
        final retryCount = (error.requestOptions.extra['retryCount'] as int?) ?? 0;
        if (retryCount < 2 && _isRetryable(error)) {
          error.requestOptions.extra['retryCount'] = retryCount + 1;
          try {
            final response = await _dio.fetch<dynamic>(error.requestOptions);
            handler.resolve(response);
            return;
          } catch (_) {}
        }
        handler.next(error);
      },
    ));
  }

  final Dio _dio;
  final RoundzAppStorage storage;

  Future<Response<dynamic>> register(Map<String, dynamic> payload) => _dio.post('/v1/auth/register', data: payload);

  Future<Response<dynamic>> login(String email, String password) async {
    final response = await _dio.post('/v1/auth/login', data: {'email': email, 'password': password});
    if (response.data is Map<String, dynamic>) await storage.saveAuthResponse(response.data as Map<String, dynamic>);
    return response;
  }

  Future<Response<dynamic>> createTrip(Map<String, dynamic> payload) async {
    final response = await _dio.post('/v1/trips', data: payload);
    final id = response.data is Map ? (response.data as Map)['id']?.toString() : null;
    if (id != null) await storage.setSelectedTripId(id);
    return response;
  }

  Future<Response<dynamic>> latestPosition(String tripId) => _dio.get('/v1/tracking/trips/$tripId/latest');
  Future<Response<dynamic>> wallet(String userId) => _dio.get('/v1/wallets/$userId');
  Future<Response<dynamic>> setRiderOnline(String riderId, Map<String, dynamic> payload) => _dio.patch('/v1/riders/$riderId/status', data: payload);
  Future<Response<dynamic>> operations() => _dio.get('/v1/admin/operations');
  Future<Response<dynamic>> analytics() => _dio.get('/v1/analytics/summary');

  bool _isRetryable(DioException error) => error.type == DioExceptionType.connectionError || error.type == DioExceptionType.connectionTimeout || (error.response?.statusCode ?? 0) >= 500;
}
