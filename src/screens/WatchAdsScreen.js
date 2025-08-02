// src/screens/WatchAdsScreen.js - Simplified version
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AdService from '../services/AdService';

// Credit history storage key
const CREDIT_HISTORY_KEY = 'ai_credit_history';
const CREDITS_BALANCE_KEY = 'ai_credits_balance';

const WatchAdsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  
  // Local state
  const [isLoading, setIsLoading] = useState(false);
  const [adIsLoading, setAdIsLoading] = useState(false);
  const [creditBalance, setCreditBalance] = useState(0);
  const [creditHistory, setCreditHistory] = useState([]);
  const [creditsPerAd, setCreditsPerAd] = useState(10);
  
  // Load user data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load credit balance
        const storedBalance = await AsyncStorage.getItem(CREDITS_BALANCE_KEY);
        if (storedBalance) {
          setCreditBalance(parseInt(storedBalance, 10));
        }
        
        // Load credit history
        const storedHistory = await AsyncStorage.getItem(CREDIT_HISTORY_KEY);
        if (storedHistory) {
          setCreditHistory(JSON.parse(storedHistory));
        }
        
        setIsLoading(false);
      } catch (error) {
        console.log('Error loading ad data:', error);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Save credit balance
  const saveCreditBalance = async (balance) => {
    try {
      await AsyncStorage.setItem(CREDITS_BALANCE_KEY, balance.toString());
      setCreditBalance(balance);
    } catch (error) {
      console.log('Error saving credit balance:', error);
    }
  };
  
  // Save credit history
  const saveCreditHistory = async (history) => {
    try {
      await AsyncStorage.setItem(CREDIT_HISTORY_KEY, JSON.stringify(history));
      setCreditHistory(history);
    } catch (error) {
      console.log('Error saving credit history:', error);
    }
  };
  
  // Handle watching an ad
  const handleWatchAd = async () => {
    if (adIsLoading) return;
    
    setAdIsLoading(true);
    
    try {
      // Initialize AdService
      await AdService.initialize();
      
      // Show the ad (this will be mocked in the simplified version)
      await AdService.showRewardedAd();
      
      // Add credits to balance
      const newBalance = creditBalance + creditsPerAd;
      await saveCreditBalance(newBalance);
      
      // Record transaction in history
      const transaction = {
        id: Date.now().toString(),
        type: 'credit',
        amount: creditsPerAd,
        source: 'rewarded_ad',
        timestamp: new Date().toISOString()
      };
      
      const updatedHistory = [transaction, ...creditHistory];
      await saveCreditHistory(updatedHistory);
      
      // Show success message
      Alert.alert(
        'Credits Added!',
        `You've earned ${creditsPerAd} AI credits by watching the ad.`,
        [{ text: 'Great!' }]
      );
    } catch (error) {
      console.log('Error showing ad:', error);
      Alert.alert(
        'Error',
        'There was a problem showing the ad. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setAdIsLoading(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme?.background || '#FFFFFF' }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme?.border || '#DDDDDD' }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme?.text || '#000000'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme?.text || '#000000' }]}>Free AI Credits</Text>
        <View style={styles.rightHeaderPlaceholder} />
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Credit Balance Card */}
        <View style={[styles.balanceCard, { backgroundColor: theme?.card || '#F9F9F9', borderColor: theme?.border || '#DDDDDD' }]}>
          <Text style={[styles.balanceTitle, { color: theme?.textSecondary || '#666666' }]}>Current Balance</Text>
          <View style={styles.balanceRow}>
            <Ionicons name="flash" size={24} color="#FFD700" />
            <Text style={[styles.balanceAmount, { color: theme?.text || '#000000' }]}>{creditBalance}</Text>
            <Text style={[styles.balanceLabel, { color: theme?.textSecondary || '#666666' }]}>AI Credits</Text>
          </View>
        </View>
        
        {/* Watch Ad Card */}
        <View style={[styles.adCard, { backgroundColor: theme?.card || '#F9F9F9', borderColor: theme?.border || '#DDDDDD' }]}>
          <View style={styles.adInfoRow}>
            <Ionicons name="videocam" size={28} color="#4CAF50" style={styles.adIcon} />
            <View style={styles.adInfoContent}>
              <Text style={[styles.adTitle, { color: theme?.text || '#000000' }]}>Watch an Ad</Text>
              <Text style={[styles.adDescription, { color: theme?.textSecondary || '#666666' }]}>
                Watch a short video ad to earn {creditsPerAd} AI credits
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={[
              styles.watchButton,
              { backgroundColor: adIsLoading ? '#888888' : '#4CAF50' }
            ]}
            onPress={handleWatchAd}
            disabled={adIsLoading}
          >
            {adIsLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="play-circle" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.watchButtonText}>Watch Ad</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        
        {/* How It Works */}
        <View style={[styles.infoCard, { backgroundColor: theme?.card || '#F9F9F9', borderColor: theme?.border || '#DDDDDD' }]}>
          <Text style={[styles.infoTitle, { color: theme?.text || '#000000' }]}>How It Works</Text>
          <View style={styles.infoItem}>
            <Text style={[styles.infoNumber, { backgroundColor: '#4CAF50' }]}>1</Text>
            <Text style={[styles.infoText, { color: theme?.text || '#000000' }]}>Watch a short video ad (usually 15-30 seconds)</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.infoNumber, { backgroundColor: '#4CAF50' }]}>2</Text>
            <Text style={[styles.infoText, { color: theme?.text || '#000000' }]}>Earn {creditsPerAd} AI credits for each completed ad</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.infoNumber, { backgroundColor: '#4CAF50' }]}>3</Text>
            <Text style={[styles.infoText, { color: theme?.text || '#000000' }]}>Use your credits when chatting with the AI assistant</Text>
          </View>
        </View>
        
        {/* Credit History */}
        {creditHistory.length > 0 && (
          <View style={[styles.historyCard, { backgroundColor: theme?.card || '#F9F9F9', borderColor: theme?.border || '#DDDDDD' }]}>
            <Text style={[styles.historyTitle, { color: theme?.text || '#000000' }]}>Credit History</Text>
            {creditHistory.map((transaction) => (
              <View key={transaction.id} style={[styles.historyItem, { borderBottomColor: theme?.border || '#DDDDDD' }]}>
                <View style={styles.historyLeft}>
                  <Ionicons 
                    name={transaction.type === 'credit' ? 'add-circle' : 'remove-circle'} 
                    size={20} 
                    color={transaction.type === 'credit' ? '#4CAF50' : '#F44336'} 
                  />
                  <Text style={[styles.historyText, { color: theme?.text || '#000000' }]}>
                    {transaction.type === 'credit' ? 'Earned' : 'Used'} {transaction.amount} credits
                  </Text>
                </View>
                <Text style={[styles.historyDate, { color: theme?.textSecondary || '#666666' }]}>
                  {formatDate(transaction.timestamp)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1 },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  rightHeaderPlaceholder: { width: 28 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  balanceCard: { borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  balanceTitle: { fontSize: 14, marginBottom: 8 },
  balanceRow: { flexDirection: 'row', alignItems: 'center' },
  balanceAmount: { fontSize: 32, fontWeight: 'bold', marginLeft: 8, marginRight: 4 },
  balanceLabel: { fontSize: 16 },
  adCard: { borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  adInfoRow: { flexDirection: 'row', marginBottom: 16 },
  adIcon: { marginRight: 12 },
  adInfoContent: { flex: 1 },
  adTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  adDescription: { fontSize: 14, lineHeight: 20 },
  watchButton: { borderRadius: 8, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  buttonIcon: { marginRight: 8 },
  watchButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  infoCard: { borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1 },
  infoTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  infoItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoNumber: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12, color: '#FFFFFF', textAlign: 'center', fontSize: 14, fontWeight: 'bold', lineHeight: 24 },
  infoText: { fontSize: 14, flex: 1 },
  historyCard: { borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1 },
  historyTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  historyLeft: { flexDirection: 'row', alignItems: 'center' },
  historyText: { fontSize: 14, marginLeft: 12 },
  historyDate: { fontSize: 12 },
});

export default WatchAdsScreen;