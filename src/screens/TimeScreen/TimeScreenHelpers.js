// src/screens/TimeScreen/TimeScreenHelpers.js
// Helper functions for TimeScreen component with free tier limitations

/**
 * Generate repeating instances of timeblocks
 * Modified to handle free tier limitations
 * 
 * @param {Array} timeBlocks - Original array of time blocks
 * @param {boolean} isPremium - Whether user is on premium plan
 * @returns {Array} - Array of generated repeating instances
 */
export const generateRepeatingInstances = (timeBlocks, isPremium = false) => {
  if (!Array.isArray(timeBlocks)) return [];
  
  const repeatingBlocks = [];
  const today = new Date();
  
  // Look ahead period - generate instances for the next 3 months (premium)
  // or 2 weeks (free)
  const lookAheadDate = new Date();
  if (isPremium) {
    lookAheadDate.setMonth(lookAheadDate.getMonth() + 3); // 3 months for premium
  } else {
    lookAheadDate.setDate(lookAheadDate.getDate() + 14); // 2 weeks for free tier
  }
  
  // Find all repeating blocks
  timeBlocks.forEach(block => {
    // Skip if not a repeating block or if it's already a repeating instance
    if (!block.isRepeating || block.isRepeatingInstance) return;
    
    // For free tier, only allow weekly repeating
    if (!isPremium && block.repeatFrequency !== 'weekly') return;
    
    // Get the original block start date
    const originalStartDate = new Date(block.startTime);
    
    // Skip if the original date is in the future (no need to generate instances yet)
    if (originalStartDate > lookAheadDate) return;
    
    // Determine the end date for generating instances
    let endGenerationDate;
    if (block.repeatIndefinitely) {
      // If repeating indefinitely, use the look ahead date
      endGenerationDate = lookAheadDate;
    } else if (block.repeatUntil) {
      // If has an end date, use it or the look ahead date, whichever is sooner
      const repeatUntilDate = new Date(block.repeatUntil);
      endGenerationDate = repeatUntilDate < lookAheadDate ? repeatUntilDate : lookAheadDate;
    } else {
      // If no end date specified, use the look ahead date
      endGenerationDate = lookAheadDate;
    }
    
    // Calculate duration between start and end time
    const originalEndDate = new Date(block.endTime);
    const durationMs = originalEndDate.getTime() - originalStartDate.getTime();
    
    // Generate instances based on frequency
    let currentDate = new Date(originalStartDate);
    
    switch (block.repeatFrequency) {
      case 'daily':
        // Only available for premium users
        if (!isPremium) break;
        
        // Start from the day after the original
        currentDate.setDate(currentDate.getDate() + 1);
        
        // Generate daily instances
        while (currentDate <= endGenerationDate) {
          // Create instance for this date
          const instanceStartTime = new Date(currentDate);
          const instanceEndTime = new Date(instanceStartTime.getTime() + durationMs);
          
          // Create a copy of the block with the new dates
          const instance = {
            ...block,
            id: `${block.id}_${currentDate.toISOString()}`,
            startTime: instanceStartTime.toISOString(),
            endTime: instanceEndTime.toISOString(),
            isRepeatingInstance: true,
            originalTimeBlockId: block.id
          };
          
          repeatingBlocks.push(instance);
          
          // Move to next day
          currentDate.setDate(currentDate.getDate() + 1);
        }
        break;
        
      case 'weekly':
        // Start from one week after the original
        currentDate.setDate(currentDate.getDate() + 7);
        
        // Generate weekly instances
        while (currentDate <= endGenerationDate) {
          // Create instance for this date
          const instanceStartTime = new Date(currentDate);
          const instanceEndTime = new Date(instanceStartTime.getTime() + durationMs);
          
          // Create a copy of the block with the new dates
          const instance = {
            ...block,
            id: `${block.id}_${currentDate.toISOString()}`,
            startTime: instanceStartTime.toISOString(),
            endTime: instanceEndTime.toISOString(),
            isRepeatingInstance: true,
            originalTimeBlockId: block.id
          };
          
          repeatingBlocks.push(instance);
          
          // Move to next week
          currentDate.setDate(currentDate.getDate() + 7);
        }
        break;
        
      case 'monthly':
        // Only available for premium users
        if (!isPremium) break;
        
        // Start from one month after the original
        currentDate.setMonth(currentDate.getMonth() + 1);
        
        // Generate monthly instances
        while (currentDate <= endGenerationDate) {
          // Create instance for this date
          const instanceStartTime = new Date(currentDate);
          const instanceEndTime = new Date(instanceStartTime.getTime() + durationMs);
          
          // Create a copy of the block with the new dates
          const instance = {
            ...block,
            id: `${block.id}_${currentDate.toISOString()}`,
            startTime: instanceStartTime.toISOString(),
            endTime: instanceEndTime.toISOString(),
            isRepeatingInstance: true,
            originalTimeBlockId: block.id
          };
          
          repeatingBlocks.push(instance);
          
          // Move to next month
          currentDate.setMonth(currentDate.getMonth() + 1);
        }
        break;
    }
  });
  
  return repeatingBlocks;
};

