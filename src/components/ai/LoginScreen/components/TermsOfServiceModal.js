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

const TermsOfServiceModal = ({ visible, onClose }) => {
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
            <Text style={styles.headerTitle}>Terms of Service</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close Terms of Service"
            >
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            <Text style={styles.title}>TERMS OF SERVICE</Text>
            <Text style={styles.title}>LifeCompass</Text>
            <Text style={styles.lastUpdated}>Last Updated: July 2025</Text>

            <Text style={styles.sectionText}>
              These Terms of Service ("Terms") govern your use of the LifeCompass mobile application ("App") operated by Ryan Novinc trading as AppLabs ("we," "us," or "our"). By downloading, installing, or using our App, you agree to be bound by these Terms.
            </Text>

            <Text style={styles.sectionTitle}>1. ACCEPTANCE OF TERMS</Text>
            <Text style={styles.sectionText}>
              By accessing and using LifeCompass, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </Text>

            <Text style={styles.sectionTitle}>2. DESCRIPTION OF SERVICE</Text>
            <Text style={styles.sectionText}>
              LifeCompass is a personal productivity and goal management application that provides:
            </Text>
            <Text style={styles.bulletPoint}>• Personal goal setting and tracking tools</Text>
            <Text style={styles.bulletPoint}>• Task and project management features</Text>
            <Text style={styles.bulletPoint}>• Time blocking and scheduling capabilities</Text>
            <Text style={styles.bulletPoint}>• Personal data tracking and visualization</Text>
            <Text style={styles.bulletPoint}>• AI-powered chat assistance for general productivity questions</Text>
            <Text style={styles.bulletPoint}>• Achievement and progress tracking systems</Text>

            <View style={styles.disclaimer}>
              <Text style={[styles.disclaimerText, styles.emphasis]}>
                IMPORTANT: LifeCompass is NOT a financial advisory service.
              </Text>
              <Text style={styles.disclaimerText}>
                We are a productivity and goal tracking app only.
              </Text>
            </View>

            <Text style={styles.sectionTitle}>3. FINANCIAL INFORMATION DISCLAIMER</Text>
            
            <Text style={styles.subsectionTitle}>3.1 No Financial Advice</Text>
            <Text style={styles.sectionText}>
              LifeCompass does not provide financial, investment, legal, tax, or accounting advice. Any financial information, tools, or features within the App are:
            </Text>
            <Text style={styles.bulletPoint}>• Provided for personal data tracking purposes only</Text>
            <Text style={styles.bulletPoint}>• Based on information you voluntarily enter</Text>
            <Text style={styles.bulletPoint}>• Not recommendations or advice from us</Text>
            <Text style={styles.bulletPoint}>• General educational information only</Text>

            <Text style={styles.subsectionTitle}>3.2 User Responsibility</Text>
            <Text style={styles.sectionText}>
              You are solely responsible for:
            </Text>
            <Text style={styles.bulletPoint}>• All financial decisions and actions you take</Text>
            <Text style={styles.bulletPoint}>• Verifying any information before making financial decisions</Text>
            <Text style={styles.bulletPoint}>• Consulting qualified financial professionals for advice</Text>
            <Text style={styles.bulletPoint}>• Understanding the risks associated with any financial activities</Text>

            <Text style={styles.subsectionTitle}>3.3 Professional Consultation Required</Text>
            <Text style={styles.sectionText}>
              Before making any financial decisions, you should consult with qualified financial, legal, tax, or accounting professionals who can assess your individual situation and provide personalized advice.
            </Text>

            <Text style={styles.sectionTitle}>4. AI-POWERED FEATURES</Text>
            
            <Text style={styles.subsectionTitle}>4.1 AI Service Description</Text>
            <Text style={styles.sectionText}>
              Our App integrates artificial intelligence technology (powered by OpenAI) to enhance your productivity experience through:
            </Text>
            <Text style={styles.bulletPoint}>• General productivity assistance</Text>
            <Text style={styles.bulletPoint}>• Goal and task organization help</Text>
            <Text style={styles.bulletPoint}>• Information synthesis from your tracked data</Text>
            <Text style={styles.bulletPoint}>• General educational responses to your questions</Text>

            <Text style={styles.subsectionTitle}>4.2 AI Limitations and Disclaimers</Text>
            <View style={styles.disclaimer}>
              <Text style={[styles.disclaimerText, styles.emphasis]}>
                AI responses are generated by algorithms, not human experts.
              </Text>
            </View>
            <Text style={styles.sectionText}>AI outputs may be:</Text>
            <Text style={styles.bulletPoint}>• Inaccurate, incomplete, or outdated</Text>
            <Text style={styles.bulletPoint}>• Inappropriate for your specific situation</Text>
            <Text style={styles.bulletPoint}>• Subject to technical errors or bias</Text>
            <Text style={styles.bulletPoint}>• Not suitable as a substitute for professional advice</Text>

            <Text style={styles.sectionTitle}>5. USER ACCOUNTS AND DATA</Text>
            <Text style={styles.sectionText}>
              To use certain features, you must create an account by providing a valid email address, phone number, and basic profile information. You are responsible for maintaining the confidentiality of your login credentials and all activities that occur under your account.
            </Text>

            <Text style={styles.sectionTitle}>6. SUBSCRIPTION SERVICES</Text>
            <Text style={styles.sectionText}>
              We offer Founder's Lifetime Access (one-time payment) and AI subscription plans (monthly/annual). Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current period. You can manage subscriptions through your App Store account settings.
            </Text>

            <Text style={styles.sectionTitle}>7. ACCEPTABLE USE</Text>
            <Text style={styles.sectionText}>
              You may use LifeCompass for personal goal tracking and productivity management. You may NOT use the service to violate laws, share harmful content, attempt to hack the app, or share sensitive financial information with AI features.
            </Text>

            <Text style={styles.sectionTitle}>8. LIMITATION OF LIABILITY</Text>
            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerText}>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW: We are not liable for any indirect, incidental, or consequential damages. Our total liability is limited to the amount you paid for the service in the past 12 months. We are specifically NOT liable for any financial losses resulting from decisions you make.
              </Text>
            </View>

            <Text style={styles.sectionTitle}>9. GOVERNING LAW</Text>
            <Text style={styles.sectionText}>
              These Terms are governed by the laws of Australia. Any legal disputes will be resolved in the courts of Australia.
            </Text>

            <Text style={styles.sectionTitle}>10. CONTACT INFORMATION</Text>
            <Text style={styles.sectionText}>
              If you have questions about these Terms of Service, please contact us at:
            </Text>
            <Text style={styles.bulletPoint}>• Email: Ryan.Novinc@gmail.com</Text>
            <Text style={styles.bulletPoint}>• Address: 13 Musson Close, Florey ACT 2615, Australia</Text>

            <Text style={styles.sectionText}>
              By using LifeCompass, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
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

export default TermsOfServiceModal;