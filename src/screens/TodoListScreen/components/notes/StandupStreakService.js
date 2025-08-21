// src/screens/TodoListScreen/components/notes/StandupStreakService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Streak tracking service for daily standups
 * Implements flexible streak system per research findings
 */

const STREAK_STORAGE_KEY = 'dailyStandupStreak';
const GRACE_PERIOD_HOURS = 48; // 48 hours grace period per research

export class StandupStreakService {
  
  static async getStreakData() {
    try {
      const stored = await AsyncStorage.getItem(STREAK_STORAGE_KEY);
      if (!stored) {
        return this.getDefaultStreakData();
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error loading streak data:', error);
      return this.getDefaultStreakData();
    }
  }

  static getDefaultStreakData() {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastCompletionDate: null,
      totalCompletions: 0,
      streakStartDate: null,
      gracePeriodUsed: false,
      freezeDaysRemaining: 0, // Optional streak freeze days
      weeklyCompletions: 0,
      monthlyCompletions: 0,
      completionDates: [], // Track all completion dates
      streakHistory: [] // Track streak milestones
    };
  }

  static async saveStreakData(streakData) {
    try {
      await AsyncStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify({
        ...streakData,
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error saving streak data:', error);
    }
  }

  static async recordCompletion(completionType = 'both', completionDate = null) {
    try {
      const getLocalDateString = (date = null) => {
        const targetDate = date ? new Date(date) : new Date();
        const year = targetDate.getFullYear();
        const month = String(targetDate.getMonth() + 1).padStart(2, '0');
        const day = String(targetDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      const completionDateString = completionDate ? getLocalDateString(completionDate) : getLocalDateString();
      const streakData = await this.getStreakData();
      
      // Check if already completed on this date
      if (streakData.lastCompletionDate === completionDateString) {
        return streakData; // No change needed
      }

      // Calculate the day before the completion date
      const targetDate = completionDate ? new Date(completionDate) : new Date();
      const dayBefore = new Date(targetDate);
      dayBefore.setDate(dayBefore.getDate() - 1);
      const yesterdayString = getLocalDateString(dayBefore);

      let newStreakData = { ...streakData };

      // Check if this maintains or breaks streak
      if (streakData.lastCompletionDate === yesterdayString) {
        // Continuing streak
        newStreakData.currentStreak += 1;
        newStreakData.gracePeriodUsed = false;
      } else if (this.isWithinGracePeriod(streakData.lastCompletionDate)) {
        // Within grace period - continue streak but mark grace used
        newStreakData.currentStreak += 1;
        newStreakData.gracePeriodUsed = true;
      } else if (streakData.lastCompletionDate === null) {
        // First ever completion
        newStreakData.currentStreak = 1;
        newStreakData.streakStartDate = completionDateString;
      } else {
        // Streak broken - start new streak
        if (newStreakData.currentStreak > newStreakData.longestStreak) {
          newStreakData.longestStreak = newStreakData.currentStreak;
        }
        newStreakData.currentStreak = 1;
        newStreakData.streakStartDate = completionDateString;
        newStreakData.gracePeriodUsed = false;
      }

      // Update completion tracking
      newStreakData.lastCompletionDate = completionDateString;
      newStreakData.totalCompletions += 1;
      newStreakData.completionDates.push(completionDateString);
      
      // Track milestone achievements
      if (this.isStreakMilestone(newStreakData.currentStreak)) {
        newStreakData.streakHistory.push({
          milestone: newStreakData.currentStreak,
          date: completionDateString,
          type: 'milestone'
        });
      }

      // Update longest streak if needed
      if (newStreakData.currentStreak > newStreakData.longestStreak) {
        newStreakData.longestStreak = newStreakData.currentStreak;
      }

      await this.saveStreakData(newStreakData);
      return newStreakData;
    } catch (error) {
      console.error('Error recording completion:', error);
      return await this.getStreakData();
    }
  }

  static isWithinGracePeriod(lastCompletionDate) {
    if (!lastCompletionDate) return false;
    
    const lastCompletion = new Date(lastCompletionDate);
    const now = new Date();
    const hoursDiff = (now - lastCompletion) / (1000 * 60 * 60);
    
    return hoursDiff <= GRACE_PERIOD_HOURS;
  }

  static isStreakMilestone(streakNumber) {
    // Celebrate at 3, 7, 14, 30, 60, 90, 180, 365 days
    const milestones = [3, 7, 14, 30, 60, 90, 180, 365];
    return milestones.includes(streakNumber);
  }

  static async useStreakFreeze() {
    try {
      const streakData = await this.getStreakData();
      if (streakData.freezeDaysRemaining > 0) {
        const newStreakData = {
          ...streakData,
          freezeDaysRemaining: streakData.freezeDaysRemaining - 1
        };
        await this.saveStreakData(newStreakData);
        return { success: true, remaining: newStreakData.freezeDaysRemaining };
      }
      return { success: false, reason: 'No freeze days remaining' };
    } catch (error) {
      console.error('Error using streak freeze:', error);
      return { success: false, reason: 'Error processing freeze' };
    }
  }

  static async grantStreakFreeze(days = 1) {
    try {
      const streakData = await this.getStreakData();
      const newStreakData = {
        ...streakData,
        freezeDaysRemaining: streakData.freezeDaysRemaining + days
      };
      await this.saveStreakData(newStreakData);
      return newStreakData;
    } catch (error) {
      console.error('Error granting streak freeze:', error);
      return await this.getStreakData();
    }
  }

  static async getWeeklyProgress() {
    try {
      const streakData = await this.getStreakData();
      const today = new Date();
      // Adjust for local timezone
      today.setHours(12, 0, 0, 0);
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
      
      const weeklyCompletions = streakData.completionDates.filter(date => {
        const completionDate = new Date(date);
        return completionDate >= weekStart;
      }).length;

      return {
        completions: weeklyCompletions,
        goal: 7, // Daily completion goal
        percentage: Math.round((weeklyCompletions / 7) * 100)
      };
    } catch (error) {
      console.error('Error calculating weekly progress:', error);
      return { completions: 0, goal: 7, percentage: 0 };
    }
  }

  static async getMonthlyProgress() {
    try {
      const streakData = await this.getStreakData();
      const today = new Date();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const daysInMonth = monthEnd.getDate();
      
      const monthlyCompletions = streakData.completionDates.filter(date => {
        const completionDate = new Date(date);
        return completionDate >= monthStart && completionDate <= today;
      }).length;

      return {
        completions: monthlyCompletions,
        goal: daysInMonth,
        percentage: Math.round((monthlyCompletions / daysInMonth) * 100)
      };
    } catch (error) {
      console.error('Error calculating monthly progress:', error);
      return { completions: 0, goal: 30, percentage: 0 };
    }
  }

  static getStreakMessage(streakData) {
    const { currentStreak, longestStreak, gracePeriodUsed } = streakData;
    
    if (currentStreak === 0) {
      return "Start your reflection journey today! 🌱";
    }
    
    if (currentStreak === 1) {
      return "Great start! Build momentum with day 2 🚀";
    }
    
    if (currentStreak <= 7) {
      return `${currentStreak} days strong! You're building a powerful habit 💪`;
    }
    
    if (currentStreak <= 30) {
      return `${currentStreak} day streak! Your commitment is inspiring 🔥`;
    }
    
    if (currentStreak <= 90) {
      return `${currentStreak} days of growth! You're a reflection master 🎯`;
    }
    
    return `${currentStreak} days! Your dedication is extraordinary 👑`;
  }

  static getMotivationalMessage(streakData, messageIndex = null) {
    const researchBasedMessages = [
      {
        text: "Written goals are 42% more likely to be achieved 🎯",
        source: "Matthews, Dominican University 2015"
      },
      {
        text: "Daily reflection improves performance by 23% 📈", 
        source: "Harvard Business School 2014"
      },
      {
        text: "Journaling reduces anxiety and stress significantly 🧘",
        source: "Chowdhury et al. Meta-analysis 2022"
      },
      {
        text: "Reflection builds resilience and coping skills 💪",
        source: "Crane et al. Anxiety, Stress & Coping 2019"
      },
      {
        text: "Gratitude practice increases happiness by 25% ✨",
        source: "Bohlmeijer et al. Journal of Happiness 2020"
      },
      {
        text: "Self-reflection enhances emotional intelligence 🧠",
        source: "1,096 student study, PMC 2024"
      },
      {
        text: "Writing about goals activates goal achievement centers 🔥",
        source: "Multiple neuroscience studies 2015-2024"
      },
      {
        text: "15 minutes of reflection = 18% better problem solving 🚀",
        source: "Wipro field study, Harvard 2014"
      }
    ];
    
    // If a specific index is provided, use it; otherwise use date-based selection
    let selectedIndex;
    if (messageIndex !== null) {
      selectedIndex = messageIndex % researchBasedMessages.length;
    } else {
      // Use current date as seed for default daily message
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      const dateNumber = parseInt(dateString.replace(/-/g, ''));
      selectedIndex = dateNumber % researchBasedMessages.length;
    }
    
    const selectedMessage = researchBasedMessages[selectedIndex];
    return `${selectedMessage.text}\n— ${selectedMessage.source}`;
  }

  static getResearchMessagesCount() {
    return 8; // Total number of research messages
  }

  static async resetStreak() {
    try {
      const defaultData = this.getDefaultStreakData();
      await this.saveStreakData(defaultData);
      return defaultData;
    } catch (error) {
      console.error('Error resetting streak:', error);
      return this.getDefaultStreakData();
    }
  }
}