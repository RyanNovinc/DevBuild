// src/screens/ProfileScreen/FinancialTracker/GoalsTab.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  Modal,
  ScrollView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import responsive utilities
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  spacing,
  fontSizes,
  isSmallDevice,
  isTablet,
  ensureAccessibleTouchTarget,
  useScreenDimensions,
  useSafeSpacing,
  useIsLandscape,
  accessibility
} from '../../../utils/responsive';


const GoalsTab = ({ theme, data, handlers, navigation }) => {
  const [showAddGoalForm, setShowAddGoalForm] = useState(false);
  const [goalFormAnimation] = useState(new Animated.Value(0));
  const [newGoalTitle, setNewGoalTitle] = useState('');
  // Add state for upgrade modal
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');
  
  // Add responsive hooks
  const { width, height } = useScreenDimensions();
  const isLandscape = useIsLandscape();
  const safeSpacing = useSafeSpacing();
  
  const { 
    financialData,
    isDarkMode,
    formatCurrency,
    isPremium // Extract premium status
  } = data;
  
  const {
    handleToggleGoal,
    handleAddGoal,
    handleDeleteGoal
  } = handlers;

  // Show upgrade modal
  const showUpgradePrompt = (message) => {
    setUpgradeMessage(message);
    setShowUpgradeModal(true);
  };

  // Handle navigation to pricing screen
  const goToPricingScreen = () => {
    setShowUpgradeModal(false);
    
    // Use the parent's navigation handler if available
    if (navigation && navigation.navigate) {
      navigation.navigate('PricingScreen');
    }
    else if (handlers && handlers.onNavigateToPricing) {
      handlers.onNavigateToPricing();
    } else {
      // Fallback if navigation handler isn't provided
      Alert.alert('Upgrade to Pro', 'Please upgrade to the lifetime version to access this feature.');
    }
  };

  // Toggle add goal form visibility with animation
  const toggleAddGoalForm = () => {
    // Check premium status
    if (!isPremium) {
      showUpgradePrompt('Upgrade to Lifetime to add financial goals and track your progress.');
      return;
    }
    
    if (showAddGoalForm) {
      // Animate out
      Animated.timing(goalFormAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false
      }).start(() => {
        setShowAddGoalForm(false);
      });
    } else {
      setShowAddGoalForm(true);
      // Animate in
      Animated.timing(goalFormAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false
      }).start();
    }
  };
  
  // Local validation for add goal
  const validateAndAddGoal = () => {
    // Check premium status
    if (!isPremium) {
      showUpgradePrompt('Upgrade to Lifetime to add financial goals and track your progress.');
      return;
    }
    
    if (!newGoalTitle.trim()) {
      Alert.alert('Error', 'Please enter a title for your goal.');
      return;
    }
    
    // Create new goal object
    const newGoal = {
      id: Date.now().toString(),
      title: newGoalTitle,
      completed: false
    };
    
    // Call parent handler to add goal
    if (handleAddGoal) {
      handleAddGoal(newGoal);
    } else {
      // Fallback if handleAddGoal is not provided
      console.warn('handleAddGoal not provided');
    }
    
    // Reset form and close
    setNewGoalTitle('');
    toggleAddGoalForm();
  };

  
  // Wrapper for handleToggleGoal with premium check
  const handleToggleGoalWithPremiumCheck = (goalId) => {
    // Check premium status
    if (!isPremium) {
      showUpgradePrompt('Upgrade to Lifetime to track your financial goals progress.');
      return;
    }
    
    // Call the parent handler
    handleToggleGoal(goalId);
  };
  
  
  // Wrapper for handleDeleteGoal with premium check
  const handleDeleteGoalWithPremiumCheck = (goalId) => {
    // Check premium status
    if (!isPremium) {
      showUpgradePrompt('Upgrade to Lifetime to manage your financial goals.');
      return;
    }
    
    // Call the parent handler
    handleDeleteGoal(goalId);
  };

  return (
    <ScrollView 
      style={[styles.tabContentContainer]} 
      contentInsetAdjustmentBehavior="automatic"
    >
      {/* Financial Goals */}
      <View style={[styles.goalsCard, { 
        backgroundColor: theme.card, 
        borderColor: theme.border
      }]}>
        {/* Redesigned header with more space */}
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Ionicons 
              name="flag-outline" 
              size={scaleWidth(26)} 
              color="#673AB7" 
              style={styles.cardIcon} 
            />
            <Text 
              style={[styles.goalsTitle, { color: theme.text }]}
              maxFontSizeMultiplier={1.5}
            >
              Financial Freedom Goals
            </Text>
          </View>
        </View>
        
        {/* Add disclaimer */}
        <View style={styles.disclaimerContainer}>
          <Text 
            style={[styles.disclaimerText, { color: theme.textSecondary }]}
            maxFontSizeMultiplier={1.2}
          >
            📊 This tool is for personal goal tracking only. We do not provide financial advice. Consult a financial professional for personalized guidance.
          </Text>
        </View>
        
        {/* Add goal button - centered */}
        <View style={styles.goalsActionRow}>
          <TouchableOpacity 
            style={[
              styles.actionButton, 
              { backgroundColor: '#673AB7' },
              ensureAccessibleTouchTarget(scaleWidth(200), scaleHeight(48))
            ]}
            onPress={toggleAddGoalForm}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={showAddGoalForm ? "Cancel adding goal" : "Add Goal"}
            accessibilityHint={showAddGoalForm ? "Cancels adding a new goal" : "Opens form to add a new goal"}
          >
            <Ionicons 
              name={showAddGoalForm ? "remove" : "add"} 
              size={scaleWidth(20)} 
              color="#FFFFFF" 
              style={{marginRight: spacing.xs}}
            />
            <Text 
              style={styles.actionButtonText}
              maxFontSizeMultiplier={1.3}
            >
              {showAddGoalForm ? "Cancel" : "Add Goal"}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Add Goal Form - Collapsible */}
        {showAddGoalForm && (
          <Animated.View 
            style={[
              styles.addGoalForm, 
              { 
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                borderColor: theme.border,
                opacity: goalFormAnimation,
                maxHeight: goalFormAnimation.interpolate({
  inputRange: [0, 1],
  outputRange: [0, Math.round(150)]
}),
                transform: [{
  translateY: goalFormAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [Math.round(-10), 0]
  })
}]
              }
            ]}
          >
            <TextInput
              style={[styles.goalInput, { 
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)',
                color: theme.text,
                borderColor: theme.border
              }]}
              placeholder="Enter your financial goal..."
              placeholderTextColor={theme.textSecondary}
              value={newGoalTitle}
              onChangeText={setNewGoalTitle}
              multiline={true}
              accessible={true}
              accessibilityLabel="Goal description"
              accessibilityHint="Enter the description of your financial goal"
              maxFontSizeMultiplier={1.3}
            />
            
            <TouchableOpacity
              style={[
                styles.addGoalButton, 
                { backgroundColor: '#673AB7' },
                ensureAccessibleTouchTarget(scaleWidth(200), scaleHeight(48))
              ]}
              onPress={validateAndAddGoal}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Add Goal"
              accessibilityHint="Saves this goal to your list"
            >
              <Text 
                style={styles.addGoalButtonText}
                maxFontSizeMultiplier={1.3}
              >
                Add Goal
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
        
        <View style={styles.goalsList}>
          {financialData.goals.length === 0 ? (
            <View style={[styles.emptyGoals, { borderColor: theme.border }]}>
              <Ionicons 
                name="flag-outline" 
                size={scaleWidth(28)} 
                color={theme.textSecondary} 
                style={styles.emptyIcon} 
              />
              <Text 
                style={[styles.emptyText, { color: theme.textSecondary }]}
                maxFontSizeMultiplier={1.3}
              >
                No goals set yet
              </Text>
              <Text 
                style={[styles.emptySubText, { color: theme.textSecondary }]}
                maxFontSizeMultiplier={1.3}
              >
                {!isPremium 
                  ? "Upgrade to Lifetime to add financial goals" 
                  : "Tap the + button to add your own financial goals"}
              </Text>
            </View>
          ) : (
            financialData.goals.map((goal) => (
              <View
                key={goal.id}
                style={[styles.goalItem, { 
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  borderColor: theme.border
                }]}
                accessible={true}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: goal.completed }}
                accessibilityLabel={goal.title}
              >
                <TouchableOpacity
                  style={[
                    styles.goalCheckbox,
                    ensureAccessibleTouchTarget(scaleWidth(300), scaleHeight(60))
                  ]}
                  onPress={() => handleToggleGoalWithPremiumCheck(goal.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={goal.completed ? "checkmark-circle" : "ellipse-outline"} 
                    size={scaleWidth(24)} 
                    color={goal.completed ? '#4CAF50' : theme.textSecondary} 
                  />
                  <Text style={[styles.goalText, { 
                    color: goal.completed ? '#4CAF50' : theme.text,
                    fontWeight: goal.completed ? '600' : 'normal',
                    textDecorationLine: goal.completed ? 'line-through' : 'none'
                  }]}
                  maxFontSizeMultiplier={1.3}
                  >
                    {goal.title}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.deleteGoalButton,
                    ensureAccessibleTouchTarget(scaleWidth(44), scaleHeight(44))
                  ]}
                  onPress={() => handleDeleteGoalWithPremiumCheck(goal.id)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Delete goal"
                  accessibilityHint="Deletes this goal from your list"
                >
                  <Ionicons name="close" size={scaleWidth(20)} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </View>

      
      {/* Upgrade Modal */}
      <Modal
        visible={showUpgradeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowUpgradeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.upgradeModal, 
            { 
              backgroundColor: theme.card,
              marginTop: safeSpacing.top,
              marginBottom: safeSpacing.bottom,
              marginLeft: safeSpacing.left,
              marginRight: safeSpacing.right
            }
          ]}>
            <View style={styles.upgradeModalHeader}>
              <Ionicons name="lock-closed" size={scaleWidth(40)} color="#3F51B5" />
              <Text 
                style={[styles.upgradeModalTitle, { color: theme.text }]}
                maxFontSizeMultiplier={1.3}
              >
                Pro Feature
              </Text>
            </View>
            
            <Text 
              style={[styles.upgradeModalMessage, { color: theme.text }]}
              maxFontSizeMultiplier={1.3}
            >
              {upgradeMessage || "Upgrade to Lifetime to unlock all financial tracking features."}
            </Text>
            
            <TouchableOpacity
              style={[
                styles.upgradeButton, 
                { backgroundColor: '#3F51B5' },
                ensureAccessibleTouchTarget(scaleWidth(220), scaleHeight(50))
              ]}
              onPress={goToPricingScreen}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Upgrade to Lifetime"
              accessibilityHint="Opens the pricing screen to upgrade your subscription"
            >
              <Ionicons name="rocket" size={scaleWidth(20)} color="#FFFFFF" style={{marginRight: spacing.xs}} />
              <Text 
                style={styles.upgradeButtonText}
                maxFontSizeMultiplier={1.3}
              >
                Upgrade to Lifetime
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.laterButton,
                ensureAccessibleTouchTarget(scaleWidth(100), scaleHeight(44))
              ]}
              onPress={() => setShowUpgradeModal(false)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Maybe Later"
              accessibilityHint="Closes the upgrade prompt"
            >
              <Text 
                style={[styles.laterButtonText, { color: theme.textSecondary }]}
                maxFontSizeMultiplier={1.3}
              >
                Maybe Later
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  tabContentContainer: {
    padding: spacing.m,
    paddingTop: 4,
  },
  // Goals Card
  goalsCard: {
    borderRadius: scaleWidth(16),
    padding: spacing.xl,
    marginBottom: spacing.m,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: scaleHeight(200),
  },
  cardHeader: {
    marginBottom: spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    marginRight: spacing.s,
  },
  goalsTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
  },
  disclaimerContainer: {
    backgroundColor: 'rgba(103, 58, 183, 0.1)',
    borderRadius: scaleWidth(8),
    padding: spacing.m,
    marginBottom: spacing.m,
    borderLeftWidth: 3,
    borderLeftColor: '#673AB7',
  },
  disclaimerText: {
    fontSize: fontSizes.xs,
    lineHeight: 18,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  goalsActionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.l,
    paddingBottom: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: scaleWidth(12),
    minHeight: scaleHeight(44), // Ensure minimum touch target height
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: fontSizes.m,
    fontWeight: '600',
  },
  goalsList: {
    marginBottom: spacing.xs,
  },
  goalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.l,
    borderRadius: scaleWidth(12),
    marginBottom: spacing.s,
    borderWidth: 1,
    minHeight: scaleHeight(70), // Increased height for better touch target
  },
  goalCheckbox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalText: {
    fontSize: fontSizes.m,
    marginLeft: spacing.s,
    flex: 1,
  },
  deleteGoalButton: {
    padding: spacing.xs,
  },
  
  // Add Goal Form
  addGoalForm: {
    borderRadius: scaleWidth(12),
    padding: spacing.m,
    marginBottom: spacing.m,
    borderWidth: 1,
  },
  goalInput: {
    borderWidth: 1,
    borderRadius: scaleWidth(12),
    padding: spacing.m,
    fontSize: fontSizes.m,
    minHeight: scaleHeight(60),
    marginBottom: spacing.s,
  },
  addGoalButton: {
    paddingVertical: spacing.s,
    borderRadius: scaleWidth(12),
    alignItems: 'center',
    minHeight: scaleHeight(44), // Ensure minimum touch target height
  },
  addGoalButtonText: {
    color: '#FFFFFF',
    fontSize: fontSizes.m,
    fontWeight: '600',
  },
  emptyGoals: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    borderRadius: scaleWidth(12),
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: spacing.xs,
  },
  emptyIcon: {
    marginBottom: spacing.s,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: fontSizes.m,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  emptySubText: {
    fontSize: fontSizes.s,
    textAlign: 'center',
    opacity: 0.7,
  },
  
  
  // Upgrade Modal Styles
  upgradeModal: {
    width: '90%',
    maxWidth: 500,
    borderRadius: scaleWidth(20),
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  upgradeModalHeader: {
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  upgradeModalTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    marginTop: spacing.m,
    textAlign: 'center',
  },
  upgradeModalMessage: {
    fontSize: fontSizes.m,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: scaleHeight(24),
    paddingHorizontal: spacing.m,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.m,
    borderRadius: scaleWidth(16),
    width: '100%',
    minHeight: scaleHeight(50),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: fontSizes.m,
    fontWeight: 'bold',
  },
  laterButton: {
    marginTop: spacing.l,
    padding: spacing.m,
  },
  laterButtonText: {
    fontSize: fontSizes.s,
  }
});

export default GoalsTab;