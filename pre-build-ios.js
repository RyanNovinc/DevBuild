// pre-build-ios.js
// Run this before building on MacInCloud
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📱 Running pre-build iOS preparation...');

// Check if we have the ios directory
if (!fs.existsSync('ios')) {
  console.error('❌ No iOS directory found. Make sure you have ejected from Expo or run "npx expo prebuild".');
  process.exit(1);
}

// Path to Podfile
const podfilePath = path.join(__dirname, 'ios', 'Podfile');

if (!fs.existsSync(podfilePath)) {
  console.error('❌ No Podfile found in ios directory.');
  process.exit(1);
}

// Read Podfile content
let podfileContent = fs.readFileSync(podfilePath, 'utf8');

// Check if our custom fix is already included
if (!podfileContent.includes('fix_privacy_manifests')) {
  console.log('✅ Adding privacy manifest fix to Podfile...');
  
  // Add require for our custom ruby file
  if (!podfileContent.includes("require_relative '../ios-privacy-fix.rb'")) {
    podfileContent = "require_relative '../ios-privacy-fix.rb'\n" + podfileContent;
  }
  
  // Find post_install block
  const postInstallRegex = /post_install\s+do\s+\|installer\|/;
  
  if (postInstallRegex.test(podfileContent)) {
    // Add our fix to existing post_install block
    podfileContent = podfileContent.replace(
      postInstallRegex,
      'post_install do |installer|\n  fix_privacy_manifests(installer)'
    );
  } else {
    // Add new post_install block at the end
    podfileContent += `\npost_install do |installer|
  fix_privacy_manifests(installer)
  react_native_post_install(installer, config[:reactNativePath], :mac_catalyst_enabled => false)
end\n`;
  }
  
  // Write updated Podfile
  fs.writeFileSync(podfilePath, podfileContent);
  console.log('✅ Podfile updated successfully');
}

// Create a basic PrivacyInfo.xcprivacy file if it doesn't exist
const privacyInfoPath = path.join(__dirname, 'ios', 'PrivacyInfo.xcprivacy');
if (!fs.existsSync(privacyInfoPath)) {
  console.log('✅ Creating basic PrivacyInfo.xcprivacy file...');
  
  const basicPrivacyInfo = `{
    "NSPrivacyAccessedAPITypes": [
        {
            "NSPrivacyAccessedAPIType": "NSFileTimestampsAccessedAPI",
            "NSPrivacyAccessedAPITypeReasons": ["C617.1"]
        },
        {
            "NSPrivacyAccessedAPIType": "NSUserDefaultsAccessedAPI",
            "NSPrivacyAccessedAPITypeReasons": ["CA92.1"]
        },
        {
            "NSPrivacyAccessedAPIType": "NSSystemBootTimeAccessedAPI",
            "NSPrivacyAccessedAPITypeReasons": ["35F9.1"]
        },
        {
            "NSPrivacyAccessedAPIType": "NSFileSystemFreeSpaceAccessedAPI",
            "NSPrivacyAccessedAPITypeReasons": ["E174.1"]
        }
    ]
}`;
  
  fs.writeFileSync(privacyInfoPath, basicPrivacyInfo);
  console.log('✅ Created basic PrivacyInfo.xcprivacy file');
}

// List known problematic libraries for privacy manifest issues
const problematicLibraries = [
  '@react-native-async-storage/async-storage',
  'react-native-sentry',
  'react-native-maps',
  'react-native-simple-toast',
  'react-native-keyboard-manager'
];

// Find which problematic libraries are installed
const installedProblematic = [];
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  problematicLibraries.forEach(lib => {
    if (dependencies[lib]) {
      installedProblematic.push(lib);
    }
  });
} catch (error) {
  console.warn('⚠️ Could not check for problematic libraries:', error.message);
}

// Update problematic dependencies if found
if (installedProblematic.length > 0) {
  console.log(`✅ Updating known problematic libraries: ${installedProblematic.join(', ')}...`);
  try {
    execSync(`npm update ${installedProblematic.join(' ')}`, { stdio: 'inherit' });
    console.log('✅ Dependencies updated successfully');
  } catch (error) {
    console.warn('⚠️ Some dependencies could not be updated:', error.message);
  }
} else {
  console.log('✅ No known problematic libraries found');
}

// Additional step to look for any PrivacyInfo.xcprivacy files in node_modules
console.log('🔍 Scanning for PrivacyInfo.xcprivacy files in node_modules...');
try {
  const findCommand = process.platform === 'win32' 
    ? 'dir /s /b node_modules\\*PrivacyInfo.xcprivacy'
    : 'find node_modules -name "PrivacyInfo.xcprivacy" -type f';
    
  const foundFiles = execSync(findCommand, { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  
  if (foundFiles.length > 0) {
    console.log(`⚠️ Found ${foundFiles.length} PrivacyInfo.xcprivacy files in node_modules:`);
    foundFiles.forEach(file => console.log(`  - ${file}`));
    console.log('These files might cause conflicts, but our fix should handle them.');
  } else {
    console.log('✅ No PrivacyInfo.xcprivacy files found in node_modules');
  }
} catch (error) {
  console.warn('⚠️ Could not scan for PrivacyInfo.xcprivacy files:', error.message);
}

console.log('🎉 Pre-build preparation complete! Your project should now handle privacy manifest conflicts.');