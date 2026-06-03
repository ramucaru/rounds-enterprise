import 'package:mqtt_client/mqtt_client.dart';
import 'package:mqtt_client/mqtt_server_client.dart';

class RoundzMqttService {
  RoundzMqttService(String host, String clientId) : client = MqttServerClient(host, clientId);
  final MqttServerClient client;

  Future<void> connect() async {
    client.keepAlivePeriod = 30;
    await client.connect();
  }

  void subscribe(String topic) => client.subscribe(topic, MqttQos.atLeastOnce);
}
