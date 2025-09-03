// src/components/BulkCreate/CompletionStep.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  scaleWidth,
  scaleHeight,
  spacing,
  fontSizes
} from '../../utils/responsive';

const CompletionStep = ({ 
  createdItems, 
  onComplete, 
  theme 
}) => {
  // Calculate totals
  const totalGoals = createdItems.goals?.length || 0;
  const totalMilestones = createdItems.milestones?.length || 0;
  const totalTasks = createdItems.tasks?.length || 0;
  const totalItems = totalGoals + totalMilestones + totalTasks;

  // Get summary text
  const getSummaryText = () => {
    const parts = [];
    if (totalGoals > 0) parts.push(`${totalGoals} goal${totalGoals > 1 ? 's' : ''}`);
    if (totalMilestones > 0) parts.push(`${totalMilestones} milestone${totalMilestones > 1 ? 's' : ''}`);
    if (totalTasks > 0) parts.push(`${totalTasks} task${totalTasks > 1 ? 's' : ''}`);
    
    if (parts.length === 1) return parts[0];
    if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
    return `${parts.slice(0, -1).join(', ')}, and ${parts[parts.length - 1]}`;
  };

  return (
    <View style={styles.container}>
      {/* Success Header */}
      <View style={styles.successHeader}>
        <View style={[styles.successIcon, { backgroundColor: theme.success + '20' }]}>
          <Ionicons name="checkmark-circle" size={48} color={theme.success || '#22C55E'} />
        </View>
        
        <Text style={[styles.successTitle, { color: theme.text }]}>
          All Done! 🎉
        </Text>
        
        <Text style={[styles.successSubtitle, { color: theme.textSecondary }]}>
          Successfully created {getSummaryText()}
        </Text>
      </View>

      {/* Created Items Summary */}
      <ScrollView style={styles.summaryContainer} showsVerticalScrollIndicator={false}>
        {/* Goals Section */}
        {totalGoals > 0 && (
          <View style={styles.itemSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flag" size={20} color={theme.primary || '#007AFF'} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Goals ({totalGoals})
              </Text>
            </View>
            
            {createdItems.goals.map((goal, index) => (
              <View key={goal.id} style={[styles.itemCard, { backgroundColor: theme.card }]}>
                <View style={styles.itemHeader}>
                  <View style={[styles.itemIcon, { backgroundColor: goal.color + '20' }]}>
                    <Ionicons name={goal.icon || 'flag'} size={16} color={goal.color} />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemTitle, { color: theme.text }]} numberOfLines={1}>
                      {goal.title}
                    </Text>
                    <Text style={[styles.itemDomain, { color: theme.textSecondary }]}>
                      {goal.domain}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Milestones Section */}
        {totalMilestones > 0 && (
          <View style={styles.itemSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flag-outline" size={20} color={theme.primary || '#007AFF'} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Milestones ({totalMilestones})
              </Text>
            </View>
            
            {createdItems.milestones.map((milestone, index) => (
              <View key={milestone.id} style={[styles.itemCard, { backgroundColor: theme.card }]}>
                <View style={styles.itemHeader}>
                  <View style={[styles.itemIcon, { backgroundColor: milestone.color + '20' }]}>
                    <Ionicons name="flag" size={16} color={milestone.color} />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemTitle, { color: theme.text }]} numberOfLines={1}>
                      {milestone.title}
                    </Text>
                    {milestone.goalTitle && (
                      <Text style={[styles.itemSubtitle, { color: theme.textSecondary }]}>
                        → {milestone.goalTitle}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Tasks Section */}
        {totalTasks > 0 && (
          <View style={styles.itemSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="checkmark-circle-outline" size={20} color={theme.primary || '#007AFF'} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Tasks ({totalTasks})
              </Text>
            </View>
            
            {createdItems.tasks.map((task, index) => (
              <View key={task.id} style={[styles.itemCard, { backgroundColor: theme.card }]}>
                <View style={styles.itemHeader}>
                  <View style={[styles.itemIcon, { backgroundColor: theme.border }]}>
                    <Ionicons name="checkmark" size={16} color={theme.textSecondary} />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemTitle, { color: theme.text }]} numberOfLines={1}>
                      {task.title}
                    </Text>
                    {task.milestoneTitle ? (
                      <Text style={[styles.itemSubtitle, { color: theme.textSecondary }]}>
                        → {task.milestoneTitle}
                      </Text>
                    ) : task.goalTitle ? (
                      <Text style={[styles.itemSubtitle, { color: theme.textSecondary }]}>
                        → {task.goalTitle}
                      </Text>
                    ) : (
                      <Text style={[styles.itemSubtitle, { color: theme.textSecondary }]}>
                        Standalone
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Next Steps Suggestions */}
        <View style={[styles.nextStepsContainer, { backgroundColor: theme.card + '80' }]}>
          <Text style={[styles.nextStepsTitle, { color: theme.text }]}>
            What's Next?
          </Text>
          <View style={styles.nextStepsList}>
            <Text style={[styles.nextStepItem, { color: theme.textSecondary }]}>
              • View your items in the Goals and Projects tabs
            </Text>
            <Text style={[styles.nextStepItem, { color: theme.textSecondary }]}>
              • Start working on your tasks in the Tasks tab
            </Text>
            <Text style={[styles.nextStepItem, { color: theme.textSecondary }]}>
              • Schedule time blocks for your work
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Complete Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.completeButton,
            { backgroundColor: theme.primary || '#007AFF' }
          ]}
          onPress={onComplete}
          accessible={true}
          accessibilityLabel="Finish and close"
          accessibilityRole="button"
        >
          <Text style={styles.completeButtonText}>
            Awesome, Let's Go!
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.m,
    paddingBottom: spacing.xl,
  },
  successHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  successIcon: {
    width: scaleWidth(80),
    height: scaleWidth(80),
    borderRadius: scaleWidth(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  successTitle: {
    fontSize: fontSizes.xxl,
    fontWeight: '700',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: fontSizes.m,
    textAlign: 'center',
    lineHeight: fontSizes.m * 1.4,
  },
  summaryContainer: {
    flex: 1,
    marginTop: spacing.l,
  },
  itemSection: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  sectionTitle: {
    fontSize: fontSizes.l,
    fontWeight: '700',
    marginLeft: spacing.s,
  },
  itemCard: {
    borderRadius: scaleWidth(12),
    marginBottom: spacing.s,
    padding: spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    width: scaleWidth(32),
    height: scaleWidth(32),
    borderRadius: scaleWidth(16),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.s,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: fontSizes.m,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemDomain: {
    fontSize: fontSizes.s,
    fontWeight: '500',
  },
  itemSubtitle: {
    fontSize: fontSizes.s,
    fontStyle: 'italic',
  },
  nextStepsContainer: {
    borderRadius: scaleWidth(12),
    padding: spacing.l,
    marginTop: spacing.l,
  },
  nextStepsTitle: {
    fontSize: fontSizes.l,
    fontWeight: '600',
    marginBottom: spacing.m,
  },
  nextStepsList: {
    gap: spacing.s,
  },
  nextStepItem: {
    fontSize: fontSizes.m,
    lineHeight: fontSizes.m * 1.4,
  },
  buttonContainer: {
    marginTop: spacing.xl,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.l,
    borderRadius: scaleWidth(16),
    minHeight: scaleHeight(56),
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: fontSizes.l,
    fontWeight: '700',
    marginRight: spacing.s,
  },
});

export default CompletionStep;