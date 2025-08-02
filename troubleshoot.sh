#!/bin/bash
# troubleshoot.sh - Script to diagnose and fix common Expo/React Native issues

# Terminal colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==============================================${NC}"
echo -e "${BLUE}        LifeCompass Troubleshooter${NC}"
echo -e "${BLUE}==============================================${NC}"

# Check Node.js version
echo -e "\n${YELLOW}Checking Node.js version...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "Node.js version: ${GREEN}$NODE_VERSION${NC}"
    
    # Check if Node.js version is compatible with Expo SDK 53
    if [[ $NODE_VERSION =~ ^v18 || $NODE_VERSION =~ ^v20 ]]; then
        echo -e "${GREEN}✓ Node.js version is compatible with Expo SDK 53${NC}"
    else
        echo -e "${RED}✗ Node.js version might not be compatible with Expo SDK 53${NC}"
        echo -e "${YELLOW}Recommendation: Update to Node.js v18 or v20${NC}"
    fi
else
    echo -e "${RED}✗ Node.js not found!${NC}"
    echo -e "${YELLOW}Recommendation: Install Node.js v18 or v20${NC}"
fi

# Check npm/yarn version
echo -e "\n${YELLOW}Checking package manager...${NC}"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "npm version: ${GREEN}$NPM_VERSION${NC}"
else
    echo -e "${RED}✗ npm not found!${NC}"
fi

if command -v yarn &> /dev/null; then
    YARN_VERSION=$(yarn -v)
    echo -e "yarn version: ${GREEN}$YARN_VERSION${NC}"
fi

# Check for Expo CLI
echo -e "\n${YELLOW}Checking Expo CLI...${NC}"
if npx --no-install expo --version &> /dev/null; then
    EXPO_CLI_VERSION=$(npx --no-install expo --version)
    echo -e "Expo CLI version: ${GREEN}$EXPO_CLI_VERSION${NC}"
else
    echo -e "${RED}✗ Expo CLI not available via npx${NC}"
    echo -e "${YELLOW}Recommendation: Make sure @expo/cli is installed${NC}"
fi

# Check dependencies
echo -e "\n${YELLOW}Checking package.json dependencies...${NC}"
if [ -f "package.json" ]; then
    echo -e "${GREEN}✓ package.json exists${NC}"
    
    # Extract Expo version
    EXPO_VERSION=$(grep -o '"expo": "[^"]*"' package.json | cut -d'"' -f4)
    if [ ! -z "$EXPO_VERSION" ]; then
        echo -e "Expo version: ${GREEN}$EXPO_VERSION${NC}"
        
        if [[ $EXPO_VERSION == "~53"* ]]; then
            echo -e "${GREEN}✓ Using Expo SDK 53${NC}"
        else
            echo -e "${YELLOW}⚠ Not using the latest Expo SDK (53)${NC}"
        fi
    else
        echo -e "${RED}✗ Could not determine Expo version from package.json${NC}"
    fi
else
    echo -e "${RED}✗ package.json not found!${NC}"
fi

# Check for asset files
echo -e "\n${YELLOW}Checking required assets...${NC}"
if [ -d "assets" ]; then
    echo -e "${GREEN}✓ assets directory exists${NC}"
    
    # Check for required asset files
    REQUIRED_ASSETS=("icon.png" "splash.png" "adaptive-icon.png" "favicon.png" "notification-icon.png")
    MISSING_ASSETS=()
    
    for asset in "${REQUIRED_ASSETS[@]}"; do
        if [ -f "assets/$asset" ]; then
            echo -e "  ${GREEN}✓ assets/$asset exists${NC}"
        else
            echo -e "  ${RED}✗ assets/$asset is missing${NC}"
            MISSING_ASSETS+=("$asset")
        fi
    done
    
    if [ ${#MISSING_ASSETS[@]} -ne 0 ]; then
        echo -e "${YELLOW}Recommendation: Run the setup-assets.sh script to create placeholder assets${NC}"
    fi
else
    echo -e "${RED}✗ assets directory not found!${NC}"
    echo -e "${YELLOW}Recommendation: Create an assets directory and add required files${NC}"
fi

# Check for node_modules
echo -e "\n${YELLOW}Checking node_modules...${NC}"
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓ node_modules directory exists${NC}"
    MODULES_COUNT=$(find node_modules -type d -maxdepth 1 | wc -l)
    echo -e "  Found approximately $((MODULES_COUNT-1)) installed packages"
else
    echo -e "${RED}✗ node_modules directory not found!${NC}"
    echo -e "${YELLOW}Recommendation: Run 'npm install' or 'yarn' to install dependencies${NC}"
fi

# Offer to clean the project
echo -e "\n${YELLOW}Would you like to perform cleanup operations? (y/n)${NC}"
read -p "> " choice

if [[ $choice == "y" || $choice == "Y" ]]; then
    echo -e "${BLUE}Performing cleanup operations...${NC}"
    
    # Remove node_modules and reinstall
    echo -e "1. Removing node_modules and reinstalling dependencies"
    rm -rf node_modules
    npm install
    
    # Clear Expo cache
    echo -e "2. Clearing Expo cache"
    npx expo-cli cache --clear
    
    # Clear Metro bundler cache
    echo -e "3. Clearing Metro bundler cache"
    rm -rf $TMPDIR/metro-*
    
    # Clear Watchman cache
    echo -e "4. Clearing Watchman cache (if installed)"
    if command -v watchman &> /dev/null; then
        watchman watch-del-all
    fi
    
    echo -e "${GREEN}Cleanup completed! Try running your app again.${NC}"
else
    echo -e "${BLUE}Skipping cleanup operations.${NC}"
fi

echo -e "\n${BLUE}==============================================${NC}"
echo -e "${BLUE}          Troubleshooting completed${NC}"
echo -e "${BLUE}==============================================${NC}"
echo -e "If you're still experiencing issues, try:"
echo "1. Checking for errors in terminal output"
echo "2. Running 'expo doctor' to check for issues"
echo "3. Creating a development build instead of using Expo Go"
echo -e "${BLUE}==============================================${NC}"