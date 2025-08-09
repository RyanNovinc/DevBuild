// src/components/ai/LoginScreen/components/AuthFooter.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../../../context/ThemeContext';

const AuthFooter = ({ onOpenTerms, onOpenPrivacy }) => {
  const { theme } = useTheme();
  
  return (
    <View style={styles.container}>
      <Text style={[styles.footerText, { color: theme.textSecondary }]}>
        By continuing, you agree to our
      </Text>
      <View style={styles.linksContainer}>
        <TouchableOpacity onPress={onOpenTerms}>
          <Text style={[styles.link, { color: theme.primary }]}>Terms of Service</Text>
        </TouchableOpacity>
        <Text style={[styles.footerText, { color: theme.textSecondary }]}> & </Text>
        <TouchableOpacity onPress={onOpenPrivacy}>
          <Text style={[styles.link, { color: theme.primary }]}>Privacy Policy</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 12,
  },
  linksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  link: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default AuthFooter;