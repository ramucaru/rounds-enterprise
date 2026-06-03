import 'package:socket_io_client/socket_io_client.dart' as io;

class RoundzRealtimeClient {
  RoundzRealtimeClient({String baseUrl = 'http://10.0.2.2:3000'}) : socket = io.io(baseUrl, io.OptionBuilder().setTransports(['websocket']).setPath('/socket.io').disableAutoConnect().build());
  final io.Socket socket;
  void connectToTrip(String tripId) { socket.connect(); socket.emit('trip:join', tripId); }
  void sendPosition(Map<String, dynamic> position) => socket.emit('tracking:position', position);
  void onPosition(void Function(dynamic payload) handler) => socket.on('tracking:position', handler);
  void dispose() => socket.dispose();
}
