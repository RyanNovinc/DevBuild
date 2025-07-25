// src/screens/GoalProgressScreen/HeaderComponent.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Animated,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HeaderComponent = ({ 
  theme,
  goalColor,
  goalTitle,
  goalCreatedDate,
  isFullscreen,
  headerHeight,
  activeTab,
  getGoalDuration,
  toggleFullscreen,
  switchTab,
  navigation,
  formatDate
}) => {
  return (
    <Animated.View 
      style={[
        styles.headerContainer,
        { 
          height: headerHeight,
          backgroundColor: isFullscreen ? 'transparent' : theme.card 
        }
      ]}
    >
      {/* Navigation header */}
      <View style={styles.navHeader}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Goal Progress
        </Text>
        
        <TouchableOpacity 
          style={[
            styles.fullscreenButton,
            { backgroundColor: `${theme.border}30` }
          ]}
          onPress={toggleFullscreen}
        >
          <Ionicons 
            name={isFullscreen ? "contract" : "expand"} 
            size={22} 
            color={theme.text} 
          />
        </TouchableOpacity>
      </View>
      
      {/* Goal info - visible only when not in fullscreen */}
      {!isFullscreen && (
        <View style={styles.goalInfoContainer}>
          <View 
            style={[
              styles.goalIconContainer, 
              { backgroundColor: `${goalColor}20` }
            ]}
          >
            <Ionicons name="trending-up" size={28} color={goalColor} />
          </View>
          
          <View style={styles.goalTextContainer}>
            <Text 
              style={[styles.goalTitle, { color: theme.text }]}
              numberOfLines={1}
            >
              {goalTitle}
            </Text>
            
            {goalCreatedDate && (
              <Text 
                style={[styles.goalCreatedText, { color: theme.textSecondary }]}
                numberOfLines={1}
              >
                Created {formatDate(goalCreatedDate)}
              </Text>
            )}
          </View>
          
          {getGoalDuration() !== null && (
            <View 
              style={[
                styles.durationBadge,
                { backgroundColor: `${goalColor}15` }
              ]}
            >
              <Ionicons name="time-outline" size={14} color={goalColor} />
              <Text style={[styles.durationText, { color: goalColor }]}>
                {getGoalDuration()} days
              </Text>
            </View>
          )}
        </View>
      )}
      
      {/* Tab switcher - visible only when not in fullscreen */}
      {!isFullscreen && (
        <View style={[styles.tabContainer, { borderBottomColor: theme.border }]}>
          <TouchableOpacity 
            style={[
              styles.tab,
              activeTab === 'chart' && [
                styles.activeTab,
                { borderBottomColor: goalColor }
              ]
            ]}
            onPress={() => switchTab('chart')}
          >
            <Ionicons 
              name="analytics" 
              size={18} 
              color={activeTab === 'chart' ? goalColor : theme.textSecondary} 
            />
            <Text 
              style={[
                styles.tabText,
                { 
                  color: activeTab === 'chart' 
                    ? goalColor 
                    : theme.textSecondary 
                }
              ]}
            >
              Chart
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tab,
              activeTab === 'timeline' && [
                styles.activeTab,
                { borderBottomColor: goalColor }
              ]
            ]}
            onPress={() => switchTab('timeline')}
          >
            <Ionicons 
              name="list" 
              size={18} 
              color={activeTab === 'timeline' ? goalColor : theme.textSecondary} 
            />
            <Text 
              style={[
                styles.tabText,
                { 
                  color: activeTab === 'timeline' 
                    ? goalColor 
                    : theme.textSecondary 
                }
              ]}
            >
              Timeline
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    overflow: 'hidden',
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  fullscreenButton: {
    padding: 8,
    borderRadius: 20,
  },
  goalInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  goalIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  goalTextContainer: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  goalCreatedText: {
    fontSize: 14,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    marginLeft: 8,
    fontWeight: '600',
  },
});

export default HeaderComponent;