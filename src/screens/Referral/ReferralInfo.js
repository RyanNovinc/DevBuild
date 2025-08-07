// src/screens/Referral/ReferralInfo.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ReferralInfo = ({ theme }) => {
  // For expandable FAQ sections
  const [expandedFaq, setExpandedFaq] = useState(null);
  
  // FAQ data
  const faqs = [
    {
      id: 1,
      question: "How do I get my 50% discount?",
      answer: "Once you successfully refer a friend who buys Pro, your next Pro purchase will automatically be 50% off - no additional steps required!"
    },
    {
      id: 2,
      question: "When is the discount applied?",
      answer: "The 50% off is automatically applied at checkout when you purchase Pro after a successful referral - it just shows up as savings!"
    },
    {
      id: 3,
      question: "Where does my friend enter the referral code?",
      answer: "Your friend must go to Profile → Settings → Enter Referral Code in the app and input your code BEFORE buying the Pro version. This is crucial - the code must be entered first!"
    },
    {
      id: 4,
      question: "Is there a limit to how many friends I can refer?",
      answer: "Yes, you can refer up to 3 friends. Complete app challenges to earn additional referral opportunities."
    }
  ];
  
  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };
  
  return (
    <ScrollView style={styles.container}>
      {/* How It Works Section */}
      <View style={styles.howItWorksSection}>
        <Text style={styles.sectionTitle}>
          How It Works
        </Text>
        
        <View style={styles.stepsList}>
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>
                Share Your Code
              </Text>
              <Text style={styles.stepDescription}>
                Send your unique referral code to friends via any messaging app
              </Text>
            </View>
          </View>
          
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>
                Friend Enters Code
              </Text>
              <Text style={styles.stepDescription}>
                They add your referral code in the app before upgrading
              </Text>
            </View>
          </View>
          
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>
                Friend Buys Pro
              </Text>
              <Text style={styles.stepDescription}>
                They purchase the Pro version of LifeCompass
              </Text>
            </View>
          </View>
          
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>✓</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>
                Both Get 50% Off
              </Text>
              <Text style={styles.stepDescription}>
                You both save 50% on your Pro purchase - instant rewards for sharing!
              </Text>
            </View>
          </View>
        </View>
      </View>
      
      {/* FAQ Section */}
      <View style={styles.faqSection}>
        <Text style={styles.sectionTitle}>
          Frequently Asked Questions
        </Text>
        
        <View style={styles.faqList}>
          {faqs.map(faq => (
            <TouchableOpacity 
              key={faq.id}
              style={styles.faqItem}
              onPress={() => toggleFaq(faq.id)}
              activeOpacity={0.7}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>
                  {faq.question}
                </Text>
                <Ionicons 
                  name={expandedFaq === faq.id ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#9E9E9E" 
                />
              </View>
              
              {expandedFaq === faq.id && (
                <Text style={styles.faqAnswer}>
                  {faq.answer}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Terms & Conditions Notice */}
      <View style={styles.termsSection}>
        <Text style={styles.termsText}>
          By participating in our referral program, you agree to our referral terms and conditions. Rewards cannot be combined with other offers. LifeCompass reserves the right to modify or terminate this program at any time.
        </Text>
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
  howItWorksSection: {
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
  stepsList: {
    marginTop: 8,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 24,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#4CAF50',
    paddingBottom: 8,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
    marginLeft: -15, // Position the circle over the line
    backgroundColor: '#4CAF50',
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepContent: {
    flex: 1,
    paddingTop: 2,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#FFFFFF',
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#9E9E9E',
  },
  faqSection: {
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  faqList: {
    marginTop: 8,
  },
  faqItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    paddingRight: 16,
    color: '#FFFFFF',
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    paddingRight: 20,
    color: '#9E9E9E',
  },
  termsSection: {
    marginHorizontal: 16,
    marginTop: 24,
    padding: 8,
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    color: '#9E9E9E',
  },
});

export default ReferralInfo;