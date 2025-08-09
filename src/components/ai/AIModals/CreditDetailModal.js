// src/components/ai/AIModals/CreditDetailModal.js
import React from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';

/**
 * Simple modal showing total available credits with "Need more?" button
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
  isAuthenticated = false,     // Authentication status
  onRefresh = null // Refresh callback
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation();

  // Calculate remaining credits
  const totalCredits = credits.baseCredits + credits.rolledOverCredits;
  const remainingCredits = totalCredits - credits.creditsUsed;
  const remainingFormatted = Math.round(remainingCredits * 1000);
  
  const handleNeedMore = () => {
    onClose(); // Close modal first
    navigation.navigate('PricingScreen'); // Navigate to pricing
  };

  const handleLogin = () => {
    onClose(); // Close modal first
    navigation.navigate('AILoginScreen'); // Navigate to AI login screen
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <SafeAreaView style={styles.safeArea}>
            
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.text }]}>Credits</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={[styles.closeText, { color: theme.text }]}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {/* Content */}
            <View style={styles.content}>
              {isAuthenticated ? (
                // Authenticated user - show credits and pricing
                <>
                  <Text style={[styles.creditsNumber, { color: theme.primary }]}>
                    {remainingFormatted}
                  </Text>
                  <Text style={[styles.creditsLabel, { color: theme.textSecondary }]}>
                    Total Available
                  </Text>
                  
                  <Text style={[styles.needMoreText, { color: theme.text }]}>
                    Need more?
                  </Text>
                  
                  <TouchableOpacity 
                    style={[styles.pricingButton, { backgroundColor: theme.primary }]} 
                    onPress={handleNeedMore}
                  >
                    <Text style={styles.pricingButtonText}>View Pricing</Text>
                  </TouchableOpacity>
                </>
              ) : (
                // Unauthenticated user - show login prompt
                <>
                  <Text style={[styles.creditsNumber, { color: theme.textSecondary }]}>
                    --
                  </Text>
                  <Text style={[styles.creditsLabel, { color: theme.textSecondary }]}>
                    Credits Available
                  </Text>
                  
                  <Text style={[styles.needMoreText, { color: theme.text }]}>
                    Login to view your AI credits
                  </Text>
                  
                  <TouchableOpacity 
                    style={[styles.pricingButton, { backgroundColor: theme.primary }]} 
                    onPress={handleLogin}
                  >
                    <Text style={styles.pricingButtonText}>Login</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
            
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  container: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  safeArea: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    opacity: 0.7,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '400',
  },
  content: {
    alignItems: 'center',
  },
  creditsNumber: {
    fontSize: 42,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  creditsLabel: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 32,
    opacity: 0.7,
  },
  needMoreText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 24,
    letterSpacing: 0.2,
    opacity: 0.9,
  },
  pricingButton: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 140,
    alignItems: 'center',
  },
  pricingButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  }
});

export default CreditDetailModal;