const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Check if sharp is available, if not, provide instructions
try {
  require('sharp');
} catch (error) {
  console.log('Sharp is not installed. Installing sharp...');
  try {
    execSync('npm install sharp', { stdio: 'inherit' });
  } catch (installError) {
    console.error('Failed to install sharp. Please run: npm install sharp');
    process.exit(1);
  }
}

const sharp = require('sharp');

// Android app icon sizes
const iconSizes = {
  'mipmap-ldpi': 36,
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192
};

async function generateAppIcons() {
  const publicDir = path.join(__dirname, 'public');
  const androidResDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');
  
  // Read the app icon SVG
  const iconSvgPath = path.join(publicDir, 'app-icon.svg');
  
  if (!fs.existsSync(iconSvgPath)) {
    console.error('❌ app-icon.svg not found in public directory');
    process.exit(1);
  }
  
  const iconSvg = fs.readFileSync(iconSvgPath);
  
  console.log('Generating app icons with your Equal logo...');
  
  for (const [density, size] of Object.entries(iconSizes)) {
    // Create directory if it doesn't exist
    const densityDir = path.join(androidResDir, density);
    if (!fs.existsSync(densityDir)) {
      fs.mkdirSync(densityDir, { recursive: true });
    }
    
    // Generate PNG icons
    const iconPath = path.join(densityDir, 'ic_launcher.png');
    const iconForegroundPath = path.join(densityDir, 'ic_launcher_foreground.png');
    
    try {
      // Generate main icon
      await sharp(iconSvg)
        .resize(size, size)
        .png()
        .toFile(iconPath);
      
      // Generate foreground icon (same as main for now)
      await sharp(iconSvg)
        .resize(size, size)
        .png()
        .toFile(iconForegroundPath);
      
      console.log(`✓ Generated ${density}/ic_launcher.png (${size}x${size})`);
      console.log(`✓ Generated ${density}/ic_launcher_foreground.png (${size}x${size})`);
    } catch (error) {
      console.error(`✗ Failed to generate ${density} icons:`, error.message);
    }
  }
  
  console.log('\nApp icons with your Equal logo generated successfully!');
  console.log('Run "npx cap sync android" to update your Android project.');
}

// Run the generator
generateAppIcons().catch(console.error);