/**
 * Format hour for display (e.g. "12 AM", "3 PM")
 * 
 * @param {number} hour - Hour in 24-hour format (0-23)
 * @returns {string} - Formatted hour
 */
export const formatHour = (hour) => {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
};

/**
 * Format time (HH:MM AM/PM)
 * 
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted time string
 */
export const formatTime = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

/**
 * Create a darker shade of a color for borders
 * 
 * @param {string} color - Hex color code
 * @returns {string} - Darker hex color
 */
export const getDarkerShade = (color) => {
  // Simple function to darken a hex color
  if (!color || typeof color !== 'string' || !color.startsWith('#')) {
    return '#333333';
  }
  
  // Convert hex to RGB
  let r = parseInt(color.slice(1, 3), 16);
  let g = parseInt(color.slice(3, 5), 16);
  let b = parseInt(color.slice(5, 7), 16);
  
  // Darken by reducing each component by 30%
  r = Math.floor(r * 0.7);
  g = Math.floor(g * 0.7);
  b = Math.floor(b * 0.7);
  
  // Convert back to hex with padding
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

/**
 * Checks if a date is within the free tier planning horizon
 * 
 * @param {Date} date - Date to check 
 * @returns {boolean} - True if date is within planning horizon
 */
export const isWithinFreePlanningHorizon = (date) => {
  const twoWeeksFromNow = new Date();
  twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14); // 2 weeks ahead
  
  return date <= twoWeeksFromNow;
};

/**
 * Count time blocks for the current week
 * 
 * @param {Array} timeBlocks - Array of time blocks
 * @returns {number} - Count of blocks in current week
 */
export const countTimeBlocksThisWeek = (timeBlocks) => {
  if (!Array.isArray(timeBlocks)) return 0;
  
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)); // Monday
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
  endOfWeek.setHours(23, 59, 59, 999);
  
  return timeBlocks.filter(block => {
    if (!block || !block.startTime) return false;
    
    const blockDate = new Date(block.startTime);
    return blockDate >= startOfWeek && blockDate <= endOfWeek;
  }).length;
};

/**
 * Check if user has reached the weekly time block limit
 * 
 * @param {Array} timeBlocks - Array of time blocks
 * @returns {Object} - Object with limitReached and counts
 */
export const checkWeeklyTimeBlockLimit = (timeBlocks) => {
  const weeklyCount = countTimeBlocksThisWeek(timeBlocks);
  const weeklyLimit = 5; // Free tier limit
  
  return {
    limitReached: weeklyCount >= weeklyLimit,
    current: weeklyCount,
    max: weeklyLimit
  };
};

/**
 * Create a text summary for fallback sharing
 * Modified to support watermarking
 */
