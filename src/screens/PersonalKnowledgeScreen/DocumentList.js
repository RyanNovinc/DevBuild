// src/screens/PersonalKnowledgeScreen/DocumentList.js
import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import DocumentItem from './DocumentItem';

const DocumentList = ({ 
  documents, 
  theme, 
  isLoading, 
  viewDocument, 
  deleteDocument, 
  EmptyStateComponent
}) => {

  // Render document item
  const renderDocumentItem = ({ item }) => (
    <DocumentItem 
      item={item} 
      theme={theme} 
      onView={() => viewDocument(item)} 
      onDelete={() => deleteDocument(item.id)} 
    />
  );

  return (
    <FlatList
      data={documents}
      keyExtractor={item => item.id}
      renderItem={renderDocumentItem}
      contentContainerStyle={styles.documentsList}
      showsVerticalScrollIndicator={true}
      ListEmptyComponent={EmptyStateComponent}
    />
  );
};

const styles = StyleSheet.create({
  documentsList: {
    paddingBottom: 80,
  }
});

export default DocumentList;