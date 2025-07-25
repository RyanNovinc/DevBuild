// src/components/ai/LoginScreen/styles.js
import { StyleSheet } from 'react-native';

export const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  backButtonContainer: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  formContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    backgroundColor: theme.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    position: 'relative',
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: theme.text,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: theme.textSecondary,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    color: theme.textSecondary,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: theme.primary,
  },
  modeToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeToggleText: {
    fontSize: 14,
    marginRight: 4,
    color: theme.textSecondary,
  },
  modeToggleButton: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.primary,
  },
  debugContainer: {
    padding: 10,
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: theme.card,
  },
  debugTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: theme.text,
  },
  debugText: {
    fontSize: 12,
    marginBottom: 3,
    color: theme.textSecondary,
  },
  debugButton: {
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 10,
  },
  debugToggle: {
    marginTop: 20,
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    borderColor: theme.border,
  },
  emailText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: theme.textSecondary,
  },
  backLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  backLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.primary,
  },
  resendLink: {
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
  },
  resendLinkText: {
    fontSize: 14,
    color: theme.primary,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
});