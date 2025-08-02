// src/screens/GoalProgressScreen/MainGoalProgressScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  Animated,
  Easing,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAppContext } from '../../context/AppContext';

// Import components
import HeaderComponent from './HeaderComponent';
import ChartViewContainer from './ChartViewContainer';
import TimelineViewContainer from './TimelineViewContainer';
import { LoadingState, ErrorState } from './LoadingErrorStates';
import { formatDate, lightenColor } from './utils';

const MainGoalProgressScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { projects, goals } = useAppContext();
  
  // Extract parameters from route
  const { goalId, goalColor = '#4CAF50', goalTitle = 'Goal' } = route.params || {};
  
  const [isLoading, setIsLoading] = useState(true);
  const [progressData, setProgressData] = useState([]);
  const [goalCreatedDate, setGoalCreatedDate] = useState(null);
  const [error, setError] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('chart');
  
  // Animation values
  const chartOpacity = useRef(new Animated.Value(1)).current;
  const listOpacity = useRef(new Animated.Value(0)).current;
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const headerHeight = useRef(new Animated.Value(200)).current;
  
  // For ripple effect on point selection
  const [selectedPointCoords, setSelectedPointCoords] = useState(null);
  const rippleAnim = useRef(new Animated.Value(0)).current;
  
  // Colors based on theme and goal
  const getSecondaryColor = () => {
    return lightenColor(goalColor, 20);
  };
  
  useEffect(() => {
    if (!goalId) {
      setError('Goal not found');
      setIsLoading(false);
      return;
    }
    
    try {
      // Find goal data to get created date
      const goalData = goals?.find(g => g.id === goalId);
      if (goalData && goalData.createdAt) {
        setGoalCreatedDate(new Date(goalData.createdAt));
      }
      
      // Get ALL projects for this goal (not just completed ones)
      const allGoalProjects = projects.filter(project => project.goalId === goalId);
      
      // Get only completed projects and sort by completion date
      const completedProjects = allGoalProjects
        .filter(project => project.progress === 100 || project.completed)
        .sort((a, b) => {
          // Use completedAt if available, otherwise updatedAt
          const dateA = a.completedAt ? new Date(a.completedAt) : new Date(a.updatedAt);
          const dateB = b.completedAt ? new Date(b.completedAt) : new Date(b.updatedAt);
          return dateA - dateB;
        });
        
      // Calculate progress points with CORRECT progress calculation
      let progressPoints = [];
      
      // Always add starting point at 0% if we have goal created date
      // FIX: Moved this outside the conditions to ensure it's always included when goalData exists
      if (goalData && goalData.createdAt) {
        const createdDate = new Date(goalData.createdAt);
        progressPoints.push({
          date: createdDate,
          progress: 0,
          formattedDate: formatDate(createdDate),
          projectTitle: 'Goal Created',
          isCreationPoint: true,
          totalProjects: allGoalProjects.length,
          completedProjects: 0
        });
      }
      
      // Calculate ACTUAL progress for each completed project milestone
      const totalProjects = allGoalProjects.length;
      
      completedProjects.forEach((project, index) => {
        // Progress = (number of completed projects / total projects) * 100
        const completedCount = index + 1; // This project is now completed
        const actualProgress = Math.round((completedCount / totalProjects) * 100);
        
        const date = project.completedAt ? new Date(project.completedAt) : new Date(project.updatedAt);
        progressPoints.push({
          date,
          progress: actualProgress,
          formattedDate: formatDate(date),
          projectTitle: project.title,
          isCreationPoint: false,
          totalProjects: totalProjects,
          completedProjects: completedCount
        });
      });
      
      // FIX: Removed the redundant check here, as we already added the starting point above if it exists
      
      setProgressData(progressPoints);
      setIsLoading(false);
      
      // Animate progress line after data loaded
      Animated.timing(progressAnimation, {
        toValue: 1,
        duration: 1500,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: false
      }).start();
      
    } catch (error) {
      console.error('Error generating progress data:', error);
      setError('Error loading progress data');
      setIsLoading(false);
    }
  }, [goalId, projects, goals]);
  
  // Calculate goal duration in days
  const getGoalDuration = () => {
    if (!goalCreatedDate || progressData.length < 2) return null;
    
    const lastPoint = progressData[progressData.length - 1];
    if (!lastPoint) return null;
    
    const endDate = new Date(lastPoint.date);
    
    const durationMs = endDate.getTime() - goalCreatedDate.getTime();
    const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24));
    
    return durationDays;
  };
  
  // Toggle fullscreen chart mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      // Collapse the header when entering fullscreen
      Animated.timing(headerHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false
      }).start();
    } else {
      // Expand the header when exiting fullscreen
      Animated.timing(headerHeight, {
        toValue: 200,
        duration: 300,
        useNativeDriver: false
      }).start();
    }
  };
  
  // Handle tab switching
  const switchTab = (tab) => {
    if (tab === activeTab) return;
    
    setActiveTab(tab);
    
    // Animate tab transition
    if (tab === 'chart') {
      Animated.parallel([
        Animated.timing(chartOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true
        }),
        Animated.timing(listOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(chartOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true
        }),
        Animated.timing(listOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true
        })
      ]).start();
    }
  };
  
  // Handle point selection with animation
  const handlePointSelection = (point, coords) => {
    if (point === selectedPoint) {
      setSelectedPoint(null);
      return;
    }
    
    setSelectedPoint(point);
    
    // Animate ripple effect
    if (coords) {
      setSelectedPointCoords(coords);
      rippleAnim.setValue(0);
      Animated.timing(rippleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true
      }).start();
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Animated Header */}
      <HeaderComponent 
        theme={theme}
        goalColor={goalColor}
        goalTitle={goalTitle}
        goalCreatedDate={goalCreatedDate}
        isFullscreen={isFullscreen}
        headerHeight={headerHeight}
        activeTab={activeTab}
        getGoalDuration={getGoalDuration}
        toggleFullscreen={toggleFullscreen}
        switchTab={switchTab}
        navigation={navigation}
        formatDate={formatDate}
      />
      
      {/* Main content */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[
          styles.scrollContent,
          isFullscreen && styles.fullscreenScrollContent
        ]}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <LoadingState theme={theme} goalColor={goalColor} />
        ) : error ? (
          <ErrorState theme={theme} error={error} />
        ) : (
          <>
            {/* Chart View (animated) */}
            <ChartViewContainer 
              theme={theme}
              goalColor={goalColor}
              chartOpacity={chartOpacity}
              activeTab={activeTab}
              isFullscreen={isFullscreen}
              progressData={progressData}
              progressAnimation={progressAnimation}
              selectedPoint={selectedPoint}
              rippleAnim={rippleAnim}
              selectedPointCoords={selectedPointCoords}
              handlePointSelection={handlePointSelection}
              setSelectedPoint={setSelectedPoint}
              getSecondaryColor={getSecondaryColor}
            />
            
            {/* Timeline View (animated) */}
            <TimelineViewContainer 
              theme={theme}
              goalColor={goalColor}
              listOpacity={listOpacity}
              activeTab={activeTab}
              progressData={progressData}
              selectedPoint={selectedPoint}
              handlePointSelection={handlePointSelection}
            />
          </>
        )}
      </ScrollView>
      
      {/* Fullscreen close button - only in fullscreen mode */}
      {isFullscreen && (
        <TouchableOpacity 
          style={[
            styles.fullscreenCloseButton, 
            { 
              backgroundColor: theme.card,
              shadowColor: theme.text
            }
          ]}
          onPress={toggleFullscreen}
        >
          <Ionicons name="close" size={24} color={theme.text} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  fullscreenScrollContent: {
    padding: 0,
    paddingTop: 16,
    paddingBottom: 0,
    flexGrow: 1,
  },
  fullscreenCloseButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
});

export default MainGoalProgressScreen;