export const createTextSummary = (selectedView, currentDate, formatDate, getTimeBlocksForDate, formatTime, getMonthName, weekDates, isToday, monthDates, selectedMonthDay, addWatermark = false) => {
  const viewType = selectedView.charAt(0).toUpperCase() + selectedView.slice(1);
  let summary = `TimeBlocks ${viewType} Calendar - ${formatDate(currentDate, 'long')}\n\n`;
  
  if (selectedView === 'day') {
    const blocksForDay = getTimeBlocksForDate(currentDate);
    if (blocksForDay.length === 0) {
      summary += "No time blocks scheduled for this day.\n";
    } else {
      summary += "Time Blocks:\n";
      blocksForDay
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
        .forEach(block => {
          summary += `\n• ${formatTime(block.startTime)} - ${formatTime(block.endTime)}: ${block.title}`;
          if (block.projectTitle && !block.isGeneralActivity) {
            summary += `\n  Project: ${block.projectTitle}`;
          }
          if (block.taskTitle && !block.isGeneralActivity) {
            summary += `\n  Task: ${block.taskTitle}`;
          }
          summary += `\n  ${block.isGeneralActivity ? block.category : block.domain}`;
          if (block.location) {
            summary += `\n  Location: ${block.location}`;
          }
        });
    }
  } else if (selectedView === 'week') {
    for (const date of weekDates) {
      const blocksForDay = getTimeBlocksForDate(date);
      summary += `\n${formatDate(date, 'short')}${isToday(date) ? ' (Today)' : ''}:\n`;
      
      if (blocksForDay.length === 0) {
        summary += "  No time blocks\n";
      } else {
        blocksForDay
          .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
          .forEach(block => {
            summary += `  • ${formatTime(block.startTime)}: ${block.title}\n`;
          });
      }
    }
  } else if (selectedView === 'month') {
    summary += `${getMonthName(currentDate.getMonth())} ${currentDate.getFullYear()}\n\n`;
    
    // Add selected day details
    const selectedDate = monthDates[selectedMonthDay];
    const blocksForSelectedDay = getTimeBlocksForDate(selectedDate);
    
    summary += `Selected Day: ${formatDate(selectedDate, 'long')}${isToday(selectedDate) ? ' (Today)' : ''}\n`;
    
    if (blocksForSelectedDay.length === 0) {
      summary += "No time blocks scheduled for this day.\n";
    } else {
      blocksForSelectedDay
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
        .forEach(block => {
          summary += `\n• ${formatTime(block.startTime)} - ${formatTime(block.endTime)}: ${block.title}`;
          if (block.projectTitle && !block.isGeneralActivity) {
            summary += `\n  Project: ${block.projectTitle}`;
          }
          if (block.taskTitle && !block.isGeneralActivity) {
            summary += `\n  Task: ${block.taskTitle}`;
          }
        });
    }
  }
  
  // Add watermark text if needed
  if (addWatermark) {
    summary += '\n\n----------------------------------';
    summary += '\nGenerated with LifeCompass Free Version';
    summary += '\nUpgrade to Pro for unlimited time blocks!';
    summary += '\n----------------------------------';
  }
  
  return summary;
};

/**
 * Generate HTML content for the day view in PDF
 * Modified to support watermarking
 */
