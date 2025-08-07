// src/screens/Onboarding/screens/DomainSelectionPage.js (with separate sequential messages)
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Easing,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ResponsiveText from '../components/ResponsiveText';
import TypingAnimation from '../components/TypingAnimation';
import NavigationHeader from '../components/NavigationHeader';
import DomainWheel from '../components/DomainWheel';
import CelebrationEffect from '../components/CelebrationEffect';

const { width, height } = Dimensions.get('window');

// Message categories
const MESSAGES = {
  // English messages
  en: {
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

// Domain names translations
const DOMAIN_NAMES = {
  en: {
    "Career & Work": "Career & Work",
    "Health & Wellness": "Health & Wellness",
    "Relationships": "Relationships",
    "Personal Growth": "Personal Growth",
    "Financial Security": "Financial Security",
    "Recreation & Leisure": "Recreation & Leisure",
    "Purpose & Meaning": "Purpose & Meaning",
    "Environment & Organization": "Environment & Organization"
  },
  ja: {
    "Career & Work": "キャリアと仕事",
    "Health & Wellness": "健康とウェルネス",
    "Relationships": "人間関係",
    "Personal Growth": "個人の成長",
    "Financial Security": "経済的安定",
    "Recreation & Leisure": "レクリエーションと余暇",
    "Purpose & Meaning": "目的と意味",
    "Environment & Organization": "環境と組織"
  }
};

// Celebration types
const CELEBRATION_TYPES = ['confetti', 'fireworks', 'sparkles', 'starburst'];

const DomainSelectionPage = ({ 
  domains, 
  onDomainSelected, 
  onDomainPreview, 
  onResetPreview,
  onBack,
  isNavigating = false,
  segmentsRevealed = false,
  onSegmentsRevealed
}) => {
  // State
  const [messageStep, setMessageStep] = useState(1); // 1: first message, 2: second message
  const [messageComplete, setMessageComplete] = useState(false);
  const [showTapToContinue, setShowTapToContinue] = useState(false);
  const [wheelVisible, setWheelVisible] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [showDomainInfo, setShowDomainInfo] = useState(false);
  const [appLanguage, setAppLanguage] = useState('en'); // Default language
  const [languageLoaded, setLanguageLoaded] = useState(false); // New state to track language loading
  
  // Center button state
  const [centerButtonClicks, setCenterButtonClicks] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [currentMessageCategory, setCurrentMessageCategory] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  const [messageText, setMessageText] = useState('');
  
  // Progressive reveal state
  const [revealInProgress, setRevealInProgress] = useState(false);
  const [revealedSegments, setRevealedSegments] = useState([]);
  const [textRevealed, setTextRevealed] = useState(false);
  
  // Old guided interaction state - keeping for compatibility but unused
  const [showGuidedInteraction, setShowGuidedInteraction] = useState(false);
  const [hasSeenGuidance, setHasSeenGuidance] = useState(false);
  
  // Celebration state
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationType, setCelebrationType] = useState('confetti');
  const [celebrationIndex, setCelebrationIndex] = useState(0);
  
  // Reference to the TypingAnimation component
  const typingRef = useRef(null);
  
  // Animations
  const messageOpacity = useRef(new Animated.Value(1)).current;
  const tapPromptOpacity = useRef(new Animated.Value(0)).current;
  const wheelOpacity = useRef(new Animated.Value(0)).current;
  const wheelScale = useRef(new Animated.Value(0.8)).current;
  const infoCardOpacity = useRef(new Animated.Value(0)).current;
  const infoCardY = useRef(new Animated.Value(50)).current;
  const continueButtonOpacity = useRef(new Animated.Value(0)).current;
  const continueButtonScale = useRef(new Animated.Value(0.9)).current;
  
  // Center button message animations
  const centerMessageOpacity = useRef(new Animated.Value(0)).current;
  const centerMessageY = useRef(new Animated.Value(20)).current;

  // Guided interaction animations
  const guidedHandOpacity = useRef(new Animated.Value(0)).current;
  const guidedHandScale = useRef(new Animated.Value(0.8)).current;
  const guidedTooltipOpacity = useRef(new Animated.Value(0)).current;

  // Icon animations
  const iconPulse = useRef(new Animated.Value(1)).current;
  
  // Get all domain colors for celebration effects
  const allDomainColors = domains.map(domain => domain.color);

  // Load saved language on mount
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const lang = await AsyncStorage.getItem('userLanguage');
        if (lang) {
          setAppLanguage(lang);
        }
        // Set language loaded flag to true when done
        setLanguageLoaded(true);
      } catch (error) {
        console.log('Error loading language:', error);
        // Set language loaded flag to true even on error
        setLanguageLoaded(true);
      }
    };
    
    loadLanguage();
  }, []);
  
  // Start continuous pulse animation for the sparkle icon
  useEffect(() => {
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
  }, []);
  
  // Show tap to continue prompt when message completes
  useEffect(() => {
    if (messageComplete && !wheelVisible) {
      setShowTapToContinue(true);
      
      // Animate in the tap prompt
      Animated.timing(tapPromptOpacity, {
        toValue: 1,
        duration: 300,
        delay: 200,
        useNativeDriver: true
      }).start();
    }
  }, [messageComplete]);
  
  // Show wheel after message is complete with enhanced animation
  useEffect(() => {
    if (wheelVisible) {
      // Create a more elegant entrance without spinning
      Animated.parallel([
        // Fade in
        Animated.timing(wheelOpacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.ease,
          useNativeDriver: true
        }),
        // Scale up with a nice bounce
        Animated.spring(wheelScale, {
          toValue: 1,
          friction: 7,
          tension: 40,
          useNativeDriver: true
        })
      ]).start(() => {
        // Wheel is now ready for interaction - segments will reveal on center button click
      });
    }
  }, [wheelVisible]);
  
  // Progressive reveal of domain segments
  const revealSegmentsSequentially = () => {
    if (revealInProgress || segmentsRevealed) return;
    
    setRevealInProgress(true);
    setRevealedSegments([]);
    
    // Show center button message and celebration immediately when reveal starts
    cycleToNextMessage();
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
        easing: Easing.out(Easing.ease),
        useNativeDriver: true
      })
    ]).start();
    
    // Show celebration
    setCelebrationType('confetti');
    setShowCelebration(true);
    
    // Celebration haptic feedback
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.log('Haptics not available:', error);
    }
    
    // Reveal segments one by one with staggered timing
    domains.forEach((domain, index) => {
      setTimeout(() => {
        setRevealedSegments(prev => [...prev, index]);
        
        // After last segment is revealed
        if (index === domains.length - 1) {
          setTimeout(() => {
            onSegmentsRevealed(true);
            setRevealInProgress(false);
            
            // Trigger text reveal after a short delay
            setTimeout(() => {
              setTextRevealed(true);
            }, 300); // Small delay before text appears
          }, 200); // Small delay after last segment
        }
      }, index * 150); // 150ms delay between each segment
    });
  };
  
  // Show info card when domain is selected with enhanced animations
  useEffect(() => {
    if (selectedDomain && !showDomainInfo) {
      setShowDomainInfo(true);
      
      // Make sure center button message is hidden when domain is selected
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
          setShowMessage(false);
        });
      }
      
      // Animate in the info card with enhanced motion
      Animated.parallel([
        // Card slides up with a spring motion
        Animated.spring(infoCardY, {
          toValue: 0,
          friction: 7,
          tension: 50,
          useNativeDriver: true
        }),
        // Card fades in
        Animated.timing(infoCardOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true
        }),
        // Delay the button animation slightly for a sequential feel
        Animated.sequence([
          Animated.delay(150),
          Animated.parallel([
            // Button fades in
            Animated.timing(continueButtonOpacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true
            }),
            // Button scales up with a bounce
            Animated.spring(continueButtonScale, {
              toValue: 1,
              friction: 6,
              tension: 50,
              useNativeDriver: true
            })
          ])
        ])
      ]).start();
    }
  }, [selectedDomain]);
  
  // Get first message text
  const getFirstMessage = () => {
    if (appLanguage === 'ja') {
      return "最初に集中する人生の分野を1つ選んでください。他の分野はいつでも探索できます。";
    }
    return "Pick one area of your life to focus on first. You can always explore other areas later.";
  };
  
  // Get second message text
  const getSecondMessage = () => {
    if (appLanguage === 'ja') {
      return "これはただのスタート地点です—飛び込みましょう。";
    }
    return "This is just your starting point - let's dive in.";
  };
  
  // Get current message based on step
  const getCurrentMessage = () => {
    return messageStep === 1 ? getFirstMessage() : getSecondMessage();
  };
  
  // Handle domain selection
  const handleDomainSelect = (domain) => {
    // Don't allow domain selection until segments are revealed
    if (!segmentsRevealed) return;
    // Add a tactile feedback animation on the wheel when selecting
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
    
    // If user clicks the same domain again, toggle selection (deselect it)
    if (selectedDomain && selectedDomain.name === domain.name) {
      // Deselection haptic feedback - a "closing" pattern
      try {
        // Use notification warning as a closing feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch (error) {
        console.log('Haptics not available:', error);
      }
      
      // Hide the info card with animation
      Animated.parallel([
        Animated.timing(infoCardOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(infoCardY, {
          toValue: 50,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true
        }),
        Animated.timing(continueButtonOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        })
      ]).start(() => {
        // Reset selected domain and hide info
        setSelectedDomain(null);
        setShowDomainInfo(false);
        
        // Reset domain preview
        if (onResetPreview) {
          onResetPreview();
        }
      });
    } else {
      // Determine if this is the first selection or changing selection
      const isFirstSelection = !selectedDomain;
      
      // Select the new domain
      setSelectedDomain(domain);
      
      // Update preview domain for real-time color changes
      if (onDomainPreview) {
        onDomainPreview(domain);
      }
      
      // Message and celebration already triggered on first center tap, so no need here
      
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
  };
  
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
  
  // Handle center button press
  const handleCenterButtonPress = () => {
    // Don't allow interaction during animations
    if (revealInProgress) return;

    // If segments haven't been revealed yet, start the progressive reveal
    if (!segmentsRevealed) {
      // Increment click count for the initial reveal
      setCenterButtonClicks(1);
      
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
      
      revealSegmentsSequentially();
      return;
    }
    
    // Always reset any domain selection
    if (selectedDomain) {
      // Apply deselection haptic feedback
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch (error) {
        console.log('Haptics not available:', error);
      }
      
      // Hide the info card with animation
      Animated.parallel([
        Animated.timing(infoCardOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(infoCardY, {
          toValue: 50,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true
        }),
        Animated.timing(continueButtonOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        })
      ]).start(() => {
        setSelectedDomain(null);
        setShowDomainInfo(false);
      });
    }
    
    // Reset domain preview when center button is pressed
    if (onResetPreview) {
      onResetPreview();
    }
    
    // Only show celebration if segments are already revealed (subsequent center button clicks)
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
      }
    
    // Update message
    updateCenterButtonMessage();
  };
  
  // Update center button message
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
        // Cycle to next message
        cycleToNextMessage();
        
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
      // First message
      cycleToNextMessage();
      
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
  
  // Cycle to next message
  const cycleToNextMessage = () => {
    // Get message categories and current category based on language
    const categories = Object.values(MESSAGES[appLanguage] || MESSAGES.en);
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
  
  // Handle continue button press with animation
  const handleContinue = () => {
    // Apply haptic feedback
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.log('Haptics not available:', error);
    }
    
    // Add a tactile feedback animation on button press
    Animated.sequence([
      // Quick scale down
      Animated.timing(continueButtonScale, {
        toValue: 0.95,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true
      }),
      // Quick scale up
      Animated.timing(continueButtonScale, {
        toValue: 1,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true
      })
    ]).start(() => {
      if (selectedDomain) {
        onDomainSelected(selectedDomain);
      }
    });
  };
  
  // Get domain explanation text based on the selected domain
  const getDomainExplanation = (domain) => {
    if (!domain) return "";
    
    // Return a simple explanation based on the domain name
    const translatedDomainName = getTranslatedDomainName(domain.name);
    
    // English explanations
    if (appLanguage === 'en') {
      switch (domain.name) {
        case "Career & Work":
          return "Focusing on your professional development, workplace satisfaction, and career progression.";
        case "Health & Wellness":
          return "Prioritizing physical fitness, nutrition, sleep quality, and overall mental well-being.";
        case "Relationships":
          return "Strengthening connections with family, friends, romantic partners, and building meaningful social bonds.";
        case "Personal Growth":
          return "Developing new skills, expanding knowledge, and fostering character development.";
        case "Financial Security":
          return "Managing money effectively, building savings, making smart investments, and working toward financial freedom.";
        case "Recreation & Leisure":
          return "Making time for hobbies, fun activities, relaxation, and travel that bring joy and balance.";
        case "Purpose & Meaning":
          return "Exploring spirituality, contributing to causes you care about, and aligning actions with your values.";
        case "Environment & Organization":
          return "Creating order in your physical spaces, developing systems, and optimizing your surroundings.";
        default:
          return domain.description || "Focus on key areas that will help you achieve meaningful progress.";
      }
    }
    // Japanese explanations
    else if (appLanguage === 'ja') {
      switch (domain.name) {
        case "Career & Work":
          return "専門的な成長、職場での満足度、キャリアの進展に焦点を当てます。";
        case "Health & Wellness":
          return "身体的な健康、栄養、睡眠の質、そして全体的な精神的健康を優先します。";
        case "Relationships":
          return "家族、友人、パートナーとの繋がりを強化し、意味のある社会的な絆を築きます。";
        case "Personal Growth":
          return "新しいスキルを身につけ、知識を広げ、人格の発達を促進します。";
        case "Financial Security":
          return "お金を効果的に管理し、貯蓄を増やし、賢明な投資を行い、経済的自由に向けて取り組みます。";
        case "Recreation & Leisure":
          return "趣味、楽しい活動、リラクゼーション、旅行などの喜びとバランスをもたらす時間を作ります。";
        case "Purpose & Meaning":
          return "精神性を探求し、あなたが気にかける原因に貢献し、行動をあなたの価値観に合わせます。";
        case "Environment & Organization":
          return "物理的な空間に秩序を作り、システムを開発し、周囲を最適化します。";
        default:
          return domain.description || "意味のある進歩を達成するのに役立つ重要な分野に焦点を当てます。";
      }
    }
    // Default to English if language not supported
    else {
      return domain.description || "Focus on key areas that will help you achieve meaningful progress.";
    }
  };
  
  // Translate domain name based on current language
  const getTranslatedDomainName = (domainName) => {
    if (!domainName) return "";
    
    return DOMAIN_NAMES[appLanguage]?.[domainName] || domainName;
  };
  
  // Get the title text for the page
  const getPageTitle = () => {
    return appLanguage === 'ja' ? "ドメインを選択" : "Choose a Domain";
  };
  
  // Get "Tap to continue" text
  const getTapToContinueText = () => {
    return appLanguage === 'ja' ? "タップして続ける" : "Tap to continue";
  };
  
  // Get continue button text
  const getContinueButtonText = () => {
    if (!selectedDomain) return appLanguage === 'ja' ? "続ける" : "Continue";
    
    const domainName = getTranslatedDomainName(selectedDomain.name);
    return appLanguage === 'ja' ? `${domainName}で続ける` : `Continue with ${domainName}`;
  };
  
  // Handle screen tap to skip typing animation or continue to next step
  const handleScreenTap = () => {
    try {
      // Provide haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Haptics not available:', error);
    }
    
    // If typing is still in progress, complete it immediately
    if (!messageComplete && typingRef.current) {
      typingRef.current.complete();
      return;
    }
    
    // If first message is complete, skip to wheel directly
    if (messageComplete && messageStep === 1) {
      // Hide tap prompt
      Animated.timing(tapPromptOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true
      }).start();
      
      // Skip second message - go straight to wheel
      Animated.timing(messageOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start(() => {
        setWheelVisible(true);
      });
    }
    // Removed second message handling - we skip directly to wheel
  };
  
  // Render loading indicator while language is loading
  if (!languageLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <NavigationHeader 
        title={selectedDomain ? getTranslatedDomainName(selectedDomain.name) : getPageTitle()} 
        iconName={selectedDomain ? selectedDomain.icon : null}
        iconColor={selectedDomain ? selectedDomain.color : null}
        onBack={onBack} 
      />
      
      {/* Full-screen touchable overlay - only visible before wheel appears */}
      {!wheelVisible && (
        <TouchableOpacity
          style={styles.fullScreenTouchable}
          activeOpacity={1}
          onPress={handleScreenTap}
          // This is the key change - allow touches to pass through to components beneath
          pointerEvents="box-none"
        />
      )}
      
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent,
          showDomainInfo && { paddingBottom: 200 } // Increased bottom padding when showing domain info
        ]}
        showsVerticalScrollIndicator={false}
        pointerEvents={!wheelVisible ? "none" : "auto"} // Make ScrollView non-interactive until wheel is visible
      >
        {/* AI Message with enhanced animations - now shows current message based on step */}
        {!wheelVisible && (
          <Animated.View style={[
            styles.messageContainer, 
            { 
              opacity: messageOpacity,
              transform: [
                { translateY: messageOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 0]
                })}
              ] 
            }
          ]}>
            <View style={styles.iconContainer}>
              <Animated.View 
                style={[
                  styles.iconCircle,
                  { transform: [{ scale: iconPulse }] }
                ]}
              >
                <Ionicons name="sparkles" size={18} color="#FFD700" />
              </Animated.View>
            </View>
            <View style={styles.messageTextContainer}>
              <TypingAnimation
                ref={typingRef}
                key={`message-${messageStep}`} // Re-mount component when message step changes
                text={getCurrentMessage()}
                typingSpeed={30}
                onComplete={() => setMessageComplete(true)}
              />
            </View>
          </Animated.View>
        )}
        
        {/* Domain Wheel with enhanced animations */}
        {wheelVisible && (
          <Animated.View 
            style={[
              styles.wheelContainer, 
              { 
                opacity: wheelOpacity,
                transform: [
                  { scale: wheelScale }
                ] 
              }
            ]}
          >
            <DomainWheel 
              domains={domains.map(domain => ({
                ...domain,
                // Translate domain name when displaying in the wheel
                displayName: getTranslatedDomainName(domain.name)
              }))}
              onDomainSelected={handleDomainSelect}
              selectedDomain={selectedDomain}
              onCenterButtonPress={handleCenterButtonPress}
              language={appLanguage}
              segmentsRevealed={segmentsRevealed}
              revealedSegments={revealedSegments}
              textRevealed={textRevealed}
            />
            
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
              colors={allDomainColors}
              onComplete={() => setShowCelebration(false)}
            />
            
          </Animated.View>
        )}
      </ScrollView>
      
      {/* Sticky Domain Info and Continue Button - similar to goal screen */}
      {showDomainInfo && selectedDomain && (
        <Animated.View 
          style={[
            styles.stickyBottomContainer,
            {
              opacity: infoCardOpacity,
              transform: [{ translateY: infoCardY.interpolate({
                inputRange: [0, 50],
                outputRange: [0, 100]
              }) }]
            }
          ]}
        >
          {/* Domain Info */}
          <View 
            style={[
              styles.domainInfoContainer,
              { borderColor: selectedDomain.color }
            ]}
          >
            <View style={styles.domainInfoHeader}>
              <Animated.View 
                style={[
                  styles.domainIconContainer,
                  { 
                    backgroundColor: selectedDomain.color,
                    transform: [{ scale: infoCardOpacity.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.7, 1]
                    })}]
                  }
                ]}
              >
                <Ionicons name={selectedDomain.icon} size={24} color="#FFFFFF" />
              </Animated.View>
              
              <View style={styles.domainHeaderTextContainer}>
                <ResponsiveText style={styles.domainInfoTitle}>
                  {getTranslatedDomainName(selectedDomain.name)}
                </ResponsiveText>
              </View>
            </View>
            
            <ResponsiveText style={styles.domainInfoText}>
              {getDomainExplanation(selectedDomain)}
            </ResponsiveText>
          </View>
          
          {/* Continue Button */}
          <Animated.View style={{ 
            opacity: continueButtonOpacity,
            transform: [{ scale: continueButtonScale }]
          }}>
            <TouchableOpacity
              style={[
                styles.continueButton,
                { backgroundColor: selectedDomain.color }
              ]}
              onPress={handleContinue}
              activeOpacity={0.8}
            >
              <ResponsiveText style={styles.continueButtonText}>
                {getContinueButtonText()}
              </ResponsiveText>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      )}
      
      {/* Central Tap to Continue Prompt */}
      {messageComplete && !wheelVisible && (
        <Animated.View 
          style={[
            styles.centralTapPrompt,
            { opacity: tapPromptOpacity }
          ]}
          pointerEvents="none"
        >
          <ResponsiveText style={styles.tapPromptText}>
            {getTapToContinueText()}
          </ResponsiveText>
          <Ionicons 
            name="chevron-down" 
            size={24} 
            color="rgba(255,255,255,0.7)" 
            style={styles.tapPromptIcon} 
          />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c1425',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0c1425',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 0, // No top padding to maximize space
  },
  fullScreenTouchable: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10, // Ensure it's below the NavigationHeader which has zIndex 20
    backgroundColor: 'transparent',
    paddingTop: Platform.OS === 'ios' ? 90 : 70, // Add top padding to avoid overlap with header
  },
  messageContainer: {
    backgroundColor: 'rgba(30, 58, 138, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
    flexDirection: 'row',
    borderLeftWidth: 2,
    borderLeftColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 5, // Lower than the touchable but higher than other elements
  },
  iconContainer: {
    marginRight: 12,
    paddingTop: 2,
  },
  iconCircle: {
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
  messageTextContainer: {
    flex: 1,
  },
  centralTapPrompt: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '20%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9, // Lower than the touchable but visible
  },
  tapPromptText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
  },
  tapPromptIcon: {
    marginTop: -4,
  },
  wheelContainer: {
    alignItems: 'center',
    marginTop: 60, // Increased from 20 to 60 to lower the wheel position further
    marginBottom: 20,
    position: 'relative',
  },
  stickyBottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 24, // More padding at bottom for iOS safe area
    backgroundColor: 'rgba(12, 20, 37, 0.98)', // Slightly transparent background that matches the app background
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
  },
  domainInfoContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  domainInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  domainIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  domainHeaderTextContainer: {
    flex: 1,
  },
  domainInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  domainInfoText: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
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
  },
  centerButtonMessageText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    textAlign: 'center',
  },
  // Guided Interaction Styles
  guidedTooltip: {
    position: 'absolute',
    top: -120, // Move higher to avoid being cut off
    left: '50%',
    transform: [{ translateX: -75 }], // Half of tooltip width
    backgroundColor: 'rgba(59, 130, 246, 0.95)', // Use blue theme color
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    zIndex: 15,
    minWidth: 150,
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  guidedTooltipText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  guidedTooltipArrow: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    transform: [{ translateX: -8 }],
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(59, 130, 246, 0.95)',
  },
  guidedHand: {
    position: 'absolute',
    top: 60, // Position closer to center button
    left: '50%',
    transform: [{ translateX: -16 }], // Center the emoji properly
    zIndex: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guidedHandEmoji: {
    fontSize: 32,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});

export default DomainSelectionPage;