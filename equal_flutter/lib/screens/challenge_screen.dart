import 'package:flutter/material.dart';
import '../widgets/gradient_background.dart';
import '../widgets/glass_card.dart';

class ChallengeScreen extends StatefulWidget {
  const ChallengeScreen({super.key});

  @override
  State<ChallengeScreen> createState() => _ChallengeScreenState();
}

class _ChallengeScreenState extends State<ChallengeScreen>
    with TickerProviderStateMixin {
  late TabController _tabController;

  // Mock challenges data
  final List<Challenge> _activeChallenges = [
    Challenge(
      id: '1',
      title: 'Beat Drop Challenge',
      description: 'Create a 30-second beat drop that gets people moving!',
      category: 'Music',
      prize: '\$500 + Featured Playlist',
      participantCount: 1234,
      endDate: DateTime.now().add(const Duration(days: 7)),
      thumbnailUrl: 'https://via.placeholder.com/400x300',
      difficulty: 'Medium',
      tags: ['music', 'beat', 'electronic'],
    ),
    Challenge(
      id: '2',
      title: 'Neon Art Contest',
      description: 'Design stunning neon-themed digital artwork',
      category: 'Art',
      prize: '\$300 + Gallery Feature',
      participantCount: 567,
      endDate: DateTime.now().add(const Duration(days: 12)),
      thumbnailUrl: 'https://via.placeholder.com/400x300',
      difficulty: 'Hard',
      tags: ['art', 'neon', 'digital'],
    ),
    Challenge(
      id: '3',
      title: 'Quick Edit Challenge',
      description: 'Edit a video in under 60 seconds with maximum impact',
      category: 'Video',
      prize: '\$200 + Pro Tools Access',
      participantCount: 890,
      endDate: DateTime.now().add(const Duration(days: 5)),
      thumbnailUrl: 'https://via.placeholder.com/400x300',
      difficulty: 'Easy',
      tags: ['video', 'editing', 'quick'],
    ),
  ];

  final List<Challenge> _myParticipations = [
    Challenge(
      id: '4',
      title: 'Retro Vibes Challenge',
      description: 'Create content with an 80s aesthetic',
      category: 'Mixed',
      prize: '\$400 + Retro Pack',
      participantCount: 445,
      endDate: DateTime.now().add(const Duration(days: 3)),
      thumbnailUrl: 'https://via.placeholder.com/400x300',
      difficulty: 'Medium',
      tags: ['retro', '80s', 'aesthetic'],
      isParticipating: true,
    ),
  ];

  final List<String> _categories = [
    'All',
    'Music',
    'Art',
    'Video',
    'Photo',
    'Mixed',
  ];

  String _selectedCategory = 'All';

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
              _buildHeader(),

              // Tab Bar
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: GlassCard(
                  child: TabBar(
                  controller: _tabController,
                  indicator: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Colors.orange, Colors.deepOrange],
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
                    Tab(icon: Icon(Icons.emoji_events), text: 'Active'),
                    Tab(icon: Icon(Icons.person), text: 'My Challenges'),
                    Tab(icon: Icon(Icons.history), text: 'Past'),
                  ],
                ),
                ),
              ),

              // Content
              Expanded(
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    _buildActiveChallengesView(),
                    _buildMyChallengesView(),
                    _buildPastChallengesView(),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _createChallenge(),
        backgroundColor: Colors.orange,
        icon: const Icon(Icons.add),
        label: const Text('Create Challenge'),
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Row(
        children: [
          Text(
            'Challenges',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.w700,
              fontFamily: 'Orbitron',
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.orange,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Text(
              'NEW',
              style: TextStyle(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const Spacer(),
          GlassCard(
            child: IconButton(
              onPressed: () => _showFilterDialog(),
              icon: const Icon(Icons.filter_list, color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActiveChallengesView() {
    return Column(
      children: [
        // Category Filter
        Container(
          height: 50,
          margin: const EdgeInsets.symmetric(vertical: 8),
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: _categories.length,
            itemBuilder: (context, index) {
              final category = _categories[index];
              final isSelected = _selectedCategory == category;

              return Container(
                margin: const EdgeInsets.only(right: 8),
                child: FilterChip(
                  label: Text(category),
                  selected: isSelected,
                  onSelected: (selected) {
                    setState(() {
                      _selectedCategory = category;
                    });
                  },
                  backgroundColor: Colors.transparent,
                  selectedColor: Colors.orange.withOpacity(0.3),
                  labelStyle: TextStyle(
                    color: isSelected ? Colors.white : Colors.white70,
                    fontWeight: isSelected
                        ? FontWeight.bold
                        : FontWeight.normal,
                  ),
                  side: BorderSide(
                    color: isSelected ? Colors.orange : Colors.white30,
                  ),
                ),
              );
            },
          ),
        ),

        // Challenges List
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: _getFilteredChallenges().length,
            itemBuilder: (context, index) {
              final challenge = _getFilteredChallenges()[index];
              return _buildChallengeCard(challenge);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildMyChallengesView() {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      itemCount: _myParticipations.length,
      itemBuilder: (context, index) {
        final challenge = _myParticipations[index];
        return _buildChallengeCard(challenge, showProgress: true);
      },
    );
  }

  Widget _buildPastChallengesView() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.history, size: 64, color: Colors.white54),
          SizedBox(height: 16),
          Text(
            'Past challenges will appear here',
            style: TextStyle(color: Colors.white54, fontSize: 16),
          ),
        ],
      ),
    );
  }

  Widget _buildChallengeCard(Challenge challenge, {bool showProgress = false}) {
    final daysLeft = challenge.endDate.difference(DateTime.now()).inDays;

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      child: GlassCard(
        child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => _openChallenge(challenge),
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                Row(
                  children: [
                    // Thumbnail
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.network(
                        challenge.thumbnailUrl,
                        width: 80,
                        height: 80,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return Container(
                            width: 80,
                            height: 80,
                            decoration: BoxDecoration(
                              color: Colors.grey[800],
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(
                              Icons.emoji_events,
                              color: Colors.white,
                              size: 32,
                            ),
                          );
                        },
                      ),
                    ),

                    const SizedBox(width: 16),

                    // Challenge Info
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  challenge.title,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                              if (challenge.isParticipating == true)
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.green,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: const Text(
                                    'JOINED',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                            ],
                          ),

                          const SizedBox(height: 4),

                          Text(
                            challenge.description,
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.8),
                              fontSize: 14,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),

                          const SizedBox(height: 8),

                          // Tags
                          Wrap(
                            spacing: 4,
                            children: challenge.tags.take(3).map((tag) {
                              return Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 6,
                                  vertical: 2,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.purple.withOpacity(0.3),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  '#$tag',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 10,
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 16),

                // Stats Row
                Row(
                  children: [
                    _buildStatChip(
                      Icons.people,
                      '${challenge.participantCount} participants',
                      Colors.blue,
                    ),
                    const SizedBox(width: 8),
                    _buildStatChip(
                      Icons.schedule,
                      '$daysLeft days left',
                      daysLeft <= 2 ? Colors.red : Colors.orange,
                    ),
                    const SizedBox(width: 8),
                    _buildStatChip(
                      Icons.star,
                      challenge.difficulty,
                      _getDifficultyColor(challenge.difficulty),
                    ),
                  ],
                ),

                const SizedBox(height: 12),

                // Prize and Action
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Prize:',
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.7),
                              fontSize: 12,
                            ),
                          ),
                          Text(
                            challenge.prize,
                            style: const TextStyle(
                              color: Colors.orange,
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),

                    if (challenge.isParticipating != true)
                      ElevatedButton(
                        onPressed: () => _joinChallenge(challenge),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.orange,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(
                            horizontal: 20,
                            vertical: 8,
                          ),
                        ),
                        child: const Text('Join'),
                      )
                    else
                      ElevatedButton(
                        onPressed: () => _submitEntry(challenge),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(
                            horizontal: 20,
                            vertical: 8,
                          ),
                        ),
                        child: const Text('Submit'),
                      ),
                  ],
                ),

                // Progress bar for participated challenges
                if (showProgress && challenge.isParticipating == true) ...[
                  const SizedBox(height: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Your Progress',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.7),
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 4),
                      LinearProgressIndicator(
                        value: 0.7, // Mock progress
                        backgroundColor: Colors.white.withOpacity(0.2),
                        valueColor: const AlwaysStoppedAnimation<Color>(
                          Colors.green,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '70% Complete',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.7),
                          fontSize: 10,
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ),
        ),
      ),
    );
  }

  Widget _buildStatChip(IconData icon, String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.2),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.5)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: color),
          const SizedBox(width: 4),
          Text(
            text,
            style: TextStyle(
              color: color,
              fontSize: 10,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Color _getDifficultyColor(String difficulty) {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return Colors.green;
      case 'medium':
        return Colors.orange;
      case 'hard':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  List<Challenge> _getFilteredChallenges() {
    if (_selectedCategory == 'All') {
      return _activeChallenges;
    }
    return _activeChallenges
        .where((challenge) => challenge.category == _selectedCategory)
        .toList();
  }

  void _openChallenge(Challenge challenge) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.grey[900],
        title: Text(
          challenge.title,
          style: const TextStyle(color: Colors.white),
        ),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                challenge.description,
                style: const TextStyle(color: Colors.white70),
              ),
              const SizedBox(height: 16),
              Text(
                'Prize: ${challenge.prize}',
                style: const TextStyle(
                  color: Colors.orange,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Participants: ${challenge.participantCount}',
                style: const TextStyle(color: Colors.white70),
              ),
              const SizedBox(height: 8),
              Text(
                'Difficulty: ${challenge.difficulty}',
                style: TextStyle(
                  color: _getDifficultyColor(challenge.difficulty),
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
          if (challenge.isParticipating != true)
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                _joinChallenge(challenge);
              },
              style: ElevatedButton.styleFrom(backgroundColor: Colors.orange),
              child: const Text('Join Challenge'),
            ),
        ],
      ),
    );
  }

  void _joinChallenge(Challenge challenge) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Joined "${challenge.title}"!'),
        backgroundColor: Colors.green,
      ),
    );
  }

  void _submitEntry(Challenge challenge) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.grey[900],
        title: const Text(
          'Submit Entry',
          style: TextStyle(color: Colors.white),
        ),
        content: const Text(
          'Entry submission functionality coming soon!',
          style: TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _createChallenge() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.grey[900],
        title: const Text(
          'Create Challenge',
          style: TextStyle(color: Colors.white),
        ),
        content: const Text(
          'Challenge creation functionality coming soon!',
          style: TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _showFilterDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.grey[900],
        title: const Text(
          'Filter Challenges',
          style: TextStyle(color: Colors.white),
        ),
        content: const Text(
          'Advanced filtering options coming soon!',
          style: TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }
}

// Data model
class Challenge {
  final String id;
  final String title;
  final String description;
  final String category;
  final String prize;
  final int participantCount;
  final DateTime endDate;
  final String thumbnailUrl;
  final String difficulty;
  final List<String> tags;
  final bool? isParticipating;

  Challenge({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.prize,
    required this.participantCount,
    required this.endDate,
    required this.thumbnailUrl,
    required this.difficulty,
    required this.tags,
    this.isParticipating,
  });
}