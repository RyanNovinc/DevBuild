// src/screens/Onboarding/components/DomainInfoModal.js
import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  Platform,
  Linking,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ResponsiveText from './ResponsiveText';

const { width, height } = Dimensions.get('window');

const DomainInfoModal = ({ visible, onClose }) => {
  const handleLinkPress = async () => {
    const url = 'https://www.researchgate.net/publication/365375169_The_Wheel_of_Life_as_a_Coaching_Tool_to_Audit_Life_Priorities';
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open link');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open link');
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <ResponsiveText style={styles.modalTitle}>
              Research-Based Life Domains
            </ResponsiveText>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.modalContent}>
            <ResponsiveText style={styles.subtitle}>
              Widely-Accepted Life Domains
            </ResponsiveText>
            
            <ResponsiveText style={styles.description}>
              These 8 domains are based on the "Wheel of Life" framework, backed by 30+ years of psychological research and validation studies.
            </ResponsiveText>

            <ResponsiveText style={styles.keyPoint}>
              ✓ Covers all essential areas of life{'\n'}
              ✓ Validated across multiple cultures{'\n'}
              ✓ Balanced framework based on research
            </ResponsiveText>

            <TouchableOpacity 
              style={styles.linkButton}
              onPress={handleLinkPress}
              accessibilityLabel="Learn more about Wheel of Life research"
            >
              <Ionicons name="link-outline" size={16} color="#60a5fa" />
              <ResponsiveText style={styles.linkText}>
                ResearchGate: Wheel of Life validation study
              </ResponsiveText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: '#16213e',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 24,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#60a5fa',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#d1d5db',
    lineHeight: 22,
    marginBottom: 20,
    textAlign: 'center',
  },
  keyPoint: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.2)',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
    backgroundColor: 'rgba(96, 165, 250, 0.05)',
  },
  linkText: {
    fontSize: 13,
    color: '#60a5fa',
    marginLeft: 6,
    textDecorationLine: 'underline',
  },
});

export default DomainInfoModal;