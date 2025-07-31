// src/components/ReferralFlowTester.js
// Development component to test referral flow in the app
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';
import ReferralTracker from '../services/ReferralTracker';
import { upgradeSubscription } from '../services/SubscriptionService';
import ReferralService from '../screens/Referral/ReferralService';
import * as FeatureExplorerTracker from '../services/FeatureExplorerTracker';
import founderCodeService from '../services/founderCodeService';

const ReferralFlowTester = () => {
  const [logs, setLogs] = useState([]);
  const [pendingReferral, setPendingReferral] = useState(null);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const testStoreReferral = async () => {
    try {
      addLog('Testing referral storage...', 'info');
      const testCode = 'TEST-' + Math.random().toString(36).substr(2, 6).toUpperCase();
      await ReferralTracker.storePendingReferral(testCode, 'test');
      addLog(`Stored referral code: ${testCode}`, 'success');
      
      const stored = await ReferralTracker.getPendingReferral();
      setPendingReferral(stored);
      addLog(`Retrieved: ${JSON.stringify(stored)}`, 'info');
    } catch (error) {
      addLog(`Error: ${error.message}`, 'error');
    }
  };

  const testURLExtraction = async () => {
    const testUrls = [
      'https://lifecompass.app/r/USER-ABC123',
      'lifecompass://r/MOBILE-XYZ789',
      'https://lifecompass.app/?ref=LEGACY-456'
    ];

    addLog('Testing URL extraction...', 'info');
    
    for (const url of testUrls) {
      const extracted = ReferralTracker.extractReferralFromURL(url);
      addLog(`${url} → ${extracted || 'null'}`, extracted ? 'success' : 'warning');
    }
  };

  const testFullFlow = async () => {
    try {
      addLog('Starting full referral flow test...', 'info');
      
      // Step 1: Simulate incoming referral
      const testURL = 'https://lifecompass.app/r/FLOW-TEST123';
      await ReferralTracker.handleIncomingURL(testURL);
      addLog('Step 1: Handled incoming URL', 'success');
      
      // Step 2: Check pending
      const pending = await ReferralTracker.getPendingReferral();
      addLog(`Step 2: Pending referral: ${pending?.referralCode}`, 'info');
      setPendingReferral(pending);
      
      // Step 3: Simulate upgrade
      const userId = 'test-user-' + Date.now();
      const result = await upgradeSubscription('pro', userId);
      addLog(`Step 3: Upgrade result: ${JSON.stringify(result)}`, 'success');
      
      // Step 4: Check if cleared
      const afterUpgrade = await ReferralTracker.getPendingReferral();
      addLog(`Step 4: Pending after upgrade: ${afterUpgrade ? 'Still there' : 'Cleared'}`, 
             afterUpgrade ? 'warning' : 'success');
      setPendingReferral(afterUpgrade);
      
      // Step 5: Check completed
      const completed = await ReferralTracker.getCompletedReferrals();
      addLog(`Step 5: Completed referrals: ${completed.length}`, 'info');
      
    } catch (error) {
      addLog(`Full flow error: ${error.message}`, 'error');
    }
  };

  const clearPendingReferral = async () => {
    try {
      await ReferralTracker.clearPendingReferral();
      setPendingReferral(null);
      addLog('Cleared pending referral', 'success');
    } catch (error) {
      addLog(`Clear error: ${error.message}`, 'error');
    }
  };

  const showPendingReferral = async () => {
    try {
      const pending = await ReferralTracker.getPendingReferral();
      setPendingReferral(pending);
      addLog(`Current pending: ${JSON.stringify(pending)}`, 'info');
    } catch (error) {
      addLog(`Get pending error: ${error.message}`, 'error');
    }
  };

  const testReferralAchievements = async () => {
    try {
      addLog('Testing referral achievements...', 'info');
      
      // Test first referral sent achievement
      addLog('Step 1: Testing first referral sent achievement', 'info');
      await ReferralService.trackReferralShare((message) => {
        addLog(`Achievement: ${message}`, 'success');
      });
      
      // Test multiple conversions
      addLog('Step 2: Testing multiple referral conversions', 'info');
      for (let i = 1; i <= 3; i++) {
        await FeatureExplorerTracker.trackReferralConversion((message) => {
          addLog(`Conversion ${i} Achievement: ${message}`, 'success');
        });
        addLog(`Conversion ${i} tracked`, 'info');
      }
      
      addLog('Referral achievements test completed', 'success');
    } catch (error) {
      addLog(`Achievement test error: ${error.message}`, 'error');
    }
  };

  const resetReferralAchievements = async () => {
    try {
      addLog('Resetting referral achievements...', 'info');
      await FeatureExplorerTracker.resetAchievementTracking(FeatureExplorerTracker.TRACKING_KEYS.FIRST_REFERRAL_SENT);
      await FeatureExplorerTracker.resetAchievementTracking(FeatureExplorerTracker.TRACKING_KEYS.REFERRALS_CONVERTED_COUNT);
      addLog('Referral achievements reset', 'success');
    } catch (error) {
      addLog(`Reset error: ${error.message}`, 'error');
    }
  };

  const testEarlyAdopterAchievement = async () => {
    try {
      addLog('Testing Early Adopter achievement...', 'info');
      
      // Check current founder status
      const isFounder = await founderCodeService.isFounder();
      addLog(`Current founder status: ${isFounder}`, 'info');
      
      if (!isFounder) {
        // Simulate becoming a founder (mock mode)
        addLog('Simulating founder code assignment...', 'info');
        const result = await founderCodeService.assignFounderCode({ testScenario: 'success' });
        
        if (result.success) {
          addLog(`Founder code assigned: ${result.code}`, 'success');
          addLog('Early Adopter achievement should be unlocked!', 'success');
        } else {
          addLog(`Failed to assign founder code: ${result.error}`, 'error');
        }
      } else {
        // Try to trigger the achievement manually
        addLog('Already a founder, manually triggering achievement...', 'info');
        await FeatureExplorerTracker.trackEarlyAdopter((message) => {
          addLog(`Achievement: ${message}`, 'success');
        });
      }
      
    } catch (error) {
      addLog(`Early Adopter test error: ${error.message}`, 'error');
    }
  };

  const resetEarlyAdopterAchievement = async () => {
    try {
      addLog('Resetting Early Adopter achievement...', 'info');
      await FeatureExplorerTracker.resetAchievementTracking(FeatureExplorerTracker.TRACKING_KEYS.EARLY_ADOPTER);
      addLog('Early Adopter achievement reset', 'success');
    } catch (error) {
      addLog(`Reset error: ${error.message}`, 'error');
    }
  };

  const testFeatureInfluencerAchievement = async () => {
    try {
      addLog('Testing Feature Influencer achievement...', 'info');
      
      // Check current subscription status
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const subscriptionStatus = await AsyncStorage.getItem('subscriptionStatus');
      addLog(`Current subscription: ${subscriptionStatus || 'free'}`, 'info');
      
      if (subscriptionStatus !== 'pro' && subscriptionStatus !== 'unlimited') {
        addLog('Simulating Pro upgrade for testing...', 'info');
        await AsyncStorage.setItem('subscriptionStatus', 'pro');
        addLog('Upgraded to Pro for testing', 'success');
      }
      
      // Test the achievement tracking
      await FeatureExplorerTracker.trackFeatureInfluencer((message) => {
        addLog(`Achievement: ${message}`, 'success');
      });
      
      addLog('Feature Influencer achievement test completed', 'success');
    } catch (error) {
      addLog(`Feature Influencer test error: ${error.message}`, 'error');
    }
  };

  const resetFeatureInfluencerAchievement = async () => {
    try {
      addLog('Resetting Feature Influencer achievement...', 'info');
      await FeatureExplorerTracker.resetAchievementTracking(FeatureExplorerTracker.TRACKING_KEYS.FEATURE_INFLUENCER);
      addLog('Feature Influencer achievement reset', 'success');
    } catch (error) {
      addLog(`Reset error: ${error.message}`, 'error');
    }
  };

  const testInsiderStatusAchievement = async () => {
    try {
      addLog('Testing Insider Status achievement...', 'info');
      
      // Simulate Pro upgrade
      const userId = 'test-user-' + Date.now();
      const result = await upgradeSubscription('pro', userId);
      
      if (result.success) {
        addLog('Upgraded to Pro subscription', 'success');
        addLog('Insider Status achievement should be unlocked!', 'success');
      } else {
        addLog(`Failed to upgrade: ${result.error}`, 'error');
      }
      
    } catch (error) {
      addLog(`Insider Status test error: ${error.message}`, 'error');
    }
  };

  const resetInsiderStatusAchievement = async () => {
    try {
      addLog('Resetting Insider Status achievement...', 'info');
      await FeatureExplorerTracker.resetAchievementTracking(FeatureExplorerTracker.TRACKING_KEYS.INSIDER_STATUS);
      addLog('Insider Status achievement reset', 'success');
    } catch (error) {
      addLog(`Reset error: ${error.message}`, 'error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Referral Flow Tester</Text>
      
      {pendingReferral && (
        <View style={styles.pendingBox}>
          <Text style={styles.pendingTitle}>Pending Referral:</Text>
          <Text style={styles.pendingCode}>{pendingReferral.referralCode}</Text>
          <Text style={styles.pendingDetails}>
            Source: {pendingReferral.source} | {new Date(pendingReferral.timestamp).toLocaleString()}
          </Text>
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={testStoreReferral}>
          <Text style={styles.buttonText}>Test Store</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testURLExtraction}>
          <Text style={styles.buttonText}>Test URLs</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={testFullFlow}>
          <Text style={styles.buttonText}>Full Flow</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={showPendingReferral}>
          <Text style={styles.buttonText}>Show Pending</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={clearPendingReferral}>
          <Text style={styles.buttonText}>Clear Pending</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.clearButton} onPress={clearLogs}>
          <Text style={styles.buttonText}>Clear Logs</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.achievementButton} onPress={testReferralAchievements}>
          <Text style={styles.buttonText}>Test Achievements</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.achievementButton} onPress={resetReferralAchievements}>
          <Text style={styles.buttonText}>Reset Achievements</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.founderButton} onPress={testEarlyAdopterAchievement}>
          <Text style={styles.buttonText}>Test Early Adopter</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.founderButton} onPress={resetEarlyAdopterAchievement}>
          <Text style={styles.buttonText}>Reset Early Adopter</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.influencerButton} onPress={testFeatureInfluencerAchievement}>
          <Text style={styles.buttonText}>Test Feature Influencer</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.influencerButton} onPress={resetFeatureInfluencerAchievement}>
          <Text style={styles.buttonText}>Reset Feature Influencer</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.insiderButton} onPress={testInsiderStatusAchievement}>
          <Text style={styles.buttonText}>Test Insider Status</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.insiderButton} onPress={resetInsiderStatusAchievement}>
          <Text style={styles.buttonText}>Reset Insider Status</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.logContainer}>
        {logs.map((log, index) => (
          <View key={index} style={styles.logItem}>
            <Text style={styles.timestamp}>{log.timestamp}</Text>
            <Text style={[styles.logText, { color: getLogColor(log.type) }]}>
              {log.message}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const getLogColor = (type) => {
  switch (type) {
    case 'success': return '#4CAF50';
    case 'error': return '#F44336';
    case 'warning': return '#FF9800';
    default: return '#333';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  pendingBox: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  pendingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  pendingCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0D47A1',
    marginVertical: 5,
  },
  pendingDetails: {
    fontSize: 12,
    color: '#424242',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 6,
    flex: 0.48,
  },
  clearButton: {
    backgroundColor: '#757575',
    padding: 12,
    borderRadius: 6,
    flex: 0.48,
  },
  achievementButton: {
    backgroundColor: '#FF9800',
    padding: 12,
    borderRadius: 6,
    flex: 0.48,
  },
  founderButton: {
    backgroundColor: '#9C27B0',
    padding: 12,
    borderRadius: 6,
    flex: 0.48,
  },
  influencerButton: {
    backgroundColor: '#E91E63',
    padding: 12,
    borderRadius: 6,
    flex: 0.48,
  },
  insiderButton: {
    backgroundColor: '#3F51B5',
    padding: 12,
    borderRadius: 6,
    flex: 0.48,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  logContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  logItem: {
    flexDirection: 'row',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    width: 80,
    marginRight: 10,
  },
  logText: {
    fontSize: 14,
    flex: 1,
  },
});

export default ReferralFlowTester;