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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import ReferralService from './ReferralService';

const ReferralDetails = ({ data, onRefresh, showSuccess, showError, theme }) => {
  const { code, link, remainingCount } = data;
  
  const [customMessage, setCustomMessage] = useState(
    "I've been using LifeCompass to boost my productivity. Join with my code and get 500 AI credits when you sign up!"
  );
  
  // NEW: Add state to control message expansion
  const [isMessageExpanded, setIsMessageExpanded] = useState(false);
  
  // Copy referral code to clipboard
  const copyToClipboard = async () => {
    try {
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
        showError('You have used all your available referrals.');
        return;
      }
      
      const result = await Share.share({
        message: `${customMessage}\n\nUse my referral code: ${code}\n${link}`,
        url: link,
        title: 'Get 500 AI credits with LifeCompass'
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
          <TouchableOpacity
            style={styles.copyButton}
            onPress={copyToClipboard}
          >
            <Ionicons name="copy-outline" size={20} color="#4CAF50" />
          </TouchableOpacity>
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
        
        <TouchableOpacity
          style={[styles.shareButton, { backgroundColor: '#25D366' }]}
          onPress={() => shareReferral('whatsapp')}
        >
          <Ionicons name="logo-whatsapp" size={22} color="#FFFFFF" />
          <Text style={styles.shareButtonText}>Share via WhatsApp</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.shareButton, { backgroundColor: '#3F51B5' }]}
          onPress={() => shareReferral('email')}
        >
          <Ionicons name="mail-outline" size={22} color="#FFFFFF" />
          <Text style={styles.shareButtonText}>Share via Email</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.shareButton, { backgroundColor: '#607D8B' }]}
          onPress={() => shareReferral('default')}
        >
          <Ionicons name="share-social-outline" size={22} color="#FFFFFF" />
          <Text style={styles.shareButtonText}>More Options</Text>
        </TouchableOpacity>
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
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 0,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#2A2A2A',
  },
  referralCodeText: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
    color: '#4CAF50',
  },
  copyButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
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
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
});

export default ReferralDetails;