// src/screens/ProfileScreen/index.js - Main ProfileScreen component
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Text,
  StatusBar,
  Animated,
  InteractionManager,
  RefreshControl,
  Alert,
  TouchableOpacity
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useProfile } from '../../context/ProfileContext'; // Add this import
import { profileLog, statsLog } from '../../utils/LoggerUtility';
import { 
  scaleWidth, 
  scaleHeight, 
  scaleFontSize,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  isTablet,
  ensureAccessibleTouchTarget
} from '../../utils/responsive';
import { Ionicons } from '@expo/vector-icons';

// Import profile screen components
import ProfileHeader from './ProfileHeader';
import StatsRow from './StatsRow';
import DomainBalanceWheel from './DomainBalanceWheel'; // New component replacing LifeDirectionSection
import CustomizableDashboard from './CustomizableDashboard';
import SettingsModal from './SettingsModal';
import AIExplanationModal from './AIExplanationModal';
import DomainColorPickerModal from './DomainColorPickerModal';
import ThemeColorPickerModal from './ThemeColorPickerModal';
import { STANDARD_DOMAINS } from './constants';

const ProfileScreen = ({ navigation, route }) => {
  // Add initialization guard to prevent multiple runs
  const isInitialized = useRef(false);
  const isMountedRef = useRef(true);
  const loadingController = useRef(new AbortController());
  const domainCalculationTimeout = useRef(null);
  
  // Safely get auth context
  let auth = null;
  try {
    auth = useAuth();
    if (!auth) {
      profileLog('Auth context not available yet');
    }
  } catch (error) {
    profileLog('Error accessing auth context:', error);
  }
  
  // Extract user from auth, with fallback
  const user = auth?.user || null;
  const logout = auth?.logout || (() => profileLog('Logout function not available'));
  
  const { theme, isColoredTheme, toggleColoredTheme, themeColor, updateTheme } = useTheme();
  const insets = useSafeAreaInsets();
  
  // Get profile from ProfileContext
  const { profile: contextProfile } = useProfile();
  
  // Create refs for scrolling to sections
  const scrollViewRef = useRef(null);
  
  // Use consistent naming and add fallbacks
  const appContext = useAppContext() || {};
  const { 
    domains = [], 
    goals = [], 
    mainGoals = goals, 
    projects = [], 
    tasks = [], // Make sure tasks are included
    updateAppSetting, 
    getLifeDirection,
    settings = {},
    updateDomain,
    refreshDomains, // Use this function if available
    updatePurchaseStatus, // New function to update purchase status
  } = appContext;
  
  profileLog('Context loaded - projects:', projects?.length, 'goals:', goals?.length, 'tasks:', tasks?.length);
  
  const { showSuccess, showError } = useNotification() || { 
    showSuccess: (msg) => profileLog(msg),
    showError: (msg) => console.error(msg)
  };
  
  // Unified state object to prevent cascading renders
  const [screenState, setScreenState] = useState({
    isLoading: true,
    totalActiveGoals: 0,
    activeProjects: 0,
    completedGoals: 0,
    totalActiveTasks: 0, // Add totalActiveTasks property
    lifeDirection: '',
    localDomains: [],
    showAIExplanation: false,
    showSettings: false,
    showDomainColorPicker: false,
    showThemeColorPicker: false,
    selectedDomain: null,
    useColoredTheme: isColoredTheme,
    showAIButton: true,
    userSubscriptionStatus: 'free',
    profile: {
      name: user?.displayName || '',
      email: user?.email || '',
      bio: '',
      profileImage: null,
      defaultAvatar: null // Add defaultAvatar property
    },
    referralCode: '',
    referralsLeft: 3,
    showTestModeToggles: __DEV__,
    // Add debug state flag
    showDebugTools: __DEV__,
  });
  
  // Add the debug function
  const debugStorageContents = async () => {
    try {
      console.log("Starting storage content debug...");
      
      // Read data from storage
      const goalsJson = await AsyncStorage.getItem('goals');
      const projectsJson = await AsyncStorage.getItem('projects');
      const tasksJson = await AsyncStorage.getItem('tasks');
      const linkMapJson = await AsyncStorage.getItem('projectGoalLinkMap');
      
      // Parse data
      const goals = goalsJson ? JSON.parse(goalsJson) : [];
      const projects = projectsJson ? JSON.parse(projectsJson) : [];
      const tasks = tasksJson ? JSON.parse(tasksJson) : [];
      const linkMap = linkMapJson ? JSON.parse(linkMapJson) : {};
      
      // Log basic counts
      console.log(`DEBUG: Found ${goals.length} goals, ${projects.length} projects, ${tasks.length} tasks, ${Object.keys(linkMap).length} link map entries`);
      
      // Check for orphaned projects (no valid goal ID)
      const validGoalIds = new Set(goals.map(g => g.id));
      const orphanedProjects = projects.filter(p => p.goalId && !validGoalIds.has(p.goalId));
      console.log(`DEBUG: Found ${orphanedProjects.length} orphaned projects`);
      
      if (orphanedProjects.length > 0) {
        console.log("ORPHANED PROJECTS:");
        orphanedProjects.forEach(p => {
          console.log(`- Project "${p.title}" (ID: ${p.id}) linked to non-existent goal: ${p.goalId}`);
        });
      }
      
      // Check for orphaned tasks (no valid project ID)
      const validProjectIds = new Set(projects.map(p => p.id));
      const orphanedTasks = tasks.filter(t => t.projectId && !validProjectIds.has(t.projectId));
      console.log(`DEBUG: Found ${orphanedTasks.length} orphaned tasks`);
      
      if (orphanedTasks.length > 0) {
        console.log("ORPHANED TASKS (first 5):");
        orphanedTasks.slice(0, 5).forEach(t => {
          console.log(`- Task "${t.name || t.title}" (ID: ${t.id}) linked to non-existent project: ${t.projectId}`);
        });
      }
      
      // Check projects with embedded tasks
      const projectsWithEmbeddedTasks = projects.filter(p => p.tasks && Array.isArray(p.tasks) && p.tasks.length > 0);
      console.log(`DEBUG: Found ${projectsWithEmbeddedTasks.length} projects with embedded tasks`);
      
      // Check link map for consistency
      const linkMapOrphans = Object.entries(linkMap).filter(([projectId, goalId]) => {
        const projectExists = validProjectIds.has(projectId);
        const goalExists = validGoalIds.has(goalId);
        return !projectExists || !goalExists;
      });
      
      console.log(`DEBUG: Found ${linkMapOrphans.length} inconsistent entries in link map`);
      
      if (linkMapOrphans.length > 0) {
        console.log("INCONSISTENT LINK MAP ENTRIES:");
        linkMapOrphans.forEach(([projectId, goalId]) => {
          const projectExists = validProjectIds.has(projectId);
          const goalExists = validGoalIds.has(goalId);
          console.log(`- Project ${projectId} (exists: ${projectExists}) -> Goal ${goalId} (exists: ${goalExists})`);
        });
      }
      
      // Check for duplicated tasks (both embedded and standalone)
      let duplicateTaskCount = 0;
      projectsWithEmbeddedTasks.forEach(project => {
        if (project.tasks && Array.isArray(project.tasks)) {
          const embeddedTaskIds = new Set(project.tasks.map(t => t.id));
          const matchingStandaloneTasks = tasks.filter(t => 
            t.projectId === project.id && embeddedTaskIds.has(t.id)
          );
          duplicateTaskCount += matchingStandaloneTasks.length;
        }
      });
      
      console.log(`DEBUG: Found ${duplicateTaskCount} tasks that exist both embedded and standalone`);
      
      // Display a summary alert
      Alert.alert(
        'Storage Debug',
        `Goals: ${goals.length}\nProjects: ${projects.length}\nTasks: ${tasks.length}\n\nOrphaned Projects: ${orphanedProjects.length}\nOrphaned Tasks: ${orphanedTasks.length}\nBad Link Map Entries: ${linkMapOrphans.length}\n\nProjects with embedded tasks: ${projectsWithEmbeddedTasks.length}\nDuplicate tasks: ${duplicateTaskCount}`,
        [
          { 
            text: 'Run Data Integrity Service', 
            onPress: async () => {
              Alert.alert('Running data integrity check...');
              try {
                // Dynamically import the service
                const DataIntegrityService = require('../../services/DataIntegrityService').default;
                const result = await DataIntegrityService.auditDataIntegrity();
                Alert.alert('Data Integrity Result', JSON.stringify(result, null, 2));
              } catch (error) {
                Alert.alert('Error', 'Failed to run data integrity service: ' + error.message);
              }
            }
          },
          { text: 'OK' }
        ]
      );
    } catch (error) {
      console.error('Debug error:', error);
      Alert.alert('Debug Error', error.message);
    }
  };
  
  // Add effect to sync with ProfileContext
  useEffect(() => {
    if (contextProfile) {
      setScreenState(prev => ({
        ...prev,
        profile: contextProfile
      }));
      profileLog('Updated profile from ProfileContext:', contextProfile);
    }
  }, [contextProfile]);
  
  // Animation for arrow pointing to floating button
  const arrowAnimation = useRef(new Animated.Value(0)).current;
  
  // Check if user is admin
  const ADMIN_EMAIL = 'ryan.novinc@gmail.com';
  const isAdmin = user?.email === ADMIN_EMAIL;
  
  // Determine specific colors for profile UI elements based on theme
  const isDarkMode = theme.background === '#000000';

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    profileLog('ProfileScreen mounted');
    
    return () => {
      isMountedRef.current = false;
      isInitialized.current = false;
      loadingController.current.abort();
      if (domainCalculationTimeout.current) {
        clearTimeout(domainCalculationTimeout.current);
      }
      profileLog('ProfileScreen unmounted');
    };
  }, []);

  // Update local state based on theme context
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    setScreenState(prev => ({
      ...prev,
      useColoredTheme: isColoredTheme
    }));
  }, [isColoredTheme]);
  
  // Animate the arrow when explanation modal is shown
  useEffect(() => {
    if (!screenState.showAIExplanation) {
      arrowAnimation.setValue(0);
      return;
    }
    
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(arrowAnimation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true
        }),
        Animated.timing(arrowAnimation, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true
        })
      ])
    );
    
    animation.start();
    
    return () => animation.stop();
  }, [screenState.showAIExplanation, arrowAnimation]);
  
  // Use useFocusEffect for profile data loading to avoid re-runs
  useFocusEffect(
    useCallback(() => {
      // Skip if auth is not ready yet
      if (!auth || !user) {
        profileLog('Auth not ready yet, skipping profile data load');
        return;
      }
      
      // Skip if already loaded
      if (isInitialized.current) {
        profileLog('Profile already initialized, skipping load');
        return;
      }
      
      isInitialized.current = true;
      profileLog('Starting to initialize profile');
      
      const loadProfileData = async () => {
        try {
          if (!isMountedRef.current) return;
          
          // First try to get profile from context
          let newProfile = {
            name: user?.displayName || '',
            email: user?.email || '',
            bio: '',
            profileImage: null,
            defaultAvatar: null
          };
          
          // Prioritize contextProfile if available
          if (contextProfile) {
            newProfile = { ...contextProfile };
            profileLog('Using profile from ProfileContext:', contextProfile);
          } else {
            // Check route params once
            const updatedProfile = route.params?.updatedProfile;
            if (updatedProfile && isMountedRef.current) {
              newProfile = updatedProfile;
              profileLog('Set profile from route params:', updatedProfile);
              // Clear the param immediately
              navigation.setParams({ updatedProfile: undefined });
            } else {
              // Try AsyncStorage with abort controller
              try {
                const storedProfileJson = await AsyncStorage.getItem('userProfile');
                
                if (storedProfileJson && isMountedRef.current) {
                  newProfile = JSON.parse(storedProfileJson);
                  profileLog('Loaded profile from AsyncStorage:', newProfile);
                } else if (settings?.userProfile && isMountedRef.current) {
                  newProfile = settings.userProfile;
                  profileLog('Loaded profile from app settings:', settings.userProfile);
                }
              } catch (error) {
                if (error.name !== 'AbortError') {
                  console.error('Error loading profile:', error);
                }
              }
            }
          }
          
          // Load other data in parallel
          const [subscriptionStatus, lifeDirection, aiButtonValue] = await Promise.all([
            AsyncStorage.getItem('subscriptionStatus').catch(() => 'free'),
            loadLifeDirection(),
            AsyncStorage.getItem('showAIButton').catch(() => null)
          ]);
          
          // Process referral data if needed
          let referralCode = '';
          let referralsLeft = 3;
          
          if (subscriptionStatus === 'pro' || subscriptionStatus === 'unlimited') {
            referralCode = await AsyncStorage.getItem('referralCode') || '';
            if (!referralCode) {
              referralCode = generateReferralCode();
              await AsyncStorage.setItem('referralCode', referralCode);
            }
            
            const remainingReferrals = await AsyncStorage.getItem('referralsRemaining');
            if (remainingReferrals) {
              referralsLeft = parseInt(remainingReferrals);
            } else {
              await AsyncStorage.setItem('referralsRemaining', '3');
            }
          }
          
          // Update state once with all loaded data - only if mounted
          if (isMountedRef.current) {
            profileLog('Setting initial profile state');
            setScreenState(prev => ({
              ...prev,
              profile: newProfile,
              userSubscriptionStatus: subscriptionStatus || 'free',
              lifeDirection: lifeDirection || '',
              showAIButton: aiButtonValue === null ? true : aiButtonValue === 'true',
              referralCode,
              referralsLeft
            }));
          }
        } catch (error) {
          console.error('Error loading profile data:', error);
        }
      };
      
      loadProfileData();
      
      return () => {
        // Reset initialization flag when screen loses focus
        isInitialized.current = false;
        profileLog('Profile screen lost focus, resetting initialization');
      };
    }, [user?.email, user?.displayName, auth, contextProfile]) // Added contextProfile as dependency
  );
  
  // Helper function to load life direction
  const loadLifeDirection = async () => {
    try {
      const storedDirection = await AsyncStorage.getItem('lifeDirection');
      
      if (storedDirection) {
        profileLog('Loaded life direction from AsyncStorage:', storedDirection);
        return storedDirection;
      } else if (getLifeDirection) {
        const direction = getLifeDirection();
        profileLog('Loaded life direction from context:', direction);
        
        if (direction) {
          await AsyncStorage.setItem('lifeDirection', direction);
          return direction;
        }
      } else if (settings?.lifeDirection) {
        profileLog('Loaded life direction from settings:', settings.lifeDirection);
        await AsyncStorage.setItem('lifeDirection', settings.lifeDirection);
        return settings.lifeDirection;
      }
      
      return '';
    } catch (error) {
      console.error('Error loading life direction:', error);
      return '';
    }
  };
  
  // Function to manually calculate domains from goals
  const calculateDomainsFromGoals = useCallback(() => {
    if (!isMountedRef.current) return;
    
    profileLog('Calculating domains from goals...');
    profileLog('Goals available:', goals?.length);
    profileLog('MainGoals available:', mainGoals?.length);
    
    // Check if refreshDomains function is available from appContext
    if (typeof refreshDomains === 'function') {
      profileLog('Using appContext.refreshDomains() function');
      const refreshedDomains = refreshDomains();
      
      if (Array.isArray(refreshedDomains) && refreshedDomains.length > 0) {
        setScreenState(prev => ({ ...prev, localDomains: refreshedDomains }));
        return;
      }
    }
    
    const goalsToUse = Array.isArray(mainGoals) && mainGoals.length > 0 ? mainGoals : goals;
    
    if (!Array.isArray(goalsToUse) || goalsToUse.length === 0) {
      profileLog('No goals available to calculate domains');
      if (isMountedRef.current) {
        setScreenState(prev => ({ ...prev, localDomains: [] }));
      }
      return;
    }
    
    const domainMap = {};
    
    goalsToUse.forEach(goal => {
      if (!goal) return;
      
      let domainName = null;
      let domainIcon = null;
      let domainColor = null;
      
      // First priority: Check for explicit domain name
      if (goal.domain) {
        domainName = goal.domain;
        
        if (!domainColor && domainName.toLowerCase() in STANDARD_DOMAINS) {
          const standardDomain = STANDARD_DOMAINS[domainName.toLowerCase()];
          domainIcon = standardDomain.icon;
          domainColor = standardDomain.color;
        }
      }
      
      // Second priority: Check for domain through icon 
      if (goal.icon) {
        domainIcon = goal.icon;
        
        if (goal.icon.toLowerCase() in STANDARD_DOMAINS) {
          const standardDomain = STANDARD_DOMAINS[goal.icon.toLowerCase()];
          if (!domainName) {
            domainName = standardDomain.name;
          }
          if (!domainColor && goal.color === undefined) {
            domainColor = standardDomain.color;
          }
        }
      }
      
      // Use goal's specific color if available
      if (goal.color) {
        domainColor = goal.color;
      }
      
      // Fallback values if still not found
      if (!domainName) domainName = 'General';
      if (!domainIcon) domainIcon = 'star';
      if (!domainColor) domainColor = '#607D8B';
      
      const isCompleted = goal.completed === true;
      
      // Create or update domain in the map
      if (!domainMap[domainName]) {
        domainMap[domainName] = {
          id: domainName,
          name: domainName,
          icon: domainIcon,
          color: domainColor,
          goalCount: 1,
          completedGoalCount: isCompleted ? 1 : 0
        };
      } else {
        domainMap[domainName].goalCount++;
        if (isCompleted) {
          domainMap[domainName].completedGoalCount++;
        }
      }
    });
    
    const calculatedDomains = Object.values(domainMap);
    profileLog('Calculated domains:', calculatedDomains.length);
    
    if (isMountedRef.current) {
      setScreenState(prev => ({ ...prev, localDomains: calculatedDomains }));
    }
  }, [goals, mainGoals, refreshDomains]);
  
  // Load stats with proper dependency tracking to update in real time
  useFocusEffect(
    useCallback(() => {
      let loadComplete = false;
      
      const loadData = async () => {
        try {
          if (!isMountedRef.current || loadComplete) return;
          
          profileLog('Starting to load profile stats data');
          setScreenState(prev => ({ ...prev, isLoading: true }));
          
          // Wait for any pending operations to complete
          await new Promise(resolve => {
            InteractionManager.runAfterInteractions(resolve);
          });
          
          if (!isMountedRef.current) return;
          
          // Calculate goal statistics
          const goalsToUse = Array.isArray(mainGoals) && mainGoals.length > 0 ? mainGoals : goals;
          
          statsLog('Calculating goals stats');
          statsLog('Goals available:', goalsToUse?.length || 0);
          
          let activeGoalsCount = 0;
          let completedGoalsCount = 0;
          
          if (Array.isArray(goalsToUse) && goalsToUse.length > 0) {
            activeGoalsCount = goalsToUse.filter(goal => !goal.completed).length;
            completedGoalsCount = goalsToUse.filter(goal => goal.completed).length;
          }
          
          // Calculate active project count with improved logic
          statsLog('Calculating project stats');
          statsLog('Projects available:', projects?.length || 0);
          statsLog('Goals available:', goalsToUse?.length || 0);
          
          // First create a map of completed goals for fast lookup
          const completedGoalsMap = {};
          if (Array.isArray(goalsToUse)) {
            goalsToUse.forEach(goal => {
              if (goal.completed === true) {
                completedGoalsMap[goal.id] = true;
                statsLog(`Goal "${goal.title || 'unnamed'}" is completed, will skip its projects & tasks`);
              }
            });
          }
          
          // Create a set of all valid goal IDs to check for deleted goals
          const validGoalIds = new Set();
          if (Array.isArray(goalsToUse)) {
            goalsToUse.forEach(goal => {
              validGoalIds.add(goal.id);
              
              // Also log all valid goals for debugging
              statsLog(`Valid goal: "${goal.title || 'unnamed'}" (ID: ${goal.id})`);
            });
          }
          
          // Count active projects, excluding those belonging to completed goals
          let activeProjectsCount = 0;
          // Create a map of completed projects for use in task counting later
          const completedProjectsMap = {};
          
          if (Array.isArray(projects)) {
            // DEBUG: Log the first few projects to see their structure
            if (projects.length > 0) {
              statsLog('First project sample:', JSON.stringify(projects[0]));
            }
            
            activeProjectsCount = projects.filter(project => {
              // DEBUG: Log each project's status and completion
              statsLog(`Project "${project.title}": goalId=${project.goalId}, completed=${project.completed}, status=${project.status}`);
              
              // NEW: Skip projects that belong to deleted goals (goals that no longer exist)
              if (project.goalId && !validGoalIds.has(project.goalId)) {
                statsLog(`Project "${project.title}" belongs to a deleted goal (${project.goalId}), skipping`);
                // Mark this project as "completed" for task filtering purposes
                completedProjectsMap[project.id] = true;
                return false;
              }
              
              // Skip projects that belong to completed goals
              if (project.goalId && completedGoalsMap[project.goalId]) {
                // Mark this project as "completed" for task filtering purposes, 
                // even if it's not actually completed itself
                completedProjectsMap[project.id] = true;
                statsLog(`Project "${project.title}" belongs to a completed goal, skipping`);
                return false;
              }
              
              // A project is inactive if:
              // 1. It has completed=true OR
              // 2. It has status='done'
              if (project.completed === true || project.status === 'done') {
                // Add to completed projects map for task filtering
                completedProjectsMap[project.id] = true;
                return false;
              }
              
              // Otherwise, it's active
              return true;
            }).length;
          }
          
          // Enhanced task counting logic with hierarchical filtering
          statsLog('Calculating task stats');
          statsLog('Tasks available from AppContext:', tasks?.length || 0);
          
          // First try to count from the global tasks array
          let activeTasksCount = 0;
          
          if (Array.isArray(tasks) && tasks.length > 0) {
            // Log a sample task to understand structure
            statsLog('First task sample from global array:', JSON.stringify(tasks[0]));
            
            // Count active tasks from global tasks array
            activeTasksCount = tasks.filter(task => {
              // Log some task details for debugging
              if (tasks.indexOf(task) < 3) { // Only log first few to avoid spam
                statsLog(`Task "${task.title || 'unnamed'}": projectId=${task.projectId}, completed=${task.completed}, status=${task.status}`);
              }
              
              // Check if this task belongs to a completed project
              if (task.projectId && completedProjectsMap[task.projectId]) {
                // Skip tasks that belong to completed projects or projects of completed goals
                return false;
              }
              
              // Additional check: if this task is directly linked to a goal, check if that goal is completed
              if (task.goalId && completedGoalsMap[task.goalId]) {
                statsLog(`Task "${task.title || 'unnamed'}" belongs to a completed goal, skipping`);
                return false;
              }
              
              // NEW: Skip tasks that are directly linked to deleted goals
              if (task.goalId && !validGoalIds.has(task.goalId)) {
                statsLog(`Task "${task.title || 'unnamed'}" belongs to a deleted goal, skipping`);
                return false;
              }
              
              // Then check task's own completion status
              return !task.completed && task.status !== 'done';
            }).length;
            
            statsLog(`Active tasks from global array: ${activeTasksCount}`);
          } else {
            // If global tasks array is empty, try to count tasks from projects
            statsLog('Global tasks array is empty, trying to count tasks from projects...');
            
            if (Array.isArray(projects) && projects.length > 0) {
              // Iterate through all projects to count their tasks
              projects.forEach(project => {
                // Skip completed projects or projects belonging to completed goals
                if (project.completed === true || 
                    project.status === 'done' || 
                    (project.goalId && completedGoalsMap[project.goalId]) ||
                    (project.goalId && !validGoalIds.has(project.goalId))) {
                  statsLog(`Project "${project.title}" is completed or belongs to a completed/deleted goal, skipping its tasks`);
                  return;
                }
                
                // Check if this project has a tasks array
                if (Array.isArray(project.tasks) && project.tasks.length > 0) {
                  const projectActiveTasks = project.tasks.filter(task => 
                    !task.completed && task.status !== 'done'
                  ).length;
                  
                  activeTasksCount += projectActiveTasks;
                  statsLog(`Project "${project.title}": ${projectActiveTasks} active tasks`);
                }
              });
              
              statsLog(`Total active tasks from projects: ${activeTasksCount}`);
            }
            
            // If still no tasks found, try to load from AsyncStorage
            if (activeTasksCount === 0) {
              statsLog('No tasks found in projects, trying AsyncStorage...');
              try {
                const storedTasks = await AsyncStorage.getItem('tasks');
                if (storedTasks) {
                  const parsedTasks = JSON.parse(storedTasks);
                  statsLog(`Found ${parsedTasks.length} tasks in AsyncStorage`);
                  
                  if (Array.isArray(parsedTasks) && parsedTasks.length > 0) {
                    // For AsyncStorage tasks, we need project data too
                    const storedProjects = await AsyncStorage.getItem('projects');
                    const parsedProjects = storedProjects ? JSON.parse(storedProjects) : [];
                    
                    // Create a map of completed projects from AsyncStorage
                    const storedCompletedProjectsMap = {};
                    
                    if (Array.isArray(parsedProjects)) {
                      parsedProjects.forEach(project => {
                        // Mark projects as "completed" if they're actually completed or belong to completed/deleted goals
                        if (project.completed === true || 
                            project.status === 'done' || 
                            (project.goalId && completedGoalsMap[project.goalId]) ||
                            (project.goalId && !validGoalIds.has(project.goalId))) {
                          storedCompletedProjectsMap[project.id] = true;
                        }
                      });
                    }
                    
                    activeTasksCount = parsedTasks.filter(task => {
                      // Skip tasks from completed projects or goals
                      if (task.projectId && storedCompletedProjectsMap[task.projectId]) {
                        return false;
                      }
                      
                      // Check direct goal relation
                      if (task.goalId && completedGoalsMap[task.goalId]) {
                        return false;
                      }
                      
                      // NEW: Skip tasks directly linked to deleted goals
                      if (task.goalId && !validGoalIds.has(task.goalId)) {
                        return false;
                      }
                      
                      // Then check task's own completion status
                      return !task.completed && task.status !== 'done';
                    }).length;
                    
                    statsLog(`Active tasks from AsyncStorage (excluding completed projects/goals): ${activeTasksCount}`);
                  }
                }
              } catch (error) {
                console.error('Error reading tasks from AsyncStorage:', error);
              }
            }
          }
          
          statsLog(`FINAL COUNT: Active Projects: ${activeProjectsCount}, Active Goals: ${activeGoalsCount}, Completed Goals: ${completedGoalsCount}, Active Tasks: ${activeTasksCount}`);
          
          if (isMountedRef.current && !loadComplete) {
            profileLog('Setting final stats state');
            setScreenState(prev => ({
              ...prev,
              isLoading: false,
              totalActiveGoals: activeGoalsCount,
              completedGoals: completedGoalsCount,
              activeProjects: activeProjectsCount,
              totalActiveTasks: activeTasksCount
            }));
            
            loadComplete = true;
          }
        } catch (error) {
          console.error("Error loading profile data:", error);
          if (isMountedRef.current) {
            setScreenState(prev => ({ ...prev, isLoading: false }));
          }
        }
      };
      
      loadData();
      
      return () => {
        loadComplete = true;
      };
    }, [goals, mainGoals, projects, tasks]) // Dependencies for real-time updates
  );
  
  // Separate effect for calculating domains with proper debouncing
  useEffect(() => {
    if (!isMountedRef.current) return;
    
    // Clear any existing timeout
    if (domainCalculationTimeout.current) {
      clearTimeout(domainCalculationTimeout.current);
    }
    
    // Debounce domain calculation
    domainCalculationTimeout.current = setTimeout(() => {
      if (isMountedRef.current) {
        calculateDomainsFromGoals();
      }
    }, 300);
    
    return () => {
      if (domainCalculationTimeout.current) {
        clearTimeout(domainCalculationTimeout.current);
      }
    };
  }, [goals?.length, mainGoals?.length, calculateDomainsFromGoals]);
  
  // Generate a random referral code
  const generateReferralCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };
  
  // Save life direction
  const handleSaveLifeDirection = async (newDirection) => {
    profileLog('Saving new life direction:', newDirection);
    
    try {
      setScreenState(prev => ({ ...prev, lifeDirection: newDirection }));
      
      await AsyncStorage.setItem('lifeDirection', newDirection);
      
      if (typeof updateAppSetting === 'function') {
        updateAppSetting('lifeDirection', newDirection);
      }
      
      showSuccess('Life direction updated successfully');
    } catch (error) {
      console.error('Error saving life direction:', error);
      showError('Failed to save life direction');
    }
  };
  
  // Handle AI button toggle
  const handleToggleAIButton = async (value) => {
    try {
      setScreenState(prev => ({ ...prev, showAIButton: value }));
      
      await AsyncStorage.setItem('showAIButton', String(value));
      profileLog('Saved AI button setting to AsyncStorage:', String(value));
      
      if (typeof updateAppSetting === 'function') {
        updateAppSetting('showAIButton', value);
      }
      
      showSuccess(value ? 'AI button enabled' : 'AI button disabled');
    } catch (error) {
      console.error('Error saving AI button setting:', error);
      showError('Failed to update AI button setting');
    }
  };
  
  // Toggle lifetime membership status (for testing only)
  const handleToggleLifetimeMember = async (value) => {
    try {
      const newStatus = value ? 'pro' : 'free';
      
      // Update local state first for immediate UI feedback
      setScreenState(prev => ({ 
        ...prev, 
        userSubscriptionStatus: newStatus,
      }));
      
      // Update global AppContext state if function is available
      if (typeof updatePurchaseStatus === 'function') {
        await updatePurchaseStatus(newStatus);
        console.log(`Updated lifetime member status in AppContext to: ${newStatus}`);
      } else {
        // Fallback to direct AsyncStorage update if AppContext function isn't available
        await AsyncStorage.setItem('subscriptionStatus', newStatus);
        console.log(`Directly updated AsyncStorage lifetime member status to: ${newStatus}`);
      }
      
      // Handle referral code for lifetime members
      if (value) {
        let code = await AsyncStorage.getItem('referralCode');
        if (!code) {
          code = generateReferralCode();
          await AsyncStorage.setItem('referralCode', code);
          setScreenState(prev => ({ ...prev, referralCode: code }));
        }
        
        await AsyncStorage.setItem('referralsRemaining', '3');
        setScreenState(prev => ({ ...prev, referralsLeft: 3 }));
        
        // IMPORTANT: Check for eligible premium achievements now that user is pro
        try {
          // Import FeatureExplorerTracker dynamically to avoid circular dependencies
          const FeatureExplorerTracker = require('../../services/FeatureExplorerTracker');
          
          if (FeatureExplorerTracker && typeof FeatureExplorerTracker.checkPremiumStreakAchievements === 'function') {
            console.log('Checking for eligible premium achievements after upgrade');
            
            // Pass showSuccess function for notifications
            await FeatureExplorerTracker.checkPremiumStreakAchievements(showSuccess);
          }
        } catch (error) {
          console.error('Error checking premium achievements:', error);
        }
      }
      
      showSuccess(value ? 'Test as Lifetime Member enabled' : 'Test as Lifetime Member disabled');
    } catch (error) {
      console.error('Error toggling lifetime member status:', error);
      showError('Failed to update lifetime member status');
    }
  };
  
  // Handle domain color update
  const handleDomainColorSelect = (color) => {
    if (screenState.selectedDomain) {
      const updatedDomain = {
        ...screenState.selectedDomain,
        color: color
      };
      
      setScreenState(prev => ({
        ...prev,
        localDomains: prev.localDomains.map(domain => 
          domain.id === prev.selectedDomain.id || domain.name === prev.selectedDomain.name 
            ? updatedDomain 
            : domain
        ),
        showDomainColorPicker: false
      }));
      
      if (typeof updateDomain === 'function') {
        updateDomain(updatedDomain);
        showSuccess(`Updated ${screenState.selectedDomain.name} domain color`);
      }
    }
  };
  
  // Handle theme color change
  const handleThemeColorChange = async (color) => {
    try {
      // Always ensure colored theme is enabled (no need to check)
      if (typeof toggleColoredTheme === 'function') {
        toggleColoredTheme(true);
      }
      
      if (typeof updateTheme === 'function') {
        updateTheme({ primary: color });
      }
      
      showSuccess('App theme updated successfully');
    } catch (error) {
      console.error('Error setting theme color:', error);
      showError('Failed to update theme color');
    }
  };
  
  // Toggle between B&W and colored themes
  const handleToggleColoredTheme = async (value) => {
    setScreenState(prev => ({ ...prev, useColoredTheme: value }));
    if (typeof toggleColoredTheme === 'function') {
      toggleColoredTheme(value);
    }
  };
  
  // Force refresh domains
  const forceRefreshDomains = () => {
    calculateDomainsFromGoals();
    showSuccess("Domain data refreshed");
  };
  
  // Show AI explanation
  const handleShowAIExplanation = () => {
    setScreenState(prev => ({ ...prev, showAIExplanation: true }));
  };
  
  // State toggle handlers
  const toggleSettings = () => {
    setScreenState(prev => ({ ...prev, showSettings: !prev.showSettings }));
  };
  
  const handleDomainPress = (domain) => {
    setScreenState(prev => ({
      ...prev,
      selectedDomain: domain,
      showDomainColorPicker: true
    }));
  };
  
  const handleCloseExplanation = () => {
    setScreenState(prev => ({ ...prev, showAIExplanation: false }));
  };
  
  const closeThemeColorPicker = () => {
    setScreenState(prev => ({ ...prev, showThemeColorPicker: false }));
  };
  
  const closeDomainColorPicker = () => {
    setScreenState(prev => ({ ...prev, showDomainColorPicker: false }));
  };
  
  // Calculate total domains once
  const totalDomains = screenState.localDomains ? screenState.localDomains.length : 0;
  
  // If auth is not ready yet, show a loading state
  if (!auth) {
    profileLog('Rendering loading screen: auth not ready');
    return (
      <View style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <StatusBar backgroundColor={theme.primary} barStyle={isDarkMode ? 'light-content' : 'dark-content'} translucent={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text 
            style={[styles.loadingText, { color: theme.text }]}
            maxFontSizeMultiplier={1.3}
          >
            Initializing...
          </Text>
        </View>
      </View>
    );
  }
  
  if (screenState.isLoading) {
    profileLog('Rendering loading screen: screenState.isLoading = true');
    return (
      <View style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <StatusBar backgroundColor={theme.primary} barStyle={isDarkMode ? 'light-content' : 'dark-content'} translucent={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text 
            style={[styles.loadingText, { color: theme.text }]}
            maxFontSizeMultiplier={1.3}
          >
            Loading Profile...
          </Text>
        </View>
      </View>
    );
  }
  
  profileLog('Rendering full profile screen');
  statsLog('Current counts in state:', 
    'active goals:', screenState.totalActiveGoals, 
    'active projects:', screenState.activeProjects,
    'completed goals:', screenState.completedGoals,
    'active tasks:', screenState.totalActiveTasks
  );
  
  // Check for Dynamic Island
  const hasDynamicIsland = insets.top >= 59;
  
  return (
    <View style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Make StatusBar use the primary color and be translucent */}
      <StatusBar 
        backgroundColor={theme.primary} 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        translucent={true}
      />
      
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.scrollContent, 
          { paddingBottom: 60 } // Original bottom padding
        ]} 
        showsVerticalScrollIndicator={false}
        accessibilityRole="scrollView"
        // Add these properties to control overscroll behavior
        overScrollMode="always"
        bounces={true}
        alwaysBounceVertical={true}
        // Customize refresh control appearance
        refreshControl={
          <RefreshControl
            refreshing={false}
            enabled={true}
            onRefresh={() => {}}
            colors={[theme.primary]} // Android
            progressBackgroundColor="transparent" // Android
            tintColor={theme.primary} // iOS
            progressViewOffset={0}
          />
        }
      >
        {/* Profile Banner - now includes settings button and starts from top of screen */}
        <ProfileHeader.Banner 
          theme={theme}
          isDarkMode={isDarkMode}
          profile={screenState.profile}
          user={user}
          navigation={navigation}
          onThemePickerOpen={() => setScreenState(prev => ({ ...prev, showThemeColorPicker: true }))}
          toggleSettings={toggleSettings} // Pass the settings toggle handler to Banner
        />
        
        {/* Stats Cards */}
        <StatsRow 
          theme={theme}
          totalDomains={totalDomains}
          totalActiveGoals={screenState.totalActiveGoals}
          activeProjects={screenState.activeProjects}
          totalActiveTasks={screenState.totalActiveTasks}
          navigation={navigation}
        />
        
        {/* Debug Button - Only visible in development mode */}
        {screenState.showDebugTools && (
          <View style={styles.debugButtonContainer}>
            <TouchableOpacity
              style={[styles.debugButton, { backgroundColor: theme.primary }]}
              onPress={debugStorageContents}
              accessibilityLabel="Debug Storage Contents"
              accessibilityRole="button"
            >
              <Ionicons name="bug-outline" size={20} color="#FFFFFF" />
              <Text style={styles.debugButtonText}>Debug Storage</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Domain Balance Wheel - replacing Life Direction section */}
        <View style={[styles.sectionContainer, { marginTop: 16 }]}>
          <DomainBalanceWheel 
            theme={theme}
            navigation={navigation}
          />
        </View>
        
        {/* Customizable Dashboard */}
        <CustomizableDashboard 
          theme={theme}
          navigation={navigation}
        />
        
        {/* Extra space to ensure content is visible above tab bar */}
        <View style={{ height: 60 }} />
      </ScrollView>
      
      {/* Settings Modal */}
      <SettingsModal 
        visible={screenState.showSettings}
        theme={theme}
        isDarkMode={isDarkMode}
        isAdmin={isAdmin}
        screenState={screenState}
        onClose={toggleSettings}
        onToggleAIButton={handleToggleAIButton}
        onToggleLifetimeMember={handleToggleLifetimeMember}
        onShowAIExplanation={handleShowAIExplanation}
        navigation={navigation}
        onLogout={toggleSettings}
        updateAppSetting={updateAppSetting}
      />
      
      {/* AI Explanation Modal */}
      <AIExplanationModal 
        visible={screenState.showAIExplanation}
        theme={theme}
        isDarkMode={isDarkMode}
        showAIButton={screenState.showAIButton}
        arrowAnimation={arrowAnimation}
        onClose={handleCloseExplanation}
      />
      
      {/* Domain Color Picker Modal */}
      <DomainColorPickerModal
        visible={screenState.showDomainColorPicker}
        theme={theme}
        isDarkMode={isDarkMode}
        selectedDomain={screenState.selectedDomain}
        onClose={closeDomainColorPicker}
        onSelectColor={handleDomainColorSelect}
      />
      
      {/* Theme Color Picker Modal */}
      <ThemeColorPickerModal
        visible={screenState.showThemeColorPicker}
        theme={theme}
        isDarkMode={isDarkMode}
        themeColor={themeColor}
        onSelectColor={handleThemeColorChange}
        onClose={closeThemeColorPicker}
        navigation={navigation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 300,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  scrollContent: {
    paddingBottom: 100,
    paddingTop: 0, // Remove top padding since we start with the banner
  },
  sectionContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  // Debug button styles
  debugButtonContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  debugButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
  },
  debugButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
});

export default ProfileScreen;