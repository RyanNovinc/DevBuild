// src/components/TimeBlockModalWrapper.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Text,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useTheme } from '../context/ThemeContext';
import TimeBlockForm from '../screens/TimeBlockScreen/TimeBlockForm';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TimeBlockModalWrapper = ({
  visible,
  onClose,
  onSave,
  timeBlockData = null,
  initialData = {}
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  
  // Animation values
  const backgroundOpacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  
  // Handle modal animation
  useEffect(() => {
    if (visible) {
      backgroundOpacityAnim.setValue(0);
      slideAnim.setValue(Dimensions.get('window').height);
      translateY.setValue(0);
      
      Animated.sequence([
        Animated.timing(backgroundOpacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);
  
  // Handle close with animation
  const handleClose = () => {
    const screenHeight = Dimensions.get('window').height;
    
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backgroundOpacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      translateY.setValue(0);
      onClose();
    });
  };
  
  // Handle pan gesture for swipe to dismiss
  const handleGesture = ({ nativeEvent }) => {
    if (nativeEvent.state === State.ACTIVE) {
      if (nativeEvent.translationY > 0) {
        translateY.setValue(nativeEvent.translationY);
      }
    } else if (nativeEvent.state === State.END) {
      if (nativeEvent.translationY > 100 && nativeEvent.velocityY > 0) {
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: Dimensions.get('window').height,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(backgroundOpacityAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          })
        ]).start(() => {
          translateY.setValue(0);
          onClose();
        });
      } else {
        Animated.spring(translateY, {
          toValue: 0,
          tension: 150,
          friction: 8,
          useNativeDriver: true
        }).start();
      }
    }
  };
  
  // Handle save from TimeBlockForm
  const handleFormSave = (timeBlockData) => {
    onSave(timeBlockData);
    handleClose();
  };
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <Animated.View 
        style={[
          styles.overlay,
          {
            opacity: backgroundOpacityAnim
          }
        ]}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.backgroundTouchable} />
        </TouchableWithoutFeedback>
        
        <KeyboardAvoidingView 
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Animated.View 
            style={[
              styles.modalContainer,
              {
                backgroundColor: theme.background,
                paddingBottom: insets.bottom,
                transform: [
                  { translateY: Animated.add(slideAnim, translateY) }
                ]
              }
            ]}
          >
            {/* Header with drag area */}
            <PanGestureHandler onHandlerStateChange={handleGesture}>
              <Animated.View style={styles.header}>
                <View style={[styles.dragIndicator, { backgroundColor: theme.textSecondary }]} />
                <View style={styles.headerContent}>
                  <Text style={[styles.headerTitle, { color: theme.text }]}>
                    {timeBlockData ? 'Edit Time Block' : 'New Time Block'}
                  </Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleClose}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                  >
                    <Ionicons name="close" size={24} color={theme.textSecondary} />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </PanGestureHandler>
            
            {/* TimeBlockForm Content */}
            <View style={styles.formContainer}>
              <TimeBlockForm
                navigation={{
                  goBack: handleClose,
                  navigate: () => {},
                  setParams: () => {},
                }}
                route={{
                  params: {
                    timeBlock: timeBlockData,
                    ...initialData
                  }
                }}
                onSave={handleFormSave}
                isModal={true}
              />
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backgroundTouchable: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 0,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
    opacity: 0.5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    flex: 1,
  },
});

export default TimeBlockModalWrapper;