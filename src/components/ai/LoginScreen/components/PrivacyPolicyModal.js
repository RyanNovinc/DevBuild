import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../context/ThemeContext';

const PrivacyPolicyModal = ({ visible, onClose }) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      flex: 1,
      backgroundColor: theme.background,
      marginTop: 50,
      marginHorizontal: 20,
      marginBottom: 20,
      borderRadius: 12,
      paddingBottom: 20,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      flex: 1,
      textAlign: 'center',
    },
    closeButton: {
      padding: 8,
    },
    scrollContent: {
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    lastUpdated: {
      fontSize: 12,
      color: theme.textSecondary,
      marginBottom: 20,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginTop: 20,
      marginBottom: 8,
    },
    sectionText: {
      fontSize: 14,
      color: theme.text,
      lineHeight: 20,
      marginBottom: 12,
    },
    subsectionTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.text,
      marginTop: 16,
      marginBottom: 6,
    },
    bulletPoint: {
      fontSize: 14,
      color: theme.text,
      lineHeight: 20,
      marginBottom: 6,
      paddingLeft: 16,
    },
    emphasis: {
      fontWeight: 'bold',
      color: theme.primary,
    },
    disclaimer: {
      backgroundColor: theme.cardElevated,
      padding: 16,
      borderRadius: 8,
      marginVertical: 12,
      borderLeftWidth: 4,
      borderLeftColor: theme.primary,
    },
    disclaimerText: {
      fontSize: 14,
      color: theme.text,
      fontWeight: '500',
      lineHeight: 18,
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={{ width: 32 }} />
            <Text style={styles.headerTitle}>Privacy Policy</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close Privacy Policy"
            >
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            <Text style={styles.title}>PRIVACY POLICY</Text>
            <Text style={styles.title}>LifeCompass</Text>
            <Text style={styles.lastUpdated}>Last Updated: July 2025</Text>

            <Text style={styles.sectionText}>
              This Privacy Policy describes how Ryan Novinc trading as AppLabs ("we," "us," or "our") collects, uses, and protects your personal information when you use the LifeCompass mobile application ("App").
            </Text>

            <Text style={styles.sectionTitle}>1. OVERVIEW</Text>
            
            <Text style={styles.subsectionTitle}>1.1 Our Commitment to Privacy</Text>
            <Text style={styles.sectionText}>
              We are committed to protecting your privacy and being transparent about how we handle your personal information. This policy explains what data we collect, why we collect it, how we use it, and your rights regarding your personal data.
            </Text>

            <Text style={styles.subsectionTitle}>1.2 Local-First Data Architecture</Text>
            <View style={styles.disclaimer}>
              <Text style={[styles.disclaimerText, styles.emphasis]}>
                LifeCompass is designed with a "local-first" approach.
              </Text>
              <Text style={styles.disclaimerText}>
                Most of your data is stored directly on your device and never leaves your device.
              </Text>
            </View>

            <Text style={styles.sectionText}>This includes:</Text>
            <Text style={styles.bulletPoint}>• Your personal goals, tasks, and projects</Text>
            <Text style={styles.bulletPoint}>• Financial tracking data you enter</Text>
            <Text style={styles.bulletPoint}>• Personal notes and achievements</Text>
            <Text style={styles.bulletPoint}>• App preferences and customizations</Text>
            <Text style={styles.bulletPoint}>• Progress tracking and statistics</Text>

            <Text style={styles.sectionTitle}>2. INFORMATION WE COLLECT</Text>

            <Text style={styles.subsectionTitle}>2.1 Account Information (Stored in Cloud)</Text>
            <Text style={styles.sectionText}>When you create an account, we collect:</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.emphasis}>Email address</Text> - for account creation and communication</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.emphasis}>Phone number</Text> - for account security and verification</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.emphasis}>Name</Text> - for personalization and account management</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.emphasis}>Profile photo</Text> (optional) - for app personalization</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.emphasis}>Country/Region</Text> - for feature customization</Text>

            <Text style={styles.subsectionTitle}>2.2 AI Interaction Data</Text>
            <Text style={styles.sectionText}>When you use AI features:</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.emphasis}>Messages sent to AI</Text> - your questions and requests</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.emphasis}>AI responses</Text> - for quality improvement</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.emphasis}>Conversation context</Text> - for coherent responses</Text>

            <View style={styles.disclaimer}>
              <Text style={[styles.disclaimerText, styles.emphasis]}>
                Important: AI conversations are processed by OpenAI.
              </Text>
              <Text style={styles.disclaimerText}>
                We recommend not sharing highly sensitive information in AI conversations.
              </Text>
            </View>

            <Text style={styles.subsectionTitle}>2.3 Local Device Data (Never Leaves Your Device)</Text>
            <Text style={styles.sectionText}>
              The following data is stored locally on your device using AsyncStorage and is NOT transmitted to our servers:
            </Text>
            <Text style={styles.bulletPoint}>• Personal goals, tasks, and project details</Text>
            <Text style={styles.bulletPoint}>• Financial tracking data you enter (income, expenses, savings, debts)</Text>
            <Text style={styles.bulletPoint}>• Personal notes and journal entries</Text>
            <Text style={styles.bulletPoint}>• Time blocking and calendar data</Text>
            <Text style={styles.bulletPoint}>• Achievement progress and streaks</Text>
            <Text style={styles.bulletPoint}>• App customization preferences</Text>

            <Text style={styles.sectionTitle}>3. HOW WE USE YOUR INFORMATION</Text>

            <Text style={styles.subsectionTitle}>3.1 Account Management</Text>
            <Text style={styles.bulletPoint}>• Create and maintain your user account</Text>
            <Text style={styles.bulletPoint}>• Authenticate your identity when you log in</Text>
            <Text style={styles.bulletPoint}>• Provide customer support</Text>
            <Text style={styles.bulletPoint}>• Send important service-related notifications</Text>

            <Text style={styles.subsectionTitle}>3.2 AI-Powered Features</Text>
            <Text style={styles.bulletPoint}>• Process your questions to generate helpful responses</Text>
            <Text style={styles.bulletPoint}>• Maintain conversation context for coherent interactions</Text>
            <Text style={styles.bulletPoint}>• Improve AI response quality through analysis</Text>
            <Text style={styles.bulletPoint}>• Ensure AI safety and prevent harmful content</Text>

            <Text style={styles.sectionTitle}>4. INFORMATION SHARING</Text>

            <View style={styles.disclaimer}>
              <Text style={[styles.disclaimerText, styles.emphasis]}>
                We Do NOT Sell Your Personal Information
              </Text>
              <Text style={styles.disclaimerText}>
                We do not sell, rent, or trade your personal information to third parties.
              </Text>
            </View>

            <Text style={styles.subsectionTitle}>4.1 Service Providers</Text>
            <Text style={styles.sectionText}>We share limited information with:</Text>
            
            <Text style={styles.bulletPoint}>• <Text style={styles.emphasis}>AWS Cognito</Text> - for account authentication</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.emphasis}>OpenAI</Text> - for AI features (messages you send only)</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.emphasis}>App Store Platforms</Text> - for app distribution and payments</Text>

            <Text style={styles.subsectionTitle}>4.2 Third-Party AI Processing (OpenAI)</Text>
            <Text style={styles.sectionText}>When you use AI features:</Text>
            <Text style={styles.bulletPoint}>• Your messages are sent to OpenAI for processing</Text>
            <Text style={styles.bulletPoint}>• OpenAI may temporarily store data to provide the service</Text>
            <Text style={styles.bulletPoint}>• We implement privacy safeguards but cannot guarantee complete data isolation</Text>
            <Text style={styles.bulletPoint}>• OpenAI has their own privacy policy governing their data handling</Text>

            <Text style={styles.emphasis}>Your Control:</Text>
            <Text style={styles.sectionText}>You can choose not to use AI features to avoid third-party processing.</Text>

            <Text style={styles.sectionTitle}>5. DATA SECURITY</Text>
            <Text style={styles.sectionText}>We implement appropriate security measures:</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.emphasis}>Encryption</Text> - Data transmission is encrypted using TLS/SSL</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.emphasis}>Access Controls</Text> - Strict limits on who can access your data</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.emphasis}>Secure Storage</Text> - Cloud data in encrypted databases</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.emphasis}>Local Security</Text> - Most data stays on your device</Text>

            <Text style={styles.sectionTitle}>6. YOUR PRIVACY RIGHTS</Text>
            <Text style={styles.sectionText}>You have the right to:</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.emphasis}>Access</Text> - Request a copy of your personal data</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.emphasis}>Correction</Text> - Request correction of inaccurate data</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.emphasis}>Deletion</Text> - Request deletion of your personal data</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.emphasis}>Data Portability</Text> - Request your data in a common format</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.emphasis}>Withdraw Consent</Text> - Stop processing where consent is the legal basis</Text>

            <Text style={styles.subsectionTitle}>How to Exercise Your Rights</Text>
            <Text style={styles.sectionText}>
              To exercise any of these rights, contact us at privacy@lifecompass.app with your name, email, and clear description of your request. We will respond within 30 days.
            </Text>

            <Text style={styles.sectionTitle}>7. INTERNATIONAL COMPLIANCE</Text>
            <Text style={styles.sectionText}>We comply with privacy laws including:</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.emphasis}>Australian Privacy Principles (APPs)</Text></Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.emphasis}>GDPR (EU/UK)</Text></Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.emphasis}>CCPA (California)</Text></Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.emphasis}>PIPEDA (Canada)</Text></Text>

            <Text style={styles.sectionTitle}>8. CHILDREN'S PRIVACY</Text>
            <Text style={styles.sectionText}>
              LifeCompass is not intended for children under 16 years old. We do not knowingly collect personal information from children under 16. If we become aware that we have collected such information, we will delete it promptly.
            </Text>

            <Text style={styles.sectionTitle}>9. DATA RETENTION</Text>
            <Text style={styles.sectionText}>We retain your data:</Text>
            <Text style={styles.bulletPoint}>• Account data: As long as your account is active, plus 30 days after deletion</Text>
            <Text style={styles.bulletPoint}>• AI conversations: Up to 90 days for quality improvement</Text>
            <Text style={styles.bulletPoint}>• Local device data: Until you delete the app or clear app data</Text>

            <Text style={styles.sectionTitle}>10. CONTACT INFORMATION</Text>
            <Text style={styles.subsectionTitle}>For privacy-related questions:</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.emphasis}>Privacy Email:</Text> Ryan.Novinc@gmail.com</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.emphasis}>General Support:</Text> Ryan.Novinc@gmail.com</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.emphasis}>Address:</Text> 13 Musson Close, Florey ACT 2615, Australia</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.emphasis}>Response Time:</Text> 30 days for general inquiries</Text>

            <Text style={styles.sectionTitle}>11. CHANGES TO THIS POLICY</Text>
            <Text style={styles.sectionText}>
              We may update this Privacy Policy from time to time. We will notify you of material changes through in-app notifications or email. Your continued use after changes constitutes acceptance of the updated policy.
            </Text>

            <Text style={styles.sectionText}>
              By using LifeCompass, you acknowledge that you have read, understood, and agree to the collection, use, and disclosure of your personal information in accordance with this Privacy Policy.
            </Text>

            <Text style={[styles.sectionText, styles.emphasis]}>
              © 2025 Ryan Novinc trading as AppLabs. All rights reserved.
            </Text>

            {/* Bottom padding for better scrolling */}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default PrivacyPolicyModal;