# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LifeCompass is a React Native application built with Expo SDK 53 that helps users manage their life goals, projects, tasks, and time. The app is designed for both iOS and Android platforms and includes features like goal tracking, time blocking, AI assistance, and achievement systems.

## Common Development Commands

### Build and Run
```bash
# Install dependencies
npm install

# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Prepare iOS build
npm run prepare-ios

# Troubleshoot common issues
./troubleshoot.sh
```

### Platform-Specific Builds
```bash
# Create development build
eas build --profile development --platform ios
eas build --profile development --platform android

# Create production build
eas build --profile production --platform ios
eas build --profile production --platform android
```

## High-Level Architecture

### Core Technology Stack
- **React Native 0.79.5** with **Expo SDK 53**
- **AWS Amplify** for authentication (Cognito)
- **Supabase** for backend data storage
- **React Navigation** for app navigation
- **Context API** for state management

### Key Architectural Patterns

1. **Context-Based State Management**
   - `AppContext`: Central state management for user data, goals, projects, tasks
   - `AuthContext`: Authentication state and user management
   - `ThemeContext`: Theme customization and dark mode support
   - `NotificationContext`: In-app notification system
   - `AchievementContext`: Achievement tracking and unlocking

2. **Navigation Structure**
   - Bottom tab navigation with 5 main tabs: Dashboard, Goals, Projects/Tasks, Time, To-Do/Notes
   - Each tab has its own stack navigator for nested screens
   - Floating AI Assistant button available globally

3. **AI Integration**
   - AI Assistant powered by Anthropic Claude API
   - WebSocket connection for real-time streaming responses
   - AI context service for personalized responses based on user data
   - Document processing for knowledge base

4. **Data Flow**
   - User data synced with Supabase backend
   - Local storage with AsyncStorage for offline capabilities
   - Real-time updates through WebSocket connections
   - Achievement tracking through FeatureExplorerTracker

### Critical Design Decisions

1. **Platform Fix** - The app includes a PlatformFix.js imported at the top of App.js to ensure Platform API is available globally (Hermes engine workaround)

2. **Metro Config** - Disabled package.json:exports feature in metro.config.js to fix Supabase compatibility issues with Expo SDK 53

3. **Responsive Design** - Comprehensive responsive utilities in src/utils/responsive.js handle different device sizes and orientations

4. **Keyboard Management** - iOS uses react-native-keyboard-manager with specific configuration to disable predictive text and auto-toolbar

5. **Error Boundaries** - NavigationErrorBoundary in App.js handles navigation-related errors and stack overflow issues

### Project Structure Patterns

- **Screens** follow a pattern of either single files or directories with index.js
- **Components** are organized by feature with sub-components in dedicated folders
- **Services** handle business logic and external API interactions
- **Context** providers manage global state
- **Utils** contain reusable utilities and helpers

### Authentication Flow

1. AWS Cognito handles user authentication
2. LoginScreen component in src/components/ai/LoginScreen
3. Onboarding flow for new users with goal/project setup
4. Subscription management through SubscriptionService

### Key Features to Understand

1. **Achievement System** - Tracks user actions and unlocks achievements
2. **Subscription Tiers** - Free, Pro, and Founder tiers with different feature access
3. **AI Credits System** - Usage-based AI assistant with credit management
4. **Time Blocking** - Calendar integration for time management
5. **Project Hierarchy** - Goals → Projects → Tasks structure
6. **Document Processing** - Upload and process documents for AI context

### Testing Approach

The project does not have a formal test suite. When making changes:
- Test on both iOS and Android platforms
- Verify responsive behavior on different device sizes
- Check navigation flows don't cause stack overflow
- Ensure AI features handle errors gracefully
- Test offline functionality

### Performance Considerations

- Tab screens use `unmountOnBlur: false` to maintain state
- Lazy loading disabled for tabs to prevent flicker
- WebSocket connections managed globally
- Image and asset optimization for bundle size

### Security Notes

- API keys and sensitive data stored in environment variables
- Supabase Row Level Security (RLS) for data access
- AWS Cognito for secure authentication
- No secrets should be committed to the repository
- It is still not displaying it correctly. Look at my profilescreen goals, projects, tasks counter closely. \
\
You will see how some things are not counted. You must do the same in the app context docuemnt.\
\
Do a deeper analysis of this
- I have no goals created, but even so, when I have tasks toggled and I click to add a task it should say something about yo need to do this before creating a task as it still refercnes before you can add projects