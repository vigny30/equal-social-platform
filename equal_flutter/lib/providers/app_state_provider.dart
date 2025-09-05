import 'package:flutter/material.dart';

class AppStateProvider extends ChangeNotifier {
  int _currentIndex = 0;
  bool _isLoading = false;
  String? _errorMessage;

  // Navigation state
  int get currentIndex => _currentIndex;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  void setCurrentIndex(int index) {
    _currentIndex = index;
    notifyListeners();
  }

  void setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void setError(String? error) {
    _errorMessage = error;
    notifyListeners();
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  // Media state
  bool _isRecording = false;
  bool _isPlaying = false;
  double _volume = 1.0;

  bool get isRecording => _isRecording;
  bool get isPlaying => _isPlaying;
  double get volume => _volume;

  void setRecording(bool recording) {
    _isRecording = recording;
    notifyListeners();
  }

  void setPlaying(bool playing) {
    _isPlaying = playing;
    notifyListeners();
  }

  void setVolume(double volume) {
    _volume = volume.clamp(0.0, 1.0);
    notifyListeners();
  }

  // Content creation state
  String? _currentProject;
  List<String> _recentProjects = [];

  String? get currentProject => _currentProject;
  List<String> get recentProjects => _recentProjects;

  void setCurrentProject(String? project) {
    _currentProject = project;
    if (project != null && !_recentProjects.contains(project)) {
      _recentProjects.insert(0, project);
      if (_recentProjects.length > 10) {
        _recentProjects = _recentProjects.take(10).toList();
      }
    }
    notifyListeners();
  }

  void clearCurrentProject() {
    _currentProject = null;
    notifyListeners();
  }

  // Social features state
  final Map<String, bool> _likedPosts = {};
  final Map<String, bool> _followedUsers = {};

  bool isPostLiked(String postId) => _likedPosts[postId] ?? false;
  bool isUserFollowed(String userId) => _followedUsers[userId] ?? false;

  void togglePostLike(String postId) {
    _likedPosts[postId] = !(_likedPosts[postId] ?? false);
    notifyListeners();
  }

  void toggleUserFollow(String userId) {
    _followedUsers[userId] = !(_followedUsers[userId] ?? false);
    notifyListeners();
  }
}
