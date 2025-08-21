// src/screens/CommunityScreen/VerificationTabRevamped.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DISCORD_BLUE = "#5865F2";

const VerificationTabRevamped = ({ founderCode, theme }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null); // null, 'success', 'error'
  const [expandedStep, setExpandedStep] = useState(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const stepAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Stagger step animations
      stepAnimations.forEach((anim, index) => {
        setTimeout(() => {
          Animated.spring(anim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }).start();
        }, index * 150);
      });
    });
  }, []);

  const handleVerify = () => {
    if (!verificationCode.trim()) {
      Alert.alert('Code Required', 'Please enter your founder code');
      return;
    }

    setIsVerifying(true);
    
    // Simulate verification
    setTimeout(() => {
      if (verificationCode === founderCode) {
        setVerificationStatus('success');
        Animated.spring(checkmarkScale, {
          toValue: 1,
          tension: 100,
          friction: 5,
          useNativeDriver: true,
        }).start();
      } else {
        setVerificationStatus('error');
      }
      setIsVerifying(false);
    }, 1500);
  };

  const copyCommand = async () => {
    const command = `!verify ${founderCode}`;
    await Clipboard.setStringAsync(command);
    Alert.alert('Copied!', 'Command copied to clipboard');
  };

  const steps = [
    {
      id: 1,
      icon: 'logo-discord',
      title: 'Join Discord Server',
      description: 'Click the link to join our Discord community',
      action: 'Join Server',
      color: DISCORD_BLUE,
      details: 'Our Discord server is where all the magic happens. Connect with other founders, share your progress, and get support.',
    },
    {
      id: 2,
      icon: 'search',
      title: 'Find Verification Channel',
      description: 'Navigate to #verify-founder-status',
      action: 'Channel Info',
      color: '#8B5CF6',
      details: 'Look for the #verify-founder-status channel in the "Welcome" category. This is where you\'ll confirm your founder status.',
    },
    {
      id: 3,
      icon: 'copy',
      title: 'Copy Your Code',
      description: 'Copy your unique founder code',
      action: 'Copy Code',
      color: '#10B981',
      details: `Your founder code is: ${founderCode || 'Not assigned yet'}. This code is unique to you and proves your founder status.`,
    },
    {
      id: 4,
      icon: 'send',
      title: 'Run Verify Command',
      description: 'Type !verify followed by your code',
      action: 'Copy Command',
      color: '#F59E0B',
      details: 'In the verification channel, type the command exactly as shown. The bot will instantly verify and assign your founder role.',
    },
  ];

  const toggleStep = (stepId) => {
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View 
        style={{ 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={['#8B5CF6', '#7C3AED', '#6D28D9']}
          style={styles.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroContent}>
            <View style={[styles.heroIconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
              <Ionicons name="shield-checkmark" size={40} color="#FFFFFF" />
            </View>
            
            <Text style={styles.heroTitle}>
              Verify Your Founder Status
            </Text>
            
            <Text style={styles.heroSubtitle}>
              Get your exclusive founder badge in Discord
            </Text>

            {founderCode && (
              <View style={styles.codePreview}>
                <Text style={styles.codePreviewLabel}>Your Code:</Text>
                <Text style={styles.codePreviewValue}>{founderCode}</Text>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Quick Verify Section */}
        {founderCode && (
          <View style={[styles.quickVerifySection, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Quick Verify
            </Text>
            <Text style={[styles.sectionDesc, { color: theme.textSecondary }]}>
              Already in Discord? Verify your status here
            </Text>

            <View style={styles.commandContainer}>
              <Text style={[styles.commandLabel, { color: theme.textSecondary }]}>
                Discord Command:
              </Text>
              <TouchableOpacity
                style={[styles.commandBox, { 
                  backgroundColor: theme.isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)',
                  borderColor: '#8B5CF6',
                }]}
                onPress={copyCommand}
                activeOpacity={0.8}
              >
                <Text style={styles.commandText}>
                  !verify {founderCode}
                </Text>
                <View style={[styles.copyIcon, { backgroundColor: '#8B5CF6' }]}>
                  <Ionicons name="copy" size={16} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.orDivider}>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
              <Text style={[styles.dividerText, { color: theme.textSecondary }]}>OR</Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            </View>

            <View style={styles.manualVerify}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                Enter your code manually:
              </Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.codeInput, { 
                    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    borderColor: verificationStatus === 'error' ? '#EF4444' : theme.border,
                    color: theme.text,
                  }]}
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  placeholder="Enter founder code"
                  placeholderTextColor={theme.textSecondary}
                  autoCapitalize="characters"
                />
                <TouchableOpacity
                  style={[styles.verifyButton, { backgroundColor: '#8B5CF6' }]}
                  onPress={handleVerify}
                  disabled={isVerifying}
                  activeOpacity={0.8}
                >
                  {isVerifying ? (
                    <Ionicons name="hourglass" size={20} color="#FFFFFF" />
                  ) : (
                    <Text style={styles.verifyButtonText}>Verify</Text>
                  )}
                </TouchableOpacity>
              </View>

              {verificationStatus === 'success' && (
                <Animated.View 
                  style={[
                    styles.successMessage,
                    { transform: [{ scale: checkmarkScale }] }
                  ]}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text style={[styles.successText, { color: '#10B981' }]}>
                    Verification successful! Check Discord for your badge.
                  </Text>
                </Animated.View>
              )}

              {verificationStatus === 'error' && (
                <View style={styles.errorMessage}>
                  <Ionicons name="alert-circle" size={20} color="#EF4444" />
                  <Text style={[styles.errorText, { color: '#EF4444' }]}>
                    Invalid code. Please check and try again.
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Step by Step Guide */}
        <View style={[styles.stepsSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Step-by-Step Guide
          </Text>
          <Text style={[styles.sectionDesc, { color: theme.textSecondary }]}>
            Follow these steps to get your founder badge
          </Text>

          <View style={styles.stepsContainer}>
            {steps.map((step, index) => {
              const isExpanded = expandedStep === step.id;
              return (
                <Animated.View
                  key={step.id}
                  style={[
                    styles.stepCard,
                    {
                      backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      borderColor: isExpanded ? step.color : theme.border,
                      borderWidth: isExpanded ? 2 : 1,
                      opacity: stepAnimations[index],
                      transform: [
                        { scale: stepAnimations[index] },
                        { 
                          translateX: stepAnimations[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [-50, 0],
                          })
                        }
                      ]
                    }
                  ]}
                >
                  <TouchableOpacity
                    style={styles.stepHeader}
                    onPress={() => toggleStep(step.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.stepLeft}>
                      <View style={[styles.stepNumber, { backgroundColor: step.color + '20' }]}>
                        <Text style={[styles.stepNumberText, { color: step.color }]}>
                          {step.id}
                        </Text>
                      </View>
                      <View style={[styles.stepIcon, { backgroundColor: step.color + '15' }]}>
                        <Ionicons name={step.icon} size={24} color={step.color} />
                      </View>
                      <View style={styles.stepInfo}>
                        <Text style={[styles.stepTitle, { color: theme.text }]}>
                          {step.title}
                        </Text>
                        <Text style={[styles.stepDesc, { color: theme.textSecondary }]}>
                          {step.description}
                        </Text>
                      </View>
                    </View>
                    <Ionicons 
                      name={isExpanded ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color={theme.textSecondary} 
                    />
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.stepDetails}>
                      <Text style={[styles.stepDetailsText, { color: theme.textSecondary }]}>
                        {step.details}
                      </Text>
                      <TouchableOpacity
                        style={[styles.stepAction, { backgroundColor: step.color }]}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.stepActionText}>{step.action}</Text>
                        <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  )}
                </Animated.View>
              );
            })}
          </View>
        </View>

        {/* Tips Section */}
        <View style={[styles.tipsSection, { backgroundColor: theme.isDark ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.02)', borderColor: theme.border }]}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={24} color="#10B981" />
            <Text style={[styles.tipsTitle, { color: theme.text }]}>
              Pro Tips
            </Text>
          </View>
          
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={[styles.tipText, { color: theme.textSecondary }]}>
                Verification is instant - you'll get your badge immediately
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={[styles.tipText, { color: theme.textSecondary }]}>
                Your founder badge is permanent and exclusive
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={[styles.tipText, { color: theme.textSecondary }]}>
                Get access to founder-only channels after verification
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom CTA */}
        {!founderCode && (
          <View style={styles.bottomCTA}>
            <Text style={[styles.bottomCTAText, { color: theme.textSecondary }]}>
              Don't have a founder code yet?
            </Text>
            <TouchableOpacity
              style={[styles.bottomCTAButton, { backgroundColor: '#10B981' }]}
              activeOpacity={0.8}
            >
              <Text style={styles.bottomCTAButtonText}>Get Founder Access</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  // Hero Section
  heroGradient: {
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
  },
  codePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  codePreviewLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginRight: 8,
  },
  codePreviewValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  // Quick Verify Section
  quickVerifySection: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDesc: {
    fontSize: 14,
    marginBottom: 20,
  },
  commandContainer: {
    marginBottom: 20,
  },
  commandLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  commandBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  commandText: {
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#8B5CF6',
    fontWeight: 'bold',
  },
  copyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 12,
  },
  manualVerify: {
    marginTop: 0,
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  codeInput: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  verifyButton: {
    paddingHorizontal: 24,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  successText: {
    fontSize: 13,
  },
  errorMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  errorText: {
    fontSize: 13,
  },
  // Steps Section
  stepsSection: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  stepsContainer: {
    gap: 12,
  },
  stepCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  stepLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 12,
  },
  stepDetails: {
    padding: 16,
    paddingTop: 0,
  },
  stepDetailsText: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  stepAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  stepActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  // Tips Section
  tipsSection: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  // Bottom CTA
  bottomCTA: {
    alignItems: 'center',
    padding: 20,
  },
  bottomCTAText: {
    fontSize: 14,
    marginBottom: 12,
  },
  bottomCTAButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  bottomCTAButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default VerificationTabRevamped;