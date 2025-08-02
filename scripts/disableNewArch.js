module.exports = function(config) {
  console.log('Ensuring New Architecture is disabled...');
  process.env.RCT_NEW_ARCH_ENABLED = '0';
  process.env.EXPO_USE_HERMES = '0';
  return config;
};
