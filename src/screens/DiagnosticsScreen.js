import React, { useState } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import assistantService from '../services/AssistantService';

const AuthTestScreen = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testAuth = async () => {
    setLoading(true);
    try {
      const result = await assistantService.testApiConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button 
        title="Test API Authentication" 
        onPress={testAuth} 
        disabled={loading} 
      />
      
      {loading && <Text style={styles.loading}>Testing authentication...</Text>}
      
      {testResult && (
        <View style={styles.resultContainer}>
          <Text style={testResult.success ? styles.success : styles.error}>
            {testResult.success ? '✅ Authentication Successful' : '❌ Authentication Failed'}
          </Text>
          <Text style={styles.details}>Status: {testResult.status}</Text>
          <Text style={styles.details}>User ID: {testResult.userId}</Text>
          <Text style={styles.details}>Message: {testResult.message}</Text>
          {testResult.error && (
            <Text style={styles.errorDetails}>Error: {testResult.error}</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  loading: {
    marginTop: 20,
    textAlign: 'center',
  },
  resultContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  success: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'green',
    marginBottom: 10,
  },
  error: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 10,
  },
  details: {
    marginBottom: 5,
  },
  errorDetails: {
    color: 'red',
    marginTop: 10,
  },
});

export default AuthTestScreen;