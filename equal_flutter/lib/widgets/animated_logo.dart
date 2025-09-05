import 'package:flutter/material.dart';
import 'dart:math' as math;

class AnimatedLogo extends StatefulWidget {
  const AnimatedLogo({super.key});

  @override
  State<AnimatedLogo> createState() => _AnimatedLogoState();
}

class _AnimatedLogoState extends State<AnimatedLogo>
    with TickerProviderStateMixin {
  late AnimationController _rotationController;
  late AnimationController _pulseController;
  late Animation<double> _rotationAnimation;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    
    _rotationController = AnimationController(
      duration: const Duration(seconds: 20),
      vsync: this,
    )..repeat();
    
    _pulseController = AnimationController(
      duration: const Duration(seconds: 3),
      vsync: this,
    )..repeat(reverse: true);

    _rotationAnimation = Tween<double>(
      begin: 0,
      end: 2 * math.pi,
    ).animate(CurvedAnimation(
      parent: _rotationController,
      curve: Curves.linear,
    ));

    _pulseAnimation = Tween<double>(
      begin: 0.8,
      end: 1.2,
    ).animate(CurvedAnimation(
      parent: _pulseController,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _rotationController.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 200,
      height: 200,
      child: AnimatedBuilder(
        animation: Listenable.merge([_rotationAnimation, _pulseAnimation]),
        builder: (context, child) {
          return Transform.scale(
            scale: _pulseAnimation.value,
            child: Transform(
              alignment: Alignment.center,
              transform: Matrix4.identity()
                ..setEntry(3, 2, 0.001)
                ..rotateY(_rotationAnimation.value * 0.3)
                ..rotateX(math.sin(_rotationAnimation.value) * 0.1),
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(20),
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      Colors.purple.withOpacity(0.8),
                      Colors.blue.withOpacity(0.8),
                      Colors.pink.withOpacity(0.8),
                    ],
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.purple.withOpacity(0.5),
                      blurRadius: 30,
                      spreadRadius: 5,
                    ),
                    BoxShadow(
                      color: Colors.blue.withOpacity(0.3),
                      blurRadius: 50,
                      spreadRadius: 10,
                    ),
                  ],
                ),
                child: CustomPaint(
                  painter: LogoPainter(
                    rotationValue: _rotationAnimation.value,
                    pulseValue: _pulseAnimation.value,
                  ),
                  size: const Size(200, 200),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

class LogoPainter extends CustomPainter {
  final double rotationValue;
  final double pulseValue;

  LogoPainter({
    required this.rotationValue,
    required this.pulseValue,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill
      ..strokeWidth = 4;

    final strokePaint = Paint()
      ..color = Colors.white.withOpacity(0.3)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;

    final center = Offset(size.width / 2, size.height / 2);
    final letterSize = size.width * 0.6;
    
    // Draw the letter 'E' with 3D effect
    _drawLetter3D(canvas, center, letterSize, paint, strokePaint);
    
    // Add glowing particles
    _drawParticles(canvas, center, letterSize);
  }

  void _drawLetter3D(Canvas canvas, Offset center, double size, Paint paint, Paint strokePaint) {
    final path = Path();
    final strokeWidth = size * 0.12;
    final letterHeight = size * 0.8;
    final letterWidth = size * 0.6;
    
    final startX = center.dx - letterWidth / 2;
    final startY = center.dy - letterHeight / 2;
    
    // Main vertical line
    path.addRect(Rect.fromLTWH(
      startX,
      startY,
      strokeWidth,
      letterHeight,
    ));
    
    // Top horizontal line
    path.addRect(Rect.fromLTWH(
      startX,
      startY,
      letterWidth,
      strokeWidth,
    ));
    
    // Middle horizontal line
    path.addRect(Rect.fromLTWH(
      startX,
      startY + letterHeight / 2 - strokeWidth / 2,
      letterWidth * 0.8,
      strokeWidth,
    ));
    
    // Bottom horizontal line
    path.addRect(Rect.fromLTWH(
      startX,
      startY + letterHeight - strokeWidth,
      letterWidth,
      strokeWidth,
    ));
    
    // Draw main letter
    canvas.drawPath(path, paint);
    
    // Draw 3D depth effect
    final depthOffset = 6.0 * pulseValue;
    canvas.save();
    canvas.translate(depthOffset, depthOffset);
    canvas.drawPath(path, strokePaint);
    canvas.restore();
  }

  void _drawParticles(Canvas canvas, Offset center, double size) {
    final particlePaint = Paint()
      ..style = PaintingStyle.fill;
    
    for (int i = 0; i < 12; i++) {
      final angle = (i / 12) * 2 * math.pi + rotationValue;
      final radius = size * 0.6 + math.sin(rotationValue * 2 + i) * 20;
      final particleSize = 3 + math.sin(rotationValue * 3 + i) * 2;
      
      final x = center.dx + math.cos(angle) * radius;
      final y = center.dy + math.sin(angle) * radius;
      
      final opacity = (math.sin(rotationValue * 2 + i) + 1) / 2;
      particlePaint.color = Colors.white.withOpacity(opacity * 0.8);
      
      canvas.drawCircle(
        Offset(x, y),
        particleSize,
        particlePaint,
      );
    }
  }

  @override
  bool shouldRepaint(LogoPainter oldDelegate) {
    return oldDelegate.rotationValue != rotationValue ||
           oldDelegate.pulseValue != pulseValue;
  }
}