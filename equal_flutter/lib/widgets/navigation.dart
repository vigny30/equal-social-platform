import 'package:flutter/material.dart';
import 'dart:ui';
import '../theme/app_theme.dart';
class Navigation extends StatefulWidget {
  final int currentIndex;
  final Function(int) onTap;

  const Navigation({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  State<Navigation> createState() => _NavigationState();
}

class _NavigationState extends State<Navigation> {
  bool _showMobileMenu = false;

  final List<NavigationItem> _navItems = [
    NavigationItem(
      path: 0,
      label: 'Home',
      icon: Icons.home_outlined,
      activeIcon: Icons.home,
    ),
    NavigationItem(
      path: 1,
      label: 'For You',
      icon: Icons.shuffle_outlined,
      activeIcon: Icons.shuffle,
    ),
    NavigationItem(
      path: 2,
      label: 'Create',
      icon: Icons.add_circle_outline,
      activeIcon: Icons.add_circle,
    ),
    NavigationItem(
      path: 3,
      label: 'Live',
      icon: Icons.radio_outlined,
      activeIcon: Icons.radio,
    ),
    NavigationItem(
      path: 4,
      label: 'Music',
      icon: Icons.music_note_outlined,
      activeIcon: Icons.music_note,
    ),
    NavigationItem(
      path: 5,
      label: 'Profile',
      icon: Icons.person_outline,
      activeIcon: Icons.person,
    ),
    NavigationItem(
      path: 6,
      label: 'Challenge',
      icon: Icons.emoji_events_outlined,
      activeIcon: Icons.emoji_events,
    ),
  ];

  List<NavigationItem> get _bottomNavItems => _navItems.take(5).toList();
  List<NavigationItem> get _moreItems => _navItems.skip(5).toList();

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Desktop Navigation - Top Bar
        if (MediaQuery.of(context).size.width >= 768)
          _buildDesktopNavigation(),
        
        // Mobile Navigation - Bottom Tab Bar
        if (MediaQuery.of(context).size.width < 768)
          _buildMobileNavigation(),
        
        // Mobile More Menu Overlay
        if (_showMobileMenu && MediaQuery.of(context).size.width < 768)
          _buildMobileMenuOverlay(),
        
        // Mobile Top Bar - Logo Only
        if (MediaQuery.of(context).size.width < 768)
          _buildMobileTopBar(),
      ],
    );
  }

  Widget _buildDesktopNavigation() {
    return Positioned(
      top: 0,
      left: 0,
      right: 0,
      child: Container(
        height: 64,
        child: ClipRRect(
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: Container(
              decoration: BoxDecoration(
                color: Colors.black.withValues(alpha: 0.2),
                border: Border(
                  bottom: BorderSide(
                    color: Colors.white.withValues(alpha: 0.1),
                    width: 1,
                  ),
                ),
              ),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Logo
                    GestureDetector(
                      onTap: () => widget.onTap(0),
                      child: Text(
                        'EQUAL',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                          letterSpacing: 2,
                          fontFamily: 'Orbitron',
                        ),
                      ),
                    ),
              
                    // Navigation Items
                    Row(
                      children: _navItems.map((item) {
                  final isActive = widget.currentIndex == item.path;
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: Material(
                      color: Colors.transparent,
                      child: InkWell(
                        onTap: () => widget.onTap(item.path),
                        borderRadius: BorderRadius.circular(8),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 8,
                          ),
                          decoration: BoxDecoration(
                            color: isActive
                                ? Colors.white.withValues(alpha: 0.2)
                                : Colors.transparent,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                isActive ? item.activeIcon : item.icon,
                                color: isActive
                                    ? Colors.white
                                    : Colors.white.withValues(alpha: 0.8),
                                size: 16,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                item.label,
                                style: TextStyle(
                                  color: isActive
                                      ? Colors.white
                                      : Colors.white.withValues(alpha: 0.8),
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  );
                      }).toList(),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMobileNavigation() {
    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: Container(
        height: 80,
        margin: const EdgeInsets.all(16),
        child: Container(
          decoration: BoxDecoration(
            color: AppTheme.glassBackground,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppTheme.glassBorder, width: 1),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.1),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              ..._bottomNavItems.map((item) {
                final isActive = widget.currentIndex == item.path;
                return _buildMobileNavItem(item, isActive);
              }),
              // More Menu Button
              _buildMoreButton(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMobileNavItem(NavigationItem item, bool isActive) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => widget.onTap(item.path),
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                isActive ? item.activeIcon : item.icon,
                color: isActive
                    ? AppTheme.primaryPurple
                    : Colors.white.withValues(alpha: 0.7),
                size: item.path == 2 ? 28 : 24, // Larger Create button
              ),
              const SizedBox(height: 4),
              Text(
                item.label,
                style: TextStyle(
                  color: isActive
                      ? AppTheme.primaryPurple
                      : Colors.white.withValues(alpha: 0.7),
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMoreButton() {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => setState(() => _showMobileMenu = true),
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.menu,
                color: Colors.white.withValues(alpha: 0.7),
                size: 24,
              ),
              const SizedBox(height: 4),
              Text(
                'More',
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.7),
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMobileMenuOverlay() {
    return Positioned.fill(
      child: GestureDetector(
        onTap: () => setState(() => _showMobileMenu = false),
        child: Container(
          color: Colors.black.withValues(alpha: 0.8),
          child: Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              margin: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.black.withValues(alpha: 0.9),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(
                  color: Colors.white.withValues(alpha: 0.2),
                  width: 1,
                ),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Header
                  Padding(
                    padding: const EdgeInsets.all(24),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'More Options',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                            fontFamily: 'Orbitron',
                          ),
                        ),
                        IconButton(
                          onPressed: () => setState(() => _showMobileMenu = false),
                          icon: const Icon(
                            Icons.close,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                  ),
                  
                  // Menu Items
                  Padding(
                    padding: const EdgeInsets.only(left: 24, right: 24, bottom: 24),
                    child: Column(
                      children: _moreItems.map((item) {
                        final isActive = widget.currentIndex == item.path;
                        return Material(
                          color: Colors.transparent,
                          child: InkWell(
                            onTap: () {
                              widget.onTap(item.path);
                              setState(() => _showMobileMenu = false);
                            },
                            borderRadius: BorderRadius.circular(12),
                            child: Container(
                              width: double.infinity,
                              padding: const EdgeInsets.symmetric(
                                vertical: 16,
                                horizontal: 16,
                              ),
                              margin: const EdgeInsets.only(bottom: 8),
                              decoration: BoxDecoration(
                                color: isActive
                                    ? AppTheme.primaryPurple.withValues(alpha: 0.2)
                                    : Colors.transparent,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Row(
                                children: [
                                  Icon(
                                    isActive ? item.activeIcon : item.icon,
                                    color: isActive
                                        ? AppTheme.primaryPurple
                                        : Colors.white.withValues(alpha: 0.8),
                                    size: 20,
                                  ),
                                  const SizedBox(width: 16),
                                  Text(
                                    item.label,
                                    style: TextStyle(
                                      color: isActive
                                          ? AppTheme.primaryPurple
                                          : Colors.white.withValues(alpha: 0.8),
                                      fontSize: 16,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMobileTopBar() {
    return Positioned(
      top: 0,
      left: 0,
      right: 0,
      child: Container(
        height: 56,
        child: ClipRRect(
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: Container(
              decoration: BoxDecoration(
                color: Colors.black.withValues(alpha: 0.2),
              ),
              child: Center(
                child: GestureDetector(
                  onTap: () => widget.onTap(0),
                  child: Text(
                    'EQUAL',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                      letterSpacing: 2,
                      fontFamily: 'Orbitron',
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class NavigationItem {
  final int path;
  final String label;
  final IconData icon;
  final IconData activeIcon;

  NavigationItem({
    required this.path,
    required this.label,
    required this.icon,
    required this.activeIcon,
  });
}