# Timeblock Debugging Guide

## Quick Start - Focus Mode

To enable focused timeblock debugging that filters out all other logs:

### 1. Open Developer Tools Console

### 2. Enable Timeblock Focus Mode
```javascript
LogPresets.TIMEBLOCK_FOCUS()
```

This will:
- Clear the console
- Only show timeblock, date/time, and recurring-related logs
- Filter out all other noise (navigation, theme, etc.)

### 3. Test Your Timeblock Creation
Now create a timeblock via AI and watch only the relevant logs appear with these prefixes:
- 🔥 TIMEBLOCK_DEBUG: Core timeblock operations
- 📱 MODAL_DEBUG: Modal mounting and props
- 📅 DATE_DEBUG: Date/time parsing
- 🔄 RECURRING_DEBUG: Recurring event setup

### 4. Restore Normal Logging (when done)
```javascript
LogPresets.RESTORE_ALL()
```

## Alternative Methods

### Manual Category Control
```javascript
// Enable specific categories only
debugLogger.enableCategories(['timeblock', 'parseaitime', 'starttime', 'recurring'])
debugLogger.startFiltering()

// Add more categories if needed
debugLogger.enableCategories(['modal', 'mounted'])

// Check what's enabled
debugLogger.status()

// Stop filtering
debugLogger.stopFiltering()
```

### Direct Logging (Always Shows)
```javascript
// These always show regardless of filtering
debugLogger.timeblock('Your custom timeblock message')
debugLogger.date('Your custom date message')
debugLogger.recurring('Your custom recurring message')
debugLogger.modal('Your custom modal message')
```

## What to Look For

When testing timeblock prefilling issues, look for:

1. **Raw AI Data**: 
   - Look for "Raw timeBlockData time settings" to see what the AI is sending

2. **Date Parsing**:
   - Look for "parseAITime startTime/endTime" to see if dates are being parsed correctly
   - Check for "SUCCESS - parsed" vs "FAILED to parse" messages

3. **Recurring Settings**:
   - Look for "Initializing isRepeating/repeatFrequency" to see if recurring data is set

4. **Modal Mounting**:
   - Look for "TimeBlockExactModal mounted with" to see what props are received

## Example Expected Output

When focused logging is enabled, you should see something like:
```
🔥🔥🔥 TIMEBLOCK FOCUS MODE ENABLED 🔥🔥🔥
Only timeblock/date/time related logs will show
Use LogPresets.RESTORE_ALL() to restore all logs

📱 MODAL_DEBUG: 🔍 TimeBlockExactModal mounted with:
📱 MODAL_DEBUG: 🔍 - timeBlockData: {title: "Meeting", startTime: "2024-01-15 14:00", ...}
📅 DATE_DEBUG: 🔍 Raw timeBlockData time settings: {startTime: "2024-01-15 14:00", ...}
🔥 TIMEBLOCK_DEBUG: parseAITime startTime: {timeString: "2024-01-15 14:00", ...}
🔥 TIMEBLOCK_DEBUG: startTime: SUCCESS - parsed: Mon Jan 15 2024 14:00:00
🔄 RECURRING_DEBUG: 🔄 Initializing isRepeating: true from timeBlockData.isRepeating: true
```

This focused output will make it much easier to identify where the prefilling is failing!