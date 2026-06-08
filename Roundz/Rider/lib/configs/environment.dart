const roundzGatewayBaseUrl = String.fromEnvironment('ROUNDZ_GATEWAY_URL', defaultValue: 'http://10.0.2.2:3000');
const roundzSocketBaseUrl = String.fromEnvironment('ROUNDZ_SOCKET_URL', defaultValue: roundzGatewayBaseUrl);
const roundzMqttUrl = String.fromEnvironment('ROUNDZ_MQTT_URL', defaultValue: 'ws://10.0.2.2:1883');
