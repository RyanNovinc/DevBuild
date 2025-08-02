module.exports = {
  name: "LifeCompass",
  slug: "lifecompass",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  splash: {
    backgroundColor: "#4CAF50"
  },
  assetBundlePatterns: [
    "*/*"
  ],
  ios: {
    supportsTablet: true,
    infoPlist: {
      UIBackgroundModes: [
        "remote-notification"
      ]
    },
    bundleIdentifier: "com.lifecompass.app",
    jsEngine: "jsc",
    // Add extra configuration to handle privacy manifest conflicts
    buildSettings: {
      GENERATE_PRIVACY_MANIFEST: "NO"
    }
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#4CAF50"
    },
    permissions: [
      "RECEIVE_BOOT_COMPLETED",
      "VIBRATE"
    ],
    package: "com.lifecompass.app",
    jsEngine: "jsc"
  },
  web: {},
  plugins: [
    [
      "expo-notifications",
      {
        "color": "#4CAF50",
        "mode": "production"
      }
    ]
  ],
  sdkVersion: "53.0.0",
  jsEngine: "jsc",
  extra: {
    eas: {
      projectId: "8ca9bf3c-0bc3-4c72-9620-9231e63acdba"
    }
  },
  owner: "ryan_novinc",
  newArchEnabled: false
};
