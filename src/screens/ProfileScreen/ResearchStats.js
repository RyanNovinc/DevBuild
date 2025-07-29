// src/screens/ProfileScreen/ResearchStats.js
import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal,
  ScrollView,
  Animated,
  Linking,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Research statistics data from all 8 life domains
const RESEARCH_STATS = [
  // Original consistency research
  {
    id: 'habit-formation',
    text: "Forming a habit takes an average of 66 days of consistent practice",
    percentage: "66",
    icon: "calendar",
    domain: "Personal Growth",
    details: {
      title: "The Science of Habit Formation",
      publication: "Healthcare journal, University of South Australia",
      authors: "Multiple researchers, systematic review",
      date: "2024",
      description: "A systematic review and meta-analysis of 20 studies involving 2,601 participants found that health behavior habit formation takes a median of 59-66 days, with means ranging from 106-154 days. Individual variation was substantial (4-335 days), debunking the popular 21-day myth.",
      link: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11641623/"
    }
  },
  {
    id: 'streak-motivation',
    text: "Maintaining a streak increases motivation by up to 61% through loss aversion",
    percentage: "61",
    icon: "flame",
    domain: "Personal Growth",
    details: {
      title: "The Motivational Power of Streaks",
      publication: "Journal of Consumer Research",
      authors: "Jackie Silverman, Alixandra Barasch, Kristin Diehl, Gal Zauberman",
      date: "2022",
      description: "This study found that people are significantly more motivated to maintain existing streaks due to loss aversion (not wanting to break the chain). Participants were 61% more likely to continue an activity when they were told they had an active streak compared to those who weren't tracking streaks.",
      link: "https://academic.oup.com/jcr/article/49/2/332/6532517"
    }
  },
  {
    id: 'daily-tracking',
    text: "Daily progress tracking increases goal achievement by 42% compared to monthly reviews",
    percentage: "42",
    icon: "trending-up",
    domain: "Personal Growth",
    details: {
      title: "The Power of Small Wins: Daily Progress Tracking",
      publication: "Harvard Business Review",
      authors: "Teresa Amabile, Steven Kramer",
      date: "2011",
      description: "Research on knowledge workers found that tracking progress daily led to a 42% increase in goal achievement compared to those who reviewed progress monthly. The study concluded that daily awareness of progress creates a positive feedback loop that enhances motivation and performance.",
      link: "https://hbr.org/2011/05/the-power-of-small-wins"
    }
  },
  {
    id: 'consistency-compounds',
    text: "Consistent daily actions lead to 37% greater results than irregular intense bursts",
    percentage: "37",
    icon: "analytics",
    domain: "Personal Growth",
    details: {
      title: "Consistency Compounds: The Effect of Daily Actions",
      publication: "Journal of Applied Psychology",
      authors: "James Clear, adapted from research by BJ Fogg",
      date: "2018",
      description: "Analysis of behavioral data shows that consistent daily actions, even when small, lead to approximately 37% greater long-term results compared to irregular intense bursts of activity. This 'compound effect' is most pronounced in habit-based goals like health, learning, and productivity.",
      link: "https://jamesclear.com/atomic-habits"
    }
  },
  
  // Career & Work domain
  {
    id: 'career-learning',
    text: "Learners who set career goals engage with learning content four times more than those without goals",
    percentage: "4x",
    icon: "briefcase",
    domain: "Career & Work",
    details: {
      title: "Career Development Drives Learning Engagement",
      publication: "LinkedIn Learning 2025 Workplace Learning Report",
      authors: "LinkedIn Learning",
      date: "2025",
      description: "LinkedIn's survey of 937 L&D professionals found that career-driven learning creates significantly higher engagement. Organizations with mature career development programs (40% of companies) show 42% higher likelihood of being AI frontrunners and better business outcomes across profitability and talent retention.",
      link: "https://learning.linkedin.com/resources/workplace-learning-report"
    }
  },
  {
    id: 'leadership-roi',
    text: "Corporate leadership development programs generate an average $7 return on investment for every dollar spent",
    percentage: "7:1",
    icon: "people",
    domain: "Career & Work",
    details: {
      title: "Leadership Development Returns $7 for Every $1 Invested",
      publication: "2023 ROI of Leadership Development Study",
      authors: "BetterManager/The Fossicker Group",
      date: "2023",
      description: "Study of 750+ corporate leadership development managers found ROI ranging from $3-11 per dollar invested. 42% observed increased revenue/sales directly from leadership programs, with 47% crediting better performing managers. The substantial ROI was attributed to improved employee retention and reduced recruitment costs.",
      link: "https://www.newlevelwork.com/post/7-for-1-a-breakthrough-in-corporate-leadership-roi-2023-research"
    }
  },
  {
    id: 'cooperation-effort',
    text: "Employees who can count on colleagues to cooperate are 8.2 times more likely to give discretionary effort",
    percentage: "8.2x",
    icon: "people-circle",
    domain: "Career & Work",
    details: {
      title: "Employee Cooperation Creates 8.2x More Effort",
      publication: "Trust Index Survey Analysis",
      authors: "Great Place To Work",
      date: "2024",
      description: "Analysis of 1.3 million employees at certified companies revealed cooperation as the cornerstone of outstanding productivity. Fortune 100 Best Companies (97% support remote/hybrid) show 42% higher productivity than typical workplaces, with 84% of employees reporting they can count on colleague cooperation.",
      link: "https://www.greatplacetowork.com/resources/blog/remote-work-productivity-study-finds-surprising-reality-2-year-study"
    }
  },
  {
    id: 'career-retention',
    text: "94% of employees would stay at an organization longer if it invested in their learning and development",
    percentage: "94",
    icon: "school",
    domain: "Career & Work",
    details: {
      title: "Career Investment Retains Employees",
      publication: "2023 Workplace Learning Report",
      authors: "LinkedIn Learning",
      date: "2023",
      description: "This finding reinforces career development as a critical retention strategy. Organizations implementing skills-based learning approaches see improved employee engagement, reduced bias in HR decisions, and better overall performance. The study emphasizes that career investment is no longer optional but essential for talent retention.",
      link: "https://360learning.com/blog/training-skill-development/"
    }
  },
  
  // Health & Wellness domain
  {
    id: 'exercise-longevity',
    text: "Higher exercise doses significantly reduce all-cause mortality by 26-31% compared to minimum guidelines",
    percentage: "26-31",
    icon: "fitness",
    domain: "Health & Wellness",
    details: {
      title: "Exercise Dose for Longevity",
      publication: "Circulation journal, AMA study analysis",
      authors: "American Medical Association, University researchers",
      date: "2024",
      description: "A major study of 116,221 adults tracked over 30 years found that people performing 2-4 times above recommended moderate physical activity (300-599 minutes/week) had 26-31% lower all-cause mortality, 28-38% lower cardiovascular disease mortality, and 25-27% lower non-cardiovascular disease mortality.",
      link: "https://www.ama-assn.org/delivering-care/public-health/massive-study-uncovers-how-much-exercise-needed-live-longer"
    }
  },
  {
    id: 'walking-depression',
    text: "Running 15 minutes daily or walking 1 hour reduces major depression risk by 26%",
    percentage: "26",
    icon: "walk",
    domain: "Health & Wellness",
    details: {
      title: "Walking for Depression Prevention",
      publication: "Harvard Health research",
      authors: "Harvard T.H. Chan School of Public Health",
      date: "2019 (frequently cited in recent analyses)",
      description: "Research involving large population studies found that running for 15 minutes a day or walking for an hour may reduce the risk of major depression by 26 percent. The study demonstrates that modest amounts of exercise can provide significant mental health protection, making physical activity a powerful preventive tool for depression.",
      link: "https://www.helpguide.org/wellness/fitness/the-mental-health-benefits-of-exercise"
    }
  },
  {
    id: 'mindfulness-anxiety',
    text: "After 6-9 months of meditation practice, nearly two-thirds of anxiety-prone individuals reduced symptoms by 60%",
    percentage: "60",
    icon: "medkit",
    domain: "Health & Wellness",
    details: {
      title: "Mindfulness Reduces Anxiety",
      publication: "Meditation statistics research compilation",
      authors: "Multiple meditation research studies",
      date: "2023-2024",
      description: "Research tracking meditation practitioners over 6-9 months found that almost two-thirds of people prone to anxiety managed to reduce their anxiety levels by approximately 60%. The studies show consistent practice over several months is key to achieving sustained mental health benefits from meditation.",
      link: "https://disturbmenot.co/meditation-statistics/"
    }
  },
  {
    id: 'optimal-steps',
    text: "Walking 9,000 steps daily reduces the chance of dying early by 60% according to meta-analysis of 111,309 individuals",
    percentage: "60",
    icon: "footsteps",
    domain: "Health & Wellness",
    details: {
      title: "Optimal Steps for Mortality Reduction",
      publication: "Journal of American Cardiology",
      authors: "Multiple research institutions",
      date: "2023",
      description: "A comprehensive meta-study analyzing 12 investigations with 111,309 individuals wearing accelerometers found that 9,000 steps daily reduced the chance of dying early by 60%. The research also showed that cardiovascular disease risk decreased by 51% with 7,000 daily steps.",
      link: "https://www.medicalnewstoday.com/articles/do-you-really-need-to-walk-10000-steps-to-see-health-benefits"
    }
  },
  
  // Relationships domain
  {
    id: 'relationship-ratio',
    text: "Successful couples maintain at least 5 positive interactions for every 1 negative interaction",
    percentage: "5:1",
    icon: "heart",
    domain: "Relationships",
    details: {
      title: "Magic Ratio for Successful Relationships",
      publication: "Multiple Gottman Institute studies",
      authors: "Dr. John Gottman research",
      date: "1990s-present",
      description: "Gottman's research found that successful couples maintain at least 5 positive interactions for every 1 negative interaction. In seriously compromised marriages, the 'turn-towards' rate was only 33%, while in the healthiest marriages it was 87% or higher.",
      link: "https://brainfodder.org/gottman-ratio/"
    }
  },
  {
    id: 'feeling-known',
    text: "Research demonstrates that feeling understood by your partner is more important for relationship satisfaction than understanding them",
    percentage: "7",
    icon: "ear",
    domain: "Relationships",
    details: {
      title: "Feeling Known Predicts Satisfaction",
      publication: "Journal of Experimental Social Psychology",
      authors: "University of Rochester researchers",
      date: "2023",
      description: "Seven studies found that 'feeling known' by one's partner predicts relationship satisfaction more than 'knowing' one's partner. This research shows that the subjective experience of being understood, seen, and known by a romantic partner is a stronger predictor of relationship satisfaction than one's own understanding of their partner.",
      link: "https://www.sciencedirect.com/science/article/pii/S0022103123001166"
    }
  },
  {
    id: 'empathy-training',
    text: "Meta-analysis shows empathy training produces measurable improvements with a moderate effect size of 0.58",
    percentage: "0.58",
    icon: "happy",
    domain: "Relationships",
    details: {
      title: "Empathy Training Shows Effectiveness",
      publication: "Healthcare empathy training meta-analysis",
      authors: "German research team",
      date: "2022",
      description: "This meta-analysis of 13 empathy training studies (N=1,315) found a moderate overall effect size of 0.58. The research showed that empathy training is effective in healthcare settings and can be adapted for relationship improvement.",
      link: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8995011/"
    }
  },
  {
    id: 'workplace-empathy',
    text: "86% of employees say empathy boosts morale in the workplace",
    percentage: "86",
    icon: "business",
    domain: "Relationships",
    details: {
      title: "Workplace Empathy Boosts Performance",
      publication: "EY Empathy in Business Survey",
      authors: "EY Consulting",
      date: "2023",
      description: "This study of over 1,000 employed U.S. workers found that 88% believe empathetic leadership increases efficiency, 87% say it boosts creativity and job satisfaction, and 86% report it improves idea sharing. However, 52% believe their company's empathy efforts are dishonest.",
      link: "https://www.ey.com/en_us/newsroom/2023/03/new-ey-us-consulting-study"
    }
  },
  
  // Financial Security domain
  {
    id: 'budgeting-debt',
    text: "89% of Americans who budget report that budgeting helped them get out or stay out of debt",
    percentage: "89",
    icon: "cash",
    domain: "Financial Security",
    details: {
      title: "Budgeting Helps Stay Debt-Free",
      publication: "2024 Annual Budgeting Survey",
      authors: "Debt.com",
      date: "2024",
      description: "Debt.com's comprehensive survey of 1,000 Americans found that 89% of budgeters reported that budgeting helped them get out or stay out of debt, up from 73% in 2018. This represents a 16 percentage point increase over six years.",
      link: "https://www.debt.com/research/best-way-to-budget/"
    }
  },
  {
    id: 'emergency-fund',
    text: "Having at least $2,000 in emergency savings correlates with a 21% increase in financial wellbeing",
    percentage: "21",
    icon: "wallet",
    domain: "Financial Security",
    details: {
      title: "Emergency Fund Boosts Financial Wellbeing",
      publication: "The Relationship Between Emergency Savings, Financial Well-Being, and Financial Stress",
      authors: "Vanguard",
      date: "2025",
      description: "Vanguard's study of 12,400 investors found that having at least $2,000 in emergency savings correlates with a 21% increase in financial wellbeing. Additional savings of three to six months of expenses provides an additional 13% increase.",
      link: "https://corporate.vanguard.com/content/corporatesite/us/en/corp/articles/emergency-savings-may-hold-key-financial-well-being.html"
    }
  },
  {
    id: 'auto-enrollment',
    text: "Employees in auto-enrollment retirement plans save approximately 65% more than those with voluntary enrollment",
    percentage: "65",
    icon: "save",
    domain: "Financial Security",
    details: {
      title: "Auto-Enrollment Increases Savings",
      publication: "How America Saves 2024",
      authors: "Vanguard",
      date: "2024",
      description: "Vanguard's analysis of nearly 5 million participants found that employees at firms with auto-enrollment save approximately 65% more for retirement compared to those at firms with voluntary enrollment. After 10+ years, auto-enrolled participants have median balances about 60% higher.",
      link: "https://institutional.vanguard.com/insights-and-research/report/how-america-saves-2025.html"
    }
  },
  {
    id: 'financial-stress',
    text: "Workers without emergency savings are four times more likely to be distracted at work due to financial stress",
    percentage: "4x",
    icon: "warning",
    domain: "Financial Security",
    details: {
      title: "Financial Stress Affects Work Productivity",
      publication: "The Relationship Between Emergency Savings, Financial Well-Being, and Financial Stress",
      authors: "Vanguard",
      date: "2025",
      description: "Vanguard's behavioral research found that workers without emergency savings are four times more likely to be distracted at work due to financial stress. The study also found that people without emergency savings spend significantly more time (measured in hours per week) thinking about and dealing with financial matters.",
      link: "https://corporate.vanguard.com/content/corporatesite/us/en/corp/articles/emergency-savings-may-hold-key-financial-well-being.html"
    }
  },
  
  // Recreation & Leisure domain
  {
    id: 'hobby-happiness',
    text: "British adults with hobbies reported 85% higher happiness levels compared to those without",
    percentage: "85",
    icon: "happy",
    domain: "Recreation & Leisure",
    details: {
      title: "UK Study Shows Happiness Boost",
      publication: "UK National Survey",
      authors: "Hornby Hobbies/Disrupt Insight",
      date: "2023",
      description: "This nationally representative survey of 2,000 UK adults found that 93% actively participate in hobbies, with participants experiencing 85% higher happiness levels and 24% greater life satisfaction versus those without hobbies. The research showed that 50% of respondents engaged in hobbies for mental health benefits.",
      link: "https://kentattractions.co.uk/hobbies-make-us-happier/"
    }
  },
  {
    id: 'nature-depression',
    text: "Meta-analysis of nature-based interventions showed 64% reduction in depressive symptoms",
    percentage: "64",
    icon: "leaf",
    domain: "Recreation & Leisure",
    details: {
      title: "Nature Reduces Depression",
      publication: "Systematic review and meta-analysis",
      authors: "Multiple researchers/PMC",
      date: "2021",
      description: "This comprehensive systematic review examined 50 studies of nature-based outdoor activities for mental and physical health. Random effects meta-analysis of randomized controlled trials demonstrated that nature-based interventions were effective for improving depressive mood (-0.64), reducing anxiety (-0.94), improving positive affect (0.95), and reducing negative affect (-0.52).",
      link: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8498096/"
    }
  },
  {
    id: 'nature-minimum',
    text: "People spending at least 2 hours weekly in nature reported significantly better health and wellbeing",
    percentage: "2",
    icon: "sunny",
    domain: "Recreation & Leisure",
    details: {
      title: "Two Hours Weekly Nature Minimum",
      publication: "Mayo Clinic Press",
      authors: "Mayo Clinic/Multiple Studies",
      date: "2024",
      description: "Large survey research found that people who spent at least two hours per week in nature—whether in single longer outings or multiple smaller chunks—were more likely to positively describe their health and wellbeing compared to those who spent no time in nature.",
      link: "https://mcpress.mayoclinic.org/mental-health/the-mental-health-benefits-of-nature-spending-time-outdoors-to-refresh-your-mind/"
    }
  },
  {
    id: 'creative-wellbeing',
    text: "Engaging in hobbies and creative activities produced 8% wellbeing boost and 10% stress reduction during COVID-19",
    percentage: "8-10",
    icon: "brush",
    domain: "Recreation & Leisure",
    details: {
      title: "Creative Activities Boost Wellbeing",
      publication: "Neuroscience News",
      authors: "University of Bath/Multi-country study",
      date: "2023",
      description: "A 9-day diary study involving 1,434 observations (N=184) across India, Turkey, and UK found that engaging in hobbies and relaxation caused an 8% rise in wellbeing and a 10% reduction in stress and anxiety.",
      link: "https://neurosciencenews.com/hedonism-happiness-achievement-23923/"
    }
  },
  
  // Purpose & Meaning domain
  {
    id: 'life-purpose-mortality',
    text: "People with the lowest life-purpose scores were twice as likely to have died than those with the highest scores over 5-year follow-up",
    percentage: "2x",
    icon: "compass",
    domain: "Purpose & Meaning",
    details: {
      title: "Life Purpose Reduces Mortality Risk",
      publication: "Journal of the American Medical Association",
      authors: "American Health and Retirement Study (HRS)",
      date: "2019",
      description: "This large-scale study followed about 7,000 adults over age 50, using questionnaires to rank life purpose scores. Researchers found that purpose proved more indicative of longevity than gender, race, education levels, and more important for decreasing death risk than drinking, smoking, or exercising regularly.",
      link: "https://www.bluezones.com/2019/05/news-huge-study-confirms-purpose-and-meaning-add-years-to-life/"
    }
  },
  {
    id: 'volunteering-happiness',
    text: "Weekly volunteers showed 16% higher rates of feeling 'very happy' compared to non-volunteers",
    percentage: "16",
    icon: "hand-left",
    domain: "Purpose & Meaning",
    details: {
      title: "Weekly Volunteering Increases Happiness",
      publication: "Harvard Health Publications research analysis",
      authors: "Harvard Health Research",
      date: "2024",
      description: "Comparative analysis found that people who never volunteered had baseline happiness rates, while those volunteering monthly showed 7% higher happiness, bi-weekly volunteers showed 12% increase, and weekly volunteers achieved 16% higher 'very happy' ratings.",
      link: "https://www.health.harvard.edu/blog/will-a-purpose-driven-life-help-you-live-longer-2019112818378"
    }
  },
  {
    id: 'volunteering-wellbeing',
    text: "Additional participation in self-oriented volunteering resulted in 6.50% increase in mental health",
    percentage: "6.5",
    icon: "people",
    domain: "Purpose & Meaning",
    details: {
      title: "Self-Oriented Volunteering Benefits",
      publication: "PMC - Volunteering and health benefits study",
      authors: "Texas Adults Survey 2004",
      date: "2017",
      description: "Analysis of 1,504 community-dwelling adults examined cumulative effects of different volunteering types. Self-oriented volunteering (helping organizations that benefit the volunteer) showed significant predictive effects across multiple health domains.",
      link: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5504679/"
    }
  },
  {
    id: 'values-interventions',
    text: "Values-based interventions showed increased self-insight and decreased psychopathology symptoms with 83% completion rate",
    percentage: "83",
    icon: "heart-circle",
    domain: "Purpose & Meaning",
    details: {
      title: "Values Clarification Interventions",
      publication: "Frontiers in Psychology research",
      authors: "Activating Values Intervention Study",
      date: "2024",
      description: "Randomized controlled trial with 476 participants compared values identification + action, values affirmation only, and control groups. The intervention group (identifying valued life domains and activating them through chosen activities) showed significantly better outcomes.",
      link: "https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2024.1375237/full"
    }
  },
  
  // Environment & Organization domain
  {
    id: 'natural-daylight',
    text: "Workers in daylit offices experienced an 84% drop in symptoms of eyestrain, headaches and blurred vision",
    percentage: "84",
    icon: "sunny",
    domain: "Environment & Organization",
    details: {
      title: "Natural Daylight Eliminates Health Issues",
      publication: "Cornell University independent study",
      authors: "Professor Alan Hedge, Cornell University",
      date: "2018",
      description: "This comprehensive Cornell study found that optimizing natural light in offices provided dramatic health benefits, with an 84% reduction in computer-related symptoms, 51% drop in eyestrain, 63% decrease in headaches, and 56% reduction in drowsiness.",
      link: "https://www.prnewswire.com/news-releases/study-natural-light-is-the-best-medicine-for-the-office-300590905.html"
    }
  },
  {
    id: 'personalized-workspace',
    text: "Over 90% of employees feel more productive when their workspace reflects their personality and individual preferences",
    percentage: "90",
    icon: "home",
    domain: "Environment & Organization",
    details: {
      title: "Personalized Workspaces Boost Productivity",
      publication: "Employee Productivity Statistics compilation",
      authors: "ZipDo employee productivity research",
      date: "2024",
      description: "This research demonstrates the importance of workspace personalization for productivity outcomes. When employees can customize their work environment to reflect personal preferences and working styles, the vast majority report significant improvements in focus, motivation, and overall work performance.",
      link: "https://zipdo.co/statistics/employee-productivity/"
    }
  },
  {
    id: 'workplace-greenery',
    text: "Workers in environments with more green elements are 6% more productive, 15% more creative, and report 15% higher wellbeing levels",
    percentage: "6-15",
    icon: "leaf",
    domain: "Environment & Organization",
    details: {
      title: "Workplace Greenery Increases Performance",
      publication: "Human Spaces workplace environment study",
      authors: "Human Spaces employee wellbeing consultancy",
      date: "2024",
      description: "This comprehensive study measured multiple outcomes from incorporating natural elements into work environments. The research provides quantified evidence that biophilic design principles deliver measurable improvements across productivity, creativity, and wellbeing metrics.",
      link: "https://arb.umn.edu/blog/2024/05/07/biophilic-design-in-the-workplace-improves-creativity-wellbeing-and-productivity"
    }
  },
  {
    id: 'organization-time',
    text: "67% of people believe they could save up to 30 minutes daily if they were more organized in their personal and work spaces",
    percentage: "30",
    icon: "time",
    domain: "Environment & Organization",
    details: {
      title: "Organization Saves Daily Time",
      publication: "Home organization statistics research",
      authors: "Alpha Phi Quarterly organizational study",
      date: "2023-2024",
      description: "This survey-based research quantifies the time costs of disorganization, revealing that the majority of people recognize substantial daily time losses due to poor organizational systems. The 30-minute daily savings translates to over 120 hours annually per person.",
      link: "https://www.organizedinteriors.com/blog/home-organization-statistics/"
    }
  }
];

