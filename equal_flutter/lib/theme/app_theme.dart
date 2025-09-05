import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Next.js color palette - exact matches
  static const Color purple900 = Color(0xFF581C87); // from-purple-900
  static const Color purple800 = Color(0xFF7C3AED); // via-purple-800  
  static const Color blue800 = Color(0xFF1E40AF);   // to-blue-800
  static const Color primaryPurple = Color(0xFF8B5CF6); // #8b5cf6
  static const Color primaryBlue = Color(0xFF3B82F6);   // #3b82f6
  
  // Glass morphism colors
  static const Color glassBackground = Color(0x0DFFFFFF); // rgba(255, 255, 255, 0.05)
  static const Color glassBorder = Color(0x1AFFFFFF);     // rgba(255, 255, 255, 0.1)
  static const Color glassNavBackground = Color(0x33000000); // rgba(0, 0, 0, 0.2)
  
  // Text colors
  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xCCFFFFFF);   // white/80
  static const Color textMuted = Color(0xB3FFFFFF);       // white/70

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      fontFamily: GoogleFonts.inter().fontFamily,
      scaffoldBackgroundColor: Colors.transparent,
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: IconThemeData(color: textPrimary),
        titleTextStyle: TextStyle(
          color: textPrimary,
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),
      cardTheme: const CardThemeData(
        color: Colors.transparent,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(16)),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent,
          foregroundColor: textPrimary,
          elevation: 0,
          shadowColor: Colors.transparent,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: const BorderSide(color: glassBorder, width: 1),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
        ),
      ),
      textTheme: TextTheme(
        headlineLarge: GoogleFonts.orbitron(
          color: textPrimary,
          fontSize: 32,
          fontWeight: FontWeight.bold,
          letterSpacing: 2.0,
        ),
        headlineMedium: GoogleFonts.orbitron(
          color: textPrimary,
          fontSize: 24,
          fontWeight: FontWeight.bold,
          letterSpacing: 1.5,
        ),
        titleLarge: GoogleFonts.orbitron(
          color: textSecondary,
          fontSize: 28,
          fontWeight: FontWeight.bold,
          letterSpacing: 2.0,
        ),
        bodyLarge: GoogleFonts.inter(
          color: textPrimary,
          fontSize: 16,
        ),
        bodyMedium: GoogleFonts.inter(
          color: textSecondary,
          fontSize: 14,
        ),
        labelLarge: GoogleFonts.inter(
          color: textPrimary,
          fontSize: 18,
          fontWeight: FontWeight.w600,
        ),
      ),
      colorScheme: const ColorScheme.dark(
        primary: primaryPurple,
        secondary: primaryBlue,
        surface: glassBackground,
        background: Colors.transparent,
        onPrimary: textPrimary,
        onSecondary: textPrimary,
        onSurface: textPrimary,
        onBackground: textPrimary,
      ),
    );
  }

  // Next.js matching gradients
  static const LinearGradient backgroundGradient = LinearGradient(
    colors: [purple900, purple800, blue800],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    stops: [0.0, 0.5, 1.0],
  );

  static const LinearGradient buttonGradient = LinearGradient(
    colors: [primaryPurple, primaryBlue],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Glass morphism box decoration
  static BoxDecoration get glassDecoration => BoxDecoration(
    color: glassBackground,
    borderRadius: BorderRadius.circular(16),
    border: Border.all(color: glassBorder, width: 1),
    boxShadow: [
      BoxShadow(
        color: Colors.black.withValues(alpha: 0.3),
        blurRadius: 32,
        offset: const Offset(0, 8),
      ),
    ],
  );

  // Navigation glass decoration
  static BoxDecoration get glassNavDecoration => BoxDecoration(
    color: glassNavBackground,
    border: const Border(
      bottom: BorderSide(color: glassBorder, width: 1),
    ),
  );

  // Button glass decoration
  static BoxDecoration get glassButtonDecoration => BoxDecoration(
    gradient: buttonGradient,
    borderRadius: BorderRadius.circular(12),
    border: Border.all(color: glassBorder, width: 1),
    boxShadow: [
      BoxShadow(
        color: Colors.black.withValues(alpha: 0.3),
        blurRadius: 32,
        offset: const Offset(0, 8),
      ),
    ],
  );
}