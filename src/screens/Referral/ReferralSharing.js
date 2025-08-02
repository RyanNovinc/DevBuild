// src/screens/Referral/ReferralSharing.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

const ReferralSharing = ({ 
  referralCode, 
  referralLink, 
  customMessage, 
  setCustomMessage, 
  onShare, 
  onCopy, 
  theme 
}) => {
  return (
    <>
      {/* Referral Code Section */}
      <View style={[styles.codeSection, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Your Referral Code
        </Text>
        
        <View style={[styles.codeContainer, { borderColor: theme.border }]}>
          <Text style={[styles.referralCodeText, { color: theme.primary }]}>
            {referralCode}
          </Text>
          <TouchableOpacity
            style={[styles.copyButton, { backgroundColor: theme.primaryLight }]}
            onPress={onCopy}
          >
            <Ionicons name="copy-outline" size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.codeInstructions, { color: theme.textSecondary }]}>
          Share this code with friends or use the sharing options below
        </Text>
      </View>
      
      {/* Custom Message Section */}
      <View style={[styles.messageSection, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Customize Your Message
        </Text>
        
        <TextInput
          style={[styles.messageInput, { 
            backgroundColor: theme.inputBackground,
            color: theme.text,
            borderColor: theme.border
          }]}
          value={customMessage}
          onChangeText={setCustomMessage}
          multiline
          numberOfLines={4}
          placeholder="Write a personal message to send with your invitation"
          placeholderTextColor={theme.textSecondary}
        />
      </View>
      
      {/* Share Options */}
      <View style={[styles.shareSection, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Share Your Invitation
        </Text>
        
        <View style={styles.shareOptions}>
          <TouchableOpacity 
            style={styles.shareOption} 
            onPress={() => onShare('whatsapp')}
          >
            <View style={[styles.shareIconContainer, { backgroundColor: '#25D366' }]}>
              <Ionicons name="logo-whatsapp" size={24} color="#FFFFFF" />
            </View>
            <Text style={[styles.shareOptionText, { color: theme.text }]}>WhatsApp</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.shareOption}
            onPress={() => onShare('email')}
          >
            <View style={[styles.shareIconContainer, { backgroundColor: '#E1306C' }]}>
              <Ionicons name="mail-outline" size={24} color="#FFFFFF" />
            </View>
            <Text style={[styles.shareOptionText, { color: theme.text }]}>Email</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.shareOption}
            onPress={() => onShare('default')}
          >
            <View style={[styles.shareIconContainer, { backgroundColor: '#3F51B5' }]}>
              <Ionicons name="share-social-outline" size={24} color="#FFFFFF" />
            </View>
            <Text style={[styles.shareOptionText, { color: theme.text }]}>More</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  codeSection: {
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  referralCodeText: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  copyButton: {
    padding: 8,
    borderRadius: 8,
  },
  codeInstructions: {
    fontSize: 14,
    textAlign: 'center',
  },
  messageSection: {
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  messageInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  shareSection: {
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  shareOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    marginBottom: 10,
  },
  shareOption: {
    alignItems: 'center',
    width: 80,
  },
  shareIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  shareOptionText: {
    fontSize: 14,
  },
});

export default ReferralSharing;