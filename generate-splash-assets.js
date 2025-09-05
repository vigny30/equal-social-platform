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

// Android splash screen densities and sizes
const splashSizes = {
  'drawable-land-ldpi': { width: 320, height: 240 },
  'drawable-land-mdpi': { width: 480, height: 320 },
  'drawable-land-hdpi': { width: 800, height: 480 },
  'drawable-land-xhdpi': { width: 1280, height: 720 },
  'drawable-land-xxhdpi': { width: 1600, height: 960 },
  'drawable-land-xxxhdpi': { width: 1920, height: 1280 },
  'drawable-port-ldpi': { width: 240, height: 320 },
  'drawable-port-mdpi': { width: 320, height: 480 },
  'drawable-port-hdpi': { width: 480, height: 800 },
  'drawable-port-xhdpi': { width: 720, height: 1280 },
  'drawable-port-xxhdpi': { width: 960, height: 1600 },
  'drawable-port-xxxhdpi': { width: 1280, height: 1920 }
};

async function generateSplashScreens() {
  const publicDir = path.join(__dirname, 'public');
  const androidResDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');
  
  // Read SVG files
  const portraitSvg = fs.readFileSync(path.join(publicDir, 'splash-screen.svg'));
  const landscapeSvg = fs.readFileSync(path.join(publicDir, 'splash-screen-landscape.svg'));
  
  console.log('Generating splash screen assets with your Equal logo...');
  
  for (const [density, size] of Object.entries(splashSizes)) {
    const isLandscape = density.includes('land');
    const svgBuffer = isLandscape ? landscapeSvg : portraitSvg;
    
    // Create directory if it doesn't exist
    const densityDir = path.join(androidResDir, density);
    if (!fs.existsSync(densityDir)) {
      fs.mkdirSync(densityDir, { recursive: true });
    }
    
    // Generate PNG
    const outputPath = path.join(densityDir, 'splash.png');
    
    try {
      await sharp(svgBuffer)
        .resize(size.width, size.height)
        .png()
        .toFile(outputPath);
      
      console.log(`✓ Generated ${density}/splash.png (${size.width}x${size.height})`);
    } catch (error) {
      console.error(`✗ Failed to generate ${density}/splash.png:`, error.message);
    }
  }
  
  console.log('\nSplash screen assets with your Equal logo generated successfully!');
  console.log('Run "npx cap sync android" to update your Android project.');
}

// Run the generator
generateSplashScreens().catch(console.error);