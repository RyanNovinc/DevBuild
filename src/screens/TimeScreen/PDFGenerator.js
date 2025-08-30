// src/screens/TimeScreen/PDFGenerator.js
import { Alert, Platform, Share } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { generateFullscreenCalendarHTML } from './TimeScreenHelpers';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Load calendar icons from AsyncStorage
 */
const loadCalendarIcons = async () => {
  try {
    const storedIcons = await AsyncStorage.getItem('calendarIcons');
    return storedIcons ? JSON.parse(storedIcons) : {};
  } catch (error) {
    console.error('Error loading calendar icons:', error);
    return {};
  }
};

/**
 * Load current view mode from AsyncStorage
 */
const loadViewMode = async () => {
  try {
    const storedViewMode = await AsyncStorage.getItem('monthViewMode');
    return storedViewMode || 'dots'; // Default to dots if nothing saved
  } catch (error) {
    console.error('Error loading view mode:', error);
    return 'dots';
  }
};

/**
 * Generate a simplified HTML content for PDF export
 * This version is optimized for performance and stability
 */
export const generateSimplifiedHTML = (
  selectedView, 
  currentDate, 
  formatDate, 
  getTimeBlocksForDate,
  userName = 'User',
  weekDates = null
) => {
  try {
    // Generate proper titles based on view type
    let title;
    if (selectedView === 'day') {
      // "John's Daily Schedule - Wednesday, August 28, 2025"
      const formattedDate = formatDate(currentDate, 'long');
      title = `${userName}'s Daily Schedule - ${formattedDate}`;
    } else if (selectedView === 'week') {
      // "John's Weekly Schedule - Aug 25 - Aug 31, 2025"
      if (weekDates && weekDates.length > 0) {
        const startDate = weekDates[0];
        const endDate = weekDates[6];
        const startFormatted = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const endFormatted = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        title = `${userName}'s Weekly Schedule - ${startFormatted} - ${endFormatted}`;
      } else {
        // Fallback if weekDates not provided
        const formattedDate = formatDate(currentDate, 'long');
        title = `${userName}'s Weekly Schedule - Week of ${formattedDate}`;
      }
    } else {
      // Fallback for other views
      const formattedDate = formatDate(currentDate, 'long');
      const viewType = (selectedView || 'day').charAt(0).toUpperCase() + (selectedView || 'day').slice(1);
      title = `${userName}'s ${viewType} Schedule - ${formattedDate}`;
    }
    
    // Get blocks for the current date - with error checking
    const blocksForDay = getTimeBlocksForDate(currentDate) || [];
    
    // Create a basic HTML template with better styling
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TimeBlocks Calendar</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
            margin: 30px;
            color: #333;
            line-height: 1.4;
          }
          h1 { 
            font-size: 24px; 
            margin-bottom: 10px; 
            color: #222;
          }
          h2 { 
            font-size: 20px; 
            margin: 20px 0 15px; 
            color: #333;
          }
          p { margin: 5px 0; }
          .block { 
            border-left: 4px solid #4CAF50; 
            padding: 12px 15px; 
            margin-bottom: 15px;
            background-color: #f9f9f9;
            border-radius: 4px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .block.calendar { 
            border-left-color: #2196F3; 
            background-color: #f5f9ff;
          }
          .block.general { 
            border-left-color: #6366f1; 
            background-color: #f8f8ff;
          }
          .block.domain { 
            border-left-color: #4CAF50; 
            background-color: #f9f9f9;
          }
          .time { 
            font-weight: bold; 
            color: #444;
          }
          .title {
            font-size: 16px;
            font-weight: 600;
            margin: 6px 0;
          }
          .category {
            display: inline-block;
            background-color: #e0f2e0;
            color: #2e7d32;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 12px;
            margin-top: 5px;
          }
          .location {
            color: #555;
            font-size: 13px;
            margin-top: 5px;
          }
          .description {
            color: #666;
            font-size: 13px;
            margin-top: 8px;
            line-height: 1.3;
            font-style: italic;
          }
          .footer { 
            margin-top: 40px; 
            padding-top: 10px;
            border-top: 1px solid #eee;
            font-size: 12px; 
            color: #777; 
            text-align: center; 
          }
          .no-blocks {
            color: #777;
            font-style: italic;
            padding: 20px 0;
          }
          .watermark {
            margin-top: 20px;
            padding: 15px;
            text-align: center;
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
          }
          .watermark-logo {
            font-size: 18px;
            font-weight: bold;
            color: #3b5998;
            margin-bottom: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }
          .watermark-text {
            font-size: 11px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        
        <div class="content">
          ${blocksForDay.length > 0 ? 
            blocksForDay
              .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
              .map(block => {
                // Format times safely with error checking
                let startTime = '';
                let endTime = '';
                
                try {
                  startTime = new Date(block.startTime)
                    .toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                  endTime = new Date(block.endTime)
                    .toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                } catch (e) {
                  startTime = 'Invalid time';
                  endTime = 'Invalid time';
                }
                
                // Safe access to properties with defaults
                const title = block.title || 'Untitled';
                
                // Handle different block types
                let category;
                let blockType = 'timeblock'; // Default type for styling
                
                if (block.isCalendarEvent) {
                  category = `📅 ${block.source || 'Calendar Event'}`;
                  blockType = 'calendar';
                } else if (block.isGeneralActivity) {
                  category = block.category || 'General';
                  blockType = 'general';
                } else {
                  category = block.domain || 'Work';
                  blockType = 'domain';
                }
                
                const location = block.location || '';
                const description = block.description || '';
                
                // Create block HTML with error boundary
                return `
                  <div class="block ${blockType}">
                    <p class="time">${startTime} - ${endTime}</p>
                    <p class="title">${title}</p>
                    <div class="category">${category}</div>
                    ${location ? `<p class="location">📍 ${location}</p>` : ''}
                    ${description && block.isCalendarEvent ? `<p class="description">${description}</p>` : ''}
                  </div>
                `;
              }).join('') : 
            '<p class="no-blocks">No scheduled blocks for this day.</p>'
          }
        </div>
        
        <div class="footer">
          Generated on ${new Date().toLocaleString()}
        </div>
        
        <div class="watermark">
          <div class="watermark-logo">
            🧭 LifeCompass
          </div>
          <div class="watermark-text">
            Navigate Your Life with Purpose • lifecompass.app
          </div>
        </div>
      </body>
      </html>
    `;
    
    return html;
  } catch (error) {
    console.error('Error generating HTML:', error);
    // Return a simple error HTML
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Error</title>
      </head>
      <body>
        <h1>Something went wrong</h1>
        <p>Could not generate the calendar view.</p>
      </body>
      </html>
    `;
  }
};

/**
 * Generate and share PDF based on current view - completely rewritten
 * with robust error handling and resource management
 */
export const generateAndSharePDF = async (options) => {
  const {
    selectedView,
    currentDate,
    formatDate,
    getTimeBlocksForDate,
    monthDates,
    selectedMonthDay,
    userName
  } = options;
  
  // File path for temporary PDF
  let tempFilePath = null;
  
  try {
    
    // Step 1: Generate HTML content with error boundary
    console.log('Generating HTML content...');
    
    let htmlContent;
    if (selectedView === 'month') {
      // Use fullscreen calendar HTML for month view with current view mode
      const monthDate = new Date(monthDates[0].getFullYear(), monthDates[0].getMonth(), 1);
      const calendarIcons = await loadCalendarIcons();
      const currentViewMode = await loadViewMode();
      const viewModeForPDF = currentViewMode === 'addIcons' ? 'addIcons' : currentViewMode;
      htmlContent = generateFullscreenCalendarHTML(monthDate, calendarIcons, [], userName || 'User', viewModeForPDF, getTimeBlocksForDate);
    } else {
      // For other views, use the selected date
      const dateForPDF = selectedView === 'month' && monthDates && selectedMonthDay !== undefined
        ? monthDates[selectedMonthDay] 
        : currentDate;
      
      htmlContent = generateSimplifiedHTML(
        selectedView,
        dateForPDF,
        formatDate,
        getTimeBlocksForDate,
        userName || 'User',
        options.weekDates
      );
    }
    
    // Step 2: Create PDF file with optimized settings
    console.log('Creating PDF file...');
    const pdfResult = await Print.printToFileAsync({
      html: htmlContent,
      width: 612, // Standard letter width at 72 DPI
      height: 792, // Standard letter height at 72 DPI
      base64: false
    });
    
    // Store the file path for cleanup later
    tempFilePath = pdfResult.uri;
    console.log('PDF created at:', tempFilePath);
    
    // Step 3: Share the PDF based on platform
    if (Platform.OS === 'ios') {
      // For iOS, we'll use Print.printAsync which gives a better UX
      console.log('Sharing on iOS...');
      await Print.printAsync({
        uri: tempFilePath,
        preview: true // This ensures a preview is shown
      });
    } else {
      // For Android, check if sharing is available first
      console.log('Sharing on Android...');
      const isSharingAvailable = await Sharing.isAvailableAsync();
      
      if (isSharingAvailable) {
        await Sharing.shareAsync(tempFilePath, {
          mimeType: 'application/pdf',
          dialogTitle: 'View your TimeBlocks Calendar',
          UTI: 'com.adobe.pdf' // For iOS
        });
      } else {
        // Fallback to basic Share API
        await Share.share({
          url: tempFilePath,
          title: 'TimeBlocks Calendar'
        });
      }
    }
    
    console.log('PDF shared successfully');
  } catch (error) {
    console.error('PDF generation error:', error);
    console.log('Error message:', error?.message);
    console.log('Error code:', error?.code);
    
    // Check if user canceled the operation - be more comprehensive
    const errorMsg = error?.message?.toLowerCase() || '';
    const errorCode = error?.code?.toLowerCase() || '';
    const isUserCancelled = 
      errorMsg.includes('cancel') || 
      errorMsg.includes('dismiss') || 
      errorMsg.includes('aborted') ||
      errorMsg.includes('user cancelled') ||
      errorMsg.includes('user canceled') ||
      errorMsg.includes('operation was cancelled') ||
      errorMsg.includes('operation was canceled') ||
      errorMsg.includes('printing did not complete') || // iOS PDF sharing canceled
      errorCode === 'e_cancelled' ||
      errorCode === 'cancelled' ||
      errorCode === 'canceled' ||
      error?.code === 'E_CANCELLED';
    
    console.log('Is user cancelled:', isUserCancelled);
    
    if (!isUserCancelled) {
      Alert.alert(
        'PDF Generation Failed',
        'There was a problem creating your PDF. Would you like to try sharing as text instead?',
        [
          { 
            text: 'No', 
            style: 'cancel' 
          },
          { 
            text: 'Share as Text', 
            onPress: () => shareAsText(options) 
          }
        ]
      );
    }
  } finally {
    
    // Clean up temporary file if it exists and we're on Android
    // iOS manages its temp files automatically
    if (tempFilePath && Platform.OS === 'android') {
      try {
        await FileSystem.deleteAsync(tempFilePath, { idempotent: true });
        console.log('Temp file cleaned up');
      } catch (e) {
        console.log('Failed to clean up temp file:', e);
      }
    }
  }
};

/**
 * Fallback text sharing function with improved formatting
 */
export const shareAsText = async (options) => {
  const {
    selectedView,
    currentDate,
    formatDate,
    getTimeBlocksForDate,
    monthDates,
    selectedMonthDay,
    userName
  } = options;
  
  try {
    // For month view, use the selected month day instead of current date
    const dateForText = selectedView === 'month' && monthDates && selectedMonthDay !== undefined
      ? monthDates[selectedMonthDay] 
      : currentDate;
      
    // Create a simple text summary with better formatting
    const formattedDate = formatDate(dateForText, 'long');
    const viewType = (selectedView || 'day').charAt(0).toUpperCase() + (selectedView || 'day').slice(1);
    const blocksForDay = getTimeBlocksForDate(dateForText) || [];
    
    let textContent = `📅 TimeBlocks ${viewType} - ${formattedDate}\n\n`;
    
    if (blocksForDay.length === 0) {
      textContent += 'No scheduled blocks for this day.';
    } else {
      blocksForDay
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
        .forEach((block, index) => {
          // Format times with error handling
          let startTime = 'Invalid time';
          let endTime = 'Invalid time';
          
          try {
            startTime = new Date(block.startTime)
              .toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
            endTime = new Date(block.endTime)
              .toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
          } catch (e) {
            // Keep default error values
          }
          
          // Add divider between blocks except for the first one
          if (index > 0) textContent += '\n----------\n';
          
          textContent += `⏰ ${startTime} - ${endTime}: ${block.title || 'Untitled'}\n`;
          
          // Handle different block types
          if (block.isCalendarEvent) {
            textContent += `📅 Calendar Event (${block.source || 'Calendar'})\n`;
          } else {
            textContent += `🏷️ ${block.isGeneralActivity ? 
              (block.category || 'General') : 
              (block.domain || 'Work')}\n`;
          }
            
          if (block.location) {
            textContent += `📍 Location: ${block.location}\n`;
          }
          
          if (block.description && block.isCalendarEvent) {
            textContent += `📝 Notes: ${block.description}\n`;
          }
        });
    }
    
    // Share the text
    console.log('Sharing as text...');
    await Share.share({
      message: textContent,
      title: 'TimeBlocks Calendar'
    });
    
  } catch (error) {
    console.error('Text sharing failed:', error);
    
    // Show a simple error alert
    Alert.alert(
      'Sharing Failed',
      'Could not share calendar data.',
      [{ text: 'OK' }]
    );
  }
};