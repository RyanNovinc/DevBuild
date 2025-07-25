// ProjectCountFix.js
// Add this file to your project and import in ProfileScreen.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// This is a standalone fix for the project count issue
export const fixProjectCount = async () => {
  console.log('Starting project count fix...');
  
  try {
    // Step 1: Get the raw data directly from AsyncStorage
    const projectsJson = await AsyncStorage.getItem('projects');
    const goalsJson = await AsyncStorage.getItem('goals');
    
    if (!projectsJson || !goalsJson) {
      console.error('Could not find projects or goals in storage');
      return { success: false, message: 'Data not found' };
    }
    
    // Step 2: Parse the data
    const allProjects = JSON.parse(projectsJson);
    const allGoals = JSON.parse(goalsJson);
    
    if (!Array.isArray(allProjects) || !Array.isArray(allGoals)) {
      console.error('Invalid data format');
      return { success: false, message: 'Invalid data format' };
    }
    
    console.log(`Original project count: ${allProjects.length}`);
    
    // Step 3: Get valid goal IDs
    const validGoalIds = allGoals.map(goal => goal.id);
    
    // Step 4: Filter to only valid projects
    const validProjects = allProjects.filter(project => 
      !project.goalId || validGoalIds.includes(project.goalId)
    );
    
    console.log(`Valid project count: ${validProjects.length}`);
    console.log(`Found ${allProjects.length - validProjects.length} orphaned projects`);
    
    // Step 5: Backup the original data (just in case)
    await AsyncStorage.setItem('projects_backup', projectsJson);
    
    // Step 6: REMOVE the projects data completely
    await AsyncStorage.removeItem('projects');
    
    // Step 7: Wait a moment (this is important)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Step 8: Write the clean data back
    await AsyncStorage.setItem('projects', JSON.stringify(validProjects));
    
    console.log('Project count fix completed successfully!');
    
    return { 
      success: true, 
      message: `Projects fixed from ${allProjects.length} to ${validProjects.length}`,
      before: allProjects.length,
      after: validProjects.length
    };
  } catch (error) {
    console.error('Error fixing project count:', error);
    return { success: false, message: error.message };
  }
};

// Function to show in UI
export const runProjectFix = async () => {
  try {
    const result = await fixProjectCount();
    
    if (result.success) {
      Alert.alert(
        'Fix Complete',
        `Successfully fixed project count from ${result.before} to ${result.after}.\n\nPlease restart the app to see changes.`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Fix Failed',
        `Error: ${result.message}`,
        [{ text: 'OK' }]
      );
    }
    
    return result;
  } catch (error) {
    Alert.alert(
      'Error',
      `An unexpected error occurred: ${error.message}`,
      [{ text: 'OK' }]
    );
    
    return { success: false, message: error.message };
  }
};