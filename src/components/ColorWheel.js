// src/components/ColorWheel.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  PanResponder,
  Alert,
} from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle, Path } from 'react-native-svg';

const { width } = Dimensions.get('window');
const WHEEL_SIZE = Math.min(width * 0.85, 320);
const WHEEL_RADIUS = WHEEL_SIZE / 2;
const CENTER = WHEEL_RADIUS;
const PICKER_RADIUS = 12;

const ColorWheel = ({ onColorChange, selectedColor = '#3b82f6', theme }) => {
  const [currentColor, setCurrentColor] = useState(selectedColor);
  const [hexInput, setHexInput] = useState(selectedColor);
  const [pickerPosition, setPickerPosition] = useState({ x: CENTER, y: CENTER });
  const [isDragging, setIsDragging] = useState(false);
  const [useBlackCenter, setUseBlackCenter] = useState(false);

  // Convert HSV to RGB
  const hsvToRgb = (h, s, v) => {
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    
    let r, g, b;
    
    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else {
      r = c; g = 0; b = x;
    }
    
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    
    return { r, g, b };
  };

  // Convert RGB to Hex
  const rgbToHex = (r, g, b) => {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  // Convert RGB to HSV
  const rgbToHsv = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    let h = 0;
    let s = max === 0 ? 0 : diff / max;
    let v = max;
    
    if (diff !== 0) {
      switch (max) {
        case r:
          h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / diff + 2) / 6;
          break;
        case b:
          h = ((r - g) / diff + 4) / 6;
          break;
      }
    }
    
    return { h: h * 360, s, v };
  };

  // Convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Convert position to HSV
  const positionToHsv = (x, y) => {
    const dx = x - CENTER;
    const dy = y - CENTER;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = WHEEL_RADIUS - 20;
    
    if (distance > maxDistance) {
      return null;
    }
    
    // Calculate hue from angle
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    
    // Calculate saturation from distance
    const saturation = Math.min(distance / maxDistance, 1);
    
    // Adjust value based on center toggle - black center means lower values at center
    const value = useBlackCenter ? 0.1 + (saturation * 0.8) : 0.9;
    
    return { h: angle, s: saturation, v: value };
  };

  // Convert HSV to position
  const hsvToPosition = (h, s, v) => {
    const angle = (h * Math.PI) / 180;
    // For black center mode, adjust distance based on value
    let distance;
    if (useBlackCenter) {
      // In black center mode, distance represents both saturation and value
      distance = Math.max(s, (v - 0.1) / 0.8) * (WHEEL_RADIUS - 20);
    } else {
      distance = s * (WHEEL_RADIUS - 20);
    }
    
    const x = CENTER + distance * Math.cos(angle);
    const y = CENTER + distance * Math.sin(angle);
    
    return { x, y };
  };

  // Update color from HSV
  const updateColorFromHsv = (h, s, v) => {
    const { r, g, b } = hsvToRgb(h, s, v);
    const hex = rgbToHex(r, g, b);
    setCurrentColor(hex);
    setHexInput(hex);
    onColorChange(hex);
  };

  // Initialize picker position from selected color
  useEffect(() => {
    const rgb = hexToRgb(selectedColor);
    if (rgb) {
      const { h, s, v } = rgbToHsv(rgb.r, rgb.g, rgb.b);
      const position = hsvToPosition(h, s, v);
      setPickerPosition(position);
    }
  }, [selectedColor, useBlackCenter]);

  // Update color when center toggle changes
  useEffect(() => {
    const hsv = positionToHsv(pickerPosition.x, pickerPosition.y);
    if (hsv) {
      updateColorFromHsv(hsv.h, hsv.s, hsv.v);
    }
  }, [useBlackCenter]);

  // Pan responder for dragging the color picker
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    
    onPanResponderGrant: (evt) => {
      setIsDragging(true);
      const { locationX, locationY } = evt.nativeEvent;
      handleTouch(locationX, locationY);
    },
    
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      handleTouch(locationX, locationY);
    },
    
    onPanResponderRelease: () => {
      setIsDragging(false);
    },
  });

  // Handle touch/drag on the color wheel
  const handleTouch = (x, y) => {
    const hsv = positionToHsv(x, y);
    if (hsv) {
      setPickerPosition({ x, y });
      updateColorFromHsv(hsv.h, hsv.s, hsv.v);
    }
  };

  // Handle hex input change
  const handleHexInput = (text) => {
    setHexInput(text);
    
    // Validate and update color if valid hex
    if (/^#[0-9A-F]{6}$/i.test(text)) {
      const rgb = hexToRgb(text);
      if (rgb) {
        setCurrentColor(text);
        onColorChange(text);
        
        // Update picker position
        const { h, s, v } = rgbToHsv(rgb.r, rgb.g, rgb.b);
        const position = hsvToPosition(h, s, v);
        setPickerPosition(position);
      }
    }
  };

  // Create a simpler color wheel using concentric circles
  const generateColorRings = () => {
    const rings = [];
    const numRings = 12; // Fewer rings for better performance
    const numSegments = 36; // 36 segments per ring
    
    for (let ring = 0; ring < numRings; ring++) {
      for (let segment = 0; segment < numSegments; segment++) {
        const hue = (segment / numSegments) * 360;
        const saturation = (ring + 1) / numRings;
        // Adjust value based on center toggle
        const value = useBlackCenter ? 0.1 + (saturation * 0.8) : 0.9;
        const { r, g, b } = hsvToRgb(hue, saturation, value);
        const color = rgbToHex(r, g, b);
        
        const innerRadius = 20 + (ring * (WHEEL_RADIUS - 40) / numRings);
        const outerRadius = 20 + ((ring + 1) * (WHEEL_RADIUS - 40) / numRings);
        const startAngle = (segment / numSegments) * 360;
        const endAngle = ((segment + 1) / numSegments) * 360;
        
        const startAngleRad = (startAngle * Math.PI) / 180;
        const endAngleRad = (endAngle * Math.PI) / 180;
        
        const x1 = CENTER + innerRadius * Math.cos(startAngleRad);
        const y1 = CENTER + innerRadius * Math.sin(startAngleRad);
        const x2 = CENTER + outerRadius * Math.cos(startAngleRad);
        const y2 = CENTER + outerRadius * Math.sin(startAngleRad);
        const x3 = CENTER + outerRadius * Math.cos(endAngleRad);
        const y3 = CENTER + outerRadius * Math.sin(endAngleRad);
        const x4 = CENTER + innerRadius * Math.cos(endAngleRad);
        const y4 = CENTER + innerRadius * Math.sin(endAngleRad);
        
        const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
        const pathData = `M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1} Z`;
        
        rings.push(
          <Path
            key={`${ring}-${segment}`}
            d={pathData}
            fill={color}
            stroke="none"
          />
        );
      }
    }
    
    return rings;
  };


  return (
    <View style={styles.container}>
      {/* Color Wheel */}
      <View style={styles.wheelContainer}>
        <View
          style={[styles.wheel, { width: WHEEL_SIZE, height: WHEEL_SIZE }]}
          {...panResponder.panHandlers}
        >
          <Svg width={WHEEL_SIZE} height={WHEEL_SIZE} style={styles.wheelSvg}>
            <Defs>
              {/* Radial gradient for saturation */}
              <RadialGradient
                id="saturationGradient"
                cx="50%"
                cy="50%"
                r="50%"
              >
                <Stop offset="0%" stopColor={useBlackCenter ? "#000000" : "#ffffff"} stopOpacity="1" />
                <Stop offset="100%" stopColor={useBlackCenter ? "#000000" : "#ffffff"} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            
            {/* Color wheel segments */}
            {generateColorRings()}
            
            {/* Saturation overlay */}
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={WHEEL_RADIUS - 20}
              fill="url(#saturationGradient)"
            />
          </Svg>
          
          {/* Draggable color picker */}
          <View
            style={[
              styles.colorPicker,
              {
                left: pickerPosition.x - PICKER_RADIUS,
                top: pickerPosition.y - PICKER_RADIUS,
                backgroundColor: currentColor,
                borderColor: isDragging ? '#fff' : '#000',
                borderWidth: 3,
                transform: [{ scale: isDragging ? 1.2 : 1 }],
              }
            ]}
          />
        </View>
      </View>
      
      
      {/* Color Preview with Hex Input */}
      <View style={styles.previewContainer}>
        <View style={[styles.colorPreview, { backgroundColor: currentColor }]}>
          <TextInput
            style={[styles.colorPreviewText, { 
              color: getBrightness(currentColor) > 128 ? '#000' : '#fff',
              backgroundColor: 'transparent',
              borderWidth: 0,
              textAlign: 'center',
              width: '100%'
            }]}
            value={hexInput}
            onChangeText={handleHexInput}
            placeholder="#000000"
            placeholderTextColor={getBrightness(currentColor) > 128 ? '#666' : '#ccc'}
            maxLength={7}
            autoCapitalize="characters"
            autoCorrect={false}
            selectTextOnFocus={true}
          />
        </View>
      </View>
      
      {/* Center Color Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, { backgroundColor: useBlackCenter ? '#000' : '#fff', borderColor: theme.border }]}
          onPress={() => setUseBlackCenter(!useBlackCenter)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Switch to ${useBlackCenter ? 'white' : 'black'} center`}
        >
          <Text style={[styles.toggleText, { color: useBlackCenter ? '#fff' : '#000' }]}>
            {useBlackCenter ? '⚫' : '⚪'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  // Helper function to determine text color based on background brightness
  function getBrightness(hexColor) {
    const rgb = hexToRgb(hexColor);
    if (!rgb) return 128;
    return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  }
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  wheelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  wheel: {
    borderRadius: WHEEL_RADIUS,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  wheelSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  colorPicker: {
    position: 'absolute',
    width: PICKER_RADIUS * 2,
    height: PICKER_RADIUS * 2,
    borderRadius: PICKER_RADIUS,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 8,
  },
  previewContainer: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  colorPreview: {
    width: 200,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  colorPreviewText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    justifyContent: 'center',
  },
  toggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  toggleText: {
    fontSize: 18,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ColorWheel;