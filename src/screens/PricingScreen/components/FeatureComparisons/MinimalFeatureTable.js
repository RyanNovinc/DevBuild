// src/screens/PricingScreen/components/FeatureComparisons/MinimalFeatureTable.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MinimalFeatureTable = ({ theme, isLifetimeMember, responsive = {} }) => {
  const [expandedSections, setExpandedSections] = useState({});
  
  // Toggle section expansion
  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Simplified feature data
  const features = [
    {
      key: 'productivity',
      title: 'Productivity Features',
      icon: 'checkmark-circle',
      items: [
        { name: 'Goals', free: '2 active', pro: 'Unlimited' },
        { name: 'Projects', free: '2 per goal', pro: 'Unlimited' },
        { name: 'Tasks', free: '5 per project', pro: 'Unlimited' },
        { name: 'Time Blocks', free: '5 per week', pro: 'Unlimited' },
        { name: 'To-Do Lists', free: '10 active', pro: 'Unlimited' },
      ]
    },
    {
      key: 'planning',
      title: 'Planning & Scheduling',
      icon: 'calendar',
      items: [
        { name: 'Planning Horizon', free: '2 weeks', pro: '12 months' },
        { name: 'Recurring Tasks', free: 'Weekly', pro: 'Daily, Weekly, Monthly' },
        { name: 'Calendar Views', free: 'Day view', pro: 'All views' },
        { name: 'PDF Export', free: 'With watermark', pro: 'Professional' },
      ]
    },
    {
      key: 'customization',
      title: 'Customization',
      icon: 'color-palette',
      items: [
        { name: 'Theme Colors', free: '3 colors', pro: '10+ colors' },
        { name: 'Dashboard Widgets', free: '2 widgets', pro: 'All widgets' },
        { name: 'Custom Layouts', free: 'Basic', pro: 'Advanced' },
      ]
    },
    {
      key: 'ai',
      title: 'AI Features',
      icon: 'sparkles',
      items: [
        { name: 'AI Credits Bonus', free: 'None', pro: '600 credits' },
        { name: 'Referral Credits', free: 'None', pro: '500 per referral' },
        { name: 'Early Access', free: 'No', pro: 'Yes' },
      ]
    }
  ];

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: theme.background,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{
        paddingHorizontal: 16,
        paddingVertical: 20,
      }}>

        {/* Simple Header */}
        <View style={{
          marginBottom: 24,
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: '300',
            color: theme.text,
            textAlign: 'center',
            letterSpacing: 0.5,
          }}>
            What's Included
          </Text>
        </View>

        {/* Feature Sections */}
        {features.map((section, index) => {
          const isExpanded = expandedSections[section.key] !== false; // Default to expanded
          
          return (
            <View
              key={section.key}
              style={{
                backgroundColor: '#000000',
                borderRadius: 12,
                marginBottom: 12,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.05)',
              }}
            >
              {/* Section Header */}
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 16,
                }}
                onPress={() => toggleSection(section.key)}
                activeOpacity={0.7}
              >
                <View style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12,
                }}>
                  <Ionicons 
                    name={section.icon} 
                    size={18} 
                    color="#FFFFFF"
                  />
                </View>
                <Text style={{
                  flex: 1,
                  fontSize: 15,
                  fontWeight: '500',
                  color: '#FFFFFF',
                }}>
                  {section.title}
                </Text>
                <Ionicons 
                  name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                  size={18} 
                  color="rgba(255,255,255,0.4)"
                />
              </TouchableOpacity>

              {/* Section Items */}
              {isExpanded && (
                <View style={{
                  paddingHorizontal: 16,
                  paddingBottom: 8,
                }}>
                  {section.items.map((item, itemIndex) => (
                    <View
                      key={itemIndex}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 12,
                        borderTopWidth: itemIndex > 0 ? 1 : 0,
                        borderTopColor: 'rgba(255,255,255,0.05)',
                      }}
                    >
                      <Text style={{
                        flex: 1,
                        fontSize: 13,
                        color: 'rgba(255,255,255,0.8)',
                      }}>
                        {item.name}
                      </Text>
                      <View style={{
                        width: 80,
                        alignItems: 'center',
                      }}>
                        <Text style={{
                          fontSize: 12,
                          color: 'rgba(255,255,255,0.4)',
                          textAlign: 'center',
                        }}>
                          {item.free}
                        </Text>
                      </View>
                      <View style={{
                        width: 100,
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent: 'center',
                      }}>
                        <Text style={{
                          fontSize: 12,
                          color: isLifetimeMember ? '#4CAF50' : '#FFFFFF',
                          fontWeight: '500',
                          textAlign: 'center',
                        }}>
                          {item.pro}
                        </Text>
                        {item.free !== item.pro && (
                          <View style={{
                            marginLeft: 4,
                          }}>
                            <Ionicons 
                              name="checkmark-circle" 
                              size={14} 
                              color={isLifetimeMember ? '#4CAF50' : 'rgba(255,255,255,0.6)'}
                            />
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}

      </View>
    </ScrollView>
  );
};

export default MinimalFeatureTable;