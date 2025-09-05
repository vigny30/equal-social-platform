import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state_provider.dart';
import '../theme/app_theme.dart';
import '../widgets/gradient_background.dart';
import '../widgets/glass_card.dart';

class ExploreScreen extends StatefulWidget {
  const ExploreScreen({super.key});

  @override
  State<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends State<ExploreScreen>
    with TickerProviderStateMixin {
  late TabController _tabController;
  final ScrollController _scrollController = ScrollController();
  
  // Mock data for posts
  final List<Post> _posts = [
    Post(
      id: '1',
      username: 'creative_artist',
      avatar: 'https://via.placeholder.com/40',
      content: 'Just created this amazing AI-generated artwork! 🎨✨',
      mediaUrl: 'https://via.placeholder.com/400x300',
      mediaType: MediaType.image,
      likes: 234,
      comments: 45,
      shares: 12,
      timestamp: DateTime.now().subtract(const Duration(hours: 2)),
    ),
    Post(
      id: '2',
      username: 'music_producer',
      avatar: 'https://via.placeholder.com/40',
      content: 'New beat drop! What do you think? 🎵🔥',
      mediaUrl: 'https://via.placeholder.com/400x200',
      mediaType: MediaType.audio,
      likes: 189,
      comments: 23,
      shares: 8,
      timestamp: DateTime.now().subtract(const Duration(hours: 4)),
    ),
    Post(
      id: '3',
      username: 'video_creator',
      avatar: 'https://via.placeholder.com/40',
      content: 'Behind the scenes of my latest project 🎬',
      mediaUrl: 'https://via.placeholder.com/400x300',
      mediaType: MediaType.video,
      likes: 456,
      comments: 78,
      shares: 34,
      timestamp: DateTime.now().subtract(const Duration(hours: 6)),
    ),
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _scrollController.dispose();
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
                      'Explore',
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                        fontFamily: 'Orbitron',
                      ),
                    ),
                    const Spacer(),
                    GlassCard(
                      child: IconButton(
                        onPressed: () => _showSearchDialog(),
                        icon: const Icon(
                          Icons.search,
                          color: Colors.white,
                        ),
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
                      Tab(text: 'For You'),
                      Tab(text: 'Following'),
                      Tab(text: 'Trending'),
                      Tab(text: 'Live'),
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
                    _buildFeedView(),
                    _buildFollowingView(),
                    _buildTrendingView(),
                    _buildLiveView(),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFeedView() {
    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      itemCount: _posts.length,
      itemBuilder: (context, index) {
        return _buildPostCard(_posts[index]);
      },
    );
  }

  Widget _buildPostCard(Post post) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      child: GlassCard(
        child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // User info
            Row(
              children: [
                CircleAvatar(
                  radius: 20,
                  backgroundImage: NetworkImage(post.avatar),
                  backgroundColor: Colors.grey[800],
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        post.username,
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      Text(
                        _formatTimestamp(post.timestamp),
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.6),
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                Consumer<AppStateProvider>(
                  builder: (context, appState, child) {
                    final isFollowed = appState.isUserFollowed(post.username);
                    return TextButton(
                      onPressed: () => appState.toggleUserFollow(post.username),
                      child: Text(
                        isFollowed ? 'Following' : 'Follow',
                        style: TextStyle(
                          color: isFollowed ? Colors.purple : Colors.white,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    );
                  },
                ),
              ],
            ),
            
            const SizedBox(height: 12),
            
            // Content
            Text(
              post.content,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
              ),
            ),
            
            const SizedBox(height: 12),
            
            // Media
            _buildMediaWidget(post),
            
            const SizedBox(height: 16),
            
            // Actions
            Row(
              children: [
                Consumer<AppStateProvider>(
                  builder: (context, appState, child) {
                    final isLiked = appState.isPostLiked(post.id);
                    return _buildActionButton(
                      icon: isLiked ? Icons.favorite : Icons.favorite_border,
                      label: post.likes.toString(),
                      color: isLiked ? Colors.red : Colors.white,
                      onTap: () => appState.togglePostLike(post.id),
                    );
                  },
                ),
                const SizedBox(width: 24),
                _buildActionButton(
                  icon: Icons.chat_bubble_outline,
                  label: post.comments.toString(),
                  color: Colors.white,
                  onTap: () => _showCommentsDialog(post),
                ),
                const SizedBox(width: 24),
                _buildActionButton(
                  icon: Icons.share_outlined,
                  label: post.shares.toString(),
                  color: Colors.white,
                  onTap: () => _sharePost(post),
                ),
                const Spacer(),
                IconButton(
                  onPressed: () => _showPostOptions(post),
                  icon: const Icon(
                    Icons.more_vert,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    ),
    );
  }

  Widget _buildMediaWidget(Post post) {
    switch (post.mediaType) {
      case MediaType.image:
        return ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: Image.network(
            post.mediaUrl,
            width: double.infinity,
            height: 200,
            fit: BoxFit.cover,
            errorBuilder: (context, error, stackTrace) {
              return Container(
                width: double.infinity,
                height: 200,
                decoration: BoxDecoration(
                  color: Colors.grey[800],
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.image,
                  color: Colors.white,
                  size: 48,
                ),
              );
            },
          ),
        );
      case MediaType.video:
        return Container(
          width: double.infinity,
          height: 200,
          decoration: BoxDecoration(
            color: Colors.black,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Stack(
            alignment: Alignment.center,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Image.network(
                  post.mediaUrl,
                  width: double.infinity,
                  height: 200,
                  fit: BoxFit.cover,
                ),
              ),
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.7),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.play_arrow,
                  color: Colors.white,
                  size: 32,
                ),
              ),
            ],
          ),
        );
      case MediaType.audio:
        return Container(
          width: double.infinity,
          height: 80,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [Colors.purple.withOpacity(0.3), Colors.blue.withOpacity(0.3)],
            ),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              const SizedBox(width: 16),
              Container(
                width: 48,
                height: 48,
                decoration: const BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.play_arrow,
                  color: Colors.purple,
                  size: 24,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Audio Track',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      'Duration: 2:34',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.7),
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 16),
            ],
          ),
        );
    }
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Row(
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              color: color,
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFollowingView() {
    return const Center(
      child: Text(
        'Following feed coming soon!',
        style: TextStyle(color: Colors.white, fontSize: 18),
      ),
    );
  }

  Widget _buildTrendingView() {
    return const Center(
      child: Text(
        'Trending content coming soon!',
        style: TextStyle(color: Colors.white, fontSize: 18),
      ),
    );
  }

  Widget _buildLiveView() {
    return const Center(
      child: Text(
        'Live streams coming soon!',
        style: TextStyle(color: Colors.white, fontSize: 18),
      ),
    );
  }

  String _formatTimestamp(DateTime timestamp) {
    final now = DateTime.now();
    final difference = now.difference(timestamp);
    
    if (difference.inMinutes < 60) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}h ago';
    } else {
      return '${difference.inDays}d ago';
    }
  }

  void _showSearchDialog() {
    // Implement search functionality
  }

  void _showCommentsDialog(Post post) {
    // Implement comments dialog
  }

  void _sharePost(Post post) {
    // Implement share functionality
  }

  void _showPostOptions(Post post) {
    // Implement post options menu
  }
}

// Data models
class Post {
  final String id;
  final String username;
  final String avatar;
  final String content;
  final String mediaUrl;
  final MediaType mediaType;
  final int likes;
  final int comments;
  final int shares;
  final DateTime timestamp;

  Post({
    required this.id,
    required this.username,
    required this.avatar,
    required this.content,
    required this.mediaUrl,
    required this.mediaType,
    required this.likes,
    required this.comments,
    required this.shares,
    required this.timestamp,
  });
}

enum MediaType { image, video, audio }