export const generateDayViewHTML = async (currentDate, getTimeBlocksForDate, formatTime, theme, addWatermark = false) => {
  const blocksForDay = getTimeBlocksForDate(currentDate);
  
  // Add watermark HTML if needed
  const watermarkHTML = addWatermark ? `
    <div class="watermark">
      <span>Free Version</span>
      <span>Upgrade to Pro for premium exports</span>
    </div>
  ` : '';
  
  let html = `
    <div class="day-view">
      ${watermarkHTML}
  `;
  
  if (blocksForDay.length === 0) {
    html += '<div class="no-blocks">No time blocks scheduled for this day.</div>';
  } else {
    // Sort blocks by start time
    const sortedBlocks = [...blocksForDay].sort((a, b) => 
      new Date(a.startTime) - new Date(b.startTime)
    );
    
    for (const block of sortedBlocks) {
      const blockColor = block.isGeneralActivity ? block.customColor : block.domainColor;
      const hasProject = block.projectTitle && !block.isGeneralActivity;
      const hasTask = block.taskTitle && !block.isGeneralActivity;
      const isRecurring = block.isRepeating || block.isRepeatingInstance;
      const recurringText = isRecurring ? 
        `(${block.repeatFrequency === 'daily' ? 'Daily' : 
           block.repeatFrequency === 'weekly' ? 'Weekly' : 'Monthly'})` : '';
      
      html += `
        <div class="time-block" style="border-left-color: ${blockColor};">
          <div class="time-block-header">
            <span class="time-block-time">
              ${formatTime(block.startTime)} - ${formatTime(block.endTime)}
              ${isRecurring ? `<span class="recurring-indicator">${recurringText}</span>` : ''}
            </span>
          </div>
          <h3 class="time-block-title">${block.title}</h3>
          
          ${hasProject ? `
            <div class="project-task-info">
              <strong>Project:</strong> ${block.projectTitle}
            </div>
          ` : ''}
          
          ${hasTask ? `
            <div class="project-task-info">
              <strong>Task:</strong> ${block.taskTitle}
            </div>
          ` : ''}
          
          <div>
            <span class="time-block-domain" style="background-color: ${blockColor};">
              ${block.isGeneralActivity ? block.category : block.domain}
            </span>
          </div>
          
          ${block.location ? `
            <div class="time-block-location">
              <strong>Location:</strong> ${block.location}
            </div>
          ` : ''}
          
          ${block.notes ? `
            <div class="time-block-notes">
              ${block.notes}
            </div>
          ` : ''}
        </div>
      `;
    }
  }
  
  html += '</div>';
  return html;
};

/**
 * Generate HTML content for the week view in PDF
 * Modified to support watermarking
 */
export const generateWeekViewHTML = async (weekDates, getTimeBlocksForDate, formatDate, formatTime, getDayName, isToday, addWatermark = false) => {
  // Add watermark HTML if needed
  const watermarkHTML = addWatermark ? `
    <div class="watermark">
      <span>Free Version</span>
      <span>Upgrade to Pro for premium exports</span>
    </div>
  ` : '';
  
  let html = `
    <div class="week-view">
      ${watermarkHTML}
  `;
  
  if (weekDates.length === 0) {
    html += '<div class="no-blocks">Week data is not available.</div>';
    return html + '</div>';
  }
  
  // Create a table for the week view
  html += `
    <table>
      <thead>
        <tr>
          <th>Monday</th>
          <th>Tuesday</th>
          <th>Wednesday</th>
          <th>Thursday</th>
          <th>Friday</th>
          <th>Saturday</th>
          <th>Sunday</th>
        </tr>
      </thead>
      <tbody>
        <tr>
  `;
  
  // Add each day's blocks
  for (const date of weekDates) {
    const isTodayDate = isToday(date);
    const blocksForDay = getTimeBlocksForDate(date);
    
    html += `<td class="${isTodayDate ? 'today-cell' : ''}">`;
    html += `<div class="day-number">${date.getDate()}</div>`;
    
    if (blocksForDay.length === 0) {
      html += '<div class="mini-block" style="color: #555555;">No blocks</div>';
    } else {
      // Sort blocks by start time
      const sortedBlocks = [...blocksForDay].sort((a, b) => 
        new Date(a.startTime) - new Date(b.startTime)
      );
      
      // Add max 5 blocks per day in the week view to keep it compact
      const displayBlocks = sortedBlocks.slice(0, 5);
      const hiddenBlocks = sortedBlocks.length > 5 ? sortedBlocks.length - 5 : 0;
      
      for (const block of displayBlocks) {
        const blockColor = block.isGeneralActivity ? block.customColor : block.domainColor;
        
        html += `
          <div class="mini-block">
            <span class="event-dot" style="background-color: ${blockColor};"></span>
            ${formatTime(block.startTime)}: ${block.title}
          </div>
        `;
      }
      
      if (hiddenBlocks > 0) {
        html += `<div class="mini-block" style="color: #333333;">+${hiddenBlocks} more</div>`;
      }
    }
    
    html += '</td>';
  }
  
  html += `
        </tr>
      </tbody>
    </table>
  `;
  
  // Add detailed day-by-day view below the table
  html += '<div class="week-container">';
  
  for (const date of weekDates) {
    const dayName = getDayName(date.getDay(), false);
    const isTodayDate = isToday(date);
    const blocksForDay = getTimeBlocksForDate(date);
    
    html += `
      <div class="day-header${isTodayDate ? ' today-header' : ''}">
        ${dayName}, ${formatDate(date, 'short')}${isTodayDate ? ' (Today)' : ''}
      </div>
    `;
    
    if (blocksForDay.length === 0) {
      html += '<div class="no-blocks">No time blocks scheduled for this day.</div>';
    } else {
      // Sort blocks by start time
      const sortedBlocks = [...blocksForDay].sort((a, b) => 
        new Date(a.startTime) - new Date(b.startTime)
      );
      
      for (const block of sortedBlocks) {
        const blockColor = block.isGeneralActivity ? block.customColor : block.domainColor;
        const hasProject = block.projectTitle && !block.isGeneralActivity;
        const hasTask = block.taskTitle && !block.isGeneralActivity;
        const isRecurring = block.isRepeating || block.isRepeatingInstance;
        
        html += `
          <div class="time-block" style="border-left-color: ${blockColor};">
            <div class="time-block-header">
              <span class="time-block-time">
                ${formatTime(block.startTime)} - ${formatTime(block.endTime)}
                ${isRecurring ? `<span class="recurring-indicator">(${block.repeatFrequency === 'daily' ? 'Daily' : block.repeatFrequency === 'weekly' ? 'Weekly' : 'Monthly'})</span>` : ''}
              </span>
            </div>
            <h3 class="time-block-title">${block.title}</h3>
            
            ${hasProject ? `
              <div class="project-task-info">
                <strong>Project:</strong> ${block.projectTitle}
              </div>
            ` : ''}
            
            ${hasTask ? `
              <div class="project-task-info">
                <strong>Task:</strong> ${block.taskTitle}
              </div>
            ` : ''}
            
            <div>
              <span class="time-block-domain" style="background-color: ${blockColor};">
                ${block.isGeneralActivity ? block.category : block.domain}
              </span>
            </div>
            
            ${block.location ? `
              <div class="time-block-location">
                <strong>Location:</strong> ${block.location}
              </div>
            ` : ''}
          </div>
        `;
      }
    }
  }
  
  html += '</div></div>';
  return html;
};

