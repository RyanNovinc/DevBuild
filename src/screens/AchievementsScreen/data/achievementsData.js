// src/screens/AchievementsScreen/data/achievementsData.js

// Categories
export const CATEGORIES = [
  {
    id: 'strategic',
    title: 'Strategic Progress',
    icon: 'rocket',
    color: '#2563eb', // Blue
    description: 'Build your strategic framework'
  },
  {
    id: 'consistency',
    title: 'Consistency Champions',
    icon: 'time',
    color: '#9333ea', // Purple
    description: 'Maintain regular usage of LifeCompass'
  },
  {
    id: 'ai',
    title: 'AI Mastery',
    icon: 'sparkles',
    color: '#16a34a', // Green
    description: 'Leverage AI for personal growth'
  },
  {
    id: 'explorer',
    title: 'Feature Explorer',
    icon: 'compass',
    color: '#db2777', // Pink
    description: 'Explore all app features'
  },
  {
    id: 'premium',
    title: 'Premium Perks',
    icon: 'star',
    color: '#f59e0b', // Amber
    description: 'Premium member benefits'
  }
];

// Achievements
export const ACHIEVEMENTS = {
  // Strategic Progress (8)
  // 5 Free, 3 Premium (37.5% premium)
  'vision-setter': {
    id: 'vision-setter',
    title: 'Vision Setter',
    description: 'Create your first life direction statement',
    icon: 'navigate',
    category: 'strategic',
    criteria: 'Create and save your first life direction statement in your profile.',
    points: 5
  },
  'foundation-builder': {
    id: 'foundation-builder',
    title: 'Foundation Builder',
    description: 'Complete the full onboarding journey',
    icon: 'construct',
    category: 'strategic',
    criteria: 'Complete the entire onboarding process by selecting a domain, goal, and setting up your personalized life compass.',
    points: 10
  },
  'goal-pioneer': {
    id: 'goal-pioneer',
    title: 'Goal Pioneer',
    description: 'Create your first goal',
    icon: 'flag',
    category: 'strategic',
    criteria: 'Create your first goal in any domain.',
    points: 5
  },
  'strategic-thinker': {
    id: 'strategic-thinker',
    title: 'Strategic Thinker',
    description: 'Link a project to a goal',
    icon: 'link',
    category: 'strategic',
    criteria: 'Create a project and link it to an existing goal.',
    points: 10
  },
  'milestone-marker': {
    id: 'milestone-marker',
    title: 'Milestone Marker',
    description: 'Set a completion date on a goal',
    icon: 'calendar',
    category: 'strategic',
    criteria: 'Add a completion date to any goal.',
    points: 5
  },
  'progress-tracker': {
    id: 'progress-tracker',
    title: 'Progress Tracker',
    description: 'Update goal progress 5 times',
    icon: 'analytics',
    category: 'strategic',
    criteria: 'Update the progress on any of your goals at least 5 different times.',
    points: 15
  },
  'domain-diversifier': {
    id: 'domain-diversifier',
    title: 'Domain Diversifier',
    description: 'Create goals in 3 different life domains',
    icon: 'layers',
    category: 'strategic',
    criteria: 'Create at least one goal in each of 3 different life domains.',
    points: 20,
    premium: true
  },
  'system-builder': {
    id: 'system-builder',
    title: 'System Builder',
    description: 'Have an active structure of 3+ goals with linked projects',
    icon: 'construct',
    category: 'strategic',
    criteria: 'Create at least 3 goals with at least one linked project each.',
    points: 25,
    premium: true
  },
  'completion-champion': {
    id: 'completion-champion',
    title: 'Completion Champion',
    description: 'Complete your first goal (any type)',
    icon: 'checkmark-circle',
    category: 'strategic',
    criteria: 'Mark any goal as completed.',
    points: 20,
    premium: true
  },

  // Consistency Champions (5)
  // 3 Free, 2 Premium (40% premium)
  '7-day-streak': {
    id: '7-day-streak',
    title: '7-Day Streak',
    description: 'Use the app for 7 consecutive days',
    icon: 'flame',
    category: 'consistency',
    criteria: 'Open the app at least once per day for 7 consecutive days.',
    points: 10
  },
  '30-day-momentum': {
    id: '30-day-momentum',
    title: '30-Day Momentum',
    description: 'Use the app for 30 consecutive days',
    icon: 'trending-up',
    category: 'consistency',
    criteria: 'Open the app at least once per day for 30 consecutive days.',
    reward: '+1 referral code',
    points: 30
  },
  '90-day-transformation': {
    id: '90-day-transformation',
    title: '90-Day Transformation',
    description: 'Use the app for 90 consecutive days',
    icon: 'trophy',
    category: 'consistency',
    criteria: 'Open the app at least once per day for 90 consecutive days.',
    reward: '+1 referral code',
    points: 50
  },
  'half-year-mastermind': {
    id: 'half-year-mastermind',
    title: 'Half-Year Mastermind',
    description: 'Use the app for 180 consecutive days',
    icon: 'medal',
    category: 'consistency',
    criteria: 'Open the app at least once per day for 180 consecutive days.',
    points: 100,
    premium: true
  },
  'year-of-progress': {
    id: 'year-of-progress',
    title: 'Year of Progress',
    description: 'Use the app for 365 consecutive days',
    icon: 'ribbon',
    category: 'consistency',
    criteria: 'Open the app at least once per day for 365 consecutive days.',
    points: 200,
    premium: true
  },

  // AI Mastery (5)
  // 3 Free, 2 Premium (40% premium)
  'ai-apprentice': {
    id: 'ai-apprentice',
    title: 'AI Apprentice',
    description: 'Complete your first AI conversation',
    icon: 'chatbubble',
    category: 'ai',
    criteria: 'Have a complete conversation with the AI assistant.',
    points: 5
  },
  'document-master': {
    id: 'document-master',
    title: 'Document Master',
    description: 'Upload your first document to AI context',
    icon: 'document',
    category: 'ai',
    criteria: 'Upload a document to provide context for an AI conversation.',
    points: 10
  },
  'strategic-advisor': {
    id: 'strategic-advisor',
    title: 'Strategic Advisor',
    description: 'Use AI to generate a new goal or project',
    icon: 'bulb',
    category: 'ai',
    criteria: 'Generate a goal or project using AI and add it to your system.',
    points: 15
  },
  'time-optimizer': {
    id: 'time-optimizer',
    title: 'Time Optimizer',
    description: 'Create a time block based on AI recommendation',
    icon: 'timer',
    category: 'ai',
    criteria: 'Get a time block recommendation from AI and add it to your schedule.',
    points: 15,
    premium: true
  },
  'ai-power-user': {
    id: 'ai-power-user',
    title: 'AI Power User',
    description: 'Have 50+ productive AI conversations',
    icon: 'flash',
    category: 'ai',
    criteria: 'Use the AI assistant for at least 50 meaningful conversations.',
    points: 50,
    premium: true
  },

  // Feature Explorer (9) - UPDATED
  // 7 Free, 2 Premium (22% premium)
  'profile-personalizer': {
    id: 'profile-personalizer',
    title: 'Profile Personalizer',
    description: 'Update your profile picture',
    icon: 'person-circle',
    category: 'explorer',
    criteria: 'Tap the profile picture to upload a custom image.',
    points: 5
  },
  'theme-customizer': {
    id: 'theme-customizer',
    title: 'Theme Customizer',
    description: 'Change your app\'s theme color',
    icon: 'color-palette',
    category: 'explorer',
    criteria: 'Change the app\'s theme color by tapping the profile banner.',
    points: 10
  },
  'dashboard-navigator': {
    id: 'dashboard-navigator',
    title: 'Dashboard Navigator',
    description: 'Access holistic view from dashboard',
    icon: 'apps',
    category: 'explorer',
    criteria: 'Tap on goals, projects, or tasks section in the dashboard to see the full system view.',
    points: 10
  },
  'domain-focus-master': {
    id: 'domain-focus-master',
    title: 'Domain Focus Master',
    description: 'Switch to active focus area view',
    icon: 'compass',
    category: 'explorer',
    criteria: 'Tap the middle of the equal domain balance wheel.',
    points: 15
  },
  'note-creator': {
    id: 'note-creator',
    title: 'Note Creator',
    description: 'Create your first note',
    icon: 'create',
    category: 'explorer',
    criteria: 'Add a note in the notes screen.',
    points: 10
  },
  'todo-organizer': {
    id: 'todo-organizer',
    title: 'Todo Organizer',
    description: 'Master todo batch organization',
    icon: 'repeat',
    category: 'explorer',
    criteria: 'Move all uncompleted items to the next day.',
    points: 15
  },
  'day-export-expert': {
    id: 'day-export-expert',
    title: 'Day Export Expert',
    description: 'Create your first day view PDF',
    icon: 'document',
    category: 'explorer',
    criteria: 'Export a day view as PDF.',
    points: 20
  },
  'week-export-pro': {
    id: 'week-export-pro',
    title: 'Week Export Pro',
    description: 'Create a week view PDF export',
    icon: 'calendar',
    category: 'explorer',
    criteria: 'Export a week view as PDF.',
    points: 25,
    premium: true
  },
  'month-export-pro': {
    id: 'month-export-pro',
    title: 'Month Export Pro',
    description: 'Create a month view PDF export',
    icon: 'calendar-clear',
    category: 'explorer',
    criteria: 'Export a month view as PDF.',
    points: 30,
    premium: true
  },

  // Premium Perks (5)
  // 0 Free, 5 Premium (100% premium - makes sense since they're premium perks)
  'insider-status': {
    id: 'insider-status',
    title: 'Insider Status',
    description: 'Upgrade to a paid AI subscription',
    icon: 'diamond',
    category: 'premium',
    criteria: 'Purchase any paid AI subscription.',
    points: 50,
    premium: true
  },
  'referral-guide': {
    id: 'referral-guide',
    title: 'Referral Guide',
    description: 'Successfully refer a friend',
    icon: 'person-add',
    category: 'premium',
    criteria: 'Have a friend sign up using your referral code.',
    reward: 'AI credits',
    points: 25,
    premium: true
  },
  'community-builder': {
    id: 'community-builder',
    title: 'Community Builder',
    description: 'Refer 3 friends (Maximum capacity)',
    icon: 'people',
    category: 'premium',
    criteria: 'Have 3 friends sign up using your referral code.',
    points: 75,
    premium: true
  },
  'early-adopter': {
    id: 'early-adopter',
    title: 'Early Adopter',
    description: 'Join during the founding member period',
    icon: 'rocket',
    category: 'premium',
    criteria: 'Create your account during the founding member period.',
    points: 100,
    premium: true
  },
  'feature-influencer': {
    id: 'feature-influencer',
    title: 'Feature Influencer',
    description: 'Submit app feedback as a Pro member',
    icon: 'git-merge',
    category: 'premium',
    criteria: 'Submit feedback or a feature request as a Pro member.',
    points: 50,
    premium: true
  }
};