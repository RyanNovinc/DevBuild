// src/screens/Referral/ReferralDetails.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Share,
  TextInput,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import ReferralService from './ReferralService';

const ReferralDetails = ({ data, onRefresh, showSuccess, showError, theme }) => {
  const { code, link, remainingCount } = data;
  
  const [customMessage, setCustomMessage] = useState(
    "I've been using LifeCompass to boost my productivity. Join with my code and get 1 month of AI Light when you sign up!"
  );
  
  // Animation values for micro-interactions
  const [copyAnimation] = useState(new Animated.Value(1));
  const [shareAnimations] = useState({
    whatsapp: new Animated.Value(1),
    email: new Animated.Value(1),
    default: new Animated.Value(1)
  });
  
  // NEW: Add state to control message expansion
  const [isMessageExpanded, setIsMessageExpanded] = useState(false);
  
  // Animation for copy button
  const animateCopyButton = () => {
    Animated.sequence([
      Animated.timing(copyAnimation, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(copyAnimation, {
        toValue: 1.1,
        tension: 200,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(copyAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();
  };
  
  // Animation for share buttons
  const animateShareButton = (type) => {
    const animation = shareAnimations[type];
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
  };
  
  // Copy referral code to clipboard
  const copyToClipboard = async () => {
    try {
      animateCopyButton();
      await Clipboard.setStringAsync(code);
      showSuccess('Referral code copied to clipboard!');
    } catch (error) {
      showError('Could not copy the referral code');
    }
  };
  
  // Share referral link
  const shareReferral = async (method = 'default') => {
    try {
      if (remainingCount <= 0) {
        showError('You have reached your referral limit! Complete achievements like maintaining a 30-day or 90-day streak to unlock more referral slots.');
        return;
      }
      
      // Animate the share button
      animateShareButton(method);
      
      const result = await Share.share({
        message: `${customMessage}\n\nUse my referral code: ${code}\n${link}`,
        url: link,
        title: 'Get 1 month AI Light with LifeCompass'
      });
      
      if (result.action === Share.sharedAction) {
        // Track the share
        await ReferralService.trackReferralShare();
        
        // Refresh data
        onRefresh();
        
        showSuccess('Invitation sent successfully!');
      }
    } catch (error) {
      console.error('Error sharing referral:', error);
      showError(error.message || 'Could not share the referral link');
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      {/* Referral Code Section */}
      <View style={styles.codeSection}>
        <Text style={styles.sectionTitle}>
          Your Referral Code
        </Text>
        
        <View style={styles.codeContainer}>
          <Text style={styles.referralCodeText}>
            {code}
          </Text>
          <Animated.View style={{ transform: [{ scale: copyAnimation }] }}>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={copyToClipboard}
              activeOpacity={0.8}
            >
              <Ionicons name="copy-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
      
      {/* Customize Message (optional) */}
      <View style={styles.messageSection}>
        <TouchableOpacity
          style={styles.customizeButton}
          onPress={() => setIsMessageExpanded(!isMessageExpanded)}
        >
          <Text style={styles.customizeText}>Customize your message (optional)</Text>
          <Ionicons 
            name={isMessageExpanded ? "chevron-up" : "chevron-down"} 
            size={16} 
            color="#9E9E9E" 
          />
        </TouchableOpacity>
        
        {/* Show TextInput when expanded */}
        {isMessageExpanded && (
          <View style={styles.messageInputContainer}>
            <TextInput
              style={styles.messageInput}
              value={customMessage}
              onChangeText={setCustomMessage}
              multiline
              numberOfLines={4}
              placeholder="Write a personal message to send with your invitation"
              placeholderTextColor="#757575"
              maxLength={150}
            />
            <Text style={styles.characterCount}>
              {customMessage.length}/150
            </Text>
          </View>
        )}
      </View>
      
      {/* Share Options */}
      <View style={styles.shareSection}>
        <Text style={styles.sectionTitle}>
          Share Your Invitation
        </Text>
        
        <Animated.View style={{ transform: [{ scale: shareAnimations.whatsapp }] }}>
          <TouchableOpacity
            style={[styles.shareButton, { backgroundColor: '#25D366' }]}
            onPress={() => shareReferral('whatsapp')}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-whatsapp" size={22} color="#FFFFFF" />
            <Text style={styles.shareButtonText}>Share via WhatsApp</Text>
          </TouchableOpacity>
        </Animated.View>
        
        <Animated.View style={{ transform: [{ scale: shareAnimations.email }] }}>
          <TouchableOpacity
            style={[styles.shareButton, { backgroundColor: '#3F51B5' }]}
            onPress={() => shareReferral('email')}
            activeOpacity={0.8}
          >
            <Ionicons name="mail-outline" size={22} color="#FFFFFF" />
            <Text style={styles.shareButtonText}>Share via Email</Text>
          </TouchableOpacity>
        </Animated.View>
        
        <Animated.View style={{ transform: [{ scale: shareAnimations.default }] }}>
          <TouchableOpacity
            style={[styles.shareButton, { backgroundColor: '#607D8B' }]}
            onPress={() => shareReferral('default')}
            activeOpacity={0.8}
          >
            <Ionicons name="share-social-outline" size={22} color="#FFFFFF" />
            <Text style={styles.shareButtonText}>More Options</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
      
      {/* Bottom space */}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  codeSection: {
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#FFFFFF',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderWidth: 2,
    borderRadius: 12,
    marginBottom: 0,
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    minHeight: 70,
  },
  referralCodeText: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: '#4CAF50',
  },
  copyButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    minWidth: 50,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageSection: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  customizeButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
  },
  customizeText: {
    color: '#9E9E9E',
  },
  // Message input container and styling
  messageInputContainer: {
    marginTop: 12,
    marginBottom: 4,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    backgroundColor: '#2A2A2A',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    alignSelf: 'flex-end',
    marginTop: 4,
    color: '#9E9E9E',
    fontSize: 12,
  },
  shareSection: {
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    minHeight: 60,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 18,
  },
});

export default ReferralDetails;