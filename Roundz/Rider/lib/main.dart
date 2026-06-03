import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'shell/rider_app.dart';

void main() {
  runApp(const ProviderScope(child: RiderApp()));
}
