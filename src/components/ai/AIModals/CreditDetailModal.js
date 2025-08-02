// src/components/ai/AIModals/CreditDetailModal.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Auth } from 'aws-amplify'; // Import Auth for user info
import { useTheme } from '../../../context/ThemeContext';

// API endpoint for Lambda functions
const API_ENDPOINT = 'https://your-api-gateway-url/dev'; // Replace with your actual API Gateway URL

/**
 * Modal showing detailed information about the user's AI credits
 * Ready for integration with backend services
 */
const CreditDetailModal = ({ 
  visible, 
  onClose, 
  credits = {
    baseCredits: 0.60,         // Base monthly credits
    rolledOverCredits: 0,      // Accumulated rollover credits 
    creditsUsed: 0.10,         // Credits used this period
    nextRefreshDate: null      // Date when credits refresh
  },
  onRefresh = null // Refresh callback
}) => {
  const { theme } = useTheme();
  // Add loading state for API calls
  const [loading, setLoading] = useState(false);
  const [activeOperation, setActiveOperation] = useState(null);

  // Calculate values
  const totalCredits = credits.baseCredits + credits.rolledOverCredits;
  const remainingCredits = totalCredits - credits.creditsUsed;
  const percentUsed = totalCredits > 0 
    ? Math.min(100, Math.round((credits.creditsUsed / totalCredits) * 100)) 
    : 0;
  
  // Format for display (1000 credits = $1)
  const baseFormatted = Math.round(credits.baseCredits * 1000);
  const rolloverFormatted = Math.round(credits.rolledOverCredits * 1000);
  const remainingFormatted = Math.round(remainingCredits * 1000);
  const usedFormatted = Math.round(credits.creditsUsed * 1000);
  
  // Estimate messages (rough approximation)
  const estimatedMessages = Math.max(1, Math.round(remainingCredits / 0.015));
  
  // Format next refresh date
  const formatNextRefresh = () => {
    // For development, use 30 days from now if not provided
    const refreshDate = credits.nextRefreshDate ? 
      new Date(credits.nextRefreshDate) : 
      new Date(Date.now() + 30*24*60*60*1000);
    
    const now = new Date();
    const diffTime = refreshDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const dateStr = refreshDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: now.getFullYear() !== refreshDate.getFullYear() ? 'numeric' : undefined
    });
    
    return `${dateStr} (${diffDays} days)`;
  };

  // Function to update subscription (connect to UpdateSubscription Lambda)
  const updateSubscription = async (tier) => {
    setLoading(true);
    setActiveOperation(`update-${tier}`);

    try {
      // Get current user
      const user = await Auth.currentAuthenticatedUser();
      const userEmail = user.attributes.email;
      
      // Call the UpdateSubscription Lambda
      const response = await fetch(`${API_ENDPOINT}/subscription/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`
        },
        body: JSON.stringify({
          userId: userEmail,
          newTier: tier
        })
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Show success message
      Alert.alert(
        "Subscription Updated",
        `Updated to ${tier.charAt(0).toUpperCase() + tier.slice(1)} tier successfully!`,
        [{ text: "OK" }]
      );
      
      // Call refresh callback
      if (onRefresh && typeof onRefresh === 'function') {
        await onRefresh();
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      Alert.alert(
        "Error",
        `Failed to update subscription: ${error.message}`,
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
      setActiveOperation(null);
    }
  };

  // Function to refresh credits (connect to GetCreditBalance Lambda)
  const refreshCredits = async () => {
    setLoading(true);
    setActiveOperation('refresh');

    try {
      // Get current user
      const user = await Auth.currentAuthenticatedUser();
      const userEmail = user.attributes.email;
      
      // Call the GetCreditBalance Lambda
      const response = await fetch(`${API_ENDPOINT}/credits/balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`
        },
        body: JSON.stringify({
          userId: userEmail
        })
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      // Call the callback for app-level refresh
      if (onRefresh && typeof onRefresh === 'function') {
        await onRefresh();
        
        // Show success message
        Alert.alert(
          "Credits Refreshed",
          "Credit information updated successfully!",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error('Error refreshing credits:', error);
      Alert.alert(
        "Error",
        `Failed to refresh credits: ${error.message}`,
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
      setActiveOperation(null);
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.centeredView}>
        <View style={[styles.modalView, { backgroundColor: theme.card }]}>
          {/* Fixed Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>AI Credits</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={[styles.closeX, { color: theme.text }]}>✕</Text>
            </TouchableOpacity>
          </View>
          
          {/* Scrollable Content */}
          <ScrollView style={styles.scrollView}>
            {/* Credit Usage Meter */}
            <View style={[styles.section, { borderBottomColor: theme.border }]}>
              <View style={styles.meterContainer}>
                <View style={[styles.meterBackground, { backgroundColor: theme.border }]}>
                  <View 
                    style={[
                      styles.meterFill, 
                      { 
                        width: `${percentUsed}%`,
                        backgroundColor: percentUsed > 80 ? theme.error : percentUsed > 50 ? theme.warning : theme.primary
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.meterText, { color: theme.text }]}>
                  {usedFormatted} / {baseFormatted + rolloverFormatted} credits used ({percentUsed}%)
                </Text>
              </View>
            </View>
            
            {/* Credit Details */}
            <View style={[styles.section, { borderBottomColor: theme.border }]}>
              <View style={styles.row}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Monthly allocation:</Text>
                <Text style={[styles.value, { color: theme.text }]}>{baseFormatted} credits</Text>
              </View>
              <View style={styles.row}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Rollover credits:</Text>
                <Text style={[styles.value, { color: theme.text }]}>{rolloverFormatted} credits</Text>
              </View>
              <View style={styles.row}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Used this period:</Text>
                <Text style={[styles.value, { color: theme.text }]}>{usedFormatted} credits</Text>
              </View>
              <View style={[styles.row, styles.totalRow, { borderTopColor: theme.border }]}>
                <Text style={[styles.totalLabel, { color: theme.text }]}>Total available:</Text>
                <Text style={[styles.totalValue, { color: theme.text }]}>{remainingFormatted} credits</Text>
              </View>
            </View>
            
            {/* Estimated Messages */}
            <View style={[styles.section, { borderBottomColor: theme.border }]}>
              <View style={styles.estimateContainer}>
                <Text style={styles.icon}>💬</Text>
                <Text style={[styles.estimate, { color: theme.text }]}>
                  Approximately {estimatedMessages} more messages
                </Text>
              </View>
            </View>
            
            {/* Next Refresh Date */}
            <View style={styles.section}>
              <View style={styles.refreshContainer}>
                <Text style={styles.icon}>📅</Text>
                <Text style={styles.refresh}>
                  Next refresh: {formatNextRefresh()}
                </Text>
              </View>
            </View>
            
            {/* Subscription Options */}
            <View style={[styles.section, styles.subscriptionSection]}>
              <Text style={styles.sectionTitle}>Subscription Options</Text>
              
              <TouchableOpacity 
                style={[styles.subscriptionButton, { backgroundColor: '#9C27B0' }]}
                onPress={() => updateSubscription('max')}
                disabled={loading}
              >
                {loading && activeOperation === 'update-max' ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.subscriptionButtonTitle}>Max Tier</Text>
                    <Text style={styles.subscriptionButtonText}>5,000 credits/month</Text>
                    <Text style={styles.subscriptionButtonPrice}>$16.99/month</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.subscriptionButton, { backgroundColor: '#2196F3' }]}
                onPress={() => updateSubscription('standard')}
                disabled={loading}
              >
                {loading && activeOperation === 'update-standard' ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.subscriptionButtonTitle}>Standard Tier</Text>
                    <Text style={styles.subscriptionButtonText}>1,500 credits/month</Text>
                    <Text style={styles.subscriptionButtonPrice}>$8.99/month</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.subscriptionButton, { backgroundColor: '#4CAF50' }]}
                onPress={() => updateSubscription('light')}
                disabled={loading}
              >
                {loading && activeOperation === 'update-light' ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.subscriptionButtonTitle}>Light Tier</Text>
                    <Text style={styles.subscriptionButtonText}>600 credits/month</Text>
                    <Text style={styles.subscriptionButtonPrice}>$4.99/month</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            
            {/* Refresh Button */}
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={refreshCredits}
              disabled={loading}
            >
              {loading && activeOperation === 'refresh' ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.refreshButtonText}>
                  <Text>🔄</Text> Refresh Credit Data
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
          
          {/* Fixed Footer */}
          <TouchableOpacity style={styles.closeButtonBottom} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)'
  },
  modalView: {
    width: '90%',
    maxWidth: 400,
    height: '80%', // Fixed height percentage
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8
  },
  closeX: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    marginBottom: 15,
  },
  section: {
    marginBottom: 20,
    borderBottomWidth: 1,
    paddingBottom: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  label: {
    fontSize: 16,
  },
  value: {
    fontSize: 16,
    fontWeight: '500'
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  meterContainer: {
    marginVertical: 8
  },
  meterBackground: {
    height: 16,
    borderRadius: 8,
    overflow: 'hidden'
  },
  meterFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 8
  },
  meterText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center'
  },
  estimateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8
  },
  refreshContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8
  },
  icon: {
    marginRight: 8,
    fontSize: 18
  },
  estimate: {
    fontSize: 16,
  },
  refresh: {
    fontSize: 16,
    color: '#AAAAAA'
  },
  subscriptionSection: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
    paddingTop: 20
  },
  subscriptionButton: {
    backgroundColor: '#0A84FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80
  },
  subscriptionButtonTitle: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 4
  },
  subscriptionButtonText: {
    color: 'white',
    fontWeight: '400',
    fontSize: 15,
    marginBottom: 4
  },
  subscriptionButtonPrice: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16
  },
  refreshButton: {
    backgroundColor: '#666666',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15
  },
  closeButtonBottom: {
    backgroundColor: '#0A84FF',
    borderRadius: 15,
    padding: 16,
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16
  }
});

export default CreditDetailModal;