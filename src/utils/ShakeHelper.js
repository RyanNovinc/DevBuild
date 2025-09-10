import { Platform } from 'react-native';
import Toast from 'react-native-toast-message';

export const showShakeFeedbackHint = () => {
  // Only show on physical devices where shake works
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    Toast.show({
      type: 'info',
      text1: '💡 Tip: Shake for quick feedback!',
      text2: 'Shake your device anytime to report issues',
      position: 'bottom',
      visibilityTime: 3000,
      autoHide: true,
      props: {
        style: {
          marginBottom: 100, // Show above tab bar
        }
      }
    });
  }
};

export const showShakeFeedbackActivated = () => {
  Toast.show({
    type: 'success',
    text1: '📝 Opening Feedback...',
    text2: 'Thanks for helping us improve!',
    position: 'bottom',
    visibilityTime: 2000,
    autoHide: true,
  });
};