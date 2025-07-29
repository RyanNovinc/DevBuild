// src/screens/TodoListScreen/components/notes/MarkdownHelpModal.js
import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';

/**
 * Modal component showing markdown syntax help
 */
const MarkdownHelpModal = ({
  visible,
  onClose,
  theme
}) => {
  // Sample markdown for the examples
  const markdownExamples = {
    headings: '# Heading 1\n## Heading 2\n### Heading 3',
    emphasis: '**Bold text**\n_Italic text_\n~~Strikethrough~~',
    lists: '- Item 1\n- Item 2\n  - Nested item\n\n1. First item\n2. Second item',
    tasks: '- [ ] Unchecked task\n- [x] Checked task',
    links: '[Link text](https://example.com)',
    images: '![Alt text](https://via.placeholder.com/150)',
    code: '`Inline code`\n\n```\nCode block\nMultiple lines\n```',
    quotes: '> This is a blockquote\n> Second line of quote',
    horizontalRule: '---',
    tables: '| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |'
  };

  // Markdown styles
  const markdownStyles = {
    body: {
      color: theme.text,
      fontSize: 14,
    },
    heading1: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      marginVertical: 6,
    },
    heading2: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginVertical: 5,
    },
    heading3: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
      marginVertical: 4,
    },
    link: {
      color: theme.primary,
    },
    blockquote: {
      backgroundColor: theme.cardElevated,
      borderLeftColor: theme.primary,
      borderLeftWidth: 4,
      paddingHorizontal: 10,
      paddingVertical: 5,
      marginVertical: 5,
    },
    code_inline: {
      fontFamily: 'monospace',
      backgroundColor: theme.cardElevated,
      padding: 4,
      borderRadius: 4,
    },
    code_block: {
      fontFamily: 'monospace',
      backgroundColor: theme.cardElevated,
      padding: 10,
      borderRadius: 4,
      marginVertical: 5,
    },
    hr: {
      backgroundColor: theme.border,
      height: 1,
      marginVertical: 10,
    },
    table: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 4,
      marginVertical: 8,
    },
    tr: {
      borderBottomWidth: 1,
      borderColor: theme.border,
    },
    th: {
      padding: 6,
      backgroundColor: theme.cardElevated,
    },
    td: {
      padding: 6,
    },
  };

  // Render a markdown example section
  const renderExample = (title, markdown, syntax) => (
    <View style={styles.exampleContainer}>
      <Text style={[styles.exampleTitle, { color: theme.text }]}>{title}</Text>
      
      <View style={[styles.syntaxContainer, { backgroundColor: theme.cardElevated, borderColor: theme.border }]}>
        <Text style={[styles.syntaxText, { color: theme.textSecondary }]}>{syntax}</Text>
      </View>
      
      <View style={[styles.outputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Markdown style={markdownStyles}>
          {markdown}
        </Markdown>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Markdown Guide</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView}>
            <Text style={[styles.description, { color: theme.text }]}>
              Markdown is a simple way to format text that looks great on any device. Use these syntax examples to format your notes.
            </Text>

            {renderExample(
              'Headings',
              markdownExamples.headings,
              '# Heading 1\n## Heading 2\n### Heading 3'
            )}

            {renderExample(
              'Emphasis',
              markdownExamples.emphasis,
              '**Bold text**\n_Italic text_\n~~Strikethrough~~'
            )}

            {renderExample(
              'Lists',
              markdownExamples.lists,
              '- Item 1\n- Item 2\n  - Nested item\n\n1. First item\n2. Second item'
            )}

            {renderExample(
              'Task Lists',
              markdownExamples.tasks,
              '- [ ] Unchecked task\n- [x] Checked task'
            )}

            {renderExample(
              'Links',
              markdownExamples.links,
              '[Link text](https://example.com)'
            )}

            {renderExample(
              'Code',
              markdownExamples.code,
              '`Inline code`\n\n```\nCode block\nMultiple lines\n```'
            )}

            {renderExample(
              'Blockquotes',
              markdownExamples.quotes,
              '> This is a blockquote\n> Second line of quote'
            )}

            {renderExample(
              'Horizontal Rule',
              markdownExamples.horizontalRule,
              '---'
            )}

            {renderExample(
              'Tables',
              markdownExamples.tables,
              '| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |'
            )}
          </ScrollView>

          <TouchableOpacity
            style={[styles.doneButton, { backgroundColor: theme.primary }]}
            onPress={onClose}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    padding: 16,
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  exampleContainer: {
    marginBottom: 20,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  syntaxContainer: {
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 8,
  },
  syntaxText: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  outputContainer: {
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  doneButton: {
    padding: 14,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MarkdownHelpModal;