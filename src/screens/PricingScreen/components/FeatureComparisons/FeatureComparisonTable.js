// src/screens/PricingScreen/components/FeatureComparisons/FeatureComparisonTable.js
import React from 'react';
import { View, Text, StyleSheet, Dimensions, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FeatureComparisonTable = ({ theme, isLifetimeMember, responsive = {} }) => {
  // Get screen dimensions directly to ensure we have the latest
  const { width: screenWidth } = useWindowDimensions();
  const isSmallScreen = screenWidth < 360;
  
  // Use responsive width if provided, otherwise use screen width with minimal padding
  const tableWidth = responsive.width || screenWidth - 16;
  
  // Get the appropriate icon for each feature category
  const getCategoryIcon = (category) => {
    switch(category) {
      case "Core Structure": return "git-branch";
      case "Time Management": return "time";
      case "Organization": return "list";
      case "User Experience": return "color-palette";
      case "AI Assistant": return "sparkles";
      default: return "checkmark-circle";
    }
  };

  // Feature comparison data
  const featureGroups = [
    {
      title: "Core Structure",
      icon: "git-branch",
      color: "#FF9800",
      features: [
        { name: "Life Direction", free: "1", premium: "1" },
        { name: "Goals", free: "2 active, 2 completed", premium: "Unlimited" },
        { name: "Projects", free: "2 per goal", premium: "Unlimited" },
        { name: "Tasks", free: "5 per project", premium: "Unlimited" },
      ]
    },
    {
      title: "Time Management",
      icon: "time",
      color: "#4CAF50",
      features: [
        { name: "Time Blocks", free: "5 per week", premium: "Unlimited" },
        { name: "Planning Horizon", free: "2 weeks ahead", premium: "12 months ahead" },
        { name: "Repeating Options", free: "Weekly only", premium: "Daily, Weekly, Monthly" },
        { name: "Calendar Views", free: "Day view (full)\nWeek/Month (limited)", premium: "All views fully accessible" }
      ]
    },
    {
      title: "Organization",
      icon: "list",
      color: "#03A9F4",
      features: [
        { name: "To-Do Lists", free: "10-7-5 Active", premium: "Unlimited" },
        { name: "Notes", free: "Unlimited", premium: "Unlimited" },
      ]
    },
    {
      title: "User Experience",
      icon: "color-palette",
      color: "#9C27B0",
      features: [
        { name: "Theme Colors", free: "Blue, Charcoal, Green", premium: "All 10 colors" },
        { name: "Dashboard Widgets", free: "2 widgets", premium: "All widgets" },
        { name: "PDF Export", free: "Day view with watermark", premium: "Professional export" },
      ]
    },
    {
      title: "AI Assistant",
      icon: "sparkles",
      color: "#673AB7",
      features: [
        { name: "AI Credits", free: "Free AI sample", premium: "1-month free AI" },
        { name: "AI Plans", free: "Regular price", premium: "Regular price" },
      ]
    }
  ];
  
  // Render a feature group card
  const renderFeatureGroupCard = (group, groupIndex) => {
    return (
      <View 
        key={`group-${groupIndex}`} 
        style={[styles.cardContainer, { 
          backgroundColor: theme.card,
          shadowColor: theme.text,
          marginBottom: groupIndex === featureGroups.length - 1 ? 0 : 16,
          width: '100%'
        }]}
      >
        <View style={[styles.cardHeader, { backgroundColor: theme.cardElevated }]}>
          <View style={[styles.iconCircle, { backgroundColor: group.color + '20' }]}>
            <Ionicons name={group.icon} size={20} color={group.color} />
          </View>
          <Text style={[styles.categoryTitle, { color: theme.text }]}>{group.title}</Text>
        </View>
        
        <View style={styles.cardContent}>
          {group.features.map((feature, featureIndex) => {
            const isPremiumOnly = feature.free !== feature.premium;
            
            return (
              <View 
                key={`feature-${groupIndex}-${featureIndex}`}
                style={[
                  styles.featureRow,
                  featureIndex < group.features.length - 1 && { 
                    borderBottomWidth: 1, 
                    borderBottomColor: 'rgba(0,0,0,0.06)' 
                  }
                ]}
              >
                <View style={styles.featureNameContainer}>
                  <Text style={[styles.featureName, { color: theme.text }]}>
                    {feature.name}
                  </Text>
                </View>
                
                <View style={styles.freeValueContainer}>
                  <View style={styles.valueInnerContainer}>
                    <Text 
                      style={[styles.planValue, { color: theme.textSecondary }]}
                    >
                      {feature.free}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.premiumValueContainer}>
                  <View style={styles.valueInnerContainer}>
                    <Text 
                      style={[
                        styles.premiumValue, 
                        { color: isLifetimeMember ? '#4CAF50' : theme.text }
                      ]}
                    >
                      {feature.premium}
                    </Text>
                    
                    {isPremiumOnly && (
                      <View style={[styles.starBadge, { 
                        backgroundColor: isLifetimeMember ? '#4CAF5020' : theme.primary + '20' 
                      }]}>
                        <Ionicons 
                          name="star" 
                          size={12} 
                          color={isLifetimeMember ? '#4CAF50' : theme.primary} 
                        />
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };
  
  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: theme.background,
        width: tableWidth
      }
    ]}>
      <View style={[styles.titleContainer, { backgroundColor: theme.primary }]}>
        <Text style={styles.titleText}>Feature Comparison</Text>
      </View>
      
      <View style={styles.headerRow}>
        <View style={styles.featureHeaderColumn}>
          <Text style={[styles.headerText, { color: theme.textSecondary }]}>Feature</Text>
        </View>
        <View style={styles.freeHeaderColumn}>
          <Text style={[styles.headerText, { color: theme.textSecondary }]}>Free</Text>
        </View>
        <View style={styles.premiumHeaderColumn}>
          <Text style={[styles.headerText, { 
            color: isLifetimeMember ? '#4CAF50' : theme.primary,
            fontWeight: '700'
          }]}>
            Founder's
          </Text>
        </View>
      </View>
      
      <View style={styles.cardsContainer}>
        {featureGroups.map(renderFeatureGroupCard)}
      </View>
      
      <View style={[styles.footer, { backgroundColor: theme.cardElevated }]}>
        <Text style={[styles.footerText, { color: theme.textSecondary }]}>
          * Founder's Access is a one-time payment of $4.99
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    alignSelf: 'center', // Center the table
  },
  titleContainer: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 6,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  featureHeaderColumn: {
    flex: 45,
    paddingLeft: 10,
  },
  freeHeaderColumn: {
    flex: 25,
    alignItems: 'center',
  },
  premiumHeaderColumn: {
    flex: 30,
    alignItems: 'center',
  },
  cardsContainer: {
    padding: 16,
    paddingTop: 8,
    width: '100%',
  },
  cardContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardContent: {
    paddingHorizontal: 0,
    width: '100%',
  },
  featureRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    minHeight: 70,
    width: '100%',
  },
  featureNameContainer: {
    flex: 45,
    paddingRight: 6,
    justifyContent: 'center',
    minHeight: 50,
  },
  featureName: {
    fontSize: 14,
    fontWeight: '500',
  },
  freeValueContainer: {
    flex: 25,
    justifyContent: 'center',
    paddingHorizontal: 2,
    minHeight: 50,
  },
  valueInnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '100%',
    flexDirection: 'row',
  },
  premiumValueContainer: {
    flex: 30,
    backgroundColor: 'rgba(0,0,0,0.01)',
    borderRadius: 6,
    padding: 8,
    paddingRight: 12,
    minHeight: 50,
    justifyContent: 'center',
  },
  planValue: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  premiumValue: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
    lineHeight: 18,
  },
  starBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  footer: {
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  footerText: {
    fontSize: 13,
    fontStyle: 'italic',
  }
});

export default FeatureComparisonTable;