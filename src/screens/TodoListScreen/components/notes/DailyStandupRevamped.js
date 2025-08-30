// src/screens/TodoListScreen/components/notes/DailyStandupRevamped.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  ActivityIndicator,
  Vibration,
  Modal,
  Linking,
  SafeAreaView,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  spacing,
  fontSizes,
  isSmallDevice
} from '../../../../utils/responsive';

// Import components and services
import { DEFAULT_PROMPTS, getAllThemes } from './PromptLibrary';
import { StandupStreakService } from './StandupStreakService';
import StandupHistoryRevamped from './StandupHistoryRevamped';
import PromptSelectorRevamped from './PromptSelectorRevamped';
import FreeTierLimitModal from '../../../TimeScreen/FreeTierLimitModal';
import { useAppContext } from '../../../../context/AppContext';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Revamped Daily Standup with modern UI/UX
 * Features: Cards UI, Progress indicators, Smooth animations, Better visual hierarchy, Swipeable tabs
 */
const DailyStandupRevamped = ({ theme, showSuccess, isFullscreen }) => {
  // Get subscription status and navigation
  const { userSubscriptionStatus } = useAppContext();
  const navigation = useNavigation();
  const isPro = userSubscriptionStatus === 'pro' || userSubscriptionStatus === 'unlimited';
  // Core state - use local date instead of UTC
  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const today = getLocalDateString();
  const [standupData, setStandupData] = useState({
    morningPriority: '',
    morningGratitude: '',
    eveningHighlight: '',
    completedAt: { morning: false, evening: false }
  });

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(null); // 'morning' or 'evening' or null (both collapsed)
  const [focusedInput, setFocusedInput] = useState(null);
  const [currentPrompts, setCurrentPrompts] = useState(DEFAULT_PROMPTS);
  const [focusMode, setFocusMode] = useState(null); // Track current focus theme
  const [promptSelections, setPromptSelections] = useState({}); // Track which variation is selected for each prompt
  const [streakData, setStreakData] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showPromptSelector, setShowPromptSelector] = useState(false);
  const [showResearchModal, setShowResearchModal] = useState(false);
  const [currentResearch, setCurrentResearch] = useState(null);
  const [researchMessageIndex, setResearchMessageIndex] = useState(null); // null = use default daily message
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Limit modal state
  const [showLimitModal, setShowLimitModal] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const streakGlowAnim = useRef(new Animated.Value(1)).current;
  const cardExpandAnim = useRef(new Animated.Value(1)).current;
  const modalFadeAnim = useRef(new Animated.Value(0)).current;
  const modalScaleAnim = useRef(new Animated.Value(0.9)).current;

  // Character limits
  const CHAR_LIMITS = {
    morningPriority: 150,
    morningGratitude: 100,
    eveningHighlight: 150
  };

  // Handle text input with limit enforcement
  const handleTextChange = (field, newText) => {
    const limit = CHAR_LIMITS[field];
    
    // For Pro users, allow unlimited characters
    if (isPro) {
      updateResponse(field, newText);
      return;
    }
    
    // For free users, check limit
    if (newText.length > limit) {
      // Show popup when they try to exceed
      setShowLimitModal(true);
      return; // Don't update the text
    }
    
    // Update normally if within limit
    updateResponse(field, newText);
  };

  // Load data on mount
  useEffect(() => {
    initializeData();
    startEntryAnimations();
  }, []);

  // Custom keyboard handling - more stable than KeyboardAvoidingView
  useEffect(() => {
    const keyboardWillShow = (event) => {
      const { height } = event.endCoordinates;
      setKeyboardHeight(height);
    };

    const keyboardWillHide = () => {
      setKeyboardHeight(0);
    };

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, keyboardWillShow);
    const hideSubscription = Keyboard.addListener(hideEvent, keyboardWillHide);

    return () => {
      showSubscription?.remove();
      hideSubscription?.remove();
    };
  }, []);

  // Animate streak glow - DISABLED
  // useEffect(() => {
  //   if (streakData?.currentStreak > 0) {
  //     Animated.loop(
  //       Animated.sequence([
  //         Animated.timing(streakGlowAnim, {
  //           toValue: 1.2,
  //           duration: 2000,
  //           useNativeDriver: true
  //         }),
  //         Animated.timing(streakGlowAnim, {
  //           toValue: 1,
  //           duration: 2000,
  //           useNativeDriver: true
  //         })
  //       ])
  //     ).start();
  //   }
  // }, [streakData]);

  // Load persistent focus mode
  const loadFocusMode = async () => {
    try {
      const stored = await AsyncStorage.getItem('dailyStandupFocusMode');
      if (stored) {
        const focusData = JSON.parse(stored);
        setFocusMode(focusData);
        setCurrentPrompts(focusData.prompts || DEFAULT_PROMPTS);
      }
    } catch (error) {
      console.error('Error loading focus mode:', error);
    }
  };

  // Save persistent focus mode
  const saveFocusMode = async (themeData, isRandomMode = false) => {
    try {
      const focusData = {
        key: themeData.key,
        name: themeData.name,
        prompts: themeData,
        isRandomMode: isRandomMode,
        lastUpdated: new Date().toISOString()
      };
      await AsyncStorage.setItem('dailyStandupFocusMode', JSON.stringify(focusData));
      setFocusMode(focusData);
    } catch (error) {
      console.error('Error saving focus mode:', error);
    }
  };

  // Get today's random theme (consistent per day)
  const getTodaysRandomTheme = () => {
    const today = getLocalDateString();
    const themes = getAllThemes();
    
    // Use date as seed for consistent daily theme
    const dateNumber = parseInt(today.replace(/-/g, ''));
    const themeIndex = dateNumber % themes.length;
    
    return themes[themeIndex];
  };

  // Generate theme-specific prompt variations
  const getPromptVariations = (basePrompt, themeKey) => {
    const field = basePrompt.field;
    
    // Theme-specific variations
    const themeVariations = {
      productivity: {
        morningPriority: [
          { question: "What's your highest-impact task today?", placeholder: "Focus on the work that moves you forward..." },
          { question: "Which project deserves your peak energy today?", placeholder: "Align your best hours with your biggest priorities..." },
          { question: "What outcome would make today a productivity win?", placeholder: "Think results, not just busy work..." },
          { question: "What's the one thing that can't wait until tomorrow?", placeholder: "Identify your true urgent task..." },
          { question: "How will you create momentum today?", placeholder: "Choose actions that build forward progress..." }
        ],
        morningGratitude: [
          { question: "What system or tool is boosting your productivity?", placeholder: "Appreciate what's working in your workflow..." },
          { question: "Which recent accomplishment are you proud of?", placeholder: "Acknowledge your productive achievements..." },
          { question: "What energy are you bringing to your work today?", placeholder: "Check in with your focus and motivation..." },
          { question: "What skill is helping you work more effectively?", placeholder: "Recognize your growing capabilities..." },
          { question: "How has your productivity improved lately?", placeholder: "Notice positive changes in your work habits..." }
        ],
        eveningHighlight: [
          { question: "What did you accomplish that moved the needle?", placeholder: "Celebrate meaningful progress made..." },
          { question: "How did you optimize your workflow today?", placeholder: "Notice improvements to your systems..." },
          { question: "What productivity lesson did you learn?", placeholder: "Capture insights about working effectively..." },
          { question: "Which deep work session paid off today?", placeholder: "Acknowledge focused effort that delivered results..." },
          { question: "How did you overcome a productivity challenge?", placeholder: "Reflect on problem-solving wins..." }
        ]
      },
      growth: {
        morningPriority: [
          { question: "How will you challenge yourself to grow today?", placeholder: "Identify one growth opportunity..." },
          { question: "What skill will you develop further today?", placeholder: "Focus on building capabilities..." },
          { question: "Which learning goal will you advance?", placeholder: "Make progress on personal development..." },
          { question: "How will you step outside your comfort zone?", placeholder: "Embrace growth through discomfort..." },
          { question: "What feedback will you seek or apply today?", placeholder: "Use input to accelerate your growth..." }
        ],
        morningGratitude: [
          { question: "What recent learning are you grateful for?", placeholder: "Appreciate new knowledge or skills gained..." },
          { question: "Who has contributed to your growth lately?", placeholder: "Recognize mentors, teachers, or supporters..." },
          { question: "What strength have you discovered in yourself?", placeholder: "Acknowledge your developing capabilities..." },
          { question: "Which challenge taught you something valuable?", placeholder: "Find gratitude in difficult experiences..." },
          { question: "How has your mindset evolved recently?", placeholder: "Notice positive changes in your thinking..." }
        ],
        eveningHighlight: [
          { question: "What did you learn about yourself today?", placeholder: "Capture insights and self-discoveries..." },
          { question: "How did you grow from today's challenges?", placeholder: "Find the learning in difficult moments..." },
          { question: "What skill improved through today's practice?", placeholder: "Notice incremental development..." },
          { question: "Which mistake taught you something valuable?", placeholder: "Transform setbacks into growth..." },
          { question: "How did you expand your perspective today?", placeholder: "Recognize new ways of thinking..." }
        ]
      },
      relationships: {
        morningPriority: [
          { question: "Who will you connect with meaningfully today?", placeholder: "Choose quality over quantity in relationships..." },
          { question: "Which relationship deserves your attention today?", placeholder: "Prioritize nurturing important connections..." },
          { question: "How will you show up for someone you care about?", placeholder: "Be intentional about supporting others..." },
          { question: "What conversation have you been putting off?", placeholder: "Address important but difficult discussions..." },
          { question: "How will you strengthen a relationship today?", placeholder: "Focus on deepening existing bonds..." }
        ],
        morningGratitude: [
          { question: "Which relationship are you most grateful for?", placeholder: "Appreciate someone who supports you..." },
          { question: "What act of kindness recently touched you?", placeholder: "Remember moments of human connection..." },
          { question: "Who has made a positive impact on your life?", placeholder: "Acknowledge people who matter to you..." },
          { question: "What support have you received lately?", placeholder: "Notice how others have helped you..." },
          { question: "Which friendship brings you joy?", placeholder: "Celebrate meaningful connections..." }
        ],
        eveningHighlight: [
          { question: "How did you strengthen a relationship today?", placeholder: "Reflect on meaningful connection moments..." },
          { question: "What conversation made a difference today?", placeholder: "Notice impactful exchanges with others..." },
          { question: "How did you show kindness to someone?", placeholder: "Acknowledge your positive impact on others..." },
          { question: "What did you learn about someone today?", placeholder: "Appreciate deeper understanding of others..." },
          { question: "How did a relationship surprise you today?", placeholder: "Notice unexpected moments of connection..." }
        ]
      },
      wellness: {
        morningPriority: [
          { question: "How will you care for your wellbeing today?", placeholder: "Plan one meaningful self-care action..." },
          { question: "What does your body need most today?", placeholder: "Listen to physical signals and needs..." },
          { question: "How will you manage your energy today?", placeholder: "Balance output with restoration..." },
          { question: "What healthy habit will you prioritize?", placeholder: "Choose one wellness practice to focus on..." },
          { question: "How will you reduce stress today?", placeholder: "Identify ways to support your mental health..." }
        ],
        morningGratitude: [
          { question: "What's your body telling you right now?", placeholder: "Check in with energy, mood, physical state..." },
          { question: "What aspect of your health are you grateful for?", placeholder: "Appreciate your body's capabilities..." },
          { question: "Which healthy choice served you well recently?", placeholder: "Acknowledge positive wellness decisions..." },
          { question: "What gives you energy and vitality?", placeholder: "Notice what makes you feel alive..." },
          { question: "How has your wellness improved lately?", placeholder: "Recognize positive health changes..." }
        ],
        eveningHighlight: [
          { question: "How did you honor your wellbeing today?", placeholder: "Celebrate healthy choices made..." },
          { question: "What made you feel energized today?", placeholder: "Notice what boosted your vitality..." },
          { question: "How did you manage stress effectively?", placeholder: "Acknowledge successful coping strategies..." },
          { question: "What wellness lesson did you learn today?", placeholder: "Capture insights about caring for yourself..." },
          { question: "How did you listen to your body's needs?", placeholder: "Reflect on self-awareness moments..." }
        ]
      }
    };

    // Get theme-specific variations or fall back to generic ones
    const themePrompts = themeVariations[themeKey];
    if (themePrompts && themePrompts[field]) {
      return themePrompts[field];
    }

    // Fallback to generic variations for themes not yet implemented
    const genericVariations = {
      morningPriority: [
        { question: "What's your most important priority today?", placeholder: "Focus on what matters most..." },
        { question: "What outcome would make today successful?", placeholder: "Think about meaningful results..." },
        { question: "What deserves your best energy today?", placeholder: "Align effort with importance..." },
        { question: "What's the one thing you must accomplish?", placeholder: "Identify your critical task..." },
        { question: "How will you make meaningful progress today?", placeholder: "Choose actions that move you forward..." }
      ],
      morningGratitude: [
        { question: "What progress are you grateful for?", placeholder: "Acknowledge recent wins, however small..." },
        { question: "What's working well in your life lately?", placeholder: "Celebrate positive momentum..." },
        { question: "What strength will you draw on today?", placeholder: "Identify your inner resources..." },
        { question: "What recent win deserves recognition?", placeholder: "Appreciate your achievements..." },
        { question: "How are you feeling about your journey?", placeholder: "Check in with your overall progress..." }
      ],
      eveningHighlight: [
        { question: "What moved forward today?", placeholder: "Celebrate progress, learn from setbacks..." },
        { question: "What did you accomplish that you're proud of?", placeholder: "Acknowledge your achievements..." },
        { question: "What went better than expected today?", placeholder: "Notice positive surprises..." },
        { question: "What lesson did today teach you?", placeholder: "Reflect on insights gained..." },
        { question: "How did you grow from today's experiences?", placeholder: "Find learning in your day..." }
      ]
    };

    return genericVariations[field] || [basePrompt];
  };

  // Get current prompt variation for a specific prompt
  const getCurrentPromptVariation = (prompt, promptIndex, sectionKey) => {
    const selectionKey = `${sectionKey}_${promptIndex}`;
    const selectedIndex = promptSelections[selectionKey] || 0;
    const variations = getPromptVariations(prompt, focusMode?.key);
    return variations[selectedIndex] || prompt;
  };

  // Refresh to next prompt variation
  const refreshPrompt = (promptIndex, sectionKey) => {
    const selectionKey = `${sectionKey}_${promptIndex}`;
    const currentIndex = promptSelections[selectionKey] || 0;
    const basePrompt = currentPrompts[sectionKey]?.[promptIndex];
    if (!basePrompt) return;

    const variations = getPromptVariations(basePrompt, focusMode?.key);
    const nextIndex = (currentIndex + 1) % variations.length;
    
    setPromptSelections(prev => ({
      ...prev,
      [selectionKey]: nextIndex
    }));

    showSuccess?.('Prompt refreshed! 🔄');
  };

  // Refresh research message to next one
  const refreshResearchMessage = () => {
    const totalMessages = StandupStreakService.getResearchMessagesCount();
    const currentIndex = researchMessageIndex ?? 0; // If null, start from 0
    const nextIndex = (currentIndex + 1) % totalMessages;
    setResearchMessageIndex(nextIndex);
    showSuccess?.('Research refreshed! 📊');
  };

  // Research data for each benefit message
  const RESEARCH_DATA = {
    "Written goals are 42% more likely to be achieved 🎯": {
      title: "Goal Setting and Achievement Research",
      description: "Dr. Gail Matthews' study at Dominican University found that people who wrote down their goals were 42% more likely to achieve them compared to those who only thought about their goals.",
      publication: "Dominican University Research Summary",
      authors: "Dr. Gail Matthews",
      date: "2015",
      details: "The study involved 267 professionals from diverse backgrounds including entrepreneurs, employees, and nonprofit workers. Goal achievement scores ranged from 4.28 (control group) to 7.6 (written goals + action plans + accountability). Written goals group (6.08), written goals + action plans (6.44), and written goals + action plans + accountability (7.6) all significantly outperformed the control group (4.28).",
      link: "https://ugmconsulting.com/do-written-goals-really-make-a-difference/"
    },
    "Daily reflection improves performance by 23% 📈": {
      title: "Learning by Thinking: Harvard Business School Study",
      description: "Harvard researchers found that employees who spent 15 minutes reflecting on their work showed 18% better performance on problem-solving tasks and 22.8% better performance on final training tests compared to those who didn't reflect.",
      publication: "Harvard Business School Working Knowledge",
      authors: "Francesca Gino, Gary P. Pisano, Bradley R. Staats",
      date: "2014",
      details: "The field experiment was conducted with Wipro's tech support employees. The reflection group performed 18% better on problem-solving tasks and 22.8% better on final training tests. Those who shared reflections with others performed 25% better than controls, despite having less practice time. The study demonstrates statistically significant improvements (p < 0.001) in problem-solving performance.",
      link: "https://www.library.hbs.edu/working-knowledge/reflecting-on-work-improves-job-performance"
    },
    "Journaling reduces anxiety and stress significantly 🧘": {
      title: "Meta-Analysis of Journaling for Mental Health",
      description: "A comprehensive meta-analysis found that journaling interventions produced statistically significant reductions in anxiety, depression, and stress across multiple randomized controlled trials.",
      publication: "PMC Systematic Review and Meta-Analysis",
      authors: "Chowdhury et al.",
      date: "2022",
      details: "Meta-analysis of multiple RCTs showed 5% greater reduction in patient health symptom scores compared to control groups (p<0.05). Control groups showed minimal change (-0.01, 95% CI -0.03 to 0.00) while intervention groups showed meaningful improvement (-0.06, 95% CI -0.09 to -0.03). Additional studies show 47.8% mean adherence to protocols with greater resilience and lower perceived stress.",
      link: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8935176/"
    },
    "Reflection builds resilience and coping skills 💪": {
      title: "Systematic Self-Reflection for Resilience Building",
      description: "Research identifies five critical self-reflective practices that systematically build psychological resilience and improve coping mechanisms through structured reflection interventions.",
      publication: "Anxiety, Stress & Coping Journal",
      authors: "Crane et al.",
      date: "2019",
      details: "The study identified five key practices: self-awareness of emotional responses, trigger identification, cognitive reappraisal, coping repertoire expansion, and resilient belief development. Multiple studies show significant increases on the Connor-Davidson Resilience Scale with structured reflection. One 6-week study with 39 trauma survivors showed significant improvements in resilience scores, decreased depressive symptoms, reduced perceived stress, and decreased rumination.",
      link: "https://pubmed.ncbi.nlm.nih.gov/30067067/"
    },
    "Gratitude practice increases happiness by 25% ✨": {
      title: "Gratitude Interventions and Well-being",
      description: "Multiple randomized controlled trials found that gratitude journaling significantly increased positive affect, subjective happiness, and life satisfaction across diverse populations.",
      publication: "Journal of Happiness Studies & Frontiers in Psychology",
      authors: "Bohlmeijer et al. & Multiple Research Teams",
      date: "2019-2020",
      details: "The 6-week gratitude intervention with 217 Dutch adults showed superiority over self-kindness practices (d = .63 at post-intervention, d = .40 at 6-week follow-up) and waitlist controls (d = .93 at post-intervention, d = .66 at 6-week follow-up). A larger study with 1,337 participants confirmed significant increases in positive affect, subjective happiness, and life satisfaction after just 14 days of gratitude practice.",
      link: "https://link.springer.com/article/10.1007/s10902-020-00261-5"
    },
    "Self-reflection enhances emotional intelligence 🧠": {
      title: "Large-Scale Study on Reflection and Emotional Intelligence",
      description: "A cross-sectional study of 1,096 nursing students found a strong positive correlation (r = 0.612, p < 0.001) between reflective thinking and emotional intelligence across all domains.",
      publication: "PMC Research Study",
      authors: "Multiple International Authors",
      date: "2024",
      details: "57.0% of students demonstrated high levels of emotional intelligence and 59.3% exhibited high levels of reflective thinking. All emotional intelligence domains—emotionality, self-control, sociability, and well-being—showed strong associations with reflective thinking capabilities. A 16-week semester study found significant improvements in adaptability (p=.018) and relationships (p=.021) after structured reflection journaling. 57% of students showed habitual reflection after four sessions compared to 34% initially.",
      link: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12082956/"
    },
    "Writing about goals activates goal achievement centers 🔥": {
      title: "Cognitive Reflection and Decision-Making Research",
      description: "Research demonstrates that reflective thinking correlates strongly with cognitive performance and decision-making abilities, with written reflection showing superior effects to mental processing alone.",
      publication: "American Economic Review & Cognitive Science Research",
      authors: "Frederick, Stanovich, Toplak, and West",
      date: "2005-2011",
      details: "Cognitive reflection scores showed correlation coefficients of .44 with SAT scores and .43 with Wonderlic IQ tests. Individuals with higher reflection scores demonstrated superior performance on decision-making tasks and reduced susceptibility to cognitive biases. Studies demonstrate that written processing creates stronger neural pathways and cognitive frameworks than mental visualization alone.",
      link: "https://www.aeaweb.org/articles?id=10.1257/089533005775196732"
    },
    "15 minutes of reflection = 18% better problem solving 🚀": {
      title: "Reflection and Problem-Solving Performance",
      description: "Harvard Business School research found that just 15 minutes of daily reflection led to 18% better performance on problem-solving tasks and 22.8% better performance on final training tests in a controlled workplace study.",
      publication: "Harvard Business School Field Study",
      authors: "Gino, Pisano, Di Stefano, Staats",
      date: "2014",
      details: "The field experiment with Wipro's technical support employees showed that reflection groups performed 18% better than controls on problem-solving tasks, and 22.8% better on final training tests. Those who shared reflections with others performed 25% better than controls. Recent studies confirm statistically significant improvements (p < 0.001) in problem-solving performance with structured reflection practices across multiple domains.",
      link: "https://www.library.hbs.edu/working-knowledge/reflecting-on-work-improves-job-performance"
    }
  };

  // Handle showing research modal
  const handleShowResearch = () => {
    const currentMessage = StandupStreakService.getMotivationalMessage(streakData, researchMessageIndex);
    const messageText = currentMessage.split('\n')[0]; // Get just the benefit text
    const researchInfo = RESEARCH_DATA[messageText];
    
    if (researchInfo) {
      setCurrentResearch(researchInfo);
      setShowResearchModal(true);
      
      // Animate modal entrance
      modalFadeAnim.setValue(0);
      modalScaleAnim.setValue(0.9);
      
      Animated.parallel([
        Animated.timing(modalFadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.spring(modalScaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true
        })
      ]).start();
    }
  };

  // Handle closing research modal
  const handleCloseResearch = () => {
    Animated.parallel([
      Animated.timing(modalFadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true
      }),
      Animated.timing(modalScaleAnim, {
        toValue: 0.9,
        duration: 250,
        useNativeDriver: true
      })
    ]).start(() => {
      setShowResearchModal(false);
      setCurrentResearch(null);
    });
  };

  // Handle opening research link
  const handleOpenResearchLink = (link) => {
    Linking.openURL(link).catch(() => {
      showSuccess?.('Unable to open research link', { type: 'error' });
    });
  };


  // Check and update random theme if needed
  const checkRandomThemeUpdate = async () => {
    try {
      if (focusMode?.isRandomMode) {
        const todaysTheme = getTodaysRandomTheme();
        
        // Check if we need to update to today's theme
        if (focusMode.key !== todaysTheme.key) {
          const updatedFocusData = {
            ...focusMode,
            key: todaysTheme.key,
            name: todaysTheme.name,
            prompts: todaysTheme,
            lastUpdated: new Date().toISOString()
          };
          
          await AsyncStorage.setItem('dailyStandupFocusMode', JSON.stringify(updatedFocusData));
          setFocusMode(updatedFocusData);
          setCurrentPrompts(todaysTheme);
          
          showSuccess?.(`Today's surprise theme: ${todaysTheme.name}! 🎲`);
        }
      }
    } catch (error) {
      console.error('Error updating random theme:', error);
    }
  };

  const initializeData = async () => {
    await Promise.all([
      loadTodaysStandup(),
      loadStreakData(),
      loadFocusMode()
    ]);
    
    // Check if random theme needs updating after focus mode is loaded
    setTimeout(() => checkRandomThemeUpdate(), 100);
  };

  const startEntryAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 8,
        useNativeDriver: true
      })
    ]).start();
  };

  const loadTodaysStandup = async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem(`dailyStandup_${today}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setStandupData({
          morningPriority: parsed.morningPriority || '',
          morningGratitude: parsed.morningGratitude || '',
          eveningHighlight: parsed.eveningHighlight || '',
          completedAt: parsed.completedAt || { morning: false, evening: false }
        });
        
        // Update progress animation
        updateProgressAnimation(parsed.completedAt);
      }
    } catch (error) {
      console.error('Error loading daily standup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStreakData = async () => {
    try {
      const streak = await StandupStreakService.getStreakData();
      setStreakData(streak);
    } catch (error) {
      console.error('Error loading streak data:', error);
    }
  };

  const updateProgressAnimation = (completedAt) => {
    let progress = 0;
    if (completedAt.morning) progress += 0.5;
    if (completedAt.evening) progress += 0.5;
    
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false
    }).start();
  };

  const saveStandupData = async (newData) => {
    try {
      const dataToSave = {
        ...newData,
        date: today,
        lastUpdated: new Date().toISOString()
      };
      await AsyncStorage.setItem(`dailyStandup_${today}`, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving daily standup:', error);
      showSuccess?.('Error saving reflection', { type: 'error' });
    }
  };

  const updateResponse = (field, value) => {
    const newData = {
      ...standupData,
      [field]: value
    };
    setStandupData(newData);
    saveStandupData(newData);
  };

  const markSectionComplete = async (section) => {
    // Haptic feedback
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Vibration.vibrate(10);
    }

    const newCompletedAt = {
      ...standupData.completedAt,
      [section]: true
    };
    const newData = {
      ...standupData,
      completedAt: newCompletedAt
    };
    
    setStandupData(newData);
    saveStandupData(newData);
    updateProgressAnimation(newCompletedAt);

    // Animate card collapse
    Animated.sequence([
      Animated.timing(cardExpandAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.spring(cardExpandAnim, {
        toValue: 1,
        tension: 40,
        friction: 8,
        useNativeDriver: true
      })
    ]).start();

    // Update streak if both sections completed
    if (newCompletedAt.morning && newCompletedAt.evening) {
      const updatedStreak = await StandupStreakService.recordCompletion('both', today);
      setStreakData(updatedStreak);
      
      if (StandupStreakService.isStreakMilestone(updatedStreak.currentStreak)) {
        showSuccess?.(`🎉 ${updatedStreak.currentStreak} day streak! Amazing consistency!`);
      }
    }

    showSuccess?.(
      section === 'morning' 
        ? 'Morning reflection completed! 🌅' 
        : 'Evening reflection completed! 🌙'
    );
  };

  const getCurrentTimeEmoji = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '🌙';
    if (hour < 12) return '☀️';
    if (hour < 17) return '🌤️';
    if (hour < 20) return '🌅';
    return '🌙';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const renderStreakCard = () => {
    if (!streakData) return null;

    const isNewStreak = streakData.currentStreak === 1;
    const hasStreak = streakData.currentStreak > 0;

    return (
      <Animated.View style={{
        opacity: fadeAnim
      }}>
        <LinearGradient
          colors={hasStreak ? [theme.primary + '20', theme.primary + '10'] : ['transparent', 'transparent']}
          style={[styles.streakCard, { borderColor: hasStreak ? theme.primary : theme.border }]}
        >
          <View style={styles.streakContent}>
            <View style={styles.streakMain}>
              <View style={styles.streakIcon}>
                <Text style={styles.streakEmoji}>
                  {hasStreak ? '🔥' : '🌱'}
                </Text>
              </View>
              <View style={styles.streakInfo}>
                <Text style={[styles.streakNumber, { color: theme.primary }]}>
                  {streakData.currentStreak}
                </Text>
                <Text style={[styles.streakLabel, { color: theme.textSecondary }]}>
                  {isNewStreak ? 'Day Started' : 'Day Streak'}
                </Text>
              </View>
            </View>
            
            <View style={styles.streakStats}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.text }]}>
                  {streakData.longestStreak}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Best
                </Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme.text }]}>
                  {streakData.totalCompletions}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Total
                </Text>
              </View>
            </View>
          </View>

          {/* Progress bar */}
          <View style={[styles.progressContainer, { backgroundColor: theme.border + '30' }]}>
            <Animated.View 
              style={[
                styles.progressBar,
                { 
                  backgroundColor: theme.primary,
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  })
                }
              ]} 
            />
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderPromptCard = (prompt, index, section) => {
    const fieldValue = standupData[prompt.field];
    const isCompleted = standupData.completedAt[section];
    const isFocused = focusedInput === prompt.field;
    
    // Get current prompt variation or fallback to original
    const currentPrompt = getCurrentPromptVariation(prompt, index, section);

    return (
      <Animated.View 
        key={index}
        style={[
          styles.promptCard,
          { 
            backgroundColor: theme.cardElevated,
            borderColor: isFocused ? theme.primary : theme.border,
            transform: [{ scale: cardExpandAnim }]
          }
        ]}
      >
        <View style={styles.promptHeader}>
          <Text style={[styles.promptQuestion, { color: theme.text }]}>
            {currentPrompt.question}
          </Text>
          <TouchableOpacity
            style={[styles.refreshButton, { backgroundColor: theme.primary + '20' }]}
            onPress={() => refreshPrompt(index, section)}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={scaleFontSize(16)} color={theme.text} />
          </TouchableOpacity>
          {fieldValue.length > 0 && (
            <View style={[styles.charIndicator, { 
              backgroundColor: fieldValue.length > CHAR_LIMITS[prompt.field] * 0.8 
                ? '#FF6B35' + '20'
                : theme.textSecondary + '15' 
            }]}>
              <Text style={[styles.charCount, { 
                color: fieldValue.length > CHAR_LIMITS[prompt.field] * 0.8 
                  ? '#FF6B35' 
                  : theme.textSecondary 
              }]}>
                {fieldValue.length}/{CHAR_LIMITS[prompt.field]}
              </Text>
            </View>
          )}
        </View>

        <TextInput
          style={[
            styles.promptInput,
            { 
              backgroundColor: isCompleted ? theme.background : theme.background,
              color: theme.text,
              borderColor: isFocused ? theme.primary : theme.border + '50',
              opacity: isCompleted ? 0.7 : 1
            }
          ]}
          value={fieldValue}
          onChangeText={(text) => handleTextChange(prompt.field, text)}
          placeholder={currentPrompt.placeholder}
          placeholderTextColor={theme.textSecondary + '80'}
          multiline={true}
          numberOfLines={3}
          textAlignVertical="top"
          onFocus={() => setFocusedInput(prompt.field)}
          onBlur={() => setFocusedInput(null)}
          editable={!isCompleted}
        />
      </Animated.View>
    );
  };

  const renderSection = (title, icon, prompts, sectionKey) => {
    const isCompleted = standupData.completedAt[sectionKey];
    const isActive = activeSection === sectionKey;
    const canComplete = prompts.every(p => standupData[p.field]?.trim());

    return (
      <Animated.View 
        style={[
          styles.section,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        <TouchableOpacity 
          onPress={() => setActiveSection(isActive ? null : sectionKey)}
          activeOpacity={0.7}
        >
          <View style={[styles.sectionHeader, { 
            backgroundColor: isCompleted ? theme.primary + '10' : theme.cardElevated,
            borderColor: isCompleted ? theme.primary : theme.border
          }]}>
            <View style={styles.sectionHeaderLeft}>
              <View style={[styles.sectionIconContainer, { 
                backgroundColor: isCompleted ? theme.primary : theme.primary + '20' 
              }]}>
                <Ionicons 
                  name={icon} 
                  size={scaleFontSize(20)} 
                  color={isCompleted ? '#FFFFFF' : (icon === 'sunny' ? '#FFA500' : '#4A90E2')} 
                />
              </View>
              <View>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  {title}
                </Text>
                <Text style={[styles.sectionTime, { color: theme.textSecondary }]}>
                  {sectionKey === 'morning' ? 'Start your day' : 'Reflect & close'}
                </Text>
              </View>
            </View>
            
            {isCompleted ? (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={scaleFontSize(28)} color={theme.primary} />
              </View>
            ) : (
              <Ionicons 
                name={isActive ? "chevron-up" : "chevron-down"} 
                size={scaleFontSize(20)} 
                color={theme.textSecondary} 
              />
            )}
          </View>
        </TouchableOpacity>

        {isActive && !isCompleted && (
          <View style={styles.sectionContent}>
            {prompts.map((prompt, index) => renderPromptCard(prompt, index, sectionKey))}
            
            <TouchableOpacity
              style={[
                styles.completeButton,
                { 
                  backgroundColor: canComplete ? theme.primary : theme.border,
                  opacity: canComplete ? 1 : 0.5
                }
              ]}
              onPress={() => canComplete && markSectionComplete(sectionKey)}
              disabled={!canComplete}
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark" size={scaleFontSize(20)} color="#FFFFFF" />
              <Text style={styles.completeButtonText}>
                Complete {title}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Preparing your reflection space...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, paddingBottom: keyboardHeight }}>
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.background }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: isFullscreen ? 0 : scaleHeight(5) }]}
      >
        {/* Header - Simplified */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.greeting, { color: theme.textSecondary }]}>
                {getGreeting()} {getCurrentTimeEmoji()}
              </Text>
              <Text style={[styles.headerTitle, { color: theme.text }]}>
                Daily Check-in
              </Text>
              <Text style={[styles.headerDate, { color: theme.textSecondary }]}>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Progress & Streak Section - Moved to top for motivation */}
        <View style={styles.topSection}>
          {/* Compact Streak Display */}
          {renderStreakCard()}
          
          {/* Focus Mode & Actions Bar */}
          <Animated.View style={[styles.actionBar, { opacity: fadeAnim }]}>
            <TouchableOpacity 
              style={[styles.focusModeButton, { 
                backgroundColor: focusMode ? theme.primary + '15' : theme.cardElevated,
                borderColor: focusMode ? theme.primary + '30' : theme.border
              }]}
              onPress={() => setShowPromptSelector(true)}
              activeOpacity={0.7}
            >
              <View style={styles.focusModeContent}>
                <Text style={[styles.focusModeLabel, { color: theme.textSecondary }]}>
                  Focus Theme
                </Text>
                <View style={styles.focusModeValue}>
                  <Text style={styles.focusModeEmoji}>
                    {focusMode ? (focusMode.isRandomMode ? '🎲' : '🎯') : '🎯'}
                  </Text>
                  <Text style={[styles.focusModeText, { color: theme.text }]}>
                    {focusMode ? focusMode.name : 'Default'}
                  </Text>
                  <Ionicons name="chevron-down" size={scaleFontSize(14)} color={theme.textSecondary} />
                </View>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.historyButton, { backgroundColor: theme.cardElevated, borderColor: theme.border }]}
              onPress={() => setShowHistory(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="calendar-outline" size={scaleFontSize(20)} color={theme.text} />
              <Text style={[styles.historyButtonText, { color: theme.text }]}>History</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Reflection Sections */}
        <View style={styles.reflectionSections}>
          {/* Morning Section */}
          {renderSection(
            'Morning',
            'sunny',
            currentPrompts.morning || DEFAULT_PROMPTS.morning,
            'morning'
          )}

          {/* Evening Section */}
          {renderSection(
            'Evening',
            'moon',
            currentPrompts.evening || DEFAULT_PROMPTS.evening,
            'evening'
          )}
        </View>

        {/* Research Insight Card - Moved to bottom as supplementary info */}
        {streakData && (
          <Animated.View style={[styles.bottomSection, { opacity: fadeAnim }]}>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Daily Insight</Text>
            <TouchableOpacity
              style={[styles.researchCard, { 
                backgroundColor: theme.cardElevated,
                borderColor: theme.border + '20'
              }]}
              onPress={handleShowResearch}
              activeOpacity={0.95}
            >
              <View style={styles.researchContent}>
                <Text style={[styles.researchStatement, { color: theme.text }]}>
                  {StandupStreakService.getMotivationalMessage(streakData, researchMessageIndex).split('\n')[0]}
                </Text>
                
                <Text style={[styles.researchSource, { color: theme.textSecondary }]}>
                  {StandupStreakService.getMotivationalMessage(streakData, researchMessageIndex).split('\n')[1]?.replace('— ', '')}
                </Text>
              </View>
              
              <View style={styles.researchActions}>
                <TouchableOpacity
                  style={[styles.refreshResearchButton, { backgroundColor: theme.background, borderColor: theme.border }]}
                  onPress={(e) => {
                    e.stopPropagation();
                    refreshResearchMessage();
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="refresh" size={scaleFontSize(14)} color={theme.textSecondary} />
                </TouchableOpacity>
                <View style={[styles.researchBadge, { backgroundColor: theme.primary + '15' }]}>
                  <Text style={[styles.researchBadgeText, { color: theme.primary }]}>Research</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Bottom padding */}
        <View style={{ height: scaleHeight(100) }} />
      </ScrollView>

      {/* Modals */}
      <StandupHistoryRevamped
        visible={showHistory}
        setVisible={setShowHistory}
        theme={theme}
        showSuccess={showSuccess}
      />
      
      <PromptSelectorRevamped
        visible={showPromptSelector}
        setVisible={setShowPromptSelector}
        onPromptSelect={(themeData, isRandomMode = false) => {
          setCurrentPrompts(themeData);
          saveFocusMode(themeData, isRandomMode);
        }}
        currentPrompts={currentPrompts}
        focusMode={focusMode}
        getTodaysRandomTheme={getTodaysRandomTheme}
        theme={theme}
        showSuccess={showSuccess}
      />

      {/* Research Details Modal */}
      <Modal
        visible={showResearchModal}
        transparent
        animationType="none"
        onRequestClose={handleCloseResearch}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalSafeArea}>
            <Animated.View
              style={[
                styles.researchModalContent,
                { 
                  backgroundColor: theme.background,
                  borderColor: theme.border + '20',
                  opacity: modalFadeAnim,
                  transform: [{ scale: modalScaleAnim }]
                }
              ]}
            >
              {/* Modal Header */}
              <View style={[styles.modalHeader, { borderBottomColor: theme.border + '20' }]}>
                <View style={styles.modalTitleContainer}>
                  <View style={[styles.modalIndicator, { backgroundColor: theme.primary + '15' }]}>
                    <Text style={[styles.modalIndicatorText, { color: theme.primary }]}>
                      Study
                    </Text>
                  </View>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>
                    {currentResearch?.title || 'Research Details'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.modalCloseButton, { backgroundColor: theme.background, borderColor: theme.border }]}
                  onPress={handleCloseResearch}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={scaleFontSize(16)} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
              
              {/* Modal Content */}
              <ScrollView 
                style={styles.modalScroll} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalScrollContent}
              >
                <View style={styles.modalContentGrid}>
                  {/* Summary */}
                  <View style={styles.modalSection}>
                    <Text style={[styles.modalSectionTitle, { color: theme.textSecondary }]}>
                      Summary
                    </Text>
                    <Text style={[styles.modalText, { color: theme.text }]}>
                      {currentResearch?.description || "No summary available."}
                    </Text>
                  </View>
                  
                  {/* Publication Info Grid */}
                  <View style={styles.modalInfoGrid}>
                    <View style={styles.modalInfoItem}>
                      <Text style={[styles.modalInfoLabel, { color: theme.textSecondary }]}>
                        Publication
                      </Text>
                      <Text style={[styles.modalInfoText, { color: theme.text }]}>
                        {currentResearch?.publication || "Not specified"}
                      </Text>
                    </View>
                    
                    <View style={styles.modalInfoItem}>
                      <Text style={[styles.modalInfoLabel, { color: theme.textSecondary }]}>
                        Authors
                      </Text>
                      <Text style={[styles.modalInfoText, { color: theme.text }]}>
                        {currentResearch?.authors || "Not specified"}
                      </Text>
                    </View>
                    
                    <View style={styles.modalInfoItem}>
                      <Text style={[styles.modalInfoLabel, { color: theme.textSecondary }]}>
                        Date
                      </Text>
                      <Text style={[styles.modalInfoText, { color: theme.text }]}>
                        {currentResearch?.date || "Not specified"}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Study Details */}
                  <View style={styles.modalSection}>
                    <Text style={[styles.modalSectionTitle, { color: theme.textSecondary }]}>
                      Key Findings
                    </Text>
                    <Text style={[styles.modalText, { color: theme.text }]}>
                      {currentResearch?.details || "No additional details available."}
                    </Text>
                  </View>
                </View>
              </ScrollView>
              
              {/* Modal Footer */}
              {currentResearch?.link && (
                <View style={[styles.modalFooter, { borderTopColor: theme.border + '20' }]}>
                  <TouchableOpacity
                    style={[styles.sourceButton, { 
                      backgroundColor: theme.primary,
                      borderColor: theme.primary 
                    }]}
                    onPress={() => handleOpenResearchLink(currentResearch.link)}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.sourceButtonText}>
                      Read Full Study
                    </Text>
                    <Ionicons name="arrow-forward" size={scaleFontSize(14)} color="#FFFFFF" style={{ marginLeft: spacing.s }} />
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          </SafeAreaView>
        </View>
      </Modal>

      {/* Limit Modal */}
      <FreeTierLimitModal
        visible={showLimitModal}
        theme={theme}
        limitType="reflectionLength"
        onClose={() => setShowLimitModal(false)}
        onUpgrade={() => {
          setShowLimitModal(false);
          navigation.navigate('PricingScreen');
        }}
        isDarkMode={theme.background === '#000000'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: scaleHeight(5),
    paddingBottom: scaleHeight(20),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: scaleFontSize(14),
    marginTop: spacing.m,
    fontStyle: 'italic',
  },
  header: {
    padding: spacing.m,
    paddingTop: spacing.s,
    paddingBottom: spacing.s,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: scaleFontSize(13),
    fontWeight: '500',
    marginBottom: 2,
    opacity: 0.8,
  },
  headerTitle: {
    fontSize: scaleFontSize(26),
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerDate: {
    fontSize: scaleFontSize(14),
    fontWeight: '400',
    opacity: 0.7,
  },
  topSection: {
    paddingHorizontal: spacing.m,
    marginBottom: spacing.m,
  },
  actionBar: {
    flexDirection: 'row',
    gap: spacing.s,
    marginTop: spacing.s,
  },
  focusModeButton: {
    flex: 1,
    padding: spacing.m,
    borderRadius: 12,
    borderWidth: 1,
  },
  focusModeContent: {
    gap: 4,
  },
  focusModeLabel: {
    fontSize: scaleFontSize(11),
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.7,
  },
  focusModeValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  focusModeEmoji: {
    fontSize: scaleFontSize(16),
  },
  focusModeText: {
    fontSize: scaleFontSize(14),
    fontWeight: '600',
    flex: 1,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.m,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
    minWidth: scaleWidth(100),
  },
  historyButtonText: {
    fontSize: scaleFontSize(14),
    fontWeight: '500',
  },
  reflectionSections: {
    marginBottom: spacing.m,
  },
  bottomSection: {
    paddingHorizontal: spacing.m,
    marginBottom: spacing.l,
  },
  sectionLabel: {
    fontSize: scaleFontSize(11),
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.s,
    marginLeft: 4,
  },
  streakCard: {
    marginBottom: spacing.s,
    padding: spacing.m,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  streakContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  streakMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakIcon: {
    marginRight: spacing.s,
  },
  streakEmoji: {
    fontSize: scaleFontSize(32),
  },
  streakInfo: {
    alignItems: 'flex-start',
  },
  streakNumber: {
    fontSize: scaleFontSize(32),
    fontWeight: '700',
    lineHeight: scaleFontSize(36),
  },
  streakLabel: {
    fontSize: scaleFontSize(13),
    fontWeight: '500',
  },
  streakStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: spacing.m,
  },
  statNumber: {
    fontSize: scaleFontSize(20),
    fontWeight: '600',
  },
  statLabel: {
    fontSize: scaleFontSize(11),
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: scaleHeight(30),
  },
  progressContainer: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  section: {
    marginHorizontal: spacing.m,
    marginBottom: spacing.m,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.m,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIconContainer: {
    width: scaleWidth(36),
    height: scaleWidth(36),
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.s,
  },
  sectionTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: '600',
  },
  sectionTime: {
    fontSize: scaleFontSize(12),
    marginTop: 2,
  },
  completedBadge: {
    marginLeft: spacing.s,
  },
  sectionContent: {
    marginTop: spacing.s,
  },
  promptCard: {
    padding: spacing.m,
    marginTop: spacing.s,
    borderRadius: 12,
    borderWidth: 1,
  },
  promptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.s,
  },
  promptQuestion: {
    fontSize: scaleFontSize(15),
    fontWeight: '600',
    flex: 1,
    lineHeight: scaleFontSize(20),
    marginRight: spacing.s,
  },
  refreshButton: {
    width: scaleWidth(32),
    height: scaleWidth(32),
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.s,
  },
  charIndicator: {
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: spacing.s,
  },
  charCount: {
    fontSize: scaleFontSize(11),
    fontWeight: '600',
  },
  promptInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.s,
    fontSize: scaleFontSize(15),
    minHeight: scaleHeight(80),
    maxHeight: scaleHeight(120),
    lineHeight: scaleFontSize(22),
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.m,
    borderRadius: 12,
    marginTop: spacing.m,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: scaleFontSize(16),
    fontWeight: '600',
    marginLeft: spacing.s,
  },
  researchCard: {
    padding: spacing.m,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
  },
  researchContent: {
    flex: 1,
    paddingRight: spacing.s,
  },
  researchStatement: {
    fontSize: scaleFontSize(15),
    fontWeight: '500',
    lineHeight: scaleFontSize(21),
    marginBottom: spacing.xs,
    letterSpacing: -0.2,
  },
  researchSource: {
    fontSize: scaleFontSize(12),
    fontWeight: '400',
    lineHeight: scaleFontSize(16),
    opacity: 0.8,
  },
  researchActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.m,
    paddingTop: spacing.s,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  refreshResearchButton: {
    width: scaleWidth(32),
    height: scaleWidth(32),
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  researchBadge: {
    paddingHorizontal: spacing.s,
    paddingVertical: 4,
    borderRadius: 6,
  },
  researchBadgeText: {
    fontSize: scaleFontSize(10),
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSafeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.m,
  },
  researchModalContent: {
    width: '95%',
    height: '85%',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 0,
    shadowOpacity: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.m,
    borderBottomWidth: 1,
  },
  modalTitleContainer: {
    flex: 1,
    marginRight: spacing.m,
  },
  modalIndicator: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.s,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: spacing.s,
  },
  modalIndicatorText: {
    fontSize: scaleFontSize(10),
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: '600',
    lineHeight: scaleFontSize(24),
    letterSpacing: -0.2,
  },
  modalCloseButton: {
    width: scaleWidth(32),
    height: scaleWidth(32),
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    padding: spacing.m,
    paddingBottom: spacing.l,
  },
  modalContentGrid: {
    gap: spacing.l,
  },
  modalSection: {
    gap: spacing.s,
  },
  modalSectionTitle: {
    fontSize: scaleFontSize(12),
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalText: {
    fontSize: scaleFontSize(15),
    lineHeight: scaleFontSize(22),
    fontWeight: '400',
  },
  modalInfoGrid: {
    gap: spacing.m,
  },
  modalInfoItem: {
    gap: 4,
  },
  modalInfoLabel: {
    fontSize: scaleFontSize(12),
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalInfoText: {
    fontSize: scaleFontSize(14),
    fontWeight: '400',
    lineHeight: scaleFontSize(20),
  },
  modalFooter: {
    padding: spacing.m,
    borderTopWidth: 1,
  },
  sourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: 8,
    borderWidth: 1,
  },
  sourceButtonText: {
    color: '#FFFFFF',
    fontSize: scaleFontSize(14),
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});

export default DailyStandupRevamped;