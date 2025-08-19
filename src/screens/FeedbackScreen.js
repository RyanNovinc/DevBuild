// Modified FeedbackScreen.js with option to choose between app and AI feedback
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { submitFeedback } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useRoute } from '@react-navigation/native';
import { useAppContext } from '../context/AppContext'; // Make sure this is imported
import * as FeatureExplorerTracker from '../services/FeatureExplorerTracker';
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  isSmallDevice,
  isTablet,
  spacing,
  fontSizes,
  useScreenDimensions,
  useIsLandscape,
  useSafeSpacing,
  ensureAccessibleTouchTarget,
  meetsContrastRequirements,
  accessibility
} from '../utils/responsive';

const FeedbackScreen = ({ navigation }) => {
  const route = useRoute();
  const { theme } = useTheme();
  const { showSuccess, showError } = useNotification() || {
    showSuccess: (msg) => Alert.alert('Success', msg),
    showError: (msg) => Alert.alert('Error', msg)
  };
  const auth = useAuth();
  const user = auth?.user || {};
  
  // Get AppContext to access subscription status
  const appContext = useAppContext();
  const { userSubscriptionStatus } = appContext || {};
  
  // Get responsive measurements
  const { width, height } = useScreenDimensions();
  const isLandscape = useIsLandscape();
  const safeSpacing = useSafeSpacing();
  
  // Check if using dark mode for better contrast
  const isDarkMode = theme.background === '#000000';

  // Ensure text colors meet contrast requirements
  const textColor = meetsContrastRequirements(theme.text, theme.card) 
    ? theme.text 
    : isDarkMode ? '#FFFFFF' : '#000000';
  
  const secondaryTextColor = meetsContrastRequirements(theme.textSecondary, theme.card) 
    ? theme.textSecondary 
    : isDarkMode ? '#E0E0E0' : '#4A4A4A';

  // Initialize feedbackType from route params or default to 'suggestion'
  const [feedbackType, setFeedbackType] = useState(route.params?.feedbackType || 'suggestion');
  const [feedbackTarget, setFeedbackTarget] = useState(route.params?.feedbackTarget || 'app'); // New state for app vs AI feedback
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Initialize email as empty string - fix for pre-filled email
  const [contactEmail, setContactEmail] = useState('');
  const [showThanksModal, setShowThanksModal] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [isGoingBack, setIsGoingBack] = useState(false);
  
  // Refund-specific states
  const [refundReason, setRefundReason] = useState('');
  const [refundExpectations, setRefundExpectations] = useState('');
  const [refundSuggestions, setRefundSuggestions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('paypal'); // 'paypal' or 'other'
  const [paymentDetails, setPaymentDetails] = useState('');
  
  // Feedback types with icons, labels, and colors
  const feedbackTypes = [
    { id: 'suggestion', label: 'Suggestion', icon: 'bulb-outline', color: '#FFD700' },
    { id: 'issue', label: 'Issue/Bug', icon: 'bug-outline', color: theme.error || '#E53935' },
    { id: 'feature', label: 'Feature Request', icon: 'add-circle-outline', color: '#4CAF50' },
    { id: 'refund', label: 'Refund Request', icon: 'card-outline', color: '#FF6B6B' },
    { id: 'testimonial', label: 'Testimonial', icon: 'star-outline', color: '#9C27B0' },
    { id: 'other', label: 'Other', icon: 'chatbox-outline', color: theme.info || '#039BE5' }
  ];

  // Feedback targets (app vs AI)
  const feedbackTargets = [
    { id: 'app', label: 'App Feedback', icon: 'phone-portrait-outline', color: theme.primary },
    { id: 'ai', label: 'AI Assistant', icon: 'sparkles-outline', color: '#FFD700' }
  ];

  // Handle feedback submission
  const handleSubmitFeedback = async () => {
    if (feedbackType === 'refund') {
      if (!refundReason.trim() || !refundExpectations.trim() || !refundSuggestions.trim() || !paymentDetails.trim()) {
        showError('Please complete all required refund fields');
        return;
      }
    } else if (!feedbackText.trim()) {
      showError('Please enter your feedback');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Determine founder status from subscription status
      const isFounder = userSubscriptionStatus === 'pro' || userSubscriptionStatus === 'unlimited';
      
      // Create feedback object
      const feedbackItem = {
        type: feedbackType,
        target: feedbackTarget, // Include the feedback target (app or AI)
        message: feedbackText,
        contact_email: contactEmail,
        user_id: user?.id || null,
        user_name: user?.displayName || null,
        created_at: new Date().toISOString(),
        device_info: `${Platform.OS} ${Platform.Version}`,
        app_version: '1.0.0', // You can use a dynamic version from your app config
        status: 'new',
        marketing_consent: feedbackType === 'testimonial' ? marketingConsent : null,
        // Add founder status information
        is_founder: isFounder,
        founder_status: isFounder ? 'Founder' : 'free',
        // Include priority field - founders get high priority
        priority: isFounder ? 'high' : 'normal',
        // Add refund-specific data
        ...(feedbackType === 'refund' && {
          refund_reason: refundReason,
          refund_expectations: refundExpectations,
          refund_suggestions: refundSuggestions,
          payment_method: paymentMethod,
          payment_details: paymentDetails,
          refund_status: 'requested'
        })
      };
      
      // Send to AWS
      const result = await submitFeedback(feedbackItem);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to submit feedback');
      }
      
      // Show success message with modal
      setShowThanksModal(true);
      
      // Track Feature Influencer achievement for Pro members
      try {
        await FeatureExplorerTracker.trackFeatureInfluencer();
      } catch (achievementError) {
        console.error('Error tracking Feature Influencer achievement:', achievementError);
        // Don't fail feedback submission if achievement tracking fails
      }
      
      // Reset form
      setFeedbackText('');
      setContactEmail('');
      setFeedbackType('suggestion');
      setFeedbackTarget('app');
      setMarketingConsent(false);
      
      // Reset refund fields
      setRefundReason('');
      setRefundExpectations('');
      setRefundSuggestions('');
      setPaymentMethod('paypal');
      setPaymentDetails('');
      
      // Close modal and navigate back after a delay
      setTimeout(() => {
        setShowThanksModal(false);
        navigation.goBack();
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      showError(`Failed to submit feedback: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle back button with loading state
  const handleBack = async () => {
    setIsGoingBack(true);
    
    try {
      // Small delay to ensure state updates are visible
      await new Promise(resolve => setTimeout(resolve, 100));
      navigation.goBack();
    } catch (error) {
      console.error('Error going back:', error);
      setIsGoingBack(false); // Reset if navigation fails
    }
  };

  // Create shorter placeholders that won't get cut off
  const getShortPlaceholderText = () => {
    if (feedbackType === 'testimonial') {
      return "Share your thoughts...";
    }
    
    if (feedbackTarget === 'ai') {
      if (feedbackType === 'suggestion') {
        return "Suggestions for the AI...";
      } else if (feedbackType === 'issue') {
        return "Describe the issue...";
      } else if (feedbackType === 'feature') {
        return "Feature ideas...";
      }
      return "Your feedback...";
    } else {
      if (feedbackType === 'suggestion') {
        return "Suggestions for the app...";
      } else if (feedbackType === 'issue') {
        return "Describe the issue...";
      } else if (feedbackType === 'feature') {
        // Check if this is coming from theme picker
        if (route.params?.fromThemePicker) {
          return "Enter custom colour code (#FFFFFF)...";
        }
        return "Feature ideas...";
      }
      return "Your feedback...";
    }
  };

  return (
    <SafeAreaView style={[
      styles.container, 
      { 
        backgroundColor: theme.background,
        paddingLeft: safeSpacing.left > 0 ? 0 : undefined,
        paddingRight: safeSpacing.right > 0 ? 0 : undefined,
        paddingBottom: safeSpacing.bottom
      }
    ]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView 
          contentContainerStyle={[
            styles.scrollContent,
            {
              padding: spacing.m,
              paddingBottom: spacing.xl,
              paddingLeft: safeSpacing.left > 0 ? safeSpacing.left : spacing.m,
              paddingRight: safeSpacing.right > 0 ? safeSpacing.right : spacing.m
            }
          ]}
          showsVerticalScrollIndicator={false}
          accessible={true}
          accessibilityLabel="Feedback form"
        >
          {/* Header with back button */}
          <View style={[
            styles.header,
            {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: spacing.m
            }
          ]}>
            <TouchableOpacity 
              style={[
                styles.backButton,
                {
                  padding: spacing.xs,
                  opacity: isGoingBack ? 0.6 : 1
                }
              ]}
              onPress={handleBack}
              disabled={isGoingBack}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {isGoingBack ? (
                <ActivityIndicator size="small" color={textColor} />
              ) : (
                <Ionicons name="arrow-back" size={scaleWidth(24)} color={textColor} />
              )}
            </TouchableOpacity>
            <Text 
              style={[
                styles.headerTitle, 
                { 
                  color: textColor,
                  fontSize: fontSizes.xl,
                  fontWeight: 'bold'
                }
              ]}
              maxFontSizeMultiplier={1.3}
              accessible={true}
              accessibilityRole="header"
            >
              {route.params?.fromThemePicker ? 'Request Custom Colour' : 'Send Feedback'}
            </Text>
            <View style={[
              styles.headerRight,
              { width: scaleWidth(24) }
            ]} />
          </View>
          
          {/* Founder Status Message - Only show for paid users */}
          {!route.params?.fromThemePicker && (userSubscriptionStatus === 'pro' || userSubscriptionStatus === 'unlimited') && (
            <View style={[
              styles.founderBadgeContainer,
              {
                backgroundColor: '#FFD70015', // Light gold background
                borderColor: '#FFD700',
                borderWidth: 1,
                borderRadius: scaleWidth(12),
                padding: spacing.s,
                marginBottom: spacing.m,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'
              }
            ]}>
              <Ionicons name="star" size={scaleWidth(18)} color="#FFD700" style={{ marginRight: spacing.xs }} />
              <Text
                style={{
                  color: '#FFD700',
                  fontWeight: 'bold',
                  fontSize: fontSizes.s
                }}
                maxFontSizeMultiplier={1.3}
              >
                Your feedback as a Founder will be prioritized
              </Text>
            </View>
          )}
          
          {/* Feedback target selection (App vs AI) - NEW SECTION */}
          {!route.params?.fromThemePicker && (
            <View style={[
              styles.card, 
              { 
                backgroundColor: theme.card,
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: scaleWidth(16),
                padding: spacing.m,
                marginBottom: spacing.m,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: scaleHeight(2) },
                shadowOpacity: 0.05,
                shadowRadius: 3,
                elevation: 2
              }
            ]}
            accessible={true}
            accessibilityRole="radiogroup"
            accessibilityLabel="Feedback target selection"
            >
              <View style={[
                styles.sectionTitleContainer,
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: spacing.m
                }
              ]}>
                <Ionicons 
                  name="options-outline" 
                  size={scaleWidth(22)} 
                  color={theme.primary} 
                  style={{ marginRight: spacing.xs }}
                />
                <Text 
                  style={[
                    styles.sectionTitle, 
                    { 
                      color: textColor,
                      fontSize: fontSizes.m,
                      fontWeight: '600'
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  What are you providing feedback for?
                </Text>
              </View>
              
              <View style={[
                styles.targetSelectionContainer,
                {
                  flexDirection: isSmallDevice && isLandscape ? 'column' : 'row',
                  justifyContent: 'space-between',
                  marginBottom: spacing.xs
                }
              ]}>
                {feedbackTargets.map(target => (
                  <TouchableOpacity
                    key={target.id}
                    style={[
                      styles.targetButton,
                      {
                        width: isSmallDevice && isLandscape ? '100%' : '48%',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: spacing.m,
                        borderRadius: scaleWidth(12),
                        marginBottom: isSmallDevice && isLandscape ? spacing.xs : 0
                      },
                      feedbackTarget === target.id ? 
                        { 
                          backgroundColor: target.color + '15', 
                          borderColor: target.color,
                          borderWidth: 2 
                        } :
                        { 
                          backgroundColor: isDarkMode ? '#1A1A1A' : theme.cardElevated, 
                          borderColor: theme.border,
                          borderWidth: 1
                        }
                    ]}
                    onPress={() => setFeedbackTarget(target.id)}
                    accessible={true}
                    accessibilityRole="radio"
                    accessibilityLabel={target.label}
                    accessibilityState={{ checked: feedbackTarget === target.id }}
                    accessibilityHint={`Select ${target.label} as your feedback target`}
                  >
                    <Ionicons 
                      name={target.icon} 
                      size={scaleWidth(24)} 
                      color={target.color} 
                      style={{ marginBottom: spacing.xs }}
                    />
                    <Text 
                      style={[
                        styles.targetLabel, 
                        { 
                          color: feedbackTarget === target.id ? target.color : textColor,
                          fontSize: fontSizes.s,
                          fontWeight: '600',
                          textAlign: 'center'
                        }
                      ]}
                      maxFontSizeMultiplier={1.3}
                    >
                      {target.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          
          {/* Feedback type selection */}
          {!route.params?.fromThemePicker && (
            <View style={[
              styles.card, 
              { 
                backgroundColor: theme.card,
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: scaleWidth(16),
                padding: spacing.m,
                marginBottom: spacing.m,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: scaleHeight(2) },
                shadowOpacity: 0.05,
                shadowRadius: 3,
                elevation: 2
              }
            ]}
            accessible={true}
            accessibilityRole="radiogroup"
            accessibilityLabel="Feedback type selection"
            >
              <View style={[
                styles.sectionTitleContainer,
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: spacing.m
                }
              ]}>
                <Ionicons 
                  name="help-circle-outline" 
                  size={scaleWidth(22)} 
                  color={theme.primary} 
                  style={{ marginRight: spacing.xs }}
                />
                <Text 
                  style={[
                    styles.sectionTitle, 
                    { 
                      color: textColor,
                      fontSize: fontSizes.m,
                      fontWeight: '600'
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  What would you like to share with us?
                </Text>
              </View>
              
              <View style={[
                styles.feedbackTypeContainer,
                {
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between'
                }
              ]}>
                {feedbackTypes.map(type => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.feedbackTypeButton,
                      {
                        width: isTablet || isLandscape ? '32%' : '48%',
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: spacing.m,
                        borderRadius: scaleWidth(12),
                        marginBottom: spacing.m
                      },
                      feedbackType === type.id ? 
                        { 
                          backgroundColor: type.color + '15', 
                          borderColor: type.color,
                          borderWidth: 2 
                        } :
                        { 
                          backgroundColor: isDarkMode ? '#1A1A1A' : theme.cardElevated, 
                          borderColor: theme.border,
                          borderWidth: 1
                        }
                    ]}
                    onPress={() => setFeedbackType(type.id)}
                    accessible={true}
                    accessibilityRole="radio"
                    accessibilityLabel={type.label}
                    accessibilityState={{ checked: feedbackType === type.id }}
                    accessibilityHint={`Select ${type.label} as your feedback type`}
                  >
                    <Ionicons 
                      name={type.icon} 
                      size={scaleWidth(22)} 
                      color={type.color} 
                      style={{ marginRight: spacing.xs }}
                    />
                    <Text 
                      style={[
                        styles.feedbackTypeLabel, 
                        { 
                          color: feedbackType === type.id ? type.color : textColor,
                          fontSize: fontSizes.s,
                          fontWeight: '500'
                        }
                      ]}
                      maxFontSizeMultiplier={1.3}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          
          {/* Feedback message - Only show for non-refund types */}
          {feedbackType !== 'refund' && (
            <View style={[
              styles.card, 
              { 
                backgroundColor: theme.card,
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: scaleWidth(16),
                padding: spacing.m,
                marginBottom: spacing.m,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: scaleHeight(2) },
                shadowOpacity: 0.05,
                shadowRadius: 3,
                elevation: 2
              }
            ]}>
            <View style={[
              styles.sectionTitleContainer,
              {
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: spacing.m
              }
            ]}>
              <Ionicons 
                name={route.params?.fromThemePicker ? "color-palette-outline" : "chatbubble-outline"} 
                size={scaleWidth(22)} 
                color={theme.primary} 
                style={{ marginRight: spacing.xs }}
              />
              <Text 
                style={[
                  styles.sectionTitle, 
                  { 
                    color: textColor,
                    fontSize: fontSizes.m,
                    fontWeight: '600'
                  }
                ]}
                maxFontSizeMultiplier={1.3}
              >
                {route.params?.fromThemePicker 
                  ? 'Request a custom colour' 
                  : (feedbackType === 'testimonial' ? 'Share your experience' : 'Tell us more')}
              </Text>
            </View>
            
            {/* First show the complete prompt text that won't get cut off */}
            <Text 
              style={[
                styles.fullPromptText, 
                { 
                  color: textColor,
                  fontSize: fontSizes.s,
                  marginBottom: spacing.s,
                  lineHeight: scaleHeight(20),
                  flexWrap: 'wrap'
                }
              ]}
              maxFontSizeMultiplier={1.3}
              accessible={true}
              accessibilityRole="text"
            >
              {getPlaceholderText()}
            </Text>
            
            {/* Then the actual text input with a shorter placeholder */}
            <TextInput
              style={[
                styles.feedbackInput,
                { 
                  backgroundColor: isDarkMode ? '#1A1A1A' : '#F5F5F5',
                  color: textColor,
                  borderColor: theme.border,
                  borderWidth: 1,
                  minHeight: scaleHeight(120),
                  borderRadius: scaleWidth(12),
                  padding: spacing.m,
                  fontSize: fontSizes.m,
                  textAlignVertical: 'top'
                }
              ]}
              placeholder={getShortPlaceholderText()}
              placeholderTextColor={isDarkMode ? '#777777' : '#999999'}
              multiline={true}
              value={feedbackText}
              onChangeText={setFeedbackText}
              textAlignVertical="top"
              maxFontSizeMultiplier={1.5}
              accessible={true}
              accessibilityLabel="Feedback text"
              accessibilityHint="Enter your feedback here"
            />
            
            <Text 
              style={[
                styles.inputHint, 
                { 
                  color: secondaryTextColor,
                  marginTop: spacing.xs,
                  fontSize: fontSizes.xs
                }
              ]}
              maxFontSizeMultiplier={1.3}
            >
              {getHintText()}
            </Text>
          </View>
          )}
          
          {/* Marketing consent for testimonials */}
          {feedbackType === 'testimonial' && !route.params?.fromThemePicker && (
            <View style={[
              styles.card, 
              { 
                backgroundColor: theme.card,
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: scaleWidth(16),
                padding: spacing.m,
                marginBottom: spacing.m,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: scaleHeight(2) },
                shadowOpacity: 0.05,
                shadowRadius: 3,
                elevation: 2
              }
            ]}>
              <View style={[
                styles.sectionTitleContainer,
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: spacing.m
                }
              ]}>
                <Ionicons 
                  name="megaphone-outline" 
                  size={scaleWidth(22)} 
                  color={theme.primary} 
                  style={{ marginRight: spacing.xs }}
                />
                <Text 
                  style={[
                    styles.sectionTitle, 
                    { 
                      color: textColor,
                      fontSize: fontSizes.m,
                      fontWeight: '600'
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  Marketing Permission
                </Text>
              </View>
              
              <View style={[
                styles.consentContainer,
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: spacing.xs
                }
              ]}>
                <Switch
                  value={marketingConsent}
                  onValueChange={setMarketingConsent}
                  trackColor={{ false: isDarkMode ? '#555' : '#ccc', true: '#9C27B080' }}
                  thumbColor={marketingConsent ? '#9C27B0' : isDarkMode ? '#888' : '#f4f3f4'}
                  accessible={true}
                  accessibilityRole="switch"
                  accessibilityLabel="Consent to use testimonial for marketing"
                  accessibilityState={{ checked: marketingConsent }}
                  accessibilityHint="Toggle to allow us to use your testimonial in marketing materials"
                />
                <Text 
                  style={[
                    styles.consentText, 
                    { 
                      color: textColor,
                      flex: 1,
                      marginLeft: spacing.m,
                      fontSize: fontSizes.s
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  I consent to my testimonial being used for marketing purposes (website, social media, promotional materials).
                </Text>
              </View>
              
              <Text 
                style={[
                  styles.inputHint, 
                  { 
                    color: secondaryTextColor,
                    marginTop: spacing.xs,
                    fontSize: fontSizes.xs
                  }
                ]}
                maxFontSizeMultiplier={1.3}
              >
                We may attribute your testimonial to your name or username. You can withdraw consent at any time by contacting us.
              </Text>
            </View>
          )}
          
          {/* Contact email (optional) - Skip for refund requests */}
          {feedbackType !== 'refund' && (
            <View style={[
            styles.card, 
            { 
              backgroundColor: theme.card,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: scaleWidth(16),
              padding: spacing.m,
              marginBottom: spacing.m,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: scaleHeight(2) },
              shadowOpacity: 0.05,
              shadowRadius: 3,
              elevation: 2
            }
          ]}>
            <View style={[
              styles.sectionTitleContainer,
              {
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: spacing.m
              }
            ]}>
              <Ionicons 
                name="mail-outline" 
                size={scaleWidth(22)} 
                color={theme.primary} 
                style={{ marginRight: spacing.xs }}
              />
              <Text 
                style={[
                  styles.sectionTitle, 
                  { 
                    color: textColor,
                    fontSize: fontSizes.m,
                    fontWeight: '600'
                  }
                ]}
                maxFontSizeMultiplier={1.3}
              >
                Contact email {feedbackType === 'testimonial' && marketingConsent ? '(required)' : '(optional)'}
              </Text>
            </View>
            
            <TextInput
              style={[
                styles.emailInput,
                { 
                  backgroundColor: isDarkMode ? '#1A1A1A' : '#F5F5F5',
                  color: textColor,
                  borderColor: theme.border,
                  borderWidth: 1,
                  height: scaleHeight(48),
                  borderRadius: scaleWidth(12),
                  padding: spacing.m,
                  fontSize: fontSizes.m
                }
              ]}
              placeholder="your@email.com"
              placeholderTextColor={isDarkMode ? '#777777' : '#999999'}
              keyboardType="email-address"
              autoCapitalize="none"
              value={contactEmail}
              onChangeText={setContactEmail}
              maxFontSizeMultiplier={1.5}
              accessible={true}
              accessibilityLabel="Contact email"
              accessibilityHint={feedbackType === 'testimonial' && marketingConsent ? 
                "Required email for testimonial" : 
                "Optional email for follow-up"}
            />
            
            <Text 
              style={[
                styles.inputHint, 
                { 
                  color: secondaryTextColor,
                  marginTop: spacing.xs,
                  fontSize: fontSizes.xs
                }
              ]}
              maxFontSizeMultiplier={1.3}
            >
              {feedbackType === 'testimonial' && marketingConsent 
                ? "Required for testimonials so we can contact you about usage."
                : "We'll only use this to follow up on your feedback if needed."}
            </Text>
          </View>
          )}
          
          {/* Refund-specific sections */}
          {feedbackType === 'refund' && (
            <>
              {/* Refund Reason */}
              <View style={[
                styles.card, 
                { 
                  backgroundColor: theme.card,
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: scaleWidth(16),
                  padding: spacing.m,
                  marginBottom: spacing.m,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: scaleHeight(2) },
                  shadowOpacity: 0.05,
                  shadowRadius: 3,
                  elevation: 2
                }
              ]}>
                <View style={[
                  styles.sectionTitleContainer,
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: spacing.m
                  }
                ]}>
                  <Ionicons 
                    name="help-circle-outline" 
                    size={scaleWidth(22)} 
                    color="#FF6B6B" 
                    style={{ marginRight: spacing.xs }}
                  />
                  <Text 
                    style={[
                      styles.sectionTitle, 
                      { 
                        color: textColor,
                        fontSize: fontSizes.m,
                        fontWeight: '600'
                      }
                    ]}
                    maxFontSizeMultiplier={1.3}
                  >
                    Why didn't Pro Access meet your expectations? *
                  </Text>
                </View>
                
                <TextInput
                  style={[
                    styles.feedbackInput,
                    { 
                      backgroundColor: isDarkMode ? '#1A1A1A' : '#F5F5F5',
                      color: textColor,
                      borderColor: theme.border,
                      borderWidth: 1,
                      minHeight: scaleHeight(80),
                      borderRadius: scaleWidth(12),
                      padding: spacing.m,
                      fontSize: fontSizes.m,
                      textAlignVertical: 'top'
                    }
                  ]}
                  placeholder="What specifically didn't work for you?"
                  placeholderTextColor={isDarkMode ? '#777777' : '#999999'}
                  multiline={true}
                  value={refundReason}
                  onChangeText={setRefundReason}
                  textAlignVertical="top"
                  maxFontSizeMultiplier={1.5}
                  accessible={true}
                  accessibilityLabel="Refund reason"
                />
              </View>

              {/* What were you hoping to achieve */}
              <View style={[
                styles.card, 
                { 
                  backgroundColor: theme.card,
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: scaleWidth(16),
                  padding: spacing.m,
                  marginBottom: spacing.m,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: scaleHeight(2) },
                  shadowOpacity: 0.05,
                  shadowRadius: 3,
                  elevation: 2
                }
              ]}>
                <View style={[
                  styles.sectionTitleContainer,
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: spacing.m
                  }
                ]}>
                  <Ionicons 
                    name="target-outline" 
                    size={scaleWidth(22)} 
                    color="#FF6B6B" 
                    style={{ marginRight: spacing.xs }}
                  />
                  <Text 
                    style={[
                      styles.sectionTitle, 
                      { 
                        color: textColor,
                        fontSize: fontSizes.m,
                        fontWeight: '600'
                      }
                    ]}
                    maxFontSizeMultiplier={1.3}
                  >
                    What were you hoping to achieve? *
                  </Text>
                </View>
                
                <TextInput
                  style={[
                    styles.feedbackInput,
                    { 
                      backgroundColor: isDarkMode ? '#1A1A1A' : '#F5F5F5',
                      color: textColor,
                      borderColor: theme.border,
                      borderWidth: 1,
                      minHeight: scaleHeight(80),
                      borderRadius: scaleWidth(12),
                      padding: spacing.m,
                      fontSize: fontSizes.m,
                      textAlignVertical: 'top'
                    }
                  ]}
                  placeholder="What were you trying to accomplish?"
                  placeholderTextColor={isDarkMode ? '#777777' : '#999999'}
                  multiline={true}
                  value={refundExpectations}
                  onChangeText={setRefundExpectations}
                  textAlignVertical="top"
                  maxFontSizeMultiplier={1.5}
                  accessible={true}
                  accessibilityLabel="Expected outcomes"
                />
              </View>

              {/* What would you like to see changed */}
              <View style={[
                styles.card, 
                { 
                  backgroundColor: theme.card,
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: scaleWidth(16),
                  padding: spacing.m,
                  marginBottom: spacing.m,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: scaleHeight(2) },
                  shadowOpacity: 0.05,
                  shadowRadius: 3,
                  elevation: 2
                }
              ]}>
                <View style={[
                  styles.sectionTitleContainer,
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: spacing.m
                  }
                ]}>
                  <Ionicons 
                    name="construct-outline" 
                    size={scaleWidth(22)} 
                    color="#FF6B6B" 
                    style={{ marginRight: spacing.xs }}
                  />
                  <Text 
                    style={[
                      styles.sectionTitle, 
                      { 
                        color: textColor,
                        fontSize: fontSizes.m,
                        fontWeight: '600'
                      }
                    ]}
                    maxFontSizeMultiplier={1.3}
                  >
                    What would you like to see changed? *
                  </Text>
                </View>
                
                <TextInput
                  style={[
                    styles.feedbackInput,
                    { 
                      backgroundColor: isDarkMode ? '#1A1A1A' : '#F5F5F5',
                      color: textColor,
                      borderColor: theme.border,
                      borderWidth: 1,
                      minHeight: scaleHeight(80),
                      borderRadius: scaleWidth(12),
                      padding: spacing.m,
                      fontSize: fontSizes.m,
                      textAlignVertical: 'top'
                    }
                  ]}
                  placeholder="What would make this better for you?"
                  placeholderTextColor={isDarkMode ? '#777777' : '#999999'}
                  multiline={true}
                  value={refundSuggestions}
                  onChangeText={setRefundSuggestions}
                  textAlignVertical="top"
                  maxFontSizeMultiplier={1.5}
                  accessible={true}
                  accessibilityLabel="Improvement suggestions"
                />
              </View>

              {/* PayPal Email for Refund */}
              <View style={[
                styles.card, 
                { 
                  backgroundColor: theme.card,
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: scaleWidth(16),
                  padding: spacing.m,
                  marginBottom: spacing.m,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: scaleHeight(2) },
                  shadowOpacity: 0.05,
                  shadowRadius: 3,
                  elevation: 2
                }
              ]}>
                <View style={[
                  styles.sectionTitleContainer,
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: spacing.m
                  }
                ]}>
                  <Ionicons 
                    name="logo-paypal" 
                    size={scaleWidth(22)} 
                    color="#0070ba" 
                    style={{ marginRight: spacing.xs }}
                  />
                  <Text 
                    style={[
                      styles.sectionTitle, 
                      { 
                        color: textColor,
                        fontSize: fontSizes.m,
                        fontWeight: '600'
                      }
                    ]}
                    maxFontSizeMultiplier={1.3}
                  >
                    PayPal email for refund *
                  </Text>
                </View>
                
                <TextInput
                  style={[
                    styles.emailInput,
                    { 
                      backgroundColor: isDarkMode ? '#1A1A1A' : '#F5F5F5',
                      color: textColor,
                      borderColor: theme.border,
                      borderWidth: 1,
                      height: scaleHeight(48),
                      borderRadius: scaleWidth(12),
                      padding: spacing.m,
                      fontSize: fontSizes.m
                    }
                  ]}
                  placeholder="your@paypal.com"
                  placeholderTextColor={isDarkMode ? '#777777' : '#999999'}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={paymentDetails}
                  onChangeText={setPaymentDetails}
                  maxFontSizeMultiplier={1.5}
                  accessible={true}
                  accessibilityLabel="PayPal email address"
                />
                
                <Text 
                  style={[
                    styles.inputHint, 
                    { 
                      color: secondaryTextColor,
                      marginTop: spacing.xs,
                      fontSize: fontSizes.xs
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  We'll send your refund to this PayPal email address within 24 hours
                </Text>
              </View>
            </>
          )}
          
          {/* Submit button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              { 
                backgroundColor: theme.primary,
                borderWidth: 2,
                borderColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                height: scaleHeight(56),
                borderRadius: scaleWidth(28),
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: spacing.m,
                marginBottom: spacing.m,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: scaleHeight(3) },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 5,
                minWidth: accessibility.minTouchTarget * 3
              },
              (isSubmitting || (feedbackType === 'refund' ? (!refundReason.trim() || !refundExpectations.trim() || !refundSuggestions.trim() || !paymentDetails.trim()) : (!feedbackText.trim() || (feedbackType === 'testimonial' && marketingConsent && !contactEmail.trim())))) && { opacity: 0.7 }
            ]}
            onPress={handleSubmitFeedback}
            disabled={isSubmitting || (feedbackType === 'refund' ? (!refundReason.trim() || !refundExpectations.trim() || !refundSuggestions.trim() || !paymentDetails.trim()) : (!feedbackText.trim() || (feedbackType === 'testimonial' && marketingConsent && !contactEmail.trim())))}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={route.params?.fromThemePicker ? 
              'Submit color request' : 
              `Submit ${feedbackType === 'testimonial' ? 'testimonial' : 'feedback'}`}
            accessibilityState={{ disabled: isSubmitting || !feedbackText.trim() || (feedbackType === 'testimonial' && marketingConsent && !contactEmail.trim()) }}
          >
            {isSubmitting ? (
              <ActivityIndicator color={isDarkMode ? "#000000" : "#FFFFFF"} size="small" />
            ) : (
              <>
                <Text 
                  style={[
                    styles.submitButtonText, 
                    {
                      color: isDarkMode ? "#000000" : "#FFFFFF",
                      fontWeight: '700',
                      fontSize: fontSizes.m
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  {route.params?.fromThemePicker ? 'Submit Color Request' : `Submit ${feedbackType === 'testimonial' ? 'Testimonial' : 'Feedback'}`}
                </Text>
                <Ionicons 
                  name="send" 
                  size={scaleWidth(18)} 
                  color={isDarkMode ? "#000000" : "#FFFFFF"} 
                  style={{ marginLeft: spacing.xs }}
                />
              </>
            )}
          </TouchableOpacity>
          
          {/* Privacy note */}
          <Text 
            style={[
              styles.privacyNote, 
              { 
                color: secondaryTextColor,
                textAlign: 'center',
                fontSize: fontSizes.xs,
                marginBottom: spacing.m
              }
            ]}
            maxFontSizeMultiplier={1.3}
          >
            {route.params?.fromThemePicker 
              ? "Thank you for suggesting a custom colour. We'll review your request and consider adding it in future updates."
              : (feedbackType === 'testimonial' 
                ? "Thank you for sharing your experience with us. Your testimonial helps others discover our app."
                : `Your feedback helps us improve the ${feedbackTarget === 'app' ? 'app' : 'AI assistant'}. We appreciate your input!`)}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Thank you modal */}
      <Modal
        visible={showThanksModal}
        transparent={true}
        animationType="fade"
        accessibilityViewIsModal={true}
      >
        <View style={[
          styles.thanksModalOverlay,
          {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)'
          }
        ]}>
          <View style={[
            styles.thanksModalContent, 
            { 
              backgroundColor: theme.background,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: scaleWidth(16),
              padding: spacing.xl,
              width: '80%',
              alignItems: 'center',
              maxWidth: isTablet ? 400 : undefined
            }
          ]}>
            <View style={[
              styles.thanksIconContainer, 
              { 
                backgroundColor: route.params?.fromThemePicker ? '#4CAF5020' : (feedbackType === 'testimonial' ? '#9C27B020' : '#4CAF5020'),
                borderWidth: 1,
                borderColor: route.params?.fromThemePicker ? '#4CAF5050' : (feedbackType === 'testimonial' ? '#9C27B050' : '#4CAF5050'),
                width: scaleWidth(80),
                height: scaleWidth(80),
                borderRadius: scaleWidth(40),
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: spacing.m
              }
            ]}>
              <Ionicons 
                name={route.params?.fromThemePicker ? 'color-palette' : (feedbackType === 'testimonial' ? 'star' : 'checkmark-circle')} 
                size={scaleWidth(50)} 
                color={route.params?.fromThemePicker ? '#4CAF50' : (feedbackType === 'testimonial' ? '#9C27B0' : '#4CAF50')} 
              />
            </View>
            <Text 
              style={[
                styles.thanksTitle, 
                { 
                  color: textColor,
                  fontSize: fontSizes.xl,
                  fontWeight: 'bold',
                  marginBottom: spacing.xs
                }
              ]}
              maxFontSizeMultiplier={1.3}
            >
              Thank You!
            </Text>
            <Text 
              style={[
                styles.thanksMessage, 
                { 
                  color: secondaryTextColor,
                  fontSize: fontSizes.s,
                  textAlign: 'center',
                  lineHeight: scaleHeight(20)
                }
              ]}
              maxFontSizeMultiplier={1.3}
            >
              {route.params?.fromThemePicker
                ? "We've received your color request and will consider adding it in a future update."
                : (feedbackType === 'testimonial' 
                  ? "We appreciate you sharing your experience with us."
                  : `We appreciate your feedback about our ${feedbackTarget === 'app' ? 'app' : 'AI assistant'} and will use it to improve.`)}
            </Text>

            {/* Special founder thank you message */}
            {(userSubscriptionStatus === 'pro' || userSubscriptionStatus === 'unlimited') && !route.params?.fromThemePicker && (
              <Text 
                style={[
                  styles.founderThanksMessage, 
                  { 
                    color: '#FFD700',
                    fontSize: fontSizes.s,
                    textAlign: 'center',
                    fontWeight: 'bold',
                    marginTop: spacing.m
                  }
                ]}
                maxFontSizeMultiplier={1.3}
              >
                Thank you for being a Founder! Your feedback is our priority.
              </Text>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
  
  // Helper function to get appropriate placeholder text based on feedback type and target
  function getPlaceholderText() {
    if (route.params?.fromThemePicker) {
      return "Please specify the hex color code (e.g., #FFFFFF) you'd like us to add to the theme options.";
    }
    
    if (feedbackType === 'testimonial') {
      return "Tell us what you love about our app...";
    }
    
    if (feedbackTarget === 'ai') {
      if (feedbackType === 'suggestion') {
        return "How can we improve the AI assistant?";
      } else if (feedbackType === 'issue') {
        return "What issues are you experiencing with the AI assistant?";
      } else if (feedbackType === 'feature') {
        return "What features would you like to see added to the AI assistant?";
      }
      return "Tell us about your experience with our AI assistant...";
    } else {
      if (feedbackType === 'suggestion') {
        return "How can we improve the app?";
      } else if (feedbackType === 'issue') {
        return "What issues are you experiencing with the app?";
      } else if (feedbackType === 'feature') {
        return "What features would you like to see added to the app?";
      }
      return "Your feedback helps us improve the app...";
    }
  }
  
  // Helper function to get appropriate hint text
  function getHintText() {
    if (route.params?.fromThemePicker) {
      return "Include the hex color code (e.g., #FFFFFF) and tell us why you'd like this color added to the theme options.";
    }
    
    if (feedbackType === 'testimonial') {
      return "Share how our app has helped you or what you enjoy most about it.";
    }
    
    if (feedbackTarget === 'ai') {
      if (feedbackType === 'issue') {
        return "Please describe what happened, what you expected, and how the AI assistant responded.";
      } else if (feedbackType === 'feature') {
        return "What capabilities would make the AI assistant more helpful to you?";
      }
      return "Please be specific about your experience with the AI assistant.";
    } else {
      if (feedbackType === 'issue') {
        return "Please describe what happened, what you expected, and any error messages you saw.";
      } else if (feedbackType === 'feature') {
        return "What functionality would make the app more useful to you?";
      }
      return "Please be as specific as possible. What do you like? What could be better?";
    }
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidContainer: {
    flex: 1,
  },
  scrollContent: {},
  header: {},
  backButton: {},
  headerTitle: {},
  headerRight: {},
  card: {},
  sectionTitleContainer: {},
  sectionIcon: {},
  sectionTitle: {},
  targetSelectionContainer: {},
  targetButton: {},
  targetIcon: {},
  targetLabel: {},
  feedbackTypeContainer: {},
  feedbackTypeButton: {},
  typeIcon: {},
  feedbackTypeLabel: {},
  fullPromptText: {},
  feedbackInput: {},
  emailInput: {},
  inputHint: {},
  consentContainer: {},
  consentText: {},
  submitButton: {},
  submitButtonText: {},
  submitIcon: {},
  privacyNote: {},
  thanksModalOverlay: {},
  thanksModalContent: {},
  thanksIconContainer: {},
  thanksTitle: {},
  thanksMessage: {},
  founderBadgeContainer: {},
  freeBadgeContainer: {},
  founderThanksMessage: {}
});

export default FeedbackScreen;