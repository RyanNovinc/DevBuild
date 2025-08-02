#!/bin/bash
# setup-assets.sh - Script to create basic assets for your Expo app

# Create assets directory if it doesn't exist
mkdir -p assets

# Check if ImageMagick is installed (for icon generation)
if command -v convert &> /dev/null; then
    echo "ImageMagick is installed, creating placeholder images..."
    
    # Create a simple icon (512x512)
    convert -size 512x512 xc:#4CAF50 -font Arial -pointsize 70 -fill white -gravity center -annotate 0 "LC" assets/icon.png
    
    # Create adaptive icon (foreground)
    convert -size 512x512 xc:#4CAF50 -font Arial -pointsize 70 -fill white -gravity center -annotate 0 "LC" assets/adaptive-icon.png
    
    # Create splash screen
    convert -size 1242x2436 xc:#4CAF50 -font Arial -pointsize 100 -fill white -gravity center -annotate 0 "LifeCompass" assets/splash.png
    
    # Create favicon
    convert -size 64x64 xc:#4CAF50 -font Arial -pointsize 18 -fill white -gravity center -annotate 0 "LC" assets/favicon.png
    
    # Create notification icon
    convert -size 96x96 xc:#FFFFFF -fill "#4CAF50" -draw "circle 48,48 48,10" -gravity center -font Arial -pointsize 30 -annotate 0 "LC" assets/notification-icon.png
    
    # Create notification sound (empty file)
    touch assets/notification-sound.wav
    
    echo "Placeholder assets created successfully!"
else
    echo "ImageMagick not found. Creating empty placeholder files instead."
    touch assets/icon.png
    touch assets/adaptive-icon.png
    touch assets/splash.png
    touch assets/favicon.png
    touch assets/notification-icon.png
    touch assets/notification-sound.wav
    echo "Empty placeholder files created. You'll need to replace them with actual images."
fi

echo "Asset setup complete!"