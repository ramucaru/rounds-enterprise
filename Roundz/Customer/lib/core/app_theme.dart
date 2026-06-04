import 'package:flutter/material.dart';

class RoundzCustomerTheme {
  static const Color primary = Color(0xFF0EA5E9);
  static const Color accent = Color(0xFF22C55E);
  static const Color surface = Color(0xFFF8FAFC);

  static ThemeData get light {
    final scheme = ColorScheme.fromSeed(seedColor: primary, brightness: Brightness.light);
    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      scaffoldBackgroundColor: surface,
      appBarTheme: const AppBarTheme(
        centerTitle: false,
        elevation: 0,
        backgroundColor: Colors.transparent,
        foregroundColor: Color(0xFF0F172A),
        titleTextStyle: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
      ),
      cardTheme: CardThemeData(
        color: Colors.white,
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
        headlineMedium: TextStyle(fontSize: 32, height: 1.05, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
        titleLarge: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Color(0xFF0F172A)),
        bodyMedium: TextStyle(fontSize: 15, height: 1.5, color: Color(0xFF475569)),
      ),
    );
  }
}

