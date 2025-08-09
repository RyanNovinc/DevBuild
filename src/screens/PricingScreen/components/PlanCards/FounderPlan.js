// src/screens/PricingScreen/components/PlanCards/FounderPlan.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, LayoutAnimation, Platform, UIManager, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../../styles';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FounderPlan = ({ 
  theme, 
  selectedPlan, 
  handleSelectPlan, 
  isLifetimeMember, 
  handlePurchase,
  responsive = {}
}) => {
  // State for expandable details
  const [showDetails, setShowDetails] = useState(false);
  
  // Animation values for glow effect only (keep the border glow, remove badge animation)
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  // Set up glow animation only
  useEffect(() => {
    // Glow effect animation - keep this as it works well
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
          easing: Easing.inOut(Easing.quad)
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
          easing: Easing.inOut(Easing.quad)
        })
      ])
    ).start();
  }, []);
  
  // Toggle details section with animation
  const toggleDetails = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowDetails(!showDetails);
  };
  
  // Determine if this plan is selected
  const isSelected = selectedPlan === 'founding';
  
  // Get responsive values
  const { isTablet } = responsive;
  
  // Calculate width based on device size
  const cardWidth = isTablet ? '75%' : '90%';
  
  // Card background color based on selection state
  const cardBackgroundColor = isSelected ? '#3F51B5' : theme.card;
  
  // Main text color based on selection state
  const textColor = isSelected ? '#FFFFFF' : theme.text;
  
  // Secondary text color based on selection state
  const secondaryTextColor = isSelected ? 'rgba(255, 255, 255, 0.7)' : theme.textSecondary;
  
  // Calculate the shadow radius for the glow effect
  const shadowRadius = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [3, 15]
  });
  
  // Calculate the shadow opacity for the glow effect
  const shadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.8]
  });
  
  // Calculate the border color intensity
  const borderColorInterpolation = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#D4AF37', '#FFD700']
  });
  
  // Status badge component - now completely static
  const StatusBadge = () => (
    <View style={{
      position: 'absolute',
      top: -12,
      left: '50%',
      transform: [
        { translateX: -90 }
      ],
      backgroundColor: '#FFD700',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 3,
      zIndex: 10,
    }}>
      <Text style={{
        fontSize: 12,
        fontWeight: 'bold',
        color: '#000000',
      }}>
        EARLY ADOPTER ADVANTAGE
      </Text>
    </View>
  );
  
  return (
    <View style={{
      width: cardWidth,
      alignSelf: 'center',
      marginVertical: 10,
      position: 'relative'
    }}>
      {/* Add status badge */}
      <StatusBadge />
      
      {/* Main card with animated border glow */}
      <Animated.View
        style={{
          backgroundColor: cardBackgroundColor,
          borderWidth: 3,
          borderColor: borderColorInterpolation,
          borderRadius: 16,
          shadowColor: '#FFD700',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity,
          shadowRadius,
          elevation: Platform.OS === 'android' ? 8 : 0,
          overflow: 'hidden'
        }}
      >
        <TouchableOpacity
          style={{
            padding: 20,
            paddingBottom: 25,
            height: showDetails ? 'auto' : 540,
            opacity: isLifetimeMember ? 0.7 : 1
          }}
          onPress={() => !isLifetimeMember && handleSelectPlan('founding')}
          activeOpacity={0.9}
          accessible={true}
          accessibilityRole="button"
          accessibilityState={{ selected: isSelected }}
          accessibilityLabel="Founder's Access Plan"
          accessibilityHint="Select the Founder's Access Plan for lifetime access"
        >
          {/* Header with title and icons */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 5,
            marginBottom: 16
          }}>
            <Ionicons 
              name="trophy" 
              size={24} 
              color="#FFD700"
              style={{ marginRight: 10 }}
            />
            
            <Text style={{
              fontSize: 26,
              fontWeight: 'bold',
              color: textColor,
              textAlign: 'center'
            }}>
              Founder's Access
            </Text>
            
            <Ionicons 
              name="trophy" 
              size={24} 
              color="#FFD700"
              style={{ marginLeft: 10 }}
            />
          </View>
          
          {/* ONE-TIME PAYMENT tag */}
          <View style={{
            backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.15)' : 'rgba(63, 81, 181, 0.1)',
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 8,
            marginBottom: 16,
            alignSelf: 'center'
          }}>
            <Text style={{
              fontWeight: 'bold',
              color: isSelected ? '#FFFFFF' : '#3F51B5',
              fontSize: 14,
              textAlign: 'center'
            }}>
              ONE-TIME PAYMENT • LIFETIME ACCESS
            </Text>
          </View>
          
          {/* Price section */}
          <View style={{
            alignItems: 'center',
            marginBottom: 28
          }}>
            <Text style={{
              fontSize: 16,
              color: secondaryTextColor,
              textDecorationLine: 'line-through',
              marginBottom: 4
            }}>
              Regular price: $4.99/month
            </Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{
                fontSize: 32,
                fontWeight: 'bold',
                color: textColor,
                textAlign: 'center'
              }}>
                $4.99
              </Text>
              <Text style={{
                fontSize: 12,
                fontWeight: '600',
                color: textColor,
                marginLeft: 8,
                opacity: 0.7
              }}>
                One Time Purchase
              </Text>
            </View>
            
            <Text style={{
              fontSize: 14,
              fontWeight: 'bold',
              color: isSelected ? '#FFD700' : '#FF9800',
              marginTop: 6
            }}>
              Limited time founder's offer!
            </Text>
          </View>
          
          {/* Key benefits */}
          <View style={{
            marginBottom: 20,
            marginHorizontal: 10
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 8
            }}>
              <Ionicons 
                name="infinite" 
                size={22} 
                color={isSelected ? '#FFFFFF' : '#3F51B5'}
              />
              <Text style={{
                color: textColor,
                fontWeight: '500',
                marginLeft: 12,
                fontSize: 16,
                flex: 1
              }}>
                Pro features other users will pay monthly for
              </Text>
            </View>
            
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 8
            }}>
              <Ionicons 
                name="arrow-up-circle" 
                size={22} 
                color={isSelected ? '#FFFFFF' : '#3F51B5'}
              />
              <Text style={{
                color: textColor,
                fontWeight: '500',
                marginLeft: 12,
                fontSize: 16,
                flex: 1
              }}>
                First access to all new features and updates
              </Text>
            </View>
            
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 8
            }}>
              <Ionicons 
                name="gift" 
                size={22} 
                color={isSelected ? '#FFD700' : '#FF9800'}
              />
              <Text style={{
                color: textColor,
                fontWeight: '500',
                marginLeft: 12,
                fontSize: 16,
                flex: 1
              }}>
                1 month of AI Light free ($2.99 value)
              </Text>
            </View>
            
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 8
            }}>
              <Ionicons 
                name="people" 
                size={22} 
                color={isSelected ? '#FFD700' : '#FF9800'}
              />
              <Text style={{
                color: textColor,
                fontWeight: '500',
                marginLeft: 12,
                fontSize: 16,
                flex: 1
              }}>
                Exclusive influence on product roadmap
              </Text>
            </View>
          </View>
          
          {/* "See all features" button */}
          <TouchableOpacity 
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 10,
              marginHorizontal: 24,
              marginBottom: 20,
              backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.15)' : 'rgba(63, 81, 181, 0.08)',
              borderRadius: 8
            }}
            onPress={toggleDetails}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={showDetails ? "Hide details" : "See all features"}
            accessibilityHint={showDetails ? "Collapse the detailed feature list" : "Expand to see more features"}
          >
            <Text style={{
              color: textColor,
              marginRight: 6,
              fontSize: 14,
              fontWeight: '500'
            }}>
              {showDetails ? 'Hide details' : 'See all features'}
            </Text>
            <Ionicons 
              name={showDetails ? 'chevron-up' : 'chevron-down'} 
              size={16} 
              color={textColor}
            />
          </TouchableOpacity>
          
          {/* Expandable details section */}
          {showDetails && (
            <View style={{
              marginTop: 5,
              marginBottom: 20
            }}>
              <View style={{
                height: 1,
                backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.05)',
                marginVertical: 12,
                width: '100%'
              }} />
              
              {/* Premium App Features section */}
              <Text style={{
                fontSize: 13,
                fontWeight: '700',
                color: secondaryTextColor,
                marginBottom: 10,
                marginTop: 6
              }}>
                PREMIUM APP ADVANTAGES:
              </Text>
              
              <View style={{ marginLeft: 10 }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 5
                }}>
                  <Ionicons 
                    name="checkmark-circle" 
                    size={16} 
                    color={isSelected ? '#FFFFFF' : '#3F51B5'}
                  />
                  <Text style={{
                    color: textColor,
                    fontSize: 14,
                    marginLeft: 10,
                    flex: 1
                  }}>
                    Unlimited goals, projects & tasks
                  </Text>
                </View>
                
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 5
                }}>
                  <Ionicons 
                    name="checkmark-circle" 
                    size={16} 
                    color={isSelected ? '#FFFFFF' : '#3F51B5'}
                  />
                  <Text style={{
                    color: textColor,
                    fontSize: 14,
                    marginLeft: 10,
                    flex: 1
                  }}>
                    Unlimited time blocks & todos
                  </Text>
                </View>
                
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 5
                }}>
                  <Ionicons 
                    name="checkmark-circle" 
                    size={16} 
                    color={isSelected ? '#FFFFFF' : '#3F51B5'}
                  />
                  <Text style={{
                    color: textColor,
                    fontSize: 14,
                    marginLeft: 10,
                    flex: 1
                  }}>
                    PDF exports for week/month views
                  </Text>
                </View>
                
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 5
                }}>
                  <Ionicons 
                    name="checkmark-circle" 
                    size={16} 
                    color={isSelected ? '#FFFFFF' : '#3F51B5'}
                  />
                  <Text style={{
                    color: textColor,
                    fontSize: 14,
                    marginLeft: 10,
                    flex: 1
                  }}>
                    All widgets (current & future)
                  </Text>
                </View>
              </View>
              
              {/* Founder Exclusives section */}
              <Text style={{
                fontSize: 13,
                fontWeight: '700',
                color: isSelected ? '#FFD700' : '#FF9800',
                marginBottom: 10,
                marginTop: 16
              }}>
                FOUNDER PRIVILEGES:
              </Text>
              
              <View style={{ marginLeft: 10 }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 5
                }}>
                  <Ionicons 
                    name="ribbon" 
                    size={16} 
                    color={isSelected ? '#FFD700' : '#FF9800'}
                  />
                  <Text style={{
                    color: textColor,
                    fontSize: 14,
                    marginLeft: 10,
                    flex: 1
                  }}>
                    Permanent Founder's Badge visible to all users
                  </Text>
                </View>
                
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 5
                }}>
                  <Ionicons 
                    name="flash" 
                    size={16} 
                    color={isSelected ? '#FFD700' : '#FF9800'}
                  />
                  <Text style={{
                    color: textColor,
                    fontSize: 14,
                    marginLeft: 10,
                    flex: 1
                  }}>
                    First access to beta features before public release
                  </Text>
                </View>
                
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 5
                }}>
                  <Ionicons 
                    name="people" 
                    size={16} 
                    color={isSelected ? '#FFD700' : '#FF9800'}
                  />
                  <Text style={{
                    color: textColor,
                    fontSize: 14,
                    marginLeft: 10,
                    flex: 1
                  }}>
                    Refer friends for mutual benefits - you both save 50% of AI plans
                  </Text>
                </View>
              </View>
            </View>
          )}
          
          <View style={{ flex: 1 }} />
          
          {/* Limited availability alert */}
          <View style={{
            backgroundColor: '#FF5722',
            paddingHorizontal: 12,
            paddingVertical: 5,
            borderRadius: 4,
            marginTop: 'auto',
            alignSelf: 'center'
          }}>
            <Text style={{
              color: '#FFFFFF',
              fontSize: 11,
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              FIRST 1,000 USERS ONLY
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default FounderPlan;