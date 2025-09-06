// src/screens/Onboarding/components/DomainWheel.js
import React, { useMemo, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Svg, { Path, G, Circle, Text as SvgText } from 'react-native-svg';
import ResponsiveText from './ResponsiveText';
import TypingAnimation from './TypingAnimation';
import CelebrationEffect from './CelebrationEffect';
import { useI18n } from '../context/I18nContext';
import { getTranslatedDomainName } from '../data/domainTranslations';

const { width, height } = Dimensions.get('window');

// Message categories
const MESSAGES = {
  // English messages
  en: {
    FIRST_MESSAGE: "Let's start off by choosing a domain of life where you want to see progress the most. There's no wrong choice here. Pick whatever catches your eye and you're already moving forward.",
    ACTION_ORIENTED: [
      "The simple act of choosing puts you ahead. Any domain you pick is a win—you can always adjust as you go.",
      "There's no wrong choice here. Pick what catches your eye, and you're already moving forward.",
      "Progress comes from action, not perfect planning. Trust your instinct and pick a domain.",
      "You're already doing what most people never do—taking that first step. Whichever domain feels right is the right choice.",
      "No need to overthink it. Pick what stands out today—changing direction later is just part of the journey.",
      "Any choice moves you forward. The simple act of selecting a domain puts momentum on your side.",
      "By choosing a domain, you've already accomplished something significant—breaking through indecision and taking action."
    ],
    PERSONAL_APPROACH: [
      "Some thrive with laser focus on one domain, others prefer balance across several. There's no universal right answer—only what works for you.",
      "Whether you want to master one area or create harmony across many, this is your compass to use as you see fit.",
      "Your attention is yours to direct. Concentrate it intensely on one domain or distribute it across several—the choice is entirely yours.",
      "Balance doesn't look the same for everyone. Define what balance means to you, not what others say it should be.",
      "Some seasons call for intense focus on one domain. Others invite a broader approach. Both are valid paths forward.",
      "Success looks different for everyone. Define yours on your own terms—whether that's excellence in one area or growth across many.",
      "This isn't about following someone else's formula. It's about finding your own direction through what matters to you.",
      "Give yourself permission to focus where you want to focus. There's wisdom in both depth and breadth—trust your instincts."
    ],
    FUTURE_EXPANSION: [
      "This is just your starting point. Once you're in the app, you can always explore and add goals in other domains.",
      "Start with what resonates today. You'll have the opportunity to branch out to other domains as you progress.",
      "Think of this as opening the door, not choosing the entire path. You can add more domains to your journey anytime.",
      "Your LifeCompass grows with you. Begin with one domain now, then expand your horizons whenever you're ready.",
      "This choice opens possibilities rather than limiting them. You can add more domains to your dashboard once you're inside.",
      "We recommend starting with one domain for focus, but don't worry—you can easily add more areas once you get familiar with the app.",
      "As you progress, your LifeCompass evolves. Start with what matters today, knowing you can expand tomorrow.",
      "Building a strong foundation in one domain creates momentum for exploring others later—which you can do anytime in the app."
    ]
  },
  // Japanese messages
  ja: {
    FIRST_MESSAGE: "最も進歩を見たい人生のドメインを選ぶことから始めましょう。ここに間違った選択はありません。目を引くものを選べば、すでに前進しています。",
    ACTION_ORIENTED: [
      "選ぶという行為だけであなたは一歩先に進んでいます。どのドメインを選んでも成功です—いつでも調整できます。",
      "ここに間違った選択はありません。目を引くものを選べば、すでに前進しています。",
      "完璧な計画ではなく、行動から進歩が生まれます。直感を信じてドメインを選びましょう。",
      "あなたはすでに多くの人が決してしないことをしています—最初の一歩を踏み出すこと。どのドメインが正しいと感じても、それが正しい選択です。",
      "考えすぎる必要はありません。今日目立つものを選びましょう—後で方向を変えることは旅の一部です。",
      "どんな選択も前進させます。ドメインを選ぶという単純な行為があなたの味方です。",
      "ドメインを選ぶことで、あなたはすでに重要なことを成し遂げています—優柔不断を打ち破り、行動を起こすこと。"
    ],
    PERSONAL_APPROACH: [
      "一つのドメインに集中する人もいれば、複数のドメインでバランスを取る人もいます。万人に通用する正解はなく、あなたに合うものだけです。",
      "一つの分野を極めたいのか、複数の分野で調和を作りたいのか、このコンパスはあなたが適切だと思うように使えます。",
      "あなたの注意力はあなたのものです。一つのドメインに集中するか、複数に分散するか—選択は完全にあなた次第です。",
      "バランスは人それぞれ異なります。他人の言うバランスではなく、あなた自身のバランスを定義しましょう。",
      "ある時期は一つのドメインに集中する必要があり、別の時期は広いアプローチが必要です。どちらも有効な前進の道です。",
      "成功は人それぞれ異なります。一つの分野での優れた能力か、多くの分野での成長か—あなた自身の条件で定義してください。",
      "これは他の人の公式に従うことではありません。あなたにとって重要なことを通じて、自分自身の方向性を見つけることです。",
      "あなたが集中したい場所に集中する許可を自分に与えてください。深さにも広さにも知恵があります—直感を信じてください。"
    ],
    FUTURE_EXPANSION: [
      "これはただの出発点です。アプリに入れば、いつでも他のドメインの目標を探索し追加できます。",
      "今日響くものから始めましょう。進歩するにつれて、他のドメインに広がる機会があります。",
      "これは道全体を選ぶのではなく、ドアを開けるようなものです。いつでも旅に他のドメインを追加できます。",
      "あなたのライフコンパスはあなたと共に成長します。今は一つのドメインから始めて、準備ができたらいつでも視野を広げましょう。",
      "この選択は可能性を制限するのではなく、開きます。ダッシュボードに他のドメインを追加するのは、中に入ってからいつでもできます。",
      "集中するために一つのドメインから始めることをお勧めしますが、心配無用です—アプリに慣れたら、簡単に他の領域を追加できます。",
      "進歩するにつれて、あなたのライフコンパスは進化します。今日重要なことから始めて、明日は拡大できることを知っておきましょう。",
      "一つのドメインで強固な基盤を築くことで、後で他のドメインを探索するための勢いが生まれます—アプリ内でいつでも可能です。"
    ]
  }
};

// Celebration types
const CELEBRATION_TYPES = ['confetti', 'fireworks', 'sparkles', 'starburst'];

// AI Introduction Messages
const AI_INTRODUCTION_MESSAGES = [
  "Welcome to LifeCompass! I'm your AI guide.",
  "I'll show you how to apply project management techniques to your personal goals - the same methods companies use to hit their biggest targets.",
  "Structured goal systems compound success at every level - from planning to execution to tracking. Let's turn your dreams into organised action plans."
];

// Simple pulsing icon component
const PulsingIcon = ({ iconName, iconX, iconY, shouldPulse, opacity = 1, animatedOpacity, animatedScale }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const ICON_SIZE = 24;

  useEffect(() => {
    if (shouldPulse) {
      // Reset and start pulse animation
      scale.setValue(1);
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.3,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [shouldPulse]);

  // Combine opacities if both are provided
  const finalOpacity = animatedOpacity ? Animated.multiply(animatedOpacity, opacity) : opacity;
  
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: iconX,
        top: iconY,
        width: ICON_SIZE,
        height: ICON_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        zIndex: 5,
        opacity: finalOpacity,
        transform: animatedScale ? [{ scale: Animated.multiply(scale, animatedScale) }] : [{ scale }]
      }}
    >
      <Ionicons 
        name={iconName} 
        size={ICON_SIZE} 
        color="#FFFFFF" 
      />
    </Animated.View>
  );
};

