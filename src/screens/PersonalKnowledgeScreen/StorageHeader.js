// src/screens/PersonalKnowledgeScreen/StorageHeader.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const StorageHeader = ({
  theme,
  storageUsedPercentage,
  documentsStorageUsed,
  currentStorageUsed,
  getStorageQuota,
  setInfoModalVisible,
}) => {
  // Calculate document storage percentages
  const totalBytes = getStorageQuota() * 1024 * 1024;
  const documentsPercentage = Math.min(100, (documentsStorageUsed / totalBytes) * 100);
  
  return (
    <View style={styles.storageContainer}>
      <View style={styles.storageTextContainer}>
        <View style={styles.titleContainer}>
          <Text style={[styles.storageText, { color: theme.text }]}>
            Storage Usage
          </Text>
          <Text style={[styles.percentageText, { color: theme.textSecondary }]}>
            {" "}({storageUsedPercentage.toFixed(0)}%)
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.infoButton}
          onPress={() => setInfoModalVisible(true)}
        >
          <Ionicons name="information-circle-outline" size={20} color={theme.text} />
        </TouchableOpacity>
      </View>
      
      <View style={[styles.progressBarContainer, { backgroundColor: theme.border }]}>
        {/* Document storage section */}
        <View 
          style={[
            styles.progressBar, 
            { 
              width: `${documentsPercentage}%`,
              backgroundColor: theme.primary,
            }
          ]} 
        />
        
        {/* Warning overlay for high usage */}
        {storageUsedPercentage > 90 && (
          <View
            style={[
              styles.progressBarWarning,
              {
                width: '100%',
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: theme.danger,
                borderRadius: 5,
              }
            ]}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  storageContainer: {
    marginVertical: 12,
    borderRadius: 12,
  },
  storageTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storageText: {
    fontWeight: '500',
  },
  percentageText: {
    fontSize: 14,
  },
  infoButton: {
    padding: 4,
  },
  progressBarContainer: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBar: {
    height: '100%',
  },
  progressBarWarning: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  }
});

export default StorageHeader;