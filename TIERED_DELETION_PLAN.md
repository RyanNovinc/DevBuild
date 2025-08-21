# TIERED DELETION PLAN - CONFIDENCE LEVELS

## 🟢 TIER 1: MAXIMUM CONFIDENCE (99% safe)
**Risk Level:** Virtually zero
**Test Time:** 30 seconds (just run `npm start`)

### Lambda Deployment Files (22.1 KB)
- `aws/lambda/referral-sync-handler.js` 
- `lambda-functions/lambda-create-referral-code.js`
- `lambda-functions/lambda-function-enhanced.js`
- `lambda-functions/lambda-get-referral-stats.js`
- `lambda-functions/lambda-redeem-rewards.js`
- `lambda-functions/lambda-track-referral.js`

**Why 99% safe:** These are AWS deployment artifacts in separate directories, never imported by React Native app

### Development Scripts (1.2 KB)
- `scripts/disableNewArch.js`

**Why 99% safe:** Build script in scripts directory, no imports found

### Utility Files - Diagnostic (5.1 KB)
- `src/components/ai/LoginScreen/utils/aws-diagnostic.js`
- `src/components/ai/LoginScreen/utils/native-auth-test.js`

**Why 99% safe:** Debug/test utilities, clear naming, no imports

---

## 🟡 TIER 2: HIGH CONFIDENCE (90-95% safe)
**Risk Level:** Very low
**Test Time:** 2-3 minutes (build + quick navigation test)

### Standalone Utility (3.2 KB)
- `ProjectCountFix.js`

**Why 90% safe:** Created but never imported, standalone utility

### Unused Components - Clear (8.7 KB)
- `src/components/AnimatedTabNavigator.js`
- `src/components/CompassIcon.js` 
- `src/components/DraggableProgressBar.js`
- `src/components/FadeInView.js`
- `src/components/MetricItem.js`
- `src/components/ScreenTransition.js`

**Why 90% safe:** No imports found, specific component names unlikely to be used dynamically

---

## 🟠 TIER 3: MEDIUM CONFIDENCE (85% safe)
**Risk Level:** Low but requires testing
**Test Time:** 5 minutes (build + test modals/buttons)

### Generic Components (3.2 KB)
- `src/components/Button.js`
- `src/components/Modal.js`
- `src/components/SuggestionChip.js`

**Why 85% safe:** Generic names, but all actual usage uses specific components (AuthButton, AddTaskModal, etc.)

---

## 🔴 REMOVED FROM DELETION
**Files discovered to be used or risky:**

### Critical Files
- ✅ `PlatformFix.js` - USED (App.js import)
- ✅ `pre-build-ios.js` - USED (package.json script)

### Potential Conflicts  
- ❌ `src/components/TodoItem.js` - Different from heavily used `src/screens/TodoListScreen/components/TodoItem.js`

---

## 📊 EXECUTION STRATEGY

### Phase 1: Tier 1 Only (28.4 KB)
- 9 files with virtually zero risk
- Quick verification: just `npm start`

### Phase 2: Tier 1 + Tier 2 (40.3 KB) 
- 15 files total
- Test: build + quick tab navigation

### Phase 3: All Tiers (43.5 KB)
- 18 files total  
- Test: build + modal/button functionality

---

## ✅ RECOMMENDED START
**Begin with Tier 1** - Maximum safety, immediate 28.4 KB cleanup with virtually no risk.