const DomainWheel = ({ 
  domains, 
  onDomainSelected, 
  selectedDomain, 
  onCenterButtonPress, 
  guidedMode = false,
  segmentsRevealed = false,
  revealedSegments = [],
  textRevealed = false,
  onWelcomeStateChange,
  wheelScale
}) => {
  // Get translation function and current language
  const { t, currentLanguage } = useI18n();
  
  // Welcome state - true initially, false after first tap
  const [isWelcomeState, setIsWelcomeState] = useState(true);
  
  // AI Introduction state
  const [showAIMessages, setShowAIMessages] = useState(true);
  const [currentAIMessage, setCurrentAIMessage] = useState(0);
  const [aiMessageComplete, setAiMessageComplete] = useState(false);
  const [showTapToContinue, setShowTapToContinue] = useState(false);
  const [showFortuneBadge, setShowFortuneBadge] = useState(false);
  
  // Notify parent of welcome state changes
  useEffect(() => {
    if (onWelcomeStateChange) {
      onWelcomeStateChange(isWelcomeState);
    }
  }, [isWelcomeState, onWelcomeStateChange]);
  
  // Show tap prompt when AI message is complete
  useEffect(() => {
    if (aiMessageComplete && showAIMessages) {
      const showPromptTimeout = setTimeout(() => {
        setShowTapToContinue(true);
        Animated.timing(tapPromptOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        }).start();
      }, 1000);

      return () => clearTimeout(showPromptTimeout);
    }
  }, [aiMessageComplete, showAIMessages]);
  
  // Show Fortune 500 badge during second message
  useEffect(() => {
    if (currentAIMessage === 1 && showAIMessages) {
      // Show badge after typing completes
      if (aiMessageComplete) {
        setShowFortuneBadge(true);
        Animated.parallel([
          Animated.timing(fortuneBadgeOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true
          }),
          Animated.spring(fortuneBadgeScale, {
            toValue: 1,
            friction: 6,
            tension: 100,
            useNativeDriver: true
          })
        ]).start();
      }
    } else {
      // Hide badge on other messages
      if (showFortuneBadge) {
        Animated.timing(fortuneBadgeOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }).start(() => {
          setShowFortuneBadge(false);
        });
      }
    }
  }, [currentAIMessage, aiMessageComplete, showAIMessages]);
  
  // Start continuous pulse animation for the sparkle icon
  useEffect(() => {
    if (showAIMessages) {
      // Create and start the continuous pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(iconPulse, {
            toValue: 1.2,
            duration: 1000,
            easing: Easing.ease,
            useNativeDriver: true
          }),
          Animated.timing(iconPulse, {
            toValue: 1,
            duration: 1000,
            easing: Easing.ease,
            useNativeDriver: true
          })
        ])
      ).start();
    }
  }, [showAIMessages]);
  
  // Initial smooth fade-in for AI messages
  useEffect(() => {
    if (showAIMessages) {
      Animated.timing(aiMessageOpacity, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }).start();
    }
  }, []); // Only run on mount
  
  // Fade in centre button when AI messages complete
  useEffect(() => {
    if (!showAIMessages) {
      // Reset any scale animations to ensure clean fade-in
      centerScale.setValue(1);
      centerTextScale.setValue(1);
      centerTextOpacity.setValue(1);
      
      Animated.timing(centerOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }).start();
    } else {
      centerOpacity.setValue(0);
    }
  }, [showAIMessages]);
  
  // Animations for centre circle breathing and ripple effect
  const centerScale = useRef(new Animated.Value(1)).current;
  const centerOpacity = useRef(new Animated.Value(0)).current;
  const rippleScale = useRef(new Animated.Value(1)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;
  
  // Animation for text transition
  const centerTextOpacity = useRef(new Animated.Value(1)).current;
  const centerTextScale = useRef(new Animated.Value(1)).current;
  
  // AI message animations
  const aiMessageOpacity = useRef(new Animated.Value(0)).current;
  const aiMessageTextOpacity = useRef(new Animated.Value(1)).current;
  const tapPromptOpacity = useRef(new Animated.Value(0)).current;
  
  // Ref for typing animation
  const typingRef = useRef(null);
  
  // Fortune badge animations
  const fortuneBadgeOpacity = useRef(new Animated.Value(0)).current;
  const fortuneBadgeScale = useRef(new Animated.Value(0.8)).current;
  
  // AI icon pulse animation
  const iconPulse = useRef(new Animated.Value(1)).current;
  
  // Simple state for triggering pulse animation
  const [shouldPulse, setShouldPulse] = useState(false);
  
  // Center button message state
  const [centerButtonClicks, setCenterButtonClicks] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [currentMessageCategory, setCurrentMessageCategory] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [showFirstMessage, setShowFirstMessage] = useState(true);
  
  // Progressive reveal state
  const [revealInProgress, setRevealInProgress] = useState(false);
  
  // Celebration state
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationType, setCelebrationType] = useState('confetti');
  const [celebrationIndex, setCelebrationIndex] = useState(0);
  
  // Center button message animations
  const centerMessageOpacity = useRef(new Animated.Value(0)).current;
  const centerMessageY = useRef(new Animated.Value(20)).current;
  
  // Animation values for segment reveal - create refs for each domain
  const segmentAnimations = useRef(
    domains.map(() => ({
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0.3)
    }))
  ).current;
  
  // Animation value for text layer fade-in
  const textLayerOpacity = useRef(new Animated.Value(0)).current;
  
  // Calculate wheel dimensions
  const WHEEL_SIZE = Math.min(width * 0.85, 340);
  const SVG_CONTAINER_SIZE = WHEEL_SIZE * 1.2;
  const CENTER_RADIUS = WHEEL_SIZE * 0.12;
  const DOMAIN_LABEL_RADIUS = WHEEL_SIZE * 0.5 + 25;
  
  // Icon configuration 
  const ICON_SIZE = 24;
  
  // Create a path for a slice
  const createSlicePath = (startAngle, endAngle) => {
    const startAngleRad = (startAngle - 90) * Math.PI / 180;
    const endAngleRad = (endAngle - 90) * Math.PI / 180;
    
    const outerRadius = WHEEL_SIZE / 2 - 1;
    const innerRadius = CENTER_RADIUS;
    
    const startOuterX = outerRadius * Math.cos(startAngleRad);
    const startOuterY = outerRadius * Math.sin(startAngleRad);
    const endOuterX = outerRadius * Math.cos(endAngleRad);
    const endOuterY = outerRadius * Math.sin(endAngleRad);
    
    const startInnerX = innerRadius * Math.cos(startAngleRad);
    const startInnerY = innerRadius * Math.sin(startAngleRad);
    const endInnerX = innerRadius * Math.cos(endAngleRad);
    const endInnerY = innerRadius * Math.sin(endAngleRad);
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    return `
      M ${startOuterX} ${startOuterY}
      A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endOuterX} ${endOuterY}
      L ${endInnerX} ${endInnerY}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${startInnerX} ${startInnerY}
      Z
    `;
  };
  
  // Calculate centroid position
  const calculateCentroid = (angle, radius) => {
    const angleRad = (angle - 90) * Math.PI / 180;
    const x = radius * Math.cos(angleRad);
    const y = radius * Math.sin(angleRad);
    return [x, y];
  };
  
  // Subtle bounce animation that triggers ripple on completion
  useEffect(() => {
    let bounceTimeout;
    
    // Ripple effect that triggers after bounce - stronger visibility
    const createRipple = () => {
      rippleScale.setValue(1);
      rippleOpacity.setValue(0.7);
      
      Animated.parallel([
        Animated.timing(rippleScale, {
          toValue: 2.2,
          duration: 1500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(rippleOpacity, {
          toValue: 0,
          duration: 1500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true
        })
      ]).start();
      
      // Trigger domain pulse when ripple reaches the domains (after ~800ms)
      setTimeout(() => {
        pulseAllDomains();
      }, 800);
    };

    // Bounce animation that triggers ripple during bounce-back
    const createBounce = () => {
      Animated.sequence([
        // Quick drop (like settling onto a soft surface)
        Animated.timing(centerScale, {
          toValue: 0.97,
          duration: 100,
          easing: Easing.ease,
          useNativeDriver: true
        }),
        // Gentle bounce back with spring
        Animated.spring(centerScale, {
          toValue: 1.0,
          friction: 6,
          tension: 100,
          useNativeDriver: true
        })
      ]).start(() => {
        // Next bounce in 1.5-2.5 seconds (more frequent)
        const nextDelay = 1500 + Math.random() * 1000;
        bounceTimeout = setTimeout(createBounce, nextDelay);
      });
      
      // Trigger ripple slightly earlier - during the bounce-back
      setTimeout(() => {
        createRipple();
      }, 120); // Start ripple 120ms after bounce begins (20ms after drop completes)
    };


    // Only start animations if AI messages are complete
    if (!showAIMessages) {
      // Start first bounce after 2 seconds
      bounceTimeout = setTimeout(createBounce, 2000);
    }

    // Cleanup
    return () => {
      if (bounceTimeout) {
        clearTimeout(bounceTimeout);
      }
    };
  }, [showAIMessages]);

  // All domains pulse once when hit by ripple
  const pulseAllDomains = () => {
    setShouldPulse(true);
    setTimeout(() => setShouldPulse(false), 600); // Reset after animation
  };

  // Use useMemo to calculate wheel slices only when domains change
  const wheelSlices = useMemo(() => {
    if (!domains || domains.length === 0) return [];
    
    // Create equal slices for all domains
    const sliceAngle = 360 / domains.length;
    let startAngle = 0;
    
    return domains.map((domain, index) => {
      const endAngle = startAngle + sliceAngle;
      const path = createSlicePath(startAngle, endAngle);
      const midAngle = startAngle + sliceAngle / 2;
      const centroid = calculateCentroid(midAngle, DOMAIN_LABEL_RADIUS);
      
      // Calculate icon position (closer to outer edge)
      const iconRadius = WHEEL_SIZE * 0.35; // 35% from centre to edge
      const iconX = iconRadius * Math.cos((midAngle - 90) * Math.PI / 180);
      const iconY = iconRadius * Math.sin((midAngle - 90) * Math.PI / 180);
      
      const result = {
        domain,
        path,
        centroid,
        angle: sliceAngle,
        startAngle,
        endAngle,
        midAngle,
        iconX,
        iconY
      };
      
      startAngle = endAngle;
      return result;
    });
  }, [domains, WHEEL_SIZE, CENTER_RADIUS, DOMAIN_LABEL_RADIUS]);
  
  // Function to play a triple haptic pulse (do-do-do)
  const playTripleHaptic = async () => {
    try {
      // First pulse
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Short delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Second pulse
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Short delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Third pulse
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.log('Triple haptic failed:', error);
    }
  };
  
  // Cycle to next message
  const cycleToNextMessage = () => {
    // Get message categories and current category based on language, excluding FIRST_MESSAGE
    const messageData = MESSAGES[currentLanguage] || MESSAGES.en;
    const categoryKeys = Object.keys(messageData).filter(key => key !== 'FIRST_MESSAGE');
    const categories = categoryKeys.map(key => messageData[key]);
    const currentCategory = categories[currentMessageCategory];
    
    // Get next message in current category
    let nextIndex = currentMessageIndex + 1;
    
    // If we've reached the end of the current category, move to the next category
    if (nextIndex >= currentCategory.length) {
      const nextCategory = (currentMessageCategory + 1) % categories.length;
      setCurrentMessageCategory(nextCategory);
      setCurrentMessageIndex(0);
      setMessageText(categories[nextCategory][0]);
    } else {
      // Stay in current category, move to next message
      setCurrentMessageIndex(nextIndex);
      setMessageText(currentCategory[nextIndex]);
    }
  };
  
  // Update centre button message
  const updateCenterButtonMessage = () => {
    // Hide previous message if showing
    if (showMessage) {
      Animated.parallel([
        Animated.timing(centerMessageOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(centerMessageY, {
          toValue: 30,
          duration: 200,
          easing: Easing.ease,
          useNativeDriver: true
        })
      ]).start(() => {
        // Check if we should show first message or cycle to next
        if (showFirstMessage) {
          // Show the first guidance message
          const firstMessage = MESSAGES[currentLanguage]?.FIRST_MESSAGE || MESSAGES.en.FIRST_MESSAGE;
          setMessageText(firstMessage);
          setShowFirstMessage(false);
        } else {
          // Cycle to next message from categories
          cycleToNextMessage();
        }
        
        // Show new message
        centerMessageY.setValue(20);
        Animated.parallel([
          Animated.timing(centerMessageOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true
          }),
          Animated.timing(centerMessageY, {
            toValue: 0,
            duration: 400,
            easing: Easing.ease,
            useNativeDriver: true
          })
        ]).start();
      });
    } else {
      // Very first message display
      if (showFirstMessage) {
        // Show the first guidance message
        const firstMessage = MESSAGES[currentLanguage]?.FIRST_MESSAGE || MESSAGES.en.FIRST_MESSAGE;
        setMessageText(firstMessage);
        setShowFirstMessage(false);
      } else {
        // This shouldn't happen, but fallback to cycling
        cycleToNextMessage();
      }
      
      // Show message
      setShowMessage(true);
      centerMessageY.setValue(20);
      Animated.parallel([
        Animated.timing(centerMessageOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true
        }),
        Animated.timing(centerMessageY, {
          toValue: 0,
          duration: 400,
          easing: Easing.ease,
          useNativeDriver: true
        })
      ]).start();
    }
  };
  
  // Handle AI message progression
  const handleAIMessageTap = () => {
    try {
      // Provide haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Haptics not available:', error);
    }
    
    // If typing is still in progress, complete it immediately
    if (!aiMessageComplete && typingRef.current) {
      typingRef.current.complete();
      return;
    }
    
    // If current message is complete, proceed to next message or finish
    if (aiMessageComplete) {
      // Hide tap prompt
      Animated.timing(tapPromptOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true
      }).start();
      
      if (currentAIMessage < AI_INTRODUCTION_MESSAGES.length - 1) {
        // Transition to next message
        Animated.timing(aiMessageTextOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        }).start(() => {
          setCurrentAIMessage(currentAIMessage + 1);
          setAiMessageComplete(false);
          setShowTapToContinue(false);
          
          Animated.timing(aiMessageTextOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true
          }).start();
        });
      } else {
        // All AI messages complete, hide AI messages and show welcome button
        Animated.timing(aiMessageOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }).start(() => {
          setShowAIMessages(false);
        });
      }
    }
  };

  // Handle centre button press
  const handleCenterPress = () => {
    // Don't allow interaction during animations
    if (revealInProgress) return;
    
    if (isWelcomeState) {
      // First tap - transition from welcome to domains view
      setIsWelcomeState(false);
      
      // Animate text transition
      Animated.sequence([
        // Fade out welcome text
        Animated.parallel([
          Animated.timing(centerTextOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(centerTextScale, {
            toValue: 0.8,
            duration: 200,
            useNativeDriver: true,
          })
        ]),
        // Fade in domain text
        Animated.parallel([
          Animated.timing(centerTextOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(centerTextScale, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          })
        ])
      ]).start();
    }
    
    // Handle progressive reveal or subsequent clicks
    if (!segmentsRevealed) {
      // Increment click count for the initial reveal
      setCenterButtonClicks(1);
      
      // Show the first guidance message immediately when starting animation
      updateCenterButtonMessage();
      
      // Show confetti on first click
      setCelebrationIndex(0);
      setCelebrationType(CELEBRATION_TYPES[0]); // Confetti
      setShowCelebration(true);
      
      // Apply celebration haptic feedback
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.log('Haptics not available:', error);
      }
    } else {
      // Only show messages and celebrations if segments are already revealed
      if (segmentsRevealed) {
        // Increment click count
        const newClickCount = centerButtonClicks + 1;
        setCenterButtonClicks(newClickCount);
        
        // Determine if we should show celebration
        // Rules: 
        // 1. First click (when segments not revealed) already showed confetti 
        // 2. 40% chance on all subsequent clicks - cycles through remaining animations
        const shouldShowCelebration = Math.random() < 0.4;
        
        if (shouldShowCelebration) {
          // Cycle through animations (confetti was already used on first click)
          const nextCelebrationIndex = (celebrationIndex + 1) % CELEBRATION_TYPES.length;
          setCelebrationIndex(nextCelebrationIndex);
          setCelebrationType(CELEBRATION_TYPES[nextCelebrationIndex]);
          
          // Apply celebration haptic feedback
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch (error) {
            console.log('Haptics not available:', error);
          }
          
          // Show celebration
          setShowCelebration(true);
        } else {
          // Regular click haptic feedback
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch (error) {
            console.log('Haptics not available:', error);
          }
        }
        
        // Update message (show first guidance message or cycle through existing ones)
        updateCenterButtonMessage();
      }
    }
    
    if (onCenterButtonPress) {
      onCenterButtonPress();
    }
  };
  
  // Handle domain selection with enhanced feedback
  const handleDomainSelect = (domain) => {
    // Don't allow domain selection until segments are revealed
    if (!segmentsRevealed) return;
    
    // Add a tactile feedback animation on the wheel when selecting
    if (wheelScale) {
      Animated.sequence([
        // Quick pulse inward
        Animated.timing(wheelScale, {
          toValue: 0.97,
          duration: 100,
          easing: Easing.ease,
          useNativeDriver: true
        }),
        // Bounce back with spring
        Animated.spring(wheelScale, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true
        })
      ]).start();
    }
    
    // If user clicks the same domain again, toggle selection (deselect it)
    if (selectedDomain && selectedDomain.name === domain.name) {
      // Deselection haptic feedback - a "closing" pattern
      try {
        // Use notification warning as a closing feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch (error) {
        console.log('Haptics not available:', error);
      }
    } else {
      // Determine if this is the first selection or changing selection
      const isFirstSelection = !selectedDomain;
      
      // Apply different haptic patterns based on state
      try {
        if (isFirstSelection) {
          // First selection - "do-do-do" pattern when continue button appears
          playTripleHaptic();
        } else {
          // Changing selection - single "do" when already have something selected
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      } catch (error) {
        console.log('Haptics not available:', error);
      }
    }
    
    // Call the parent's domain selection handler
    if (onDomainSelected) {
      onDomainSelected(domain);
    }
  };
  
  // Animate segment reveals
  useEffect(() => {
    revealedSegments.forEach(segmentIndex => {
      if (segmentIndex < segmentAnimations.length) {
        // Animate segment pop-in
        Animated.parallel([
          Animated.spring(segmentAnimations[segmentIndex].opacity, {
            toValue: 1,
            friction: 8,
            tension: 100,
            useNativeDriver: true,
          }),
          Animated.spring(segmentAnimations[segmentIndex].scale, {
            toValue: 1,
            friction: 6,
            tension: 80,
            useNativeDriver: true,
          })
        ]).start();
      }
    });
  }, [revealedSegments]);
  
  // Animate text layer fade-in
  useEffect(() => {
    if (textRevealed) {
      Animated.timing(textLayerOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      textLayerOpacity.setValue(0);
    }
  }, [textRevealed]);
  
  return (
    <>
      {/* AI Introduction Messages - positioned relative to screen */}
      {showAIMessages && (
        <TouchableOpacity
          style={styles.fullScreenTouchable}
          activeOpacity={1}
          onPress={handleAIMessageTap}
          pointerEvents="box-none"
        />
      )}
      
      <View style={styles.container}>
      
      {showAIMessages && (
        <Animated.View style={[styles.aiMessageContainer, { opacity: aiMessageOpacity }]}>
          <View style={styles.aiIconContainer}>
            <Animated.View style={[styles.aiIconCircle, { transform: [{ scale: iconPulse }] }]}>
              <Ionicons name="sparkles" size={18} color="#FFD700" />
            </Animated.View>
          </View>
          <Animated.View style={[styles.aiMessageTextContainer, { opacity: aiMessageTextOpacity }]}>
            <TypingAnimation
              ref={typingRef}
              key={currentAIMessage}
              text={AI_INTRODUCTION_MESSAGES[currentAIMessage]}
              typingSpeed={30}
              onComplete={() => setAiMessageComplete(true)}
              style={styles.aiMessageText}
            />
          </Animated.View>
        </Animated.View>
      )}
      
      {/* Fortune 500 Methods Badge - separate from AI message */}
      {showFortuneBadge && (
        <View style={styles.fortuneBadgeContainer}>
          <Animated.View style={[
            styles.fortuneBadge,
            { 
              opacity: fortuneBadgeOpacity,
              transform: [{ scale: fortuneBadgeScale }]
            }
          ]}>
            <View style={styles.fortuneBadgeHeader}>
              <Ionicons name="business" size={24} color="#FFD700" />
              <ResponsiveText style={styles.fortuneBadgeTitle}>ENTERPRISE</ResponsiveText>
            </View>
            <ResponsiveText style={styles.fortuneBadgeMainText}>
              Fortune 500
            </ResponsiveText>
            <ResponsiveText style={styles.fortuneBadgeSubText}>
              PROJECT MANAGEMENT
            </ResponsiveText>
            <ResponsiveText style={styles.fortuneBadgeMethodsText}>
              TECHNIQUES
            </ResponsiveText>
            <View style={styles.fortuneBadgeFooter}>
              <View style={styles.fortuneBadgeStamp}>
                <ResponsiveText style={styles.fortuneBadgeStampText}>PROFESSIONAL</ResponsiveText>
              </View>
            </View>
          </Animated.View>
        </View>
      )}
      
      {/* Tap to continue prompt */}
      {showTapToContinue && showAIMessages && (
        <Animated.View style={[styles.centralTapPrompt, { opacity: tapPromptOpacity }]}>
          <ResponsiveText style={styles.tapPromptText}>
            Tap to continue
          </ResponsiveText>
          <Ionicons 
            name="hand-left" 
            size={24} 
            color="rgba(255,255,255,0.7)" 
            style={styles.tapPromptIcon}
          />
        </Animated.View>
      )}
      <Animated.View style={[styles.wheelContainer, { width: SVG_CONTAINER_SIZE, height: SVG_CONTAINER_SIZE, transform: wheelScale ? [{ scale: wheelScale }] : [] }]}>
        {/* Main SVG Wheel */}
        <Svg
          width={SVG_CONTAINER_SIZE}
          height={SVG_CONTAINER_SIZE}
          viewBox={`${-SVG_CONTAINER_SIZE/2} ${-SVG_CONTAINER_SIZE/2} ${SVG_CONTAINER_SIZE} ${SVG_CONTAINER_SIZE}`}
        >
          {/* Domain slices - show all if segments revealed, or individual ones as they're revealed */}
          {wheelSlices.map((slice, index) => {
            // Check if this segment should be visible
            const isSegmentRevealed = segmentsRevealed || revealedSegments.includes(index);
            if (!isSegmentRevealed) return null;
            
            // Determine if this is on the bottom half of the wheel
            const isBottomHalf = slice.midAngle > 90 && slice.midAngle < 270;
            
            // Calculate label position
            const labelRadius = WHEEL_SIZE / 2 + (isBottomHalf ? 30 : 25);
            const labelX = labelRadius * Math.cos((slice.midAngle - 90) * Math.PI / 180);
            const labelY = labelRadius * Math.sin((slice.midAngle - 90) * Math.PI / 180);
            
            // Determine if this domain is selected
            const isSelected = selectedDomain?.name === slice.domain.name;
            
            // Calculate circle size for icon background
            const circleRadius = isSelected ? 26 : 24;
            
            // Get translated domain name
            const translatedDomainName = getTranslatedDomainName(slice.domain.name, currentLanguage);
            
            // Get first word for the label - handle Japanese labels differently
            let labelText;
            if (currentLanguage === 'ja') {
              labelText = translatedDomainName.slice(0, 2); // Take first two characters for Japanese
            } else {
              // For English, use "Growth" for Personal Growth, otherwise first word
              labelText = slice.domain.name === 'Personal Growth' ? 'Growth' : translatedDomainName.split(' ')[0];
            }
            
            // Get animation values for this segment
            const segmentAnim = segmentAnimations[index] || { opacity: new Animated.Value(1), scale: new Animated.Value(1) };
            
            return (
              <G key={`slice-${index}`}>
                {/* Main slice with solid color fill - now touchable */}
                <Path
                  d={slice.path}
                  fill={slice.domain.color}
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth={0.5}
                  opacity={guidedMode ? (isSelected ? 1 : 0.3) : (isSelected ? 1 : 0.7)}
                  onPress={() => handleDomainSelect(slice.domain)}
                />
                
                
                {/* Circle background for icon - also clickable */}
                <Circle
                  cx={slice.iconX}
                  cy={slice.iconY}
                  r={circleRadius}
                  fill={isSelected ? slice.domain.color : 'rgba(255,255,255,0.15)'}
                  stroke={isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.3)'}
                  strokeWidth={isSelected ? 2 : 1}
                  opacity={guidedMode ? (isSelected ? 1 : 0.3) : 1}
                  onPress={() => handleDomainSelect(slice.domain)}
                />
              </G>
            );
          })}
          
          {/* Center circle placeholder - hidden, replaced by animated overlay */}
          <Circle
            cx="0"
            cy="0"
            r={CENTER_RADIUS}
            fill="transparent"
            stroke="none"
            strokeWidth={0}
            opacity={0}
          />
        </Svg>
        
        {/* Animated centre circle overlay with float - only show after AI messages complete */}
        {!showAIMessages && (
          <Animated.View
          style={[
            {
              position: 'absolute',
              left: SVG_CONTAINER_SIZE / 2 - CENTER_RADIUS,
              top: SVG_CONTAINER_SIZE / 2 - CENTER_RADIUS,
              width: CENTER_RADIUS * 2,
              height: CENTER_RADIUS * 2,
              borderRadius: CENTER_RADIUS,
              backgroundColor: '#1e3a8a',
              borderWidth: 2,
              borderColor: '#3b82f6',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 21,
              opacity: centerOpacity,
              transform: [{ scale: centerScale }],
              shadowColor: '#3b82f6',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 4,
            }
          ]}
          pointerEvents="none"
        >
          <Animated.View 
            style={[
              {
                justifyContent: 'center',
                alignItems: 'center',
                opacity: centerTextOpacity,
                transform: [{ scale: centerTextScale }]
              }
            ]}
          >
            {isWelcomeState ? (
              // Welcome state content - large compass icon in centre
              <Ionicons name="compass" size={32} color="#FFFFFF" />
            ) : (
              // Domain selection state content - large compass icon in centre
              <Ionicons name="compass" size={32} color="#FFFFFF" />
            )}
          </Animated.View>
        </Animated.View>
        )}
        
        {/* Position icons using manual calculation */}
        <View style={styles.iconsOverlay} pointerEvents="none">
          {wheelSlices.map((slice, index) => {
            // Check if this segment should be visible
            const isSegmentRevealed = segmentsRevealed || revealedSegments.includes(index);
            if (!isSegmentRevealed) return null;
            
            const isSelected = selectedDomain?.name === slice.domain.name;
            
            // Calculate the absolute position based on the SVG viewBox and centre
            const centerX = SVG_CONTAINER_SIZE / 2;
            const centerY = SVG_CONTAINER_SIZE / 2;
            
            // Adjust icon position to be centered exactly in the middle of the slice
            const iconX = centerX + slice.iconX - ICON_SIZE / 2;
            const iconY = centerY + slice.iconY - ICON_SIZE / 2;
            
            // Get animation values for this segment
            const segmentAnim = segmentAnimations[index] || { opacity: new Animated.Value(1), scale: new Animated.Value(1) };
            
            return (
              <PulsingIcon
                key={`icon-${index}`}
                iconName={slice.domain.icon}
                iconX={iconX}
                iconY={iconY}
                shouldPulse={shouldPulse}
                opacity={guidedMode ? (isSelected ? 1 : 0.3) : 1}
                animatedOpacity={segmentAnim.opacity}
                animatedScale={segmentAnim.scale}
              />
            );
          })}
        </View>
        
        {/* Animated text labels and connecting lines */}
        <Animated.View style={[styles.textOverlay, { opacity: textLayerOpacity }]} pointerEvents="none">
          <Svg
            width={SVG_CONTAINER_SIZE}
            height={SVG_CONTAINER_SIZE}
            viewBox={`${-SVG_CONTAINER_SIZE/2} ${-SVG_CONTAINER_SIZE/2} ${SVG_CONTAINER_SIZE} ${SVG_CONTAINER_SIZE}`}
          >
          {wheelSlices.map((slice, index) => {
            // Check if this segment should be visible
            const isSegmentRevealed = segmentsRevealed || revealedSegments.includes(index);
            if (!isSegmentRevealed) return null;
            
            const isSelected = selectedDomain?.name === slice.domain.name;
            
            // Calculate positions (same as SVG text positioning)
            const isBottomHalf = slice.midAngle > 90 && slice.midAngle < 270;
            const labelRadius = WHEEL_SIZE / 2 + (isBottomHalf ? 30 : 25);
            const labelX = labelRadius * Math.cos((slice.midAngle - 90) * Math.PI / 180);
            const labelY = labelRadius * Math.sin((slice.midAngle - 90) * Math.PI / 180);
            
            // Get translated domain name and label text
            const translatedDomainName = getTranslatedDomainName(slice.domain.name, currentLanguage);
            let labelText;
            if (currentLanguage === 'ja') {
              labelText = translatedDomainName.slice(0, 2);
            } else {
              labelText = slice.domain.name === 'Personal Growth' ? 'Growth' : translatedDomainName.split(' ')[0];
            }
            
            
            return (
              <G key={`animated-text-${index}`}>
                {/* Connecting line - fades in with text */}
                <Path
                  d={`M ${(WHEEL_SIZE/2 - 5) * Math.cos((slice.midAngle - 90) * Math.PI / 180)} ${(WHEEL_SIZE/2 - 5) * Math.sin((slice.midAngle - 90) * Math.PI / 180)} 
                      L ${(WHEEL_SIZE/2 + 10) * Math.cos((slice.midAngle - 90) * Math.PI / 180)} ${(WHEEL_SIZE/2 + 10) * Math.sin((slice.midAngle - 90) * Math.PI / 180)}`}
                  stroke={guidedMode ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.3)"}
                  strokeWidth={1}
                  opacity={guidedMode ? (isSelected ? 1 : 0.3) : 1}
                />
                
                {/* Text label - fades in with textRevealed */}
                <SvgText
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  fill={isSelected ? '#FFFFFF' : (guidedMode ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.8)')}
                  opacity={guidedMode ? (isSelected ? 1 : 0.3) : 1}
                  rotation={isBottomHalf ? slice.midAngle + 180 : slice.midAngle}
                  origin={`${labelX},${labelY}`}
                >
                  {labelText}
                </SvgText>
              </G>
            );
          })}
          </Svg>
        </Animated.View>
        
        {/* Center button message */}
        {showMessage && (
          <Animated.View 
            style={[
              styles.centerButtonMessage,
              {
                opacity: centerMessageOpacity,
                transform: [{ translateY: centerMessageY }]
              }
            ]}
          >
            <ResponsiveText style={styles.centerButtonMessageText}>
              {messageText}
            </ResponsiveText>
          </Animated.View>
        )}
        
        {/* Celebration Effect */}
        <CelebrationEffect 
          visible={showCelebration}
          type={celebrationType}
          colors={domains.map(domain => domain.color)}
          onComplete={() => setShowCelebration(false)}
        />
        
        {/* Simplified approach - just centre button touch area */}
        <View style={styles.touchableOverlays}>
          
          {/* Ripple effect for centre button - only show if segments not revealed yet and AI messages complete */}
          {!segmentsRevealed && !showAIMessages && (
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  left: SVG_CONTAINER_SIZE / 2 - CENTER_RADIUS,
                  top: SVG_CONTAINER_SIZE / 2 - CENTER_RADIUS,
                  width: CENTER_RADIUS * 2,
                  height: CENTER_RADIUS * 2,
                  borderRadius: CENTER_RADIUS,
                  borderWidth: 2,
                  borderColor: 'rgba(59, 130, 246, 0.9)',
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  zIndex: 19,
                  transform: [{ scale: rippleScale }],
                  opacity: rippleOpacity
                }
              ]}
              pointerEvents="none"
            />
          )}
          
          {/* Center button touch area - only show after AI messages complete */}
          {!showAIMessages && (
            <TouchableOpacity
            style={[
              styles.centerButton,
              {
                left: SVG_CONTAINER_SIZE / 2 - CENTER_RADIUS - 15,
                top: SVG_CONTAINER_SIZE / 2 - CENTER_RADIUS - 15,
                width: CENTER_RADIUS * 2 + 30,
                height: CENTER_RADIUS * 2 + 30,
                borderRadius: CENTER_RADIUS + 15,
                backgroundColor: 'transparent',
                zIndex: 20,
              }
            ]}
            onPress={handleCenterPress}
            activeOpacity={0.7}
          />
          )}
        </View>
      </Animated.View>
      
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  wheelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  iconsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textLabelText: {
    fontSize: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  iconView: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  touchableOverlays: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    // Uncomment to see all touchable areas
    // backgroundColor: 'rgba(255,255,255,0.1)',
  },
  segmentTouch: {
    backgroundColor: 'transparent',
    zIndex: 15,
  },
  centerButton: {
    position: 'absolute',
    backgroundColor: 'transparent',
    zIndex: 20,
  },
  centerButtonMessage: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(30, 58, 138, 0.2)',
    borderRadius: 16,
    borderLeftWidth: 2,
    borderLeftColor: '#3b82f6',
    maxWidth: width - 40,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    position: 'absolute',
    top: '100%',
    alignSelf: 'center',
  },
  centerButtonMessageText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    textAlign: 'center',
  },
  // AI Message styles
  fullScreenTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width, // Use actual screen width
    height: height, // Use actual screen height
    zIndex: 25, // Higher than all other elements
  },
  aiMessageContainer: {
    position: 'absolute',
    top: '15%',
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(30, 58, 138, 0.2)',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 11,
  },
  aiIconContainer: {
    marginRight: 12,
    paddingTop: 2,
  },
  aiIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  aiMessageTextContainer: {
    flex: 1,
  },
  aiMessageText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  centralTapPrompt: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '85%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  tapPromptText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  tapPromptIcon: {
    marginLeft: 8,
  },
  // Fortune 500 Badge styles
  fortuneBadgeContainer: {
    position: 'absolute',
    top: '55%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  fortuneBadge: {
    position: 'relative',
    backgroundColor: '#1e3a8a',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#FFD700',
    padding: 24,
    minWidth: 280,
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    zIndex: 15,
  },
  fortuneBadgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fortuneBadgeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFD700',
    marginLeft: 8,
    letterSpacing: 1.2,
  },
  fortuneBadgeMainText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 0.8,
  },
  fortuneBadgeSubText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 4,
  },
  fortuneBadgeMethodsText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFD700',
    textAlign: 'center',
    letterSpacing: 2.5,
    marginBottom: 16,
  },
  fortuneBadgeFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 215, 0, 0.3)',
    paddingTop: 8,
    width: '100%',
    alignItems: 'center',
  },
  fortuneBadgeStamp: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.5)',
  },
  fortuneBadgeStampText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFD700',
    letterSpacing: 1,
  },
});

export default DomainWheel;