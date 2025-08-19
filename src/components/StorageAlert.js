import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { spacing, fontSizes } from '../utils/responsive';

const StorageAlert = ({ visible, onClose }) => {
  const handleClose = () => {
    console.log('🚀 StorageAlert handleClose called');
    if (onClose) {
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
      hardwareAccelerated={true}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={handleClose}
        >
          <View style={styles.container}>
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              <View style={styles.content}>
                <Text style={styles.title}>Storage Full</Text>
                <Text style={styles.message}>
                  You can only save up to 3 streak files. Delete one of your saved streaks to continue.
                </Text>
              </View>
              <TouchableOpacity style={styles.button} onPress={handleClose}>
                <Text style={styles.buttonText}>OK</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  overlayTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  container: {
    width: '100%',
    maxWidth: 280,
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  content: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: fontSizes.l,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: spacing.s,
    textAlign: 'center',
  },
  message: {
    fontSize: fontSizes.m,
    lineHeight: 22,
    color: '#BBBBBB',
    textAlign: 'center',
  },
  button: {
    paddingVertical: spacing.m,
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: '#121212',
  },
  buttonText: {
    fontSize: fontSizes.m,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default StorageAlert;