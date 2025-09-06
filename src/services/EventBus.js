// EventBus - Centralized event management to replace global state
class EventBus {
  constructor() {
    this.events = {};
    this.onceEvents = {};
  }

  // Subscribe to an event
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    
    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  // Subscribe to an event that only fires once
  once(event, callback) {
    if (!this.onceEvents[event]) {
      this.onceEvents[event] = [];
    }
    this.onceEvents[event].push(callback);
  }

  // Unsubscribe from an event
  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }

  // Emit an event
  emit(event, data) {
    // Handle regular events
    if (this.events[event]) {
      this.events[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`EventBus error in ${event} handler:`, error);
        }
      });
    }

    // Handle once events
    if (this.onceEvents[event]) {
      this.onceEvents[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`EventBus error in ${event} once handler:`, error);
        }
      });
      // Clear once events after execution
      delete this.onceEvents[event];
    }
  }

  // Clear all listeners for an event
  removeAllListeners(event) {
    if (event) {
      delete this.events[event];
      delete this.onceEvents[event];
    } else {
      this.events = {};
      this.onceEvents = {};
    }
  }

  // Debug method to see active events
  getActiveEvents() {
    return {
      events: Object.keys(this.events),
      onceEvents: Object.keys(this.onceEvents)
    };
  }
}

// Create singleton instance
const eventBus = new EventBus();

export default eventBus;

// Common event types to replace global state
export const EVENTS = {
  // Tour events
  TOUR_START: 'tour:start',
  TOUR_NEXT_STEP: 'tour:nextStep',
  TOUR_COMPLETE: 'tour:complete',
  TOUR_SKIP: 'tour:skip',
  
  // Achievement events
  ACHIEVEMENT_UNLOCKED: 'achievement:unlocked',
  ACHIEVEMENT_SHOW_MODAL: 'achievement:showModal',
  
  // UI state events
  AI_BUTTON_TOGGLE: 'ui:aiButtonToggle',
  FULLSCREEN_TOGGLE: 'ui:fullscreenToggle',
  
  // Navigation events
  TAB_PRESS: 'navigation:tabPress',
  GOALS_VIEW_TOGGLE: 'navigation:goalsViewToggle',
  
  // App state events
  ONBOARDING_COMPLETE: 'app:onboardingComplete',
  CONTEXT_REFRESH: 'app:contextRefresh'
};