import { Platform } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { showShakeFeedbackActivated } from '../utils/ShakeHelper';

class ShakeService {
  constructor() {
    this.isListening = false;
    this.navigationRef = null;
    this.subscription = null;
    this.lastShakeTime = 0;
    this.shakeThreshold = 15; // Sensitivity threshold
    this.shakeSlop = 500; // Time between shakes in ms
  }

  initialize(navigationRef) {
    this.navigationRef = navigationRef;
    this.startListening();
  }

  startListening() {
    if (this.isListening) return;

    try {
      // Only enable on physical devices (shake doesn't work well in simulators)
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        // Set update interval to 100ms for responsive shake detection
        Accelerometer.setUpdateInterval(100);
        
        this.subscription = Accelerometer.addListener(accelerometerData => {
          this.detectShake(accelerometerData);
        });
        
        this.isListening = true;
        console.log('🤳 Shake-to-feedback enabled (using accelerometer)');
      }
    } catch (error) {
      console.error('Error setting up shake detection:', error);
    }
  }

  stopListening() {
    if (!this.isListening) return;

    try {
      if (this.subscription) {
        this.subscription.remove();
        this.subscription = null;
      }
      this.isListening = false;
      console.log('🤳 Shake detection disabled');
    } catch (error) {
      console.error('Error removing shake detection:', error);
    }
  }

  detectShake({ x, y, z }) {
    const now = Date.now();
    
    // Calculate total acceleration (magnitude of vector)
    const acceleration = Math.sqrt(x * x + y * y + z * z);
    
    // Remove gravity (approximately 9.8)
    const deltaAcceleration = acceleration - 9.8;
    
    // Check if acceleration exceeds threshold and enough time has passed
    if (Math.abs(deltaAcceleration) > this.shakeThreshold) {
      if (now - this.lastShakeTime > this.shakeSlop) {
        this.lastShakeTime = now;
        this.handleShake();
      }
    }
  }

  handleShake() {
    console.log('🤳 Device shaken - opening feedback screen');
    
    // Show toast notification
    showShakeFeedbackActivated();
    
    if (this.navigationRef && this.navigationRef.current) {
      try {
        // Navigate to FeedbackScreen (it's registered at root level in App.js)
        this.navigationRef.current.navigate('FeedbackScreen');
      } catch (error) {
        console.error('Error navigating to feedback screen:', error);
      }
    } else {
      console.warn('Navigation ref not available for shake-to-feedback');
    }
  }

  cleanup() {
    this.stopListening();
    this.navigationRef = null;
  }
}

// Export singleton instance
const shakeService = new ShakeService();
export default shakeService;