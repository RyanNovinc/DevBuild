// src/services/CalendarService.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// Try to import expo-calendar, but handle gracefully if not available in current build
let Calendar;
try {
  Calendar = require('expo-calendar');
} catch (error) {
  console.log('expo-calendar not available in current build - using mock implementation');
  Calendar = null;
}

class CalendarService {
  constructor() {
    this.isDevBuild = Calendar !== null;
    this.calendarEnabled = false;
    this.availableCalendars = [];
    this.selectedCalendarId = null;
    this.mockEvents = []; // For testing in current build
    
    this.init();
  }

  async init() {
    try {
      // Load calendar settings from storage
      const settings = await AsyncStorage.getItem('calendar_settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        this.calendarEnabled = parsed.enabled || false;
        this.selectedCalendarId = parsed.selectedCalendarId || null;
      }

      // Initialize mock data for current build testing
      if (!this.isDevBuild) {
        this.mockEvents = [
          {
            id: 'mock-1',
            title: 'Team Meeting',
            startDate: new Date(new Date().setHours(10, 0, 0, 0)),
            endDate: new Date(new Date().setHours(11, 0, 0, 0)),
            location: 'Conference Room A',
            notes: 'Weekly team sync',
            source: 'device_calendar',
            isReadOnly: true
          },
          {
            id: 'mock-2',
            title: 'Doctor Appointment',
            startDate: new Date(new Date().setHours(14, 30, 0, 0)),
            endDate: new Date(new Date().setHours(15, 30, 0, 0)),
            location: 'Medical Center',
            source: 'device_calendar',
            isReadOnly: true
          }
        ];
      }
    } catch (error) {
      console.error('Error initializing CalendarService:', error);
    }
  }

