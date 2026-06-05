import 'package:flutter/material.dart';

class RoundzRiderTheme {
  static const Color primary = Color(0xFFF97316);
  static const Color accent = Color(0xFF0EA5E9);
  static const Color surface = Color(0xFF111827);

  static ThemeData get dark {
    final scheme = ColorScheme.fromSeed(seedColor: primary, brightness: Brightness.dark);
    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      scaffoldBackgroundColor: surface,
      appBarTheme: const AppBarTheme(
        centerTitle: false,
        elevation: 0,
        backgroundColor: Colors.transparent,
        foregroundColor: Color(0xFFF8FAFC),
        titleTextStyle: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Color(0xFFF8FAFC)),
      ),
      cardTheme: CardThemeData(
        color: const Color(0xFF1F2937),
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          textStyle: const TextStyle(fontWeight: FontWeight.w800),
        ),
      ),
      textTheme: const TextTheme(
        headlineMedium: TextStyle(fontSize: 32, height: 1.05, fontWeight: FontWeight.w900, color: Color(0xFFF8FAFC)),
        titleLarge: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Color(0xFFF8FAFC)),
        bodyMedium: TextStyle(fontSize: 15, height: 1.5, color: Color(0xFFCBD5E1)),
      ),
    );
  }
}

