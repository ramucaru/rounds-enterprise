class RoundzApiClient {
  RoundzApiClient({required this.baseUrl, this.token});

  final String baseUrl;
  final String? token;

  Uri uri(String path) => Uri.parse('$baseUrl$path');

  Map<String, String> headers() => {
    'content-type': 'application/json',
    if (token != null) 'authorization': 'Bearer $token',
  };
}