  // Permission Management
  async requestCalendarPermissions() {
    if (!this.isDevBuild) {
      console.log('Mock: Calendar permissions granted');
      return { status: 'granted' };
    }

    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      return { status };
    } catch (error) {
      console.error('Error requesting calendar permissions:', error);
      return { status: 'denied', error: error.message };
    }
  }

  async getCalendarPermissionStatus() {
    if (!this.isDevBuild) {
      return { status: 'granted' };
    }

    try {
      const { status } = await Calendar.getCalendarPermissionsAsync();
      return { status };
    } catch (error) {
      console.error('Error getting calendar permission status:', error);
      return { status: 'undetermined', error: error.message };
    }
  }

  // Calendar Management
  async getAvailableCalendars() {
    if (!this.isDevBuild) {
      return [
        {
          id: 'mock-primary',
          title: 'Primary Calendar',
          source: { name: 'Local', type: 'local' },
          allowsModifications: true,
          color: '#4CAF50',
          isPrimary: true
        },
        {
          id: 'mock-google',
          title: 'Google Calendar',
          source: { name: 'Google', type: 'caldav' },
          allowsModifications: true,
          color: '#2196F3',
          isPrimary: false
        }
      ];
    }

    try {
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      return calendars.map(cal => ({
        ...cal,
        isPrimary: cal.source?.name === 'Default' || cal.isPrimary
      }));
    } catch (error) {
      console.error('Error fetching calendars:', error);
      return [];
    }
  }

  async getDefaultCalendar() {
    const calendars = await this.getAvailableCalendars();
    
    // Try to find primary calendar
    let defaultCal = calendars.find(cal => cal.isPrimary);
    
    // Fallback to first writable calendar
    if (!defaultCal) {
      defaultCal = calendars.find(cal => cal.allowsModifications);
    }
    
    // Final fallback to first calendar
    if (!defaultCal && calendars.length > 0) {
      defaultCal = calendars[0];
    }
    
    return defaultCal;
  }

  // Event Reading
  async getEventsForDateRange(startDate, endDate, calendarIds = null) {
    if (!this.isDevBuild) {
      // Return mock events that fall within the date range
      return this.mockEvents.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate >= startDate && eventDate <= endDate;
      });
    }

    try {
      const calendars = calendarIds || (await this.getAvailableCalendars()).map(cal => cal.id);
      const events = await Calendar.getEventsAsync(calendars, startDate, endDate);
      
      return events.map(event => ({
        ...event,
        source: 'device_calendar',
        isReadOnly: true
      }));
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }

  async getEventsForDate(date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return this.getEventsForDateRange(startOfDay, endOfDay);
  }

  // Event Creation
  async createCalendarEvent(eventDetails) {
    if (!this.isDevBuild) {
      // Mock event creation
      const mockEvent = {
        id: `mock-created-${Date.now()}`,
        ...eventDetails,
        source: 'lifecompass',
        isReadOnly: false,
        createdAt: new Date()
      };
      
      console.log('Mock: Created calendar event:', mockEvent.title);
      return { success: true, eventId: mockEvent.id, event: mockEvent };
    }

    try {
      const calendar = await this.getSelectedCalendar();
      if (!calendar) {
        throw new Error('No calendar selected for event creation');
      }

      const eventId = await Calendar.createEventAsync(calendar.id, {
        title: eventDetails.title,
        startDate: eventDetails.startDate,
        endDate: eventDetails.endDate,
        location: eventDetails.location || '',
        notes: eventDetails.notes || '',
        timeZone: eventDetails.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        allDay: eventDetails.allDay || false,
        alarms: eventDetails.reminders ? [
          { relativeOffset: -15, method: Calendar.AlarmMethod.ALARM }
        ] : []
      });

      return { success: true, eventId, event: { id: eventId, ...eventDetails } };
    } catch (error) {
      console.error('Error creating calendar event:', error);
      return { success: false, error: error.message };
    }
  }

  // Event Updates
  async updateCalendarEvent(eventId, updates) {
    if (!this.isDevBuild) {
      console.log('Mock: Updated calendar event:', eventId, updates);
      return { success: true };
    }

    try {
      await Calendar.updateEventAsync(eventId, updates);
      return { success: true };
    } catch (error) {
      console.error('Error updating calendar event:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteCalendarEvent(eventId) {
    if (!this.isDevBuild) {
      console.log('Mock: Deleted calendar event:', eventId);
      return { success: true };
    }

    try {
      await Calendar.deleteEventAsync(eventId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      return { success: false, error: error.message };
    }
  }

  // Time Block Integration
  async syncTimeBlockToCalendar(timeBlock) {
    if (!this.calendarEnabled) {
      return { success: false, reason: 'Calendar sync disabled' };
    }

    const eventDetails = {
      title: timeBlock.title,
      startDate: new Date(timeBlock.startTime),
      endDate: new Date(timeBlock.endTime),
      location: timeBlock.location || '',
      notes: this.formatTimeBlockNotes(timeBlock),
      allDay: false
    };

    const result = await this.createCalendarEvent(eventDetails);
    
    if (result.success) {
      // Store the calendar event ID with the time block for future updates
      return {
        success: true,
        calendarEventId: result.eventId,
        event: result.event
      };
    }

    return result;
  }

  async updateTimeBlockInCalendar(timeBlock, calendarEventId) {
    if (!this.calendarEnabled || !calendarEventId) {
      return { success: false, reason: 'Calendar sync disabled or no event ID' };
    }

    const updates = {
      title: timeBlock.title,
      startDate: new Date(timeBlock.startTime),
      endDate: new Date(timeBlock.endTime),
      location: timeBlock.location || '',
      notes: this.formatTimeBlockNotes(timeBlock)
    };

    return this.updateCalendarEvent(calendarEventId, updates);
  }

  async deleteTimeBlockFromCalendar(calendarEventId) {
    if (!this.calendarEnabled || !calendarEventId) {
      return { success: false, reason: 'Calendar sync disabled or no event ID' };
    }

    return this.deleteCalendarEvent(calendarEventId);
  }

  // Helper Methods
  formatTimeBlockNotes(timeBlock) {
    let notes = '';
    
    if (timeBlock.description) {
      notes += timeBlock.description + '\n\n';
    }
    
    if (timeBlock.projectName) {
      notes += `Project: ${timeBlock.projectName}\n`;
    }
    
    if (timeBlock.taskName) {
      notes += `Task: ${timeBlock.taskName}\n`;
    }
    
    if (timeBlock.domain) {
      notes += `Domain: ${timeBlock.domain}\n`;
    }
    
    notes += '\nCreated with LifeCompass 📍';
    
    return notes.trim();
  }

  // Settings Management
  async enableCalendarSync(enabled = true) {
    this.calendarEnabled = enabled;
    await this.saveSettings();
    return { success: true };
  }

  async setSelectedCalendar(calendarId) {
    this.selectedCalendarId = calendarId;
    await this.saveSettings();
    return { success: true };
  }

  async getSelectedCalendar() {
    if (this.selectedCalendarId) {
      const calendars = await this.getAvailableCalendars();
      return calendars.find(cal => cal.id === this.selectedCalendarId);
    }
    
    return this.getDefaultCalendar();
  }

  async saveSettings() {
    try {
      const settings = {
        enabled: this.calendarEnabled,
        selectedCalendarId: this.selectedCalendarId
      };
      
      await AsyncStorage.setItem('calendar_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving calendar settings:', error);
    }
  }

  // Status Methods
  isCalendarSyncEnabled() {
    return this.calendarEnabled;
  }

  isDevBuildReady() {
    return this.isDevBuild;
  }

  getIntegrationStatus() {
    return {
      isDevBuild: this.isDevBuild,
      calendarEnabled: this.calendarEnabled,
      selectedCalendarId: this.selectedCalendarId,
      hasPermissions: this.isDevBuild ? null : true // Will be checked when dev build is ready
    };
  }
}

// Export singleton instance
const calendarService = new CalendarService();
export default calendarService;