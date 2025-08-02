// src/screens/TodoListScreen/components/notes/MarkdownEditor.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Keyboard,
  Platform
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Ionicons } from '@expo/vector-icons';
import Clipboard from '@react-native-community/clipboard';

/**
 * Markdown editor component with preview mode and formatting toolbar
 */
const MarkdownEditor = ({
  value,
  onChangeText,
  placeholder,
  theme,
  style,
  editorHeight = 'auto',
  showToolbar = true,
  autoFocus = false,
  scrollEnabled = true
}) => {
  // State for editor
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  
  // Refs
  const inputRef = useRef(null);
  const scrollViewRef = useRef(null);
  
  // Handle toggling preview mode
  const togglePreviewMode = () => {
    Keyboard.dismiss();
    setIsPreviewMode(!isPreviewMode);
  };
  
  // Helper to insert text at cursor position
  const insertTextAtCursor = (insertBefore, insertAfter = '') => {
    const newText = value.substring(0, selection.start) +
                    insertBefore +
                    value.substring(selection.start, selection.end) +
                    insertAfter +
                    value.substring(selection.end);
    
    onChangeText(newText);
    
    // Calculate new cursor position for better UX
    const newCursorPosition = selection.start + insertBefore.length;
    
    // We need to delay setting the new selection until after the TextInput updates
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.setNativeProps({
          selection: {
            start: newCursorPosition,
            end: newCursorPosition + (selection.end - selection.start)
          }
        });
      }
    }, 10);
  };
  
  // Formatting functions
  const formatBold = () => insertTextAtCursor('**', '**');
  const formatItalic = () => insertTextAtCursor('_', '_');
  const formatHeading = () => insertTextAtCursor('## ');
  const formatQuote = () => insertTextAtCursor('> ');
  const formatBulletList = () => insertTextAtCursor('- ');
  const formatNumberedList = () => insertTextAtCursor('1. ');
  const formatCheckbox = () => insertTextAtCursor('- [ ] ');
  const formatCode = () => insertTextAtCursor('`', '`');
  const formatHorizontalRule = () => insertTextAtCursor('\\n---\\n');
  
  // Handle keyboard showing/hiding on iOS to adjust scroll
  useEffect(() => {
    if (Platform.OS === 'ios') {
      const keyboardDidShowListener = Keyboard.addListener(
        'keyboardDidShow',
        () => {
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
          }
        }
      );
      
      return () => {
        keyboardDidShowListener.remove();
      };
    }
  }, []);
  
  // Define markdown styling to match app theme
  const markdownStyles = {
    body: {
      color: theme.text,
      fontSize: 16,
      lineHeight: 24,
    },
    heading1: {
      color: theme.text,
      fontSize: 24,
      fontWeight: 'bold',
      marginTop: 16,
      marginBottom: 8,
    },
    heading2: {
      color: theme.text,
      fontSize: 20,
      fontWeight: 'bold',
      marginTop: 16,
      marginBottom: 8,
    },
    heading3: {
      color: theme.text,
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 16,
      marginBottom: 8,
    },
    link: {
      color: theme.primary,
      textDecorationLine: 'underline',
    },
    blockquote: {
      backgroundColor: theme.cardElevated,
      borderLeftColor: theme.primary,
      borderLeftWidth: 4,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginVertical: 10,
    },
    code_inline: {
      backgroundColor: theme.cardElevated,
      color: theme.text,
      borderRadius: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    code_block: {
      backgroundColor: theme.cardElevated,
      color: theme.text,
      padding: 12,
      borderRadius: 6,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      marginVertical: 10,
    },
    bullet_list: {
      marginVertical: 8,
    },
    ordered_list: {
      marginVertical: 8,
    },
    bullet_list_icon: {
      color: theme.primary,
    },
    hr: {
      backgroundColor: theme.border,
      height: 1,
      marginVertical: 16,
    },
    image: {
      marginVertical: 10,
      alignSelf: 'center',
      borderRadius: 6,
    },
    table: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 6,
      marginVertical: 10,
    },
    tr: {
      borderBottomWidth: 1,
      borderColor: theme.border,
    },
    th: {
      padding: 8,
      backgroundColor: theme.cardElevated,
    },
    td: {
      padding: 8,
    },
  };
  
  // Render a simple formatting toolbar
  const renderToolbar = () => {
    if (!showToolbar) return null;
    
    return (
      <View style={[styles.toolbar, { backgroundColor: theme.cardElevated, borderColor: theme.border }]}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.toolbarScrollContent}
        >
          <TouchableOpacity style={styles.toolbarButton} onPress={formatBold}>
            <Text style={[styles.toolbarButtonText, { color: theme.text }]}>B</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.toolbarButton} onPress={formatItalic}>
            <Ionicons name="italic" size={18} color={theme.text} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.toolbarButton} onPress={formatHeading}>
            <Text style={[styles.toolbarButtonText, { color: theme.text }]}>H</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.toolbarButton} onPress={formatQuote}>
            <Ionicons name="quote" size={18} color={theme.text} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.toolbarButton} onPress={formatBulletList}>
            <Ionicons name="list" size={18} color={theme.text} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.toolbarButton} onPress={formatNumberedList}>
            <Ionicons name="list-outline" size={18} color={theme.text} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.toolbarButton} onPress={formatCheckbox}>
            <Ionicons name="checkbox-outline" size={18} color={theme.text} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.toolbarButton} onPress={formatCode}>
            <Ionicons name="code-slash" size={18} color={theme.text} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.toolbarButton} onPress={formatHorizontalRule}>
            <Ionicons name="remove" size={18} color={theme.text} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.toolbarButton} onPress={togglePreviewMode}>
            <Ionicons 
              name={isPreviewMode ? "create-outline" : "eye-outline"} 
              size={18} 
              color={theme.text} 
            />
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };
  
  return (
    <View style={[styles.container, style]}>
      {renderToolbar()}
      
      {isPreviewMode ? (
        // Preview mode - render markdown
        <ScrollView 
          style={[
            styles.previewContainer, 
            { 
              backgroundColor: theme.card,
              height: editorHeight !== 'auto' ? editorHeight - 40 : 'auto' // Adjust for toolbar height
            }
          ]}
          ref={scrollViewRef}
        >
          {value.trim() ? (
            <Markdown style={markdownStyles}>
              {value}
            </Markdown>
          ) : (
            <Text style={{ color: theme.textSecondary, padding: 16 }}>
              Nothing to preview. Start writing to see markdown rendering.
            </Text>
          )}
        </ScrollView>
      ) : (
        // Edit mode - show text input
        <TextInput
          ref={inputRef}
          style={[
            styles.editor,
            { 
              color: theme.text,
              backgroundColor: theme.card,
              height: editorHeight !== 'auto' ? editorHeight - 40 : 'auto' // Adjust for toolbar height
            }
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondary}
          multiline={true}
          scrollEnabled={scrollEnabled}
          autoFocus={autoFocus}
          onSelectionChange={(event) => {
            setSelection(event.nativeEvent.selection);
          }}
          textAlignVertical="top"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    height: 40,
  },
  toolbarScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolbarButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  toolbarButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  editor: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    textAlignVertical: 'top',
  },
  previewContainer: {
    flex: 1,
    padding: 16,
  },
});

export default MarkdownEditor;