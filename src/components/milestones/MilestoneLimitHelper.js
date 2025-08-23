// src/components/milestones/MilestoneLimitHelper.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

// Import subscription components and functions
import { FeatureLimitBanner, LimitReachedView } from '../subscription/SubscriptionUI';
import { checkMilestonesPerGoalLimit, FREE_PLAN_LIMITS } from '../../services/SubscriptionService';

/**
 * A component that checks if a user has reached their milestone limit for a goal
 * and displays appropriate UI elements
 */
const MilestoneLimitChecker = ({ 
  theme, 
  goalId, 
  milestones = [], 
  onUpgrade,
  style,
  children,
  showLimitBanner = true,
  showLimitView = false
}) => {
  const [limitStatus, setLimitStatus] = useState({
    hasReachedLimit: false,
    milestoneCount: 0,
    maxAllowed: FREE_PLAN_LIMITS.MAX_MILESTONES_PER_GOAL,
    loading: true,
    subscriptionStatus: 'free'
  });
  
  const navigation = useNavigation();
  
  // Check limit when component mounts or goalId/projects change
  useEffect(() => {
    const checkLimit = async () => {
      // First check subscription status
      const status = await AsyncStorage.getItem('subscriptionStatus');
      
      // Skip limit check for pro users
      if (status === 'pro' || status === 'unlimited') {
        setLimitStatus({
          hasReachedLimit: false,
          projectCount: 0,
          maxAllowed: Infinity,
          loading: false,
          subscriptionStatus: status
        });
        return;
      }
      
      // For free users, check the project count
      if (goalId) {
        const result = await checkMilestonesPerGoalLimit(goalId, projects);
        
        setLimitStatus({
          ...result,
          loading: false,
          subscriptionStatus: status || 'free'
        });
      } else {
        // No goal ID provided, can't check limit
        setLimitStatus({
          hasReachedLimit: false,
          projectCount: 0,
          maxAllowed: FREE_PLAN_LIMITS.MAX_PROJECTS_PER_GOAL,
          loading: false,
          subscriptionStatus: status || 'free'
        });
      }
    };
    
    checkLimit();
  }, [goalId, milestones]);
  
  // Handle navigation to pricing screen
  const handleUpgrade = () => {
    if (typeof onUpgrade === 'function') {
      onUpgrade();
    } else {
      navigation.navigate('PricingScreen');
    }
  };
  
  // Skip rendering if pro user or still loading
  if (limitStatus.subscriptionStatus !== 'free' || limitStatus.loading) {
    return children || null;
  }
  
  // If limit not reached and only showing banner, render children
  if (!limitStatus.hasReachedLimit && !showLimitView) {
    return (
      <>
        {children}
        
        {/* Optionally show limit banner for awareness */}
        {showLimitBanner && (
          <FeatureLimitBanner
            theme={theme}
            message={`Free plan: ${limitStatus.milestoneCount}/${limitStatus.maxAllowed} milestones for this goal`}
            onUpgrade={handleUpgrade}
            style={style}
          />
        )}
      </>
    );
  }
  
  // If limit reached or explicitly showing limit view
  if (limitStatus.hasReachedLimit || showLimitView) {
    return (
      <LimitReachedView
        theme={theme}
        limitType="milestones per goal"
        currentCount={limitStatus.milestoneCount}
        maxCount={limitStatus.maxAllowed}
        message={`You've reached the limit of ${limitStatus.maxAllowed} milestones per goal on the free plan.`}
        onUpgrade={handleUpgrade}
      >
        <Text 
          style={[styles.limitExplanation, { color: theme.textSecondary }]}
          maxFontSizeMultiplier={1.3}
        >
          Upgrade to Pro for unlimited milestones per goal and better organize your work.
        </Text>
      </LimitReachedView>
    );
  }
  
  // Default fallback
  return children || null;
};

/**
 * A hook that checks if a user can add more milestones to a goal
 */
export const useMilestoneLimitCheck = (goalId, milestones = []) => {
  const [limitStatus, setLimitStatus] = useState({
    hasReachedLimit: false,
    projectCount: 0,
    maxAllowed: FREE_PLAN_LIMITS.MAX_PROJECTS_PER_GOAL,
    loading: true,
    subscriptionStatus: 'free'
  });
  
  // Check limit when component mounts or goalId/projects change
  useEffect(() => {
    const checkLimit = async () => {
      // First check subscription status
      const status = await AsyncStorage.getItem('subscriptionStatus');
      
      // Skip limit check for pro users
      if (status === 'pro' || status === 'unlimited') {
        setLimitStatus({
          hasReachedLimit: false,
          projectCount: 0,
          maxAllowed: Infinity,
          loading: false,
          subscriptionStatus: status
        });
        return;
      }
      
      // For free users, check the project count
      if (goalId) {
        const result = await checkMilestonesPerGoalLimit(goalId, projects);
        
        setLimitStatus({
          ...result,
          loading: false,
          subscriptionStatus: status || 'free'
        });
      } else {
        // No goal ID provided, can't check limit
        setLimitStatus({
          hasReachedLimit: false,
          projectCount: 0,
          maxAllowed: FREE_PLAN_LIMITS.MAX_PROJECTS_PER_GOAL,
          loading: false,
          subscriptionStatus: status || 'free'
        });
      }
    };
    
    checkLimit();
  }, [goalId, milestones]);
  
  return limitStatus;
};

const styles = StyleSheet.create({
  limitExplanation: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
  }
});

export default MilestoneLimitChecker;