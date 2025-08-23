// src/components/DataExportModal.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const DataExportModal = ({ visible, theme, onCancel, onConfirm }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const isDarkMode = theme.background === '#000000';

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      statusBarTranslucent={true}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />
      
      {/* Backdrop with blur effect */}
      <Animated.View 
        style={[
          styles.backdrop,
          { opacity: fadeAnim }
        ]}
      >
        <BlurView
          intensity={20}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.backdropOverlay} />
      </Animated.View>

      {/* Modal Container */}
      <View style={styles.centeredView}>
        <Animated.View
          style={[
            styles.modalView,
            {
              backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: '#FF980020' }]}>
              <Ionicons name="download-outline" size={28} color="#FF9800" />
            </View>
            <Text style={[styles.title, { color: theme.text }]}>
              Export Your Data
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Download your personal information
            </Text>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={[styles.description, { color: theme.text }]}>
              This will export all your personal data from LifeCompass in JSON format, including:
            </Text>

            <View style={styles.dataList}>
              {[
                { icon: 'flag-outline', text: 'Goals, milestones, and tasks' },
                { icon: 'wallet-outline', text: 'Financial tracker data' },
                { icon: 'flame-outline', text: 'Streak tracker data' },
                { icon: 'chatbubbles-outline', text: 'AI conversation history' },
                { icon: 'person-outline', text: 'Profile and preferences' },
                { icon: 'document-outline', text: 'Uploaded documents' },
                { icon: 'calendar-outline', text: 'Calendar events and settings' },
                { icon: 'list-outline', text: 'Todo lists and task notes' },
                { icon: 'create-outline', text: 'All saved notes and entries' },
              ].map((item, index) => (
                <View key={index} style={styles.dataItem}>
                  <View style={[styles.dataIconContainer, { backgroundColor: theme.card }]}>
                    <Ionicons name={item.icon} size={16} color={theme.textSecondary} />
                  </View>
                  <Text style={[styles.dataItemText, { color: theme.text }]}>
                    {item.text}
                  </Text>
                </View>
              ))}
            </View>

            {/* Rights Information */}
            <View style={[styles.rightsContainer, { backgroundColor: theme.card }]}>
              <Text style={[styles.rightsTitle, { color: theme.text }]}>
                Your Data Rights
              </Text>
              <Text style={[styles.rightsText, { color: theme.textSecondary }]}>
                Under GDPR and CCPA, you have the right to access, transfer, and delete your personal data. 
                The export file will be saved to your device for you to share as needed.
              </Text>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { backgroundColor: theme.card }]}
              onPress={onCancel}
            >
              <Text style={[styles.buttonText, { color: theme.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={onConfirm}
            >
              <Ionicons name="download-outline" size={18} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                Export Data
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalView: {
    width: Math.min(width - 40, 400),
    maxHeight: height * 0.8,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 15,
  },
  header: {
    alignItems: 'center',
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  content: {
    paddingHorizontal: 24,
    maxHeight: height * 0.45,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  dataList: {
    marginBottom: 24,
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dataIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dataItemText: {
    fontSize: 15,
    flex: 1,
  },
  rightsContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  rightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  rightsText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    padding: 24,
    paddingTop: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  confirmButton: {
    backgroundColor: '#FF9800',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default DataExportModal;