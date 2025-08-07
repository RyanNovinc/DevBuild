# React Native IAP Installation

## Install the dependency
```bash
npm install react-native-iap
```

## iOS Setup (if not auto-linked)
```bash
cd ios && pod install
```

## Android Setup
Add to `android/app/build.gradle`:
```gradle
dependencies {
    implementation 'com.android.billingclient:billing:4.0.0'
}
```

## Usage in Community Screen
The receipt validation is already implemented in the community screen using:
```javascript
const RNIap = require('react-native-iap');
const receiptData = await RNIap.getReceiptIOS();
```

This package is required for production receipt validation to work properly.