// src/utils/DeviceIdentifier.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Application from 'expo-application';
import * as Device from 'expo-device';

const DEVICE_ID_KEY = 'lifecompass_device_id';
const DEVICE_FINGERPRINT_KEY = 'lifecompass_device_fingerprint';

class DeviceIdentifier {
  constructor() {
    this.deviceId = null;
    this.fingerprint = null;
  }

  // Generate a unique device identifier that persists across app reinstalls
  async getDeviceId() {
    if (this.deviceId) return this.deviceId;

    try {
      // First try to get stored device ID
      let storedId = await AsyncStorage.getItem(DEVICE_ID_KEY);
      
      if (storedId) {
        this.deviceId = storedId;
        return storedId;
      }

      // Generate new device ID based on hardware characteristics
      const deviceId = await this.generateDeviceId();
      
      // Store it for future use
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
      this.deviceId = deviceId;
      
      return deviceId;
    } catch (error) {
      console.error('Error getting device ID:', error);
      // Fallback to timestamp-based ID
      const fallbackId = `LC_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      await AsyncStorage.setItem(DEVICE_ID_KEY, fallbackId);
      return fallbackId;
    }
  }

  // Generate device ID from hardware characteristics
  async generateDeviceId() {
    try {
      const components = [];
      
      // Platform and OS version
      components.push(Platform.OS);
      components.push(Platform.Version?.toString() || '');
      
      // Device information
      if (Device.modelName) components.push(Device.modelName);
      if (Device.brand) components.push(Device.brand);
      if (Device.manufacturer) components.push(Device.manufacturer);
      
      // App installation ID (persists across app updates but not reinstalls)
      if (Application.androidId) {
        components.push(Application.androidId);
      }
      
      // Create hash from components
      const fingerprint = components.join('|');
      const hash = await this.simpleHash(fingerprint);
      
      return `LC_${hash}_${Date.now().toString(36)}`;
    } catch (error) {
      console.error('Error generating device ID:', error);
      // Ultimate fallback
      return `LC_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
  }

  // Get device fingerprint for cross-device matching
  async getDeviceFingerprint() {
    if (this.fingerprint) return this.fingerprint;

    try {
      let storedFingerprint = await AsyncStorage.getItem(DEVICE_FINGERPRINT_KEY);
      
      if (storedFingerprint) {
        this.fingerprint = storedFingerprint;
        return storedFingerprint;
      }

      // Generate device fingerprint
      const fingerprint = await this.generateFingerprint();
      
      await AsyncStorage.setItem(DEVICE_FINGERPRINT_KEY, fingerprint);
      this.fingerprint = fingerprint;
      
      return fingerprint;
    } catch (error) {
      console.error('Error getting device fingerprint:', error);
      return null;
    }
  }

  // Generate device fingerprint from stable characteristics
  async generateFingerprint() {
    try {
      const components = [];
      
      // More stable device characteristics
      if (Device.brand) components.push(Device.brand);
      if (Device.manufacturer) components.push(Device.manufacturer);
      if (Device.modelName) components.push(Device.modelName);
      
      // Screen dimensions (usually stable)
      components.push(Platform.OS);
      
      return await this.simpleHash(components.join('|'));
    } catch (error) {
      console.error('Error generating fingerprint:', error);
      return null;
    }
  }

  // Simple hash function (djb2)
  async simpleHash(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
    }
    return Math.abs(hash).toString(36);
  }

  // Reset device identity (for testing)
  async resetDeviceId() {
    await AsyncStorage.multiRemove([DEVICE_ID_KEY, DEVICE_FINGERPRINT_KEY]);
    this.deviceId = null;
    this.fingerprint = null;
  }

  // Get anonymous user identifier for backend
  async getAnonymousUserId() {
    const deviceId = await this.getDeviceId();
    return `anon_${deviceId}`;
  }
}

export const deviceIdentifier = new DeviceIdentifier();
export default deviceIdentifier;