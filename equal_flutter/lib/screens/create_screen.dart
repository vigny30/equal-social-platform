import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/app_state_provider.dart';
import '../theme/app_theme.dart';
import '../widgets/gradient_background.dart';
import '../widgets/glass_card.dart';

class CreateScreen extends StatefulWidget {
  const CreateScreen({super.key});

  @override
  State<CreateScreen> createState() => _CreateScreenState();
}

class _CreateScreenState extends State<CreateScreen>
    with TickerProviderStateMixin {
  late TabController _tabController;
  int _selectedCreationType = 0;
  
  final List<CreationType> _creationTypes = [
    CreationType(
      title: 'Photo',
      icon: Icons.camera_alt,
      description: 'Create stunning photos with AI enhancement',
      gradient: [AppTheme.primaryPurple, AppTheme.pinkAccent],
    ),
    CreationType(
      title: 'Video',
      icon: Icons.videocam,
      description: 'Record and edit videos with effects',
      gradient: [AppTheme.primaryBlue, AppTheme.blueAccent],
    ),
    CreationType(
      title: 'Audio',
      icon: Icons.mic,
      description: 'Record audio and create music',
      gradient: [AppTheme.orangeAccent, AppTheme.redAccent],
    ),
    CreationType(
      title: 'Text',
      icon: Icons.text_fields,
      description: 'Generate creative text content',
      gradient: [AppTheme.tealAccent, AppTheme.purpleAccent],
    ),
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
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
                      'Create',
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                        fontFamily: 'Orbitron',
                      ),
                    ),
                    const Spacer(),
                    GlassCard(
                      child: IconButton(
                        onPressed: () => _showTemplatesDialog(),
                        icon: const Icon(
                          Icons.dashboard_outlined,
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
                      Tab(text: 'Create New'),
                      Tab(text: 'My Projects'),
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
                    _buildCreateNewView(),
                    _buildMyProjectsView(),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCreateNewView() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: [
          // Creation type selector
          SizedBox(
            height: 120,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: _creationTypes.length,
              itemBuilder: (context, index) {
                final type = _creationTypes[index];
                final isSelected = _selectedCreationType == index;
                
                return GestureDetector(
                  onTap: () {
                    setState(() {
                      _selectedCreationType = index;
                    });
                  },
                  child: Container(
                    width: 100,
                    margin: const EdgeInsets.only(right: 12),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: isSelected 
                            ? type.gradient 
                            : [Colors.grey[800]!, Colors.grey[700]!],
                      ),
                      borderRadius: BorderRadius.circular(16),
                      border: isSelected 
                          ? Border.all(color: Colors.white, width: 2)
                          : null,
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          type.icon,
                          color: Colors.white,
                          size: 32,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          type.title,
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Selected type description
          GlassCard(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                Row(
                  children: [
                    Icon(
                      _creationTypes[_selectedCreationType].icon,
                      color: Colors.white,
                      size: 24,
                    ),
                    const SizedBox(width: 12),
                    Text(
                      _creationTypes[_selectedCreationType].title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  _creationTypes[_selectedCreationType].description,
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.8),
                    fontSize: 16,
                  ),
                ),
              ],
            ),
          ),
          ),
          
          const SizedBox(height: 24),
          
          // Creation tools
          Expanded(
            child: _buildCreationTools(),
          ),
          
          // Start creating button
          Container(
            width: double.infinity,
            height: 56,
            margin: const EdgeInsets.only(bottom: 16),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: _creationTypes[_selectedCreationType].gradient,
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: () => _startCreating(),
                borderRadius: BorderRadius.circular(16),
                child: const Center(
                  child: Text(
                    'Start Creating',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCreationTools() {
    switch (_selectedCreationType) {
      case 0: // Photo
        return _buildPhotoTools();
      case 1: // Video
        return _buildVideoTools();
      case 2: // Audio
        return _buildAudioTools();
      case 3: // Text
        return _buildTextTools();
      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buildPhotoTools() {
    return GridView.count(
      crossAxisCount: 2,
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      children: [
        _buildToolCard(
          'Camera',
          Icons.camera_alt,
          'Take a new photo',
          () => _openCamera(),
        ),
        _buildToolCard(
          'Gallery',
          Icons.photo_library,
          'Choose from gallery',
          () => _openGallery(),
        ),
        _buildToolCard(
          'AI Enhance',
          Icons.auto_fix_high,
          'Enhance with AI',
          () => _openAIEnhance(),
        ),
        _buildToolCard(
          'Filters',
          Icons.filter_vintage,
          'Apply filters',
          () => _openFilters(),
        ),
      ],
    );
  }

  Widget _buildVideoTools() {
    return GridView.count(
      crossAxisCount: 2,
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      children: [
        _buildToolCard(
          'Record',
          Icons.videocam,
          'Record new video',
          () => _recordVideo(),
        ),
        _buildToolCard(
          'Import',
          Icons.video_library,
          'Import video',
          () => _importVideo(),
        ),
        _buildToolCard(
          'Effects',
          Icons.movie_filter,
          'Add effects',
          () => _addEffects(),
        ),
        _buildToolCard(
          'Edit',
          Icons.edit,
          'Video editor',
          () => _openVideoEditor(),
        ),
      ],
    );
  }

  Widget _buildAudioTools() {
    return GridView.count(
      crossAxisCount: 2,
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      children: [
        _buildToolCard(
          'Record',
          Icons.mic,
          'Record audio',
          () => _recordAudio(),
        ),
        _buildToolCard(
          'Import',
          Icons.library_music,
          'Import audio',
          () => _importAudio(),
        ),
        _buildToolCard(
          'Generate',
          Icons.auto_awesome,
          'AI music generation',
          () => _generateMusic(),
        ),
        _buildToolCard(
          'Mix',
          Icons.tune,
          'Audio mixer',
          () => _openAudioMixer(),
        ),
      ],
    );
  }

  Widget _buildTextTools() {
    return GridView.count(
      crossAxisCount: 2,
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      children: [
        _buildToolCard(
          'Write',
          Icons.edit,
          'Write content',
          () => _writeContent(),
        ),
        _buildToolCard(
          'AI Generate',
          Icons.auto_awesome,
          'AI text generation',
          () => _generateText(),
        ),
        _buildToolCard(
          'Templates',
          Icons.article,
          'Use templates',
          () => _useTemplates(),
        ),
        _buildToolCard(
          'Styles',
          Icons.format_paint,
          'Text styles',
          () => _applyTextStyles(),
        ),
      ],
    );
  }

  Widget _buildToolCard(
    String title,
    IconData icon,
    String description,
    VoidCallback onTap,
  ) {
    return GlassCard(
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  icon,
                  color: Colors.white,
                  size: 32,
                ),
                const SizedBox(height: 8),
                Text(
                  title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.7),
                    fontSize: 12,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMyProjectsView() {
    return Consumer<AppStateProvider>(
      builder: (context, appState, child) {
        final projects = appState.recentProjects;
        
        if (projects.isEmpty) {
          return const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.folder_open,
                  color: Colors.white60,
                  size: 64,
                ),
                SizedBox(height: 16),
                Text(
                  'No projects yet',
                  style: TextStyle(
                    color: Colors.white60,
                    fontSize: 18,
                  ),
                ),
                SizedBox(height: 8),
                Text(
                  'Start creating to see your projects here',
                  style: TextStyle(
                    color: Colors.white54,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          );
        }
        
        return ListView.builder(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          itemCount: projects.length,
          itemBuilder: (context, index) {
            final project = projects[index];
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: GlassCard(
                child: ListTile(
                leading: const Icon(
                  Icons.folder,
                  color: Colors.white,
                ),
                title: Text(
                  project,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                subtitle: Text(
                  'Last modified: Today',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.6),
                  ),
                ),
                trailing: IconButton(
                  onPressed: () => _showProjectOptions(project),
                  icon: const Icon(
                    Icons.more_vert,
                    color: Colors.white,
                  ),
                ),
                onTap: () => _openProject(project),
              ),
                ),
            );
          },
        );
      },
    );
  }

  // Tool action methods
  void _startCreating() {
    final appState = Provider.of<AppStateProvider>(context, listen: false);
    final projectName = 'Project ${DateTime.now().millisecondsSinceEpoch}';
    appState.setCurrentProject(projectName);
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Started ${_creationTypes[_selectedCreationType].title.toLowerCase()} project'),
        backgroundColor: Colors.purple,
      ),
    );
  }

  void _showTemplatesDialog() {}
  void _openCamera() {}
  void _openGallery() {}
  void _openAIEnhance() {}
  void _openFilters() {}
  void _recordVideo() {}
  void _importVideo() {}
  void _addEffects() {}
  void _openVideoEditor() {}
  void _recordAudio() {}
  void _importAudio() {}
  void _generateMusic() {}
  void _openAudioMixer() {}
  void _writeContent() {}
  void _generateText() {}
  void _useTemplates() {}
  void _applyTextStyles() {}
  void _showProjectOptions(String project) {}
  void _openProject(String project) {}
}

class CreationType {
  final String title;
  final IconData icon;
  final String description;
  final List<Color> gradient;

  CreationType({
    required this.title,
    required this.icon,
    required this.description,
    required this.gradient,
  });
}