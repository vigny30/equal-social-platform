import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class AuthProvider extends ChangeNotifier {
  final SupabaseClient _supabase = Supabase.instance.client;
  User? _user;
  bool _loading = true;

  User? get user => _user;
  bool get loading => _loading;
  bool get isAuthenticated => _user != null;

  AuthProvider() {
    _initialize();
  }

  void _initialize() {
    // Get initial session
    _user = _supabase.auth.currentUser;
    _loading = false;
    notifyListeners();

    // Listen for auth changes
    _supabase.auth.onAuthStateChange.listen((data) {
      _user = data.session?.user;
      _loading = false;
      notifyListeners();
    });
  }

  Future<AuthResponse> signUp(String email, String password, [String? displayName]) async {
    try {
      _loading = true;
      notifyListeners();

      final response = await _supabase.auth.signUp(
        email: email,
        password: password,
        data: displayName != null ? {'display_name': displayName} : null,
      );

      _loading = false;
      notifyListeners();
      return response;
    } catch (e) {
      _loading = false;
      notifyListeners();
      rethrow;
    }
  }

  Future<AuthResponse> signIn(String email, String password) async {
    try {
      _loading = true;
      notifyListeners();

      final response = await _supabase.auth.signInWithPassword(
        email: email,
        password: password,
      );

      _loading = false;
      notifyListeners();
      return response;
    } catch (e) {
      _loading = false;
      notifyListeners();
      rethrow;
    }
  }

  Future<void> signOut() async {
    try {
      _loading = true;
      notifyListeners();

      await _supabase.auth.signOut();

      _loading = false;
      notifyListeners();
    } catch (e) {
      _loading = false;
      notifyListeners();
      rethrow;
    }
  }

  Future<bool> signInWithGoogle() async {
    try {
      _loading = true;
      notifyListeners();

      await _supabase.auth.signInWithOAuth(
        OAuthProvider.google,
        redirectTo: 'io.supabase.flutterquickstart://login-callback/',
      );

      _loading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _loading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> resetPassword(String email) async {
    try {
      await _supabase.auth.resetPasswordForEmail(email);
    } catch (e) {
      rethrow;
    }
  }
}