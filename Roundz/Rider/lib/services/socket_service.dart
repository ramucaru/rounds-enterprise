import 'package:socket_io_client/socket_io_client.dart' as io;

class RoundzSocketService {
  RoundzSocketService(this.gatewayUrl);
  final String gatewayUrl;
  late final io.Socket socket = io.io(gatewayUrl, io.OptionBuilder().setTransports(['websocket']).build());

  void joinTrip(String tripId) => socket.emit('trip:join', tripId);
  void dispose() => socket.dispose();
}