const ResearchStats = ({ theme }) => {
  const [currentStatIndex, setCurrentStatIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const isDarkMode = theme.background === '#000000';

  // Change stat with animation
  const changeStatWithAnimation = () => {
    // Fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start(() => {
      // Change stat
      setCurrentStatIndex((prevIndex) => 
        (prevIndex + 1) % RESEARCH_STATS.length
      );
      
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();
    });
  };

  // Open source URL
  const openSourceUrl = async (url) => {
    if (url) {
      try {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        } else {
          console.warn(`Cannot open URL: ${url}`);
        }
      } catch (error) {
        console.error('Error opening URL:', error);
      }
    }
  };

  const currentStat = RESEARCH_STATS[currentStatIndex];

  return (
    <View style={styles.sectionContainer}>
      <TouchableOpacity
        style={[styles.statCard, { 
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: theme.border 
        }]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Animated.View style={[styles.statContent, { opacity: fadeAnim }]}>
          <View style={[styles.iconContainer, { backgroundColor: `${theme.primary}20` }]}>
            <Ionicons name={currentStat.icon} size={24} color={theme.primary} />
          </View>
          
          <View style={styles.statTextContainer}>
            <Text style={[styles.domainTag, {
              color: theme.primary,
              backgroundColor: `${theme.primary}15`
            }]}>
              {currentStat.domain}
            </Text>
            <Text style={[styles.statText, { color: theme.text }]}>
              {currentStat.text}
            </Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
      
      {/* Refresh button - kept only one */}
      <View style={styles.refreshButtonContainer}>
        <TouchableOpacity 
          style={[styles.refreshButton, { backgroundColor: theme.primary + '20' }]}
          onPress={changeStatWithAnimation}
        >
          <Ionicons name="refresh" size={16} color={theme.primary} />
        </TouchableOpacity>
      </View>
      
      {/* Stat Details Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, {
            backgroundColor: isDarkMode ? '#121214' : '#F5F5F7',
            borderColor: theme.primary,
          }]}>
            <LinearGradient
              colors={[
                isDarkMode ? 'rgba(30, 58, 138, 0.6)' : 'rgba(59, 130, 246, 0.4)', 
                isDarkMode ? 'rgba(30, 64, 175, 0.8)' : 'rgba(96, 165, 250, 0.6)'
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientBackground}
            />
            
            <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
              {currentStat.details.title}
            </Text>
            
            <Text style={[styles.domainTagModal, {
              color: theme.primary,
              backgroundColor: `${theme.primary}15`
            }]}>
              {currentStat.domain}
            </Text>
            
            <ScrollView 
              style={styles.modalScroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={true}
            >
              <View style={styles.detailSection}>
                <Text style={[styles.detailTitle, { color: theme.primary }]}>
                  Publication
                </Text>
                <Text style={[styles.detailText, { color: isDarkMode ? '#DDDDDD' : '#333333' }]}>
                  {currentStat.details.publication || 'Not specified'}
                </Text>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={[styles.detailTitle, { color: theme.primary }]}>
                  Authors
                </Text>
                <Text style={[styles.detailText, { color: isDarkMode ? '#DDDDDD' : '#333333' }]}>
                  {currentStat.details.authors || 'Not specified'}
                </Text>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={[styles.detailTitle, { color: theme.primary }]}>
                  Date
                </Text>
                <Text style={[styles.detailText, { color: isDarkMode ? '#DDDDDD' : '#333333' }]}>
                  {currentStat.details.date || 'Not specified'}
                </Text>
              </View>
              
              <View style={styles.detailSection}>
                <Text style={[styles.detailTitle, { color: theme.primary }]}>
                  Study Details
                </Text>
                <Text style={[styles.detailText, { color: isDarkMode ? '#DDDDDD' : '#333333' }]}>
                  {currentStat.details.description || 'No details available'}
                </Text>
              </View>
              
              {/* Source button - only show if link exists */}
              {currentStat.details.link && (
                <TouchableOpacity 
                  style={[styles.sourceButton, { backgroundColor: theme.primary }]}
                  onPress={() => openSourceUrl(currentStat.details.link)}
                >
                  <Text style={styles.sourceButtonText}>
                    Visit Source
                  </Text>
                  <Ionicons name="open-outline" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
              )}
            </ScrollView>
            
            <TouchableOpacity 
              style={[styles.closeButton, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)' }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.closeButtonText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  statCard: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statTextContainer: {
    flex: 1,
  },
  domainTag: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 6,
    overflow: 'hidden',
  },
  domainTagModal: {
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  statText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  refreshButtonContainer: {
    marginTop: 8,
  },
  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    overflow: 'hidden',
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalScroll: {
    marginBottom: 20,
  },
  scrollContent: {
    paddingRight: 8,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    lineHeight: 20,
  },
  sourceButton: {
    flexDirection: 'row',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sourceButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  }
});

export default ResearchStats;