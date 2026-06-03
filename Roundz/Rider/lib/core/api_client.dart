import 'package:dio/dio.dart';

class RoundzApiClient {
  RoundzApiClient({String baseUrl = 'http://10.0.2.2:3000'}) : _dio = Dio(BaseOptions(baseUrl: baseUrl, contentType: 'application/json'));
  final Dio _dio;

  void setToken(String token) => _dio.options.headers['Authorization'] = 'Bearer $token';
  Future<Response<dynamic>> login(String email, String password) => _dio.post('/v1/auth/login', data: {'email': email, 'password': password});
  Future<Response<dynamic>> createTrip(Map<String, dynamic> payload) => _dio.post('/v1/trips', data: payload);
  Future<Response<dynamic>> latestPosition(String tripId) => _dio.get('/v1/tracking/trips/$tripId/latest');
  Future<Response<dynamic>> wallet(String userId) => _dio.get('/v1/wallets/$userId');
  Future<Response<dynamic>> setRiderOnline(String riderId, Map<String, dynamic> payload) => _dio.patch('/v1/riders/$riderId/status', data: payload);
}
