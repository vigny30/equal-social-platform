import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state_provider.dart';
import '../theme/app_theme.dart';
import '../widgets/gradient_background.dart';
import '../widgets/glass_card.dart';

class MusicScreen extends StatefulWidget {
  const MusicScreen({super.key});

  @override
  State<MusicScreen> createState() => _MusicScreenState();
}

class _MusicScreenState extends State<MusicScreen>
    with TickerProviderStateMixin {
  late TabController _tabController;
  int _currentTrackIndex = 0;
  bool _isPlaying = false;
  final double _currentPosition = 0.0;

  // Mock data for music tracks
  final List<MusicTrack> _tracks = [
    MusicTrack(
      id: '1',
      title: 'Neon Dreams',
      artist: 'SynthWave Producer',
      album: 'Digital Nights',
      duration: const Duration(minutes: 3, seconds: 45),
      coverUrl: 'https://via.placeholder.com/300',
      audioUrl: 'https://example.com/track1.mp3',
    ),
    MusicTrack(
      id: '2',
      title: 'Electric Pulse',
      artist: 'Beat Master',
      album: 'Electronic Vibes',
      duration: const Duration(minutes: 4, seconds: 12),
      coverUrl: 'https://via.placeholder.com/300',
      audioUrl: 'https://example.com/track2.mp3',
    ),
    MusicTrack(
      id: '3',
      title: 'Cosmic Journey',
      artist: 'Space Sounds',
      album: 'Interstellar',
      duration: const Duration(minutes: 5, seconds: 23),
      coverUrl: 'https://via.placeholder.com/300',
      audioUrl: 'https://example.com/track3.mp3',
    ),
  ];

  final List<Playlist> _playlists = [
    Playlist(
      id: '1',
      name: 'My Favorites',
      description: 'Your liked tracks',
      trackCount: 24,
      coverUrl: 'https://via.placeholder.com/200',
    ),
    Playlist(
      id: '2',
      name: 'Chill Vibes',
      description: 'Relaxing music for focus',
      trackCount: 18,
      coverUrl: 'https://via.placeholder.com/200',
    ),
    Playlist(
      id: '3',
      name: 'Workout Mix',
      description: 'High energy tracks',
      trackCount: 32,
      coverUrl: 'https://via.placeholder.com/200',
    ),
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: GradientBackground(
        child: SafeArea(
          child: Column(
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  children: [
                    Text(
                      'Music',
                      style: Theme.of(context).textTheme.headlineMedium
                          ?.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                            fontFamily: 'Orbitron',
                          ),
                    ),
                    const Spacer(),
                    GlassCard(
                      child: IconButton(
                        onPressed: () => _showSearchDialog(),
                        icon: const Icon(Icons.search, color: Colors.white),
                      ),
                    ),
                  ],
                ),
              ),

              // Tab Bar
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 16),
                child: GlassCard(
                  child: TabBar(
                    controller: _tabController,
                    indicator: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [AppTheme.primaryPurple, AppTheme.primaryBlue],
                      ),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    indicatorSize: TabBarIndicatorSize.tab,
                    labelColor: Colors.white,
                    unselectedLabelColor: Colors.white.withOpacity(0.6),
                    labelStyle: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                    ),
                    tabs: const [
                      Tab(text: 'Tracks'),
                      Tab(text: 'Playlists'),
                      Tab(text: 'Artists'),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Content
              Expanded(
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    _buildTracksView(),
                    _buildPlaylistsView(),
                    _buildArtistsView(),
                  ],
                ),
              ),

              // Now Playing Bar
              if (_isPlaying) _buildNowPlayingBar(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTracksView() {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      itemCount: _tracks.length,
      itemBuilder: (context, index) {
        final track = _tracks[index];
        final isCurrentTrack = _currentTrackIndex == index;

        return Padding(
           padding: const EdgeInsets.only(bottom: 8),
           child: Container(
             decoration: isCurrentTrack
                 ? BoxDecoration(
                     border: Border.all(color: AppTheme.primaryPurple, width: 2),
                     borderRadius: BorderRadius.circular(16),
                   )
                 : null,
             child: GlassCard(
          child: ListTile(
            leading: ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Image.network(
                track.coverUrl,
                width: 50,
                height: 50,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      color: Colors.grey[800],
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.music_note, color: Colors.white),
                  );
                },
              ),
            ),
            title: Text(
              track.title,
              style: TextStyle(
                color: isCurrentTrack ? Colors.purple : Colors.white,
                fontWeight: FontWeight.w600,
              ),
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  track.artist,
                  style: TextStyle(color: Colors.white.withOpacity(0.7)),
                ),
                Text(
                  _formatDuration(track.duration),
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.5),
                    fontSize: 12,
                  ),
                ),
              ],
            ),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                IconButton(
                  onPressed: () => _toggleFavorite(track.id),
                  icon: const Icon(Icons.favorite_border, color: Colors.white),
                ),
                IconButton(
                  onPressed: () => _showTrackOptions(track),
                  icon: const Icon(Icons.more_vert, color: Colors.white),
                ),
              ],
            ),
            onTap: () => _playTrack(index),
          ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildPlaylistsView() {
    return GridView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 0.8,
      ),
      itemCount: _playlists.length,
      itemBuilder: (context, index) {
        final playlist = _playlists[index];

        return GlassCard(
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: () => _openPlaylist(playlist),
              borderRadius: BorderRadius.circular(16),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.network(
                          playlist.coverUrl,
                          width: double.infinity,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            return Container(
                              width: double.infinity,
                              decoration: BoxDecoration(
                                color: Colors.grey[800],
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Icon(
                                Icons.playlist_play,
                                color: Colors.white,
                                size: 48,
                              ),
                            );
                          },
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      playlist.name,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${playlist.trackCount} tracks',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.7),
                        fontSize: 12,
                      ),
                    ),
                    Text(
                      playlist.description,
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.5),
                        fontSize: 11,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildArtistsView() {
    return const Center(
      child: Text(
        'Artists view coming soon!',
        style: TextStyle(color: Colors.white, fontSize: 18),
      ),
    );
  }

  Widget _buildNowPlayingBar() {
    final currentTrack = _tracks[_currentTrackIndex];

    return Container(
      height: 80,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Colors.black.withOpacity(0.9),
            Colors.purple.withOpacity(0.3),
          ],
        ),
        border: Border(
          top: BorderSide(color: Colors.white.withOpacity(0.2), width: 1),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Row(
          children: [
            // Track info
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Image.network(
                currentTrack.coverUrl,
                width: 50,
                height: 50,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      color: Colors.grey[800],
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.music_note, color: Colors.white),
                  );
                },
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    currentTrack.title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  Text(
                    currentTrack.artist,
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.7),
                      fontSize: 12,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),

            // Controls
            Consumer<AppStateProvider>(
              builder: (context, appState, child) {
                return Row(
                  children: [
                    IconButton(
                      onPressed: () => _previousTrack(),
                      icon: const Icon(
                        Icons.skip_previous,
                        color: Colors.white,
                      ),
                    ),
                    IconButton(
                      onPressed: () => _togglePlayPause(),
                      icon: Icon(
                        appState.isPlaying ? Icons.pause : Icons.play_arrow,
                        color: Colors.white,
                        size: 32,
                      ),
                    ),
                    IconButton(
                      onPressed: () => _nextTrack(),
                      icon: const Icon(Icons.skip_next, color: Colors.white),
                    ),
                  ],
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  String _formatDuration(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    final minutes = twoDigits(duration.inMinutes.remainder(60));
    final seconds = twoDigits(duration.inSeconds.remainder(60));
    return '$minutes:$seconds';
  }

  void _playTrack(int index) {
    setState(() {
      _currentTrackIndex = index;
      _isPlaying = true;
    });

    final appState = Provider.of<AppStateProvider>(context, listen: false);
    appState.setPlaying(true);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Now playing: ${_tracks[index].title}'),
        backgroundColor: Colors.purple,
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _togglePlayPause() {
    setState(() {
      _isPlaying = !_isPlaying;
    });

    final appState = Provider.of<AppStateProvider>(context, listen: false);
    appState.setPlaying(_isPlaying);
  }

  void _previousTrack() {
    if (_currentTrackIndex > 0) {
      _playTrack(_currentTrackIndex - 1);
    }
  }

  void _nextTrack() {
    if (_currentTrackIndex < _tracks.length - 1) {
      _playTrack(_currentTrackIndex + 1);
    }
  }

  void _toggleFavorite(String trackId) {
    // Implement favorite functionality
  }

  void _showTrackOptions(MusicTrack track) {
    // Implement track options menu
  }

  void _openPlaylist(Playlist playlist) {
    // Implement playlist view
  }

  void _showSearchDialog() {
    // Implement search functionality
  }
}

// Data models
class MusicTrack {
  final String id;
  final String title;
  final String artist;
  final String album;
  final Duration duration;
  final String coverUrl;
  final String audioUrl;

  MusicTrack({
    required this.id,
    required this.title,
    required this.artist,
    required this.album,
    required this.duration,
    required this.coverUrl,
    required this.audioUrl,
  });
}

class Playlist {
  final String id;
  final String name;
  final String description;
  final int trackCount;
  final String coverUrl;

  Playlist({
    required this.id,
    required this.name,
    required this.description,
    required this.trackCount,
    required this.coverUrl,
  });
}