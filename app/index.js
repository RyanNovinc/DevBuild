import { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

// Keep the splash screen visible while we load resources
SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore error */
});

export default function Home() {
  const [bgColor, setBgColor] = useState('#ffffff');
  const [sound, setSound] = useState();
  const [message, setMessage] = useState('Touch the screen to test your app');
  const [isLoaded, setIsLoaded] = useState(false);
  const [allWorking, setAllWorking] = useState(false);

  useEffect(() => {
    // Hide splash screen after a small delay
    const timer = setTimeout(async () => {
      try {
        await SplashScreen.hideAsync();
        setIsLoaded(true);
      } catch (e) {
        console.log("Error hiding splash screen:", e);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle background color change on press
  const changeBackgroundColor = async () => {
    // Generate random color
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
    setBgColor(randomColor);
    
    // Trigger haptic feedback
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.log('Haptics not available:', error);
    }
    
    // Play sound
    const soundPlayed = await playSound();
    
    // Update message and status
    setAllWorking(true);
    setMessage('Your app is working! You can proceed with the next steps.');
  };

  // Sound playback function
  async function playSound() {
    try {
      // Unload the previous sound if it exists
      if (sound) {
        await sound.unloadAsync();
      }
      
      // Create and play the sound from the correct path
      const { sound: newSound } = await Audio.Sound.createAsync(
        require('../assets/sounds/Click.mp3')
      );
      setSound(newSound);
      
      await newSound.playAsync();
      return true;
    } catch (error) {
      console.log('Error playing sound:', error);
      return false;
    }
  }

  // Clean up the sound when the component unmounts
  useEffect(() => {
    return sound ? () => {
      sound.unloadAsync();
    } : undefined;
  }, [sound]);

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: bgColor }]}
      onPress={changeBackgroundColor}
      activeOpacity={0.8}
    >
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.content}>
        <Text style={styles.title}>
          App Test Screen
        </Text>
        
        <View style={[styles.animationPlaceholder, allWorking ? styles.success : styles.waiting]}>
          <Text style={styles.checkmark}>{allWorking ? '✓' : '?'}</Text>
        </View>
        
        <Text style={styles.message}>
          {message}
        </Text>
        
        <Text style={styles.instruction}>
          If the background changes color, you hear a sound, and feel haptic feedback when tapping the screen, your app is working correctly.
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  animationPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waiting: {
    backgroundColor: '#FFA726',
  },
  success: {
    backgroundColor: '#4CAF50',
  },
  checkmark: {
    fontSize: 80,
    color: 'white',
  },
  message: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  instruction: {
    fontSize: 16,
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
    lineHeight: 24,
  },
});