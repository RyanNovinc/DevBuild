// src/screens/TodoListScreen/components/StableInput.js
import React, { useState, useEffect, memo } from 'react';
import { TextInput, StyleSheet } from 'react-native';

/**
 * StableInput - A completely isolated input component that doesn't cause parent re-renders
 * This is the key component for preventing keyboard flashing in the TodoList screens
 * 
 * @param {Object} props - Component props
 * @param {Object} props.inputRef - Ref to be attached to the input
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.placeholderTextColor - Color of placeholder text
 * @param {Function} props.onChangeText - Optional callback for text changes
 * @param {Function} props.onSubmitEditing - Callback when submit button is pressed
 * @param {Function} props.onFocus - Optional callback when input gets focus
 * @param {Function} props.onBlur - Optional callback when input loses focus
 * @param {string} props.textColor - Color of input text
 * @param {string} props.initialValue - Initial value for the input
 * @param {string} props.returnKeyType - Type of return key on keyboard
 */
const StableInput = memo(({
  inputRef,
  placeholder,
  placeholderTextColor,
  onChangeText,
  onSubmitEditing,
  onFocus,
  onBlur,
  textColor,
  initialValue = '',
  returnKeyType = 'done',
}) => {
  // Internal state that doesn't cause parent re-renders
  const [localValue, setLocalValue] = useState(initialValue);
  
  // Update local value when initialValue changes
  useEffect(() => {
    if (initialValue !== localValue) {
      setLocalValue(initialValue);
    }
  }, [initialValue]);
  
  // Store the value on the ref for external access
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current._lastText = localValue;
    }
  }, [localValue, inputRef]);
  
  // Handle text changes locally first
  const handleLocalChange = (text) => {
    setLocalValue(text);
    if (onChangeText) onChangeText(text);
  };
  
  // Handle submit with cached value
  const handleSubmit = () => {
    if (onSubmitEditing) onSubmitEditing(localValue);
  };
  
  // Methods exposed to parent via the ref
  useEffect(() => {
    if (inputRef.current) {
      // Method to get current text
      inputRef.current.getValue = () => localValue;
      
      // Method to clear text without parent re-render
      inputRef.current.clearText = () => {
        setLocalValue('');
      };
      
      // Access to focus
      const originalFocus = inputRef.current.focus;
      inputRef.current.focus = () => {
        if (originalFocus) originalFocus.call(inputRef.current);
      };
      
      // Check if focused
      inputRef.current.isFocused = () => {
        if (inputRef.current && inputRef.current.isFocused) {
          return inputRef.current.isFocused();
        }
        return false;
      };
    }
  }, [localValue, inputRef]);
  
  return (
    <TextInput
      ref={inputRef}
      style={[styles.input, { color: textColor }]}
      placeholder={placeholder}
      placeholderTextColor={placeholderTextColor}
      value={localValue}
      onChangeText={handleLocalChange}
      onSubmitEditing={handleSubmit}
      onFocus={onFocus}
      onBlur={onBlur}
      returnKeyType={returnKeyType}
      autoCorrect={false}
      autoCapitalize="none"
      spellCheck={false}
      blurOnSubmit={false} // Critical to prevent keyboard flashing
      keyboardType="default"
    />
  );
}, () => true); // Always prevent re-renders from parent

const styles = StyleSheet.create({
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    paddingVertical: 10,
  },
});

export default StableInput;