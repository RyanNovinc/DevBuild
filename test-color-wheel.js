// Quick test to verify color wheel functionality
const CustomThemeService = require('./src/services/CustomThemeService').default;

async function testColorWheel() {
  console.log('Testing Custom Theme Service...');
  
  try {
    // Test saving a custom theme
    const saveResult = await CustomThemeService.saveCustomTheme('Test Theme', '#ff5733');
    console.log('Save result:', saveResult);
    
    // Test getting custom themes
    const themes = await CustomThemeService.getCustomThemes();
    console.log('Custom themes:', themes);
    
    // Test getting stats
    const stats = await CustomThemeService.getThemeStats();
    console.log('Theme stats:', stats);
    
    console.log('✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  testColorWheel();
}

module.exports = { testColorWheel };