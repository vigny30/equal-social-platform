import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../providers/auth_provider.dart';
import '../theme/app_theme.dart';
import '../widgets/auth_modal.dart';
import '../widgets/glass_card.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen>
    with TickerProviderStateMixin {
  late AnimationController _logoController;
  late AnimationController _floatController;
  late Animation<double> _logoRotation;
  late Animation<double> _logoFloat;

  @override
  void initState() {
    super.initState();
    _logoController = AnimationController(
      duration: const Duration(seconds: 8),
      vsync: this,
    )..repeat();
    
    _floatController = AnimationController(
      duration: const Duration(seconds: 3),
      vsync: this,
    )..repeat(reverse: true);
    
    _logoRotation = Tween<double>(
      begin: 0,
      end: 1,
    ).animate(CurvedAnimation(
      parent: _logoController,
      curve: Curves.linear,
    ));
    
    _logoFloat = Tween<double>(
      begin: -10,
      end: 10,
    ).animate(CurvedAnimation(
      parent: _floatController,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _logoController.dispose();
    _floatController.dispose();
    super.dispose();
  }

  void _showAuthModal() {
    showDialog(
      context: context,
      barrierDismissible: true,
      barrierColor: Colors.black.withValues(alpha: 0.8),
      builder: (context) => const AuthModal(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: AppTheme.backgroundGradient,
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
            child: Column(
              children: [
                // Header with auth
                _buildHeader(),
                
                // Main content area
                Expanded(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // 3D Logo section
                      _build3DLogo(),
                      const SizedBox(height: 60),
                      
                      // EQUAL title
                      _buildTitle(),
                      const SizedBox(height: 40),
                      
                      // Navigation buttons
                      _buildNavigationButtons(),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        // Logo text (smaller)
        Text(
          'EQUAL',
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w700,
            color: Colors.white,
            fontFamily: 'Orbitron',
          ),
        ).animate().fadeIn(duration: 600.ms).slideX(begin: -0.3),
        
        // Auth section
        Consumer<AuthProvider>(
          builder: (context, authProvider, child) {
            if (authProvider.isAuthenticated) {
              return GestureDetector(
                onTap: () => authProvider.signOut(),
                child: GlassCard(
                  padding: const EdgeInsets.all(12),
                  borderRadius: 12,
                  enableHoverEffects: true,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const CircleAvatar(
                        radius: 16,
                        backgroundColor: Colors.white24,
                        child: Icon(Icons.person, color: Colors.white, size: 18),
                      ),
                      const SizedBox(width: 8),
                      const Icon(Icons.logout, color: Colors.white70, size: 18),
                    ],
                  ),
                ),
              );
            }
            return GlassCard(
              onTap: _showAuthModal,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              borderRadius: 25,
              enableHoverEffects: true,
              enableGlow: true,
              child: Text(
                'Sign In',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
              ),
            );
          },
        ).animate().fadeIn(duration: 600.ms, delay: 200.ms).slideX(begin: 0.3),
      ],
    );
  }

  Widget _build3DLogo() {
    return AnimatedBuilder(
      animation: Listenable.merge([_logoRotation, _logoFloat]),
      builder: (context, child) {
        return Transform.translate(
          offset: Offset(0, _logoFloat.value),
          child: Transform(
            alignment: Alignment.center,
            transform: Matrix4.identity()
              ..setEntry(3, 2, 0.001)
              ..rotateY(_logoRotation.value * 2 * 3.14159)
              ..rotateX(0.2),
            child: Container(
              width: 200,
              height: 200,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(20),
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    AppTheme.primaryPurple.withValues(alpha: 0.8),
                    AppTheme.primaryBlue.withValues(alpha: 0.6),
                    AppTheme.accentCyan.withValues(alpha: 0.4),
                  ],
                ),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.primaryPurple.withValues(alpha: 0.5),
                    blurRadius: 40,
                    spreadRadius: 5,
                  ),
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.3),
                    blurRadius: 20,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: Center(
                child: Text(
                  'E',
                  style: TextStyle(
                    fontSize: 120,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                    fontFamily: 'Orbitron',
                    shadows: [
                      Shadow(
                        color: Colors.black.withValues(alpha: 0.5),
                        blurRadius: 10,
                        offset: const Offset(2, 2),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        );
      },
    ).animate().fadeIn(duration: 800.ms, delay: 400.ms).scale(begin: const Offset(0.5, 0.5));
  }

  Widget _buildTitle() {
    return Column(
      children: [
        Text(
          'EQUAL',
          style: TextStyle(
            fontSize: 48,
            fontWeight: FontWeight.w900,
            color: Colors.white,
            fontFamily: 'Orbitron',
            letterSpacing: 8,
            shadows: [
              Shadow(
                color: AppTheme.primaryPurple.withValues(alpha: 0.8),
                blurRadius: 20,
              ),
            ],
          ),
        ).animate().fadeIn(duration: 800.ms, delay: 600.ms).slideY(begin: 0.3),
        const SizedBox(height: 8),
        Text(
          'Create • Remix • Explore',
          style: TextStyle(
            fontSize: 16,
            color: Colors.white70,
            fontWeight: FontWeight.w400,
            letterSpacing: 2,
          ),
        ).animate().fadeIn(duration: 800.ms, delay: 800.ms).slideY(begin: 0.3),
      ],
    );
  }

  Widget _buildNavigationButtons() {
    final buttons = [
      {'label': 'Create', 'icon': Icons.add_circle_outline, 'delay': 0},
      {'label': 'Remix', 'icon': Icons.shuffle_outlined, 'delay': 100},
      {'label': 'Explore', 'icon': Icons.explore_outlined, 'delay': 200},
    ];

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: buttons.map((button) {
        return GlassCard(
          width: 100,
          height: 120,
          enableHoverEffects: true,
          enableGlow: false,
          onTap: () {
            // Navigate to respective screen
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('${button['label']} coming soon!'),
                backgroundColor: AppTheme.primaryPurple,
              ),
            );
          },
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                button['icon'] as IconData,
                color: Colors.white,
                size: 32,
              ),
              const SizedBox(height: 12),
              Text(
                button['label'] as String,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ).animate()
          .fadeIn(duration: 600.ms, delay: Duration(milliseconds: 1000 + (button['delay'] as int)))
          .slideY(begin: 0.5)
          .scale(begin: const Offset(0.8, 0.8));
      }).toList(),
    );
  }


}