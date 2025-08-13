// SubscriptionPlans.js - Post-founder regular subscription pricing
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';

const SubscriptionPlans = ({ selectedPlan, handleSelectPlan, billing, setBilling, highlightPlan, pulseCredits }) => {
  const subscription = billing || 'monthly';
  const setSubscription = setBilling || (() => {});
  const navigation = useNavigation();

  // Modal state for guarantee info
  const [showGuaranteeInfo, setShowGuaranteeInfo] = useState(false);
  const [guaranteeDetailsView, setGuaranteeDetailsView] = useState('main'); // 'main' or 'details'

  // Animation for highlighting
  const highlightAnim = useRef(new Animated.Value(0)).current;
  
  // Animation for pulsating
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    if (highlightPlan) {
      // Start highlight animation - 3 cycles ending on dim
      Animated.sequence([
        Animated.timing(highlightAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
        Animated.timing(highlightAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: false,
        }),
        Animated.timing(highlightAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
        Animated.timing(highlightAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: false,
        }),
        Animated.timing(highlightAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
        Animated.timing(highlightAnim, {
          toValue: 1, // End at bright state
          duration: 600,
          useNativeDriver: false,
        })
      ]).start();
    }
  }, [highlightPlan]);

  // Helper function to add commas to numbers
  const formatNumber = (num) => {
    return num.toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',');
  };

  const CardTemplate = ({ id, name, icon, description, features, popular, monthlyPrice, annualPrice }) => {
    const isSelected = selectedPlan === id;
    const price = subscription === 'annual' ? annualPrice : monthlyPrice;
    const period = subscription === 'annual' ? '/year' : '/month';
    
    // Determine haptic feedback intensity based on plan
    const getHapticFeedback = () => {
      switch(id) {
        case 'basic': return Haptics.ImpactFeedbackStyle.Light;
        case 'pro': return Haptics.ImpactFeedbackStyle.Medium;
        case 'premium': return Haptics.ImpactFeedbackStyle.Heavy;
        default: return Haptics.ImpactFeedbackStyle.Light;
      }
    };

    const shouldHighlight = highlightPlan === id;
    
    // Interpolate highlight animation
    const highlightBorderColor = highlightAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [
        'rgba(255,255,255,0.15)',
        'rgba(255,255,255,0.8)'
      ]
    });
    
    // Determine border color
    let borderColor;
    if (shouldHighlight) {
      borderColor = highlightBorderColor;
    } else if (isSelected) {
      borderColor = 'rgba(255,255,255,0.4)';
    } else {
      borderColor = 'rgba(255,255,255,0.15)';
    }
    
    return (
      <Animated.View
        style={{
          backgroundColor: '#000000',
          borderRadius: 18,
          padding: 32,
          marginRight: 20,
          width: 300,
          height: 380,
          borderWidth: 2,
          borderColor: borderColor,
          position: 'relative',
        }}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => {
            Haptics.impactAsync(getHapticFeedback());
            handleSelectPlan(id);
          }}
          activeOpacity={0.7}
        >
          {popular && (
            <View style={{
              position: 'absolute',
              top: 0,
              right: 20,
              backgroundColor: '#FFD700',
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 12,
            }}>
              <Text style={{
                fontSize: 10,
                fontWeight: '700',
                color: '#000000',
                letterSpacing: 0.5,
              }}>
                MOST POPULAR
              </Text>
            </View>
          )}

          <View style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.05)',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <Ionicons 
              name={icon} 
              size={22} 
              color="#FFFFFF"
            />
          </View>

          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: '#FFFFFF',
            marginBottom: 4,
          }}>
            {name}
          </Text>

          <Text style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.5)',
            marginBottom: 16,
          }}>
            {description}
          </Text>

          <View style={{
            flexDirection: 'row',
            alignItems: 'baseline',
            marginBottom: 20,
          }}>
            <Text style={{
              fontSize: 28,
              fontWeight: '300',
              color: '#FFFFFF',
            }}>
              {price}
            </Text>
            <Text style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.4)',
              marginLeft: 4,
            }}>
              {period}
            </Text>
          </View>

          <View style={{ marginBottom: 40 }}>
            {features.map((feature, index) => (
              <View 
                key={index} 
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <Ionicons 
                  name="checkmark" 
                  size={14} 
                  color="rgba(255,255,255,0.6)"
                  style={{ marginRight: 8 }}
                />
                <Text style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.7)',
                }}>
                  {feature}
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: isSelected ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
              borderRadius: 10,
              paddingVertical: 10,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: isSelected ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)',
            }}
            onPress={() => {
              Haptics.impactAsync(getHapticFeedback());
              handleSelectPlan(id);
            }}
          >
            <Text style={{
              fontSize: 13,
              fontWeight: '600',
              color: isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
            }}>
              {isSelected ? 'Selected' : 'Select'}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={{ paddingHorizontal: 0, paddingVertical: 0, marginTop: 0, width: '100%' }}>
      {/* Billing Toggle */}
      <View style={{
        backgroundColor: '#000000',
        borderRadius: 12,
        padding: 4,
        flexDirection: 'row',
        marginBottom: 16,
        marginTop: 12,
        alignSelf: 'center',
        width: '85%',
      }}>
        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 10,
            backgroundColor: subscription === 'monthly' ? 'rgba(255,255,255,0.1)' : 'transparent',
          }}
          onPress={() => setSubscription('monthly')}
        >
          <Text style={{
            textAlign: 'center',
            fontSize: 14,
            fontWeight: '600',
            color: subscription === 'monthly' ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
          }}>
            Monthly
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 10,
            backgroundColor: subscription === 'annual' ? 'rgba(255,255,255,0.1)' : 'transparent',
          }}
          onPress={() => setSubscription('annual')}
        >
          <View style={{ alignItems: 'center' }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: subscription === 'annual' ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
            }}>
              Annual
            </Text>
            <Text style={{
              fontSize: 11,
              color: subscription === 'annual' ? '#FFD700' : 'transparent',
              marginTop: 2,
              height: 14, // Reserve consistent height
              fontWeight: '600',
            }}>
              2 months free
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 3 SUBSCRIPTION PLANS */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
        style={{ marginHorizontal: -16, marginTop: -8 }}
      >
        <View style={{ flexDirection: 'row', paddingLeft: 16 }}>
        
          <CardTemplate 
            id="basic"
            name="LifeCompass Basic"
            icon="leaf-outline"
            description="Full app + AI Light included"
            features={[
              'All core app features',
              'Standard user context*',
              'Basic AI assistance',
              'For personal use'
            ]}
            popular={false}
            monthlyPrice="$3.49"
            annualPrice="$34.99"
          />
          
          <CardTemplate 
            id="pro"
            name="LifeCompass Pro"
            icon="compass-outline"
            description="Full app + AI Plus included"
            features={[
              'Everything in Basic',
              'Additional user context* (2x)',
              'More daily usage (3x Basic)',
              'For daily users'
            ]}
            popular={true}
            monthlyPrice="$4.99"
            annualPrice="$49.99"
          />
          
          <CardTemplate 
            id="premium"
            name="LifeCompass Premium"
            icon="diamond-outline"
            description="Full app + AI Max included"
            features={[
              'Everything in Pro',
              'Maximum user context* (7x)',
              'Heavy usage capacity (10x Basic)',
              'For power users'
            ]}
            popular={false}
            monthlyPrice="$9.99"
            annualPrice="$99.99"
          />
        </View>
      </ScrollView>

      <View style={{
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        paddingHorizontal: 20,
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8,
        }}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowGuaranteeInfo(true);
            }}
            activeOpacity={0.7}
          >
            <Text style={{
              fontSize: 11,
              color: '#4CAF50',
              textAlign: 'center',
              textDecorationLine: 'underline',
              textDecorationColor: '#4CAF50',
            }}>
              30-day money-back guarantee
            </Text>
          </TouchableOpacity>
          <Text style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.6)',
            textAlign: 'center',
          }}>
            {' '}• Cancel anytime • 
          </Text>
          <Ionicons 
            name="shield-checkmark" 
            size={12} 
            color="rgba(255,255,255,0.6)"
            style={{ marginLeft: 4, marginRight: 2 }}
          />
          <Text style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.6)',
            textAlign: 'center',
          }}>
            Secure billing
          </Text>
        </View>
        
        <Text style={{
          fontSize: 10,
          color: 'rgba(255,255,255,0.4)',
          textAlign: 'center',
          fontStyle: 'italic',
          lineHeight: 14,
        }}>
          *Context refers to how much AI knows about your goals, milestones, tasks and any documents you upload (resumes, personality tests) to help with your planning.
        </Text>
      </View>

      {/* Founder Access Sold Out Message */}
      <View style={{
        marginTop: 32,
        marginHorizontal: 20,
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(255,215,0,0.05)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,215,0,0.2)',
        alignItems: 'center',
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 8,
        }}>
          <Ionicons 
            name="star" 
            size={16} 
            color="#FFD700"
            style={{ marginRight: 8 }}
          />
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: '#FFD700',
          }}>
            Founder Access: SOLD OUT
          </Text>
        </View>
        <Text style={{
          fontSize: 12,
          color: 'rgba(255,255,255,0.7)',
          textAlign: 'center',
          lineHeight: 16,
        }}>
          Join 1,000+ founding members already building better lives with LifeCompass
        </Text>
      </View>

      {/* Guarantee Info Modal */}
      <Modal
        visible={showGuaranteeInfo}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowGuaranteeInfo(false)}
      >
        <TouchableOpacity 
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.95)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20,
          }}
          activeOpacity={1}
          onPress={() => setShowGuaranteeInfo(false)}
        >
          <TouchableOpacity 
            activeOpacity={1}
            style={{
              backgroundColor: '#000000',
              borderRadius: 20,
              padding: 24,
              width: '100%',
              maxWidth: 340,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.1)',
            }}
          >
            {/* Header */}
            <View style={{
              alignItems: 'center',
              marginBottom: 20,
            }}>
              <Ionicons 
                name="checkmark-circle" 
                size={32} 
                color="#4CAF50"
                style={{ marginBottom: 8 }}
              />
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#FFFFFF',
                textAlign: 'center',
              }}>
                30-DAY MONEY BACK GUARANTEE
              </Text>
            </View>
            {/* Divider */}
            <View style={{
              height: 1,
              backgroundColor: 'rgba(255,255,255,0.1)',
              marginBottom: 20,
            }} />
            
            {/* Content */}
            {guaranteeDetailsView === 'main' ? (
              // Main View - Clean and Simple
              <View style={{ alignItems: 'center' }}>
                <Text style={{
                  fontSize: 14,
                  color: 'rgba(255,255,255,0.8)',
                  lineHeight: 20,
                  textAlign: 'center',
                  marginBottom: 24,
                  fontWeight: '400',
                }}>
                  Not 100% satisfied with your LifeCompass subscription?
                </Text>
                {/* Benefits List */}
                <View style={{
                  backgroundColor: 'rgba(75, 181, 67, 0.05)',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 24,
                  width: '100%',
                  borderWidth: 1,
                  borderColor: 'rgba(75, 181, 67, 0.1)',
                }}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}>
                    <Ionicons 
                      name="checkmark-circle" 
                      size={16} 
                      color="#4CAF50"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={{
                      fontSize: 13,
                      color: 'rgba(255,255,255,0.8)',
                      fontWeight: '500',
                      flex: 1,
                    }}>
                      Get all your money back
                    </Text>
                  </View>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}>
                    <Ionicons 
                      name="checkmark-circle" 
                      size={16} 
                      color="#4CAF50"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={{
                      fontSize: 13,
                      color: 'rgba(255,255,255,0.8)',
                      fontWeight: '500',
                      flex: 1,
                    }}>
                      Keep access for full month
                    </Text>
                  </View>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}>
                    <Ionicons 
                      name="checkmark-circle" 
                      size={16} 
                      color="#4CAF50"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={{
                      fontSize: 13,
                      color: 'rgba(255,255,255,0.8)',
                      fontWeight: '500',
                      flex: 1,
                    }}>
                      Quick & fair process
                    </Text>
                  </View>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                    <Ionicons 
                      name="checkmark-circle" 
                      size={16} 
                      color="#4CAF50"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={{
                      fontSize: 13,
                      color: 'rgba(255,255,255,0.8)',
                      fontWeight: '500',
                      flex: 1,
                    }}>
                      30-day refund window
                    </Text>
                  </View>
                </View>
                {/* Button Row */}
                <View style={{
                  flexDirection: 'row',
                  width: '100%',
                  gap: 12,
                }}>
                  <TouchableOpacity
                    onPress={() => setGuaranteeDetailsView('details')}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      borderRadius: 20,
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.1)',
                    }}
                  >
                    <Text style={{
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.8)',
                      fontWeight: '500',
                      textAlign: 'center',
                    }}>
                      How it works
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setShowGuaranteeInfo(false)}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      borderRadius: 20,
                      backgroundColor: '#4CAF50',
                    }}
                  >
                    <Text style={{
                      fontSize: 12,
                      color: '#FFFFFF',
                      fontWeight: '600',
                      textAlign: 'center',
                    }}>
                      Got it
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              // Details View - How to Request
              <View style={{ alignItems: 'center' }}>
                <Text style={{
                  fontSize: 14,
                  color: 'rgba(255,255,255,0.8)',
                  lineHeight: 20,
                  textAlign: 'center',
                  marginBottom: 24,
                  fontWeight: '400',
                }}>
                  How to Request a Refund
                </Text>
                <Text style={{
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.7)',
                  lineHeight: 18,
                  textAlign: 'center',
                  fontWeight: '400',
                  marginBottom: 20,
                }}>
                  Send us{' '}
                  <Text 
                    style={{
                      color: '#4CAF50',
                      textDecorationLine: 'underline',
                      textDecorationColor: '#4CAF50',
                    }}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setShowGuaranteeInfo(false);
                      navigation.navigate('FeedbackScreen', { feedbackType: 'refund' });
                    }}
                  >
                    feedback
                  </Text>
                  {' '}through the app including:
                </Text>
                {/* Requirements List */}
                <View style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 20,
                  width: '100%',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.08)',
                }}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    marginBottom: 12,
                  }}>
                    <Text style={{
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.5)',
                      marginRight: 8,
                      marginTop: 2,
                    }}>
                      •
                    </Text>
                    <Text style={{
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.8)',
                      lineHeight: 16,
                      flex: 1,
                    }}>
                      Why LifeCompass didn't meet your expectations
                    </Text>
                  </View>
                  
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    marginBottom: 12,
                  }}>
                    <Text style={{
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.5)',
                      marginRight: 8,
                      marginTop: 2,
                    }}>
                      •
                    </Text>
                    <Text style={{
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.8)',
                      lineHeight: 16,
                      flex: 1,
                    }}>
                      What you were hoping to achieve
                    </Text>
                  </View>
                  
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                  }}>
                    <Text style={{
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.5)',
                      marginRight: 8,
                      marginTop: 2,
                    }}>
                      •
                    </Text>
                    <Text style={{
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.8)',
                      lineHeight: 16,
                      flex: 1,
                    }}>
                      What you would like to see changed
                    </Text>
                  </View>
                </View>
                <Text style={{
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.5)',
                  textAlign: 'center',
                  fontWeight: '400',
                  lineHeight: 14,
                  marginBottom: 24,
                }}>
                  Your{' '}
                  <Text 
                    style={{
                      color: '#4CAF50',
                      textDecorationLine: 'underline',
                      textDecorationColor: '#4CAF50',
                    }}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setShowGuaranteeInfo(false);
                      navigation.navigate('FeedbackScreen', { feedbackType: 'refund' });
                    }}
                  >
                    feedback
                  </Text>
                  {' '}helps us improve • Refunds processed within 24 hours
                </Text>
                {/* Back button only */}
                <TouchableOpacity
                  onPress={() => setGuaranteeDetailsView('main')}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 24,
                    borderRadius: 20,
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.1)',
                  }}
                >
                  <Text style={{
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.8)',
                    fontWeight: '500',
                    textAlign: 'center',
                  }}>
                    Back
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default React.memo(SubscriptionPlans);