import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'providers/auth_provider.dart';
import 'providers/app_state_provider.dart';
import 'theme/app_theme.dart';
import 'widgets/navigation.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  await Supabase.initialize(
    url: 'https://your-project-url.supabase.co',
    anonKey: 'your-anon-key',
  );
  
  runApp(const EqualApp());
}

class EqualApp extends StatelessWidget {
  const EqualApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => AppStateProvider()),
      ],
      child: MaterialApp(
        title: 'Equal',
        theme: AppTheme.darkTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: ThemeMode.dark,
        home: Navigation(
          currentIndex: 0,
          onTap: (index) {
            // Handle navigation
          },
        ),
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}
