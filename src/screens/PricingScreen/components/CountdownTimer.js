// src/screens/PricingScreen/components/CountdownTimer.js
import React, { useState, useEffect, memo } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CountdownTimer = memo(({ initialTime, style, textStyle, theme }) => {
  const [countdownTime, setCountdownTime] = useState(initialTime || {
    days: 26,
    hours: 12,
    minutes: 45,
    seconds: 30
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdownTime(prev => {
        let { days, hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              hours = 23;
              if (days > 0) {
                days--;
              }
            }
          }
        }
        
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={[{
      backgroundColor: '#000000',
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 20,
      marginHorizontal: 16,
      marginVertical: 12,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.05)',
    }, style]}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
      }}>
        <Ionicons 
          name="time-outline" 
          size={16} 
          color="#FFD700"
          style={{ marginRight: 6 }}
        />
        <Text style={{
          fontSize: 13,
          fontWeight: '600',
          color: '#FFD700',
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        }}>
          Founder Offer Ends In
        </Text>
      </View>
      
      {/* Timer Display */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {/* Days */}
        <View style={{ alignItems: 'center', marginHorizontal: 8 }}>
          <Text style={{
            fontSize: 28,
            fontWeight: '700',
            color: '#FFFFFF',
            fontVariant: ['tabular-nums'],
          }}>
            {countdownTime.days < 10 ? `0${countdownTime.days}` : countdownTime.days}
          </Text>
          <Text style={{
            fontSize: 10,
            color: '#999',
            marginTop: 2,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}>
            days
          </Text>
        </View>

        <Text style={{
          fontSize: 20,
          fontWeight: '300',
          color: '#666',
          marginHorizontal: 4,
          marginBottom: 12,
        }}>:</Text>

        {/* Hours */}
        <View style={{ alignItems: 'center', marginHorizontal: 8 }}>
          <Text style={{
            fontSize: 28,
            fontWeight: '700',
            color: '#FFFFFF',
            fontVariant: ['tabular-nums'],
          }}>
            {countdownTime.hours < 10 ? `0${countdownTime.hours}` : countdownTime.hours}
          </Text>
          <Text style={{
            fontSize: 10,
            color: '#999',
            marginTop: 2,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}>
            hrs
          </Text>
        </View>

        <Text style={{
          fontSize: 20,
          fontWeight: '300',
          color: '#666',
          marginHorizontal: 4,
          marginBottom: 12,
        }}>:</Text>

        {/* Minutes */}
        <View style={{ alignItems: 'center', marginHorizontal: 8 }}>
          <Text style={{
            fontSize: 28,
            fontWeight: '700',
            color: '#FFFFFF',
            fontVariant: ['tabular-nums'],
          }}>
            {countdownTime.minutes < 10 ? `0${countdownTime.minutes}` : countdownTime.minutes}
          </Text>
          <Text style={{
            fontSize: 10,
            color: '#999',
            marginTop: 2,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}>
            min
          </Text>
        </View>

        <Text style={{
          fontSize: 20,
          fontWeight: '300',
          color: '#666',
          marginHorizontal: 4,
          marginBottom: 12,
        }}>:</Text>

        {/* Seconds */}
        <View style={{ alignItems: 'center', marginHorizontal: 8 }}>
          <Text style={{
            fontSize: 28,
            fontWeight: '700',
            color: '#FF6B6B',
            fontVariant: ['tabular-nums'],
          }}>
            {countdownTime.seconds < 10 ? `0${countdownTime.seconds}` : countdownTime.seconds}
          </Text>
          <Text style={{
            fontSize: 10,
            color: '#999',
            marginTop: 2,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}>
            sec
          </Text>
        </View>
      </View>
    </View>
  );
});

CountdownTimer.displayName = 'CountdownTimer';

export default CountdownTimer;