/**
 * Generate HTML content for the month view in PDF
 * Modified to support watermarking
 */
export const generateMonthViewHTML = async (currentDate, monthDates, selectedMonthDay, getTimeBlocksForDate, formatDate, getMonthName, isToday, addWatermark = false) => {
  // Add watermark HTML if needed
  const watermarkHTML = addWatermark ? `
    <div class="watermark">
      <span>Free Version</span>
      <span>Upgrade to Pro for premium exports</span>
    </div>
  ` : '';
  
  let html = `
    <div class="month-view">
      ${watermarkHTML}
  `;
  
  if (monthDates.length === 0) {
    html += '<div class="no-blocks">Month data is not available.</div>';
    return html + '</div>';
  }
  
  // Get the month name and year
  const monthName = getMonthName(currentDate.getMonth());
  const year = currentDate.getFullYear();
  
  html += `<h2>${monthName} ${year}</h2>`;
  
  // Set the day order for the week - Starting with Monday
  const mondayFirstOrder = [1, 2, 3, 4, 5, 6, 0];
  
  // Create weeks array for the month view
  const weeks = [];
  let week = [];
  
  // Add empty slots for days before the first day of the month
  const firstDay = monthDates[0].getDay();
  const firstDayIndex = mondayFirstOrder.indexOf(firstDay);
  for (let i = 0; i < firstDayIndex; i++) {
    week.push(null);
  }
  
  // Add days to the weeks
  monthDates.forEach((date) => {
    week.push(date);
    
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  });
  
  // Add empty slots for days after the last day of the month
  if (week.length > 0) {
    while (week.length < 7) {
      week.push(null);
    }
    weeks.push(week);
  }
  
  // Create a table for the month view
  html += `
    <table>
      <thead>
        <tr>
          <th>Mon</th>
          <th>Tue</th>
          <th>Wed</th>
          <th>Thu</th>
          <th>Fri</th>
          <th>Sat</th>
          <th>Sun</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  // Add weeks to the table
  for (const weekRow of weeks) {
    html += '<tr>';
    
    for (const date of weekRow) {
      if (!date) {
        html += '<td></td>';
        continue;
      }
      
      const isTodayDate = isToday(date);
      const blocksForDay = getTimeBlocksForDate(date);
      
      html += `<td class="${isTodayDate ? 'today-cell' : ''}">`;
      html += `<div class="day-number">${date.getDate()}</div>`;
      
      if (blocksForDay.length === 0) {
        // No blocks for this day
      } else {
        // Sort blocks by start time
        const sortedBlocks = [...blocksForDay].sort((a, b) => 
          new Date(a.startTime) - new Date(b.startTime)
        );
        
        // Add max 3 blocks per day in the month view to keep it compact
        const displayBlocks = sortedBlocks.slice(0, 3);
        const hiddenBlocks = sortedBlocks.length > 3 ? sortedBlocks.length - 3 : 0;
        
        for (const block of displayBlocks) {
          const blockColor = block.isGeneralActivity ? block.customColor : block.domainColor;
          
          html += `
            <div class="mini-block">
              <span class="event-dot" style="background-color: ${blockColor};"></span>
              ${formatTime(block.startTime).slice(0, -3)}: ${block.title.length > 12 ? block.title.substring(0, 12) + '...' : block.title}
            </div>
          `;
        }
        
        if (hiddenBlocks > 0) {
          html += `<div class="mini-block" style="color: #333333;">+${hiddenBlocks} more</div>`;
        }
      }
      
      html += '</td>';
    }
    
    html += '</tr>';
  }
  
  html += `
      </tbody>
    </table>
  `;
  
  // Add selected day view (similar to current implementation)
  const selectedDate = monthDates[selectedMonthDay];
  const isTodaySelected = isToday(selectedDate);
  const blocksForSelectedDay = getTimeBlocksForDate(selectedDate);
  
  html += `
    <div class="month-container">
      <div class="day-header${isTodaySelected ? ' today-header' : ''}">
        Blocks for ${formatDate(selectedDate, 'long')}${isTodaySelected ? ' (Today)' : ''}
      </div>
  `;
  
  if (blocksForSelectedDay.length === 0) {
    html += '<div class="no-blocks">No time blocks scheduled for this day.</div>';
  } else {
    // Sort blocks by start time
    const sortedBlocks = [...blocksForSelectedDay].sort((a, b) => 
      new Date(a.startTime) - new Date(b.startTime)
    );
    
    for (const block of sortedBlocks) {
      const blockColor = block.isGeneralActivity ? block.customColor : block.domainColor;
      const hasProject = block.projectTitle && !block.isGeneralActivity;
      const hasTask = block.taskTitle && !block.isGeneralActivity;
      const isRecurring = block.isRepeating || block.isRepeatingInstance;
      
      html += `
        <div class="time-block" style="border-left-color: ${blockColor};">
          <div class="time-block-header">
            <span class="time-block-time">
              ${formatTime(block.startTime)} - ${formatTime(block.endTime)}
              ${isRecurring ? `<span class="recurring-indicator">(${block.repeatFrequency === 'daily' ? 'Daily' : block.repeatFrequency === 'weekly' ? 'Weekly' : 'Monthly'})</span>` : ''}
            </span>
          </div>
          <h3 class="time-block-title">${block.title}</h3>
          
          ${hasProject ? `
            <div class="project-task-info">
              <strong>Project:</strong> ${block.projectTitle}
            </div>
          ` : ''}
          
          ${hasTask ? `
            <div class="project-task-info">
              <strong>Task:</strong> ${block.taskTitle}
            </div>
          ` : ''}
          
          <div>
            <span class="time-block-domain" style="background-color: ${blockColor};">
              ${block.isGeneralActivity ? block.category : block.domain}
            </span>
          </div>
          
          ${block.location ? `
            <div class="time-block-location">
              <strong>Location:</strong> ${block.location}
            </div>
          ` : ''}
        </div>
      `;
    }
  }
  
  html += '</div></div>';
  return html;
};