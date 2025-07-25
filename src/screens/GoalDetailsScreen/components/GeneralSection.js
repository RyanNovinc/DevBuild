// src/screens/GoalDetailsScreen/components/GeneralSection.js
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableWithoutFeedback,
  TouchableOpacity, 
  ScrollView, 
  Platform, 
  Keyboard,
  StyleSheet,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTextColorForBackground, isDarkColor } from '../utils/colorUtils';
import CustomDatePicker from './CustomDatePicker';
import { STANDARD_DOMAINS, getDomainByIcon } from '../../../constants/domains';
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  spacing,
  fontSizes,
  isSmallDevice,
  accessibility,
  meetsContrastRequirements
} from '../../../utils/responsive';

const GeneralSection = ({
  theme,
  title,
  setTitle,
  description,
  setDescription,
  selectedIcon,
  setSelectedIcon,
  selectedColor,
  setSelectedColor,
  hasTargetDate,
  setHasTargetDate,
  targetDate,
  setTargetDate,
  showDatePicker,
  setShowDatePicker,
  handleDateChange,
  titleInputRef,
  descriptionInputRef,
  handleInputFocus,
  datePickerMode,
  toggleDatePickerMode
}) => {
  // State to track if user has scrolled
  const [hasScrolled, setHasScrolled] = useState(false);
  
  // Animation value for arrow fading
  const arrowOpacity = useRef(new Animated.Value(1)).current;
  
  // Reference to ScrollView
  const scrollViewRef = useRef(null);

  // Get the domain names
  const uniqueDomainNames = STANDARD_DOMAINS.map(domain => domain.name);
  
  // Get the current selected domain based on icon
  const getSelectedDomain = () => {
    // Find domain by matching icon
    const foundDomain = STANDARD_DOMAINS.find(domain => domain.icon === selectedIcon);
    return foundDomain ? foundDomain.name : 'Other';
  };
  
  const selectedDomain = getSelectedDomain();
  
  // Handle domain selection - set both icon and color
  const handleDomainSelect = (domainName) => {
    // Find the domain with this name
    const domainData = STANDARD_DOMAINS.find(domain => domain.name === domainName);
    
    if (domainData) {
      setSelectedIcon(domainData.icon);
      setSelectedColor(domainData.color);
    }
  };
  
  // Get domain data for display
  const getDomainDisplayData = () => {
    return STANDARD_DOMAINS.map(domain => ({
      name: domain.name,
      originalName: domain.name, // Keep original name for functionality
      icon: domain.icon,
      color: domain.color,
      description: domain.description
    }));
  };

  // Handle scroll events
  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    
    // If user has scrolled horizontally, hide the arrow
    if (offsetX > 10 && !hasScrolled) {
      setHasScrolled(true);
      
      // Animate the arrow to fade out
      Animated.timing(arrowOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start();
    }
  };

  // Programmatically scroll to next domain
  const scrollToNextDomain = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: scaleWidth(195), // Width of one card + margin
        animated: true
      });
      
      // Mark as scrolled
      setHasScrolled(true);
      
      // Fade out the indicator
      Animated.timing(arrowOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start();
    }
  };

  const domainDisplayData = getDomainDisplayData();

  // Calculate accessible touch target size
  const minTouchSize = Math.max(scaleWidth(44), accessibility.minTouchTarget);

  return (
    <View style={[
      styles.sectionContainer, 
      { 
        backgroundColor: theme.card,
        padding: spacing.l,
        borderRadius: scaleWidth(15)
      }
    ]}>
      {/* Title */}
      <View style={styles.formGroup}>
        <Text 
          style={[
            styles.label, 
            { 
              color: theme.textSecondary,
              fontSize: fontSizes.m
            }
          ]}
          maxFontSizeMultiplier={1.5}
        >
          Goal Title
        </Text>
        <TextInput
          ref={titleInputRef}
          style={[
            styles.input, 
            { 
              color: theme.text, 
              backgroundColor: theme.background, 
              borderColor: theme.border,
              fontSize: fontSizes.m,
              paddingHorizontal: spacing.m,
              paddingVertical: spacing.s,
              borderRadius: scaleWidth(10)
            }
          ]}
          value={title}
          onChangeText={setTitle}
          placeholder="What do you want to achieve?"
          placeholderTextColor={theme.textSecondary}
          maxLength={100}
          autoCorrect={false}
          spellCheck={false}
          textContentType="none"
          autoComplete="off"
          keyboardType={Platform.OS === 'ios' ? 'ascii-capable' : 'visible-password'}
          returnKeyType="next"
          blurOnSubmit={false}
          onFocus={() => handleInputFocus(0)}
          onSubmitEditing={() => descriptionInputRef.current && descriptionInputRef.current.focus()}
          accessible={true}
          accessibilityLabel="Goal title"
          accessibilityHint="Enter what you want to achieve"
          maxFontSizeMultiplier={1.8}
        />
        <Text 
          style={[
            styles.characterCount, 
            { 
              color: theme.textSecondary,
              fontSize: fontSizes.xs
            }
          ]}
          maxFontSizeMultiplier={1.3}
        >
          {title.length}/100
        </Text>
      </View>
      
      {/* Description */}
      <View style={styles.formGroup}>
        <Text 
          style={[
            styles.label, 
            { 
              color: theme.textSecondary,
              fontSize: fontSizes.m
            }
          ]}
          maxFontSizeMultiplier={1.5}
        >
          Description (Optional)
        </Text>
        <TextInput
          ref={descriptionInputRef}
          style={[
            styles.input, 
            styles.textArea, 
            { 
              color: theme.text, 
              backgroundColor: theme.background, 
              borderColor: theme.border,
              fontSize: fontSizes.m,
              paddingHorizontal: spacing.m,
              paddingVertical: spacing.s,
              borderRadius: scaleWidth(10),
              minHeight: scaleHeight(120)
            }
          ]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your goal in more detail"
          placeholderTextColor={theme.textSecondary}
          multiline
          numberOfLines={4}
          autoCorrect={false}
          spellCheck={false}
          textContentType="none"
          autoComplete="off"
          keyboardType={Platform.OS === 'ios' ? 'ascii-capable' : 'default'}
          onFocus={() => handleInputFocus(100)}
          accessible={true}
          accessibilityLabel="Goal description"
          accessibilityHint="Describe your goal in more detail"
          maxFontSizeMultiplier={2.0}
        />
      </View>
      
      {/* Domain Selection */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[
          styles.formGroup, 
          { 
            marginBottom: spacing.xxxl,
            position: 'relative'
          }
        ]}>
          <Text 
            style={[
              styles.label, 
              { 
                color: theme.textSecondary,
                fontSize: fontSizes.m
              }
            ]}
            maxFontSizeMultiplier={1.5}
          >
            Choose a Domain
          </Text>
          
          {/* Small Scroll Arrow Indicator at bottom with "More" text */}
          {!hasScrolled && (
            <TouchableOpacity 
              style={styles.scrollIndicatorTouchable}
              onPress={scrollToNextDomain}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="More domains available"
              accessibilityHint="Tap to see more domain options"
            >
              <Animated.View 
                style={[
                  styles.scrollIndicator,
                  { opacity: arrowOpacity }
                ]}
              >
                <View style={[
                  styles.indicatorBubble,
                  { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
                ]}>
                  <Text style={styles.indicatorText}>More</Text>
                  <Ionicons 
                    name="chevron-forward" 
                    size={scaleWidth(14)} 
                    color="#FFFFFF" 
                  />
                </View>
              </Animated.View>
            </TouchableOpacity>
          )}
          
          {/* Horizontal Scrolling Domain Layout */}
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ 
              height: scaleHeight(140)
            }}
            contentContainerStyle={{ 
              paddingRight: spacing.m, // Reduced right padding to show partial next card
              alignItems: 'center',
              paddingVertical: spacing.s
            }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            accessible={true}
            accessibilityLabel="Domain selection"
            accessibilityHint="Scroll horizontally to select a domain"
            accessibilityRole="scrollbar"
            // Make scrolling easier with these props
            decelerationRate="normal"
            snapToInterval={scaleWidth(170) + spacing.m} // Optional: snap to card width
            snapToAlignment="start"
          >
            {domainDisplayData.map((domain) => (
              <TouchableOpacity 
                key={domain.originalName} 
                style={[
                  styles.domainCard,
                  {
                    width: scaleWidth(170), // Slightly narrower to show next card
                    height: scaleWidth(120),
                    marginRight: spacing.m, 
                    backgroundColor: selectedDomain === domain.originalName 
                      ? `${domain.color}15` 
                      : theme.backgroundSecondary,
                    borderRadius: scaleWidth(10),
                    padding: spacing.s,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderWidth: selectedDomain === domain.originalName ? 2 : 0,
                    borderColor: selectedDomain === domain.originalName ? domain.color : 'transparent'
                  }
                ]}
                onPress={() => handleDomainSelect(domain.originalName)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`${domain.name} domain${selectedDomain === domain.originalName ? ', selected' : ''}`}
                accessibilityState={{ selected: selectedDomain === domain.originalName }}
              >
                {/* Domain icon */}
                <View style={[
                  styles.domainIcon,
                  { 
                    backgroundColor: domain.color,
                    width: scaleWidth(50),
                    height: scaleWidth(50),
                    borderRadius: scaleWidth(25),
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: spacing.s
                  }
                ]}>
                  <Ionicons 
                    name={domain.icon} 
                    size={scaleWidth(26)} 
                    color={domain.color === '#FFFFFF' ? '#000000' : getTextColorForBackground(domain.color)} 
                  />
                </View>
                
                {/* Domain name - consistent size */}
                <Text 
                  style={[
                    styles.domainName,
                    { 
                      color: selectedDomain === domain.originalName ? domain.color : theme.text,
                      fontSize: fontSizes.s, // Keep same larger font size
                      fontWeight: selectedDomain === domain.originalName ? '600' : '400',
                      textAlign: 'center',
                      height: scaleHeight(44), // Keep same height for text
                      paddingHorizontal: spacing.s // MORE padding around text
                    }
                  ]}
                  numberOfLines={2}
                  maxFontSizeMultiplier={1.3}
                >
                  {domain.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
      
      {/* Target Date - now using our custom date picker component */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.formGroup}>
          <CustomDatePicker
            theme={theme}
            selectedColor={selectedColor}
            hasTargetDate={hasTargetDate}
            toggleTargetDate={setHasTargetDate}
            targetDate={targetDate}
            setTargetDate={setTargetDate}
            showDatePicker={showDatePicker}
            setShowDatePicker={setShowDatePicker}
          />
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    borderRadius: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  formGroup: {
    marginBottom: spacing.l,
    position: 'relative',
  },
  label: {
    marginBottom: spacing.s,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    fontSize: fontSizes.m,
  },
  textArea: {
    textAlignVertical: 'top',
  },
  characterCount: {
    position: 'absolute',
    right: spacing.s,
    top: spacing.s,
  },
  
  // Domain Styles
  domainCard: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  domainIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  domainName: {
    width: '100%',
    textAlign: 'center',
  },
  
  // Scroll Indicator Styles - small and positioned at bottom right with text
  scrollIndicatorTouchable: {
    position: 'absolute',
    right: 0,
    bottom: 10, // Position near bottom
    zIndex: 20,
    width: 60, // Wider touch area
    height: 40, // Taller touch area
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  scrollIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  indicatorText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
    marginRight: 3,
  }
});

export default GeneralSection;