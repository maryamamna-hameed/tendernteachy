/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Brain, 
  TrendingUp, 
  User, 
  Send, 
  Sparkles, 
  Cloud, 
  Repeat, 
  Puzzle, 
  Sprout, 
  AlertTriangle, 
  Fingerprint,
  ChevronRight,
  Plus,
  Heart,
  Moon,
  Sun,
  Settings,
  Users,
  MessageSquare,
  Home,
  Bell,
  FileText,
  Zap,
  VolumeX,
  Search,
  Lock,
  Wind,
  Smile,
  Footprints,
  Target,
  Activity,
  Timer,
  CheckCircle2,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { format } from 'date-fns';

import { Message, Insight, InsightType, UserState, MoodLog, Circle, CircleMessage } from './types';
import { SAMPLE_NUDGES, INSIGHT_TYPES_CONFIG } from './constants';
import { getReflectiveResponse, analyzePatterns, getCircleResponse, getProactiveTip } from './services/geminiService';

const EXERCISES = [
  {
    id: 'breathing',
    title: 'Deep Breathing',
    subtitle: 'Fast Calm Reset',
    icon: <Wind className="w-6 h-6 text-blue-400" />,
    description: 'Inhale 4s → Hold 4s → Exhale 6s. Repeat 5 times.',
    why: 'Regulates your nervous system instantly.',
    color: 'bg-blue-50',
    borderColor: 'border-blue-100',
    prompt: 'Pause for 30 seconds — breathe with me?'
  },
  {
    id: 'reframing',
    title: 'Thought Reframing',
    subtitle: 'CBT Classic',
    icon: <Brain className="w-6 h-6 text-purple-400" />,
    description: 'Challenge negative thoughts and replace them with balanced ones.',
    why: 'Core of Cognitive Behavioral Therapy.',
    color: 'bg-purple-50',
    borderColor: 'border-purple-100',
    prompt: 'Is that thought completely true — or just familiar?'
  },
  {
    id: 'journaling',
    title: 'Emotional Journaling',
    subtitle: 'Mind Dump',
    icon: <FileText className="w-6 h-6 text-emerald-400" />,
    description: 'Write freely for 3–5 minutes. Don’t structure, just dump thoughts.',
    why: 'Releases suppressed emotions and improves clarity.',
    color: 'bg-emerald-50',
    borderColor: 'border-emerald-100',
    prompt: 'Want to empty your mind for a minute?'
  },
  {
    id: 'pattern',
    title: 'Pattern Reflection',
    subtitle: 'Your Core',
    icon: <Repeat className="w-6 h-6 text-orange-400" />,
    description: 'Ask: What triggered me? What did I do? How did it end?',
    why: 'Builds self-awareness and reveals cycles.',
    color: 'bg-orange-50',
    borderColor: 'border-orange-100',
    prompt: 'Have you noticed this happens before stressful days?'
  },
  {
    id: 'gratitude',
    title: 'Gratitude Rewiring',
    subtitle: 'Positivity Shift',
    icon: <Heart className="w-6 h-6 text-rose-400" />,
    description: 'Write 3 small things you’re grateful for daily.',
    why: 'Shifts brain toward positivity and reduces stress.',
    color: 'bg-rose-50',
    borderColor: 'border-rose-100',
    prompt: 'What’s one small thing that didn’t go wrong today?'
  },
  {
    id: 'grounding',
    title: 'Grounding',
    subtitle: '5-4-3-2-1 Method',
    icon: <Compass className="w-6 h-6 text-amber-400" />,
    description: '5 see, 4 feel, 3 hear, 2 smell, 1 taste.',
    why: 'Brings you back to the present and reduces anxiety.',
    color: 'bg-amber-50',
    borderColor: 'border-amber-100',
    prompt: 'Let\'s find our way back to the present.'
  },
  {
    id: 'compassion',
    title: 'Self-Compassion Pause',
    subtitle: 'Gentle Check-in',
    icon: <Smile className="w-6 h-6 text-indigo-400" />,
    description: 'Ask yourself: "Would I say this to a friend?"',
    why: 'Reduces harsh self-criticism.',
    color: 'bg-indigo-50',
    borderColor: 'border-indigo-100',
    prompt: 'Are you being fair to yourself right now?'
  },
  {
    id: 'movement',
    title: 'Movement Reset',
    subtitle: 'Physical Release',
    icon: <Footprints className="w-6 h-6 text-emerald-400" />,
    description: '10–15 minute walk or light stretching.',
    why: 'Releases stress hormones and improves mood quickly.',
    color: 'bg-emerald-50',
    borderColor: 'border-emerald-100',
    prompt: 'A little movement can shift a lot of energy.'
  },
  {
    id: 'goals',
    title: 'Micro-Goal Setting',
    subtitle: 'Momentum Builder',
    icon: <Target className="w-6 h-6 text-blue-400" />,
    description: 'Break tasks into: "Just do 5 minutes".',
    why: 'Reduces overwhelm and builds momentum.',
    color: 'bg-blue-50',
    borderColor: 'border-blue-100',
    prompt: 'What\'s one tiny thing we can do right now?'
  },
  {
    id: 'identity',
    title: 'Identity Reflection',
    subtitle: 'Your Unique Edge',
    icon: <User className="w-6 h-6 text-purple-400" />,
    description: 'Ask: "Who am I becoming?" "What kind of person do I want to be?"',
    why: 'Connects behavior to identity for long-term change.',
    color: 'bg-purple-50',
    borderColor: 'border-purple-100',
    prompt: 'Every action is a vote for the person you want to be.'
  }
];

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'chat' | 'portrait' | 'alerts' | 'village' | 'brief' | 'exercises'>('home');
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [activeCircleId, setActiveCircleId] = useState<string | null>(null);
  const [level, setLevel] = useState(1);
  const [experience, setExperience] = useState(0);
  const [streak, setStreak] = useState(12);
  const [portraitProgress, setPortraitProgress] = useState(34);
  const [dimensions, setDimensions] = useState({
    openness: 82,
    warmth: 75,
    steadiness: 60,
    expressiveness: 68,
    curiosity: 88
  });
  const [showNudge, setShowNudge] = useState(true);
  const [currentNudge, setCurrentNudge] = useState('');
  const [currentMood, setCurrentMood] = useState<number>(7);
  const [proactiveTip, setProactiveTip] = useState<string>('Take a deep breath. Today is a fresh start for self-discovery.');
  const [showMoodModal, setShowMoodModal] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load initial state
  useEffect(() => {
    const saved = localStorage.getItem('tendernteachy_state');
    if (saved) {
      const state: UserState = JSON.parse(saved);
      setMessages(state.messages || []);
      setInsights(state.insights || []);
      setMoodLogs(state.moodLogs || []);
      setCircles(state.circles || []);
      setLevel(state.level || 1);
      setExperience(state.experience || 0);
      setStreak(state.streak || 1);
      
      // Check if mood logged today
      const today = new Date().toDateString();
      const hasMoodToday = state.moodLogs?.some(log => new Date(log.timestamp).toDateString() === today);
      if (!hasMoodToday) {
        setTimeout(() => setShowMoodModal(true), 2000);
      }
    } else {
      // ... existing initial state ...
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: "Hello. I'm tendernteachy. I'm here to help you see the patterns in your mind. How are you feeling today?",
        timestamp: new Date().toISOString()
      }]);

      setCircles([
        {
          id: 'circle-1',
          name: 'Morning Reflections',
          description: 'A space to share your first thoughts of the day.',
          members: [
            { id: 'u1', name: 'Maya' },
            { id: 'u2', name: 'Leo' },
            { id: 'u3', name: 'Sara' }
          ],
          messages: [
            { id: 'm1', role: 'peer', authorName: 'Maya', content: "Woke up feeling a bit heavy today, but the sun is nice.", timestamp: new Date().toISOString() }
          ]
        },
        {
          id: 'circle-2',
          name: 'Academic Pressure',
          description: 'Dealing with deadlines and expectations.',
          members: [
            { id: 'u4', name: 'Alex' },
            { id: 'u5', name: 'Jordan' },
            { id: 'u6', name: 'Sam' }
          ],
          messages: [
            { id: 'm2', role: 'peer', authorName: 'Leo', content: "Anyone else feeling like they're just running to stay in place?", timestamp: new Date().toISOString() }
          ]
        }
      ]);
      
      setTimeout(() => setShowMoodModal(true), 2000);
    }
    setCurrentNudge(SAMPLE_NUDGES[Math.floor(Math.random() * SAMPLE_NUDGES.length)]);
  }, []);

  // Update proactive tip when insights change
  useEffect(() => {
    if (insights.length > 0) {
      getProactiveTip(insights).then(setProactiveTip);
    }
  }, [insights]);

  // Save state
  useEffect(() => {
    const state: UserState = { 
      messages, 
      insights, 
      moodLogs, 
      circles, 
      level, 
      experience, 
      streak, 
      portraitProgress, 
      dimensions 
    };
    localStorage.setItem('tendernteachy_state', JSON.stringify(state));
  }, [messages, insights, moodLogs, circles, level, experience, streak, portraitProgress, dimensions]);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Analyze patterns periodically
  useEffect(() => {
    if (messages.length > 0 && messages.length % 4 === 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        handlePatternAnalysis();
      }
    }
  }, [messages]);

  const handlePatternAnalysis = async () => {
    const newInsightsRaw = await analyzePatterns(messages);
    if (newInsightsRaw.length > 0) {
      const newInsights: Insight[] = newInsightsRaw.map((raw, i) => ({
        id: `insight-${Date.now()}-${i}`,
        type: (raw.type as InsightType) || InsightType.EMOTIONAL,
        title: raw.title || 'New Pattern Detected',
        description: raw.description || '',
        timestamp: new Date().toISOString(),
        isNew: true,
        unlockedAt: level
      }));

      setInsights(prev => {
        // Filter out duplicates based on title
        const existingTitles = new Set(prev.map(ins => ins.title));
        const uniqueNew = newInsights.filter(ins => !existingTitles.has(ins.title));
        return [...uniqueNew, ...prev];
      });

      // Gain XP for new insights
      setExperience(prev => {
        const nextXp = prev + (newInsights.length * 25);
        if (nextXp >= 100) {
          setLevel(l => l + 1);
          return nextXp - 100;
        }
        return nextXp;
      });
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setShowNudge(false);

    try {
      const response = await getReflectiveResponse(input, messages);
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMsg]);
      setExperience(prev => {
        const nextXp = prev + 10;
        if (nextXp >= 100) {
          setLevel(l => l + 1);
          return nextXp - 100;
        }
        return nextXp;
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCircleSend = async (circleId: string, text: string) => {
    if (!text.trim()) return;
    
    const userMsg: CircleMessage = {
      id: Date.now().toString(),
      role: 'user',
      authorName: 'You',
      content: text,
      timestamp: new Date().toISOString()
    };

    setCircles(prev => prev.map(c => 
      c.id === circleId ? { ...c, messages: [...c.messages, userMsg] } : c
    ));
    setInput('');
    setIsTyping(true);

    try {
      const circle = circles.find(c => c.id === circleId);
      if (!circle) return;
      
      const peerResponses = await getCircleResponse(circle.name, text, circle.messages);
      
      const peerMsgs: CircleMessage[] = peerResponses.map((r, i) => ({
        id: (Date.now() + i + 1).toString(),
        role: 'peer',
        authorName: r.author,
        content: r.content,
        timestamp: new Date().toISOString()
      }));

      setCircles(prev => prev.map(c => 
        c.id === circleId ? { ...c, messages: [...c.messages, ...peerMsgs] } : c
      ));
      
      setExperience(prev => {
        const nextXp = prev + 15;
        if (nextXp >= 100) {
          setLevel(l => l + 1);
          return nextXp - 100;
        }
        return nextXp;
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleNudgeClick = (nudge: string) => {
    setInput(nudge);
    setShowNudge(false);
  };

  const [isCrisis, setIsCrisis] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const CRISIS_KEYWORDS = ['kill myself', 'suicide', 'end it all', 'hurt myself', 'want to die'];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
      setExperience(prev => prev + 20);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === 'user') {
      const content = lastMsg.content.toLowerCase();
      if (CRISIS_KEYWORDS.some(k => content.includes(k))) {
        setIsCrisis(true);
      }
    }
  }, [messages]);

  const moodChartData = [...moodLogs].reverse().map(log => ({
    time: format(new Date(log.timestamp), 'HH:mm'),
    mood: log.mood
  }));

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D2D2D] font-sans selection:bg-indigo-100">
      <AnimatePresence>
        {isCrisis && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl text-center space-y-6"
            >
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-rose-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-gray-800">You're not alone.</h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  It sounds like you're going through a very difficult time. Please reach out to someone who can help.
                </p>
              </div>
              <div className="space-y-3">
                <a 
                  href="tel:988" 
                  className="block w-full bg-rose-500 text-white py-3 rounded-full font-bold shadow-lg shadow-rose-200 hover:bg-rose-600 transition-colors"
                >
                  Call 988 (Crisis Line)
                </a>
                <button 
                  onClick={() => setIsCrisis(false)}
                  className="block w-full bg-gray-50 text-gray-500 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors"
                >
                  I'm okay for now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {showMoodModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <Heart className="w-6 h-6 text-indigo-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Daily Check-in</h2>
                <p className="text-sm text-gray-500">How's your mind feeling today?</p>
              </div>
              
              <div className="flex justify-between items-center px-2">
                {[2, 4, 6, 8, 10].map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setCurrentMood(m);
                      setMoodLogs(prev => [{ id: Date.now().toString(), mood: m, timestamp: new Date().toISOString() }, ...prev]);
                      setShowMoodModal(false);
                    }}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                      currentMood === m 
                        ? "bg-indigo-600 text-white scale-110 shadow-md" 
                        : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                    )}
                  >
                    <span className="text-xs font-bold">{m}</span>
                  </button>
                ))}
              </div>
              
              <div className="flex justify-between px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <span>Drained</span>
                <span>Radiant</span>
              </div>
              
              <button 
                onClick={() => setShowMoodModal(false)}
                className="w-full py-3 text-gray-400 text-sm font-medium hover:text-gray-600 transition-colors"
              >
                Skip for now
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <motion.div 
            animate={{ 
              backgroundColor: currentMood > 7 ? '#818CF8' : currentMood > 4 ? '#FBBF24' : '#F87171',
              boxShadow: `0 0 20px ${currentMood > 7 ? '#818CF844' : currentMood > 4 ? '#FBBF2444' : '#F8717144'}`,
              scale: [1, 1.05, 1],
            }}
            transition={{
              backgroundColor: { duration: 1 },
              scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-white" />
          </motion.div>
          <h1 className="text-xl font-medium tracking-tight text-gray-800">tendernteachy</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
            <Sun className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-amber-700">{streak} Day Streak</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest font-semibold text-gray-400">Mind Level</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-indigo-600">{level}</span>
              <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${experience}%` }}
                  className="h-full bg-indigo-500"
                />
              </div>
            </div>
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 pb-24 max-w-2xl mx-auto px-4 min-h-screen flex flex-col">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="pt-12 space-y-12"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center shadow-sm">
                    <Sparkles className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">TNT <span className="text-gray-400 font-normal text-lg ml-1">tender & teachy</span></h1>
                    <p className="text-sm text-gray-500">Your self-discovery companion ✨</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-[2.5rem] leading-[1.1] font-bold text-gray-900 tracking-tight">
                    Tender enough to listen. <span className="text-orange-500">Teachy enough to show you what you didn't know about yourself.</span>
                  </h2>
                  <p className="text-lg text-gray-400 font-medium">Not a quiz. Not a checklist. A conversation that grows with you.</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center shrink-0">
                    <Fingerprint className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Discover your portrait</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">Watch your personality take shape through everyday conversations</p>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
                    <Sprout className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Grow at your own pace</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">No pressure, no judgments — just curiosity about who you're becoming</p>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center shrink-0">
                    <Heart className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Find your people</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">Connect with anonymous communities who share your interests and values</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center">
                    <Lock className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">End-to-end encrypted</h4>
                    <p className="text-xs text-gray-400">Your identity stays yours. Go anonymous anytime.</p>
                  </div>
                </div>
                <div className="w-6 h-6 border-2 border-emerald-400 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                </div>
              </div>

              <button 
                onClick={() => setActiveTab('chat')}
                className="w-full bg-orange-500 text-white py-5 rounded-[2rem] text-xl font-bold shadow-xl shadow-orange-200 hover:bg-orange-600 transition-all flex items-center justify-center gap-3"
              >
                <Sparkles className="w-6 h-6" />
                Start your self-discovery
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-400 font-medium">Start your journey today</p>
              </div>
            </motion.div>
          )}

          {activeTab === 'portrait' && (
            <motion.div 
              key="portrait"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="pt-8 space-y-8"
            >
              <div className="flex items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50">
                <div className="relative w-24 h-24 shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-gray-100"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={2 * Math.PI * 40 * (1 - portraitProgress / 100)}
                      className="text-orange-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-800">{portraitProgress}%</span>
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-1">Your portrait is taking shape</h2>
                  <p className="text-sm text-gray-400">Tap to see what's been discovered so far</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-100 p-8 rounded-[2.5rem] relative overflow-hidden">
                <div className="relative z-10 flex items-center gap-6">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                    <Sun className="w-8 h-8 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-amber-900">{streak} days of knowing yourself</h3>
                    <p className="text-sm text-amber-700 font-medium">Your longest streak yet! Keep going 🔥</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm space-y-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500">Today's Spark</span>
                </div>
                <p className="text-xl font-bold text-gray-800 leading-tight">
                  "If you could master one skill in 30 days — what would it be and why?"
                </p>
                <div className="flex gap-3">
                  <button className="flex-1 bg-orange-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-orange-100 hover:bg-orange-600 transition-all">
                    Answer now
                  </button>
                  <button className="flex-1 bg-gray-50 text-gray-500 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all">
                    Save for later
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-800">Personality Dimensions</h3>
                <div className="space-y-5">
                  {[
                    { label: 'Openness', value: dimensions.openness, color: 'bg-orange-500' },
                    { label: 'Warmth', value: dimensions.warmth, color: 'bg-amber-400' },
                    { label: 'Steadiness', value: dimensions.steadiness, color: 'bg-emerald-400' },
                    { label: 'Expressiveness', value: dimensions.expressiveness, color: 'bg-purple-400' },
                    { label: 'Curiosity', value: dimensions.curiosity, color: 'bg-rose-400' },
                  ].map((dim) => (
                    <div key={dim.label} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-600">{dim.label}</span>
                        <span className="text-sm font-bold text-gray-400">{dim.value}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${dim.value}%` }}
                          className={cn("h-full", dim.color)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Interests</h4>
                  <div className="space-y-3">
                    {[
                      { icon: '🎯', label: 'Interior Design & Aesthetics' },
                      { icon: '🎯', label: 'South Asian Poetry' },
                      { icon: '🎯', label: 'Plant Care & Nature' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-sm">{item.icon}</span>
                        <span className="text-sm font-bold text-gray-700 leading-tight">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Values</h4>
                  <div className="space-y-3">
                    {[
                      { icon: '💛', label: 'Deep Friendships' },
                      { icon: '💛', label: 'Creating Peaceful Spaces' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-sm">{item.icon}</span>
                        <span className="text-sm font-bold text-gray-700 leading-tight">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-rose-50 border border-rose-100 p-8 rounded-[2.5rem] space-y-4">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-5 h-5 text-rose-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-rose-500">TNT's Insight</span>
                </div>
                <p className="text-lg font-medium text-gray-800 leading-relaxed italic">
                  "We've noticed you light up most when creating something with your hands — whether it's rearranging your room or sketching ideas. You process the world aesthetically, and that's a real strength."
                </p>
              </div>
            </motion.div>
          )}
          {activeTab === 'chat' && (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col pt-4"
            >
              {!activeCircleId ? (
                <div className="flex-1 flex flex-col">
                  <div className="flex-1 space-y-4 overflow-y-auto pb-32">
                    {messages.length === 0 && (
                      <div className="text-center py-12 space-y-4">
                        <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto">
                          <MessageSquare className="w-10 h-10 text-orange-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Ready to talk?</h2>
                        <p className="text-sm text-gray-500 max-w-xs mx-auto">Start a conversation about your day, your feelings, or anything on your mind.</p>
                      </div>
                    )}
                    {messages.map((msg, idx) => (
                      <div key={idx} className={cn(
                        "flex w-full",
                        msg.role === 'user' ? "justify-end" : "justify-start"
                      )}>
                        <div className={cn(
                          "max-w-[85%] px-6 py-4 rounded-[2rem] text-sm leading-relaxed",
                          msg.role === 'user' 
                            ? "bg-orange-500 text-white shadow-lg shadow-orange-100 rounded-tr-none" 
                            : "bg-white border border-gray-100 text-gray-800 shadow-sm rounded-tl-none"
                        )}>
                          <div className="markdown-body">
                            <Markdown>{msg.content}</Markdown>
                          </div>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-100 rounded-full w-fit">
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                      </div>
                    )}
                  </div>

                  <div className="fixed bottom-24 left-0 right-0 px-4">
                    <div className="max-w-2xl mx-auto">
                      {showNudge && (
                        <div className="mb-4 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                          {SAMPLE_NUDGES.map((nudge, i) => (
                            <button 
                              key={i}
                              onClick={() => setInput(nudge)}
                              className="whitespace-nowrap px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-full text-xs font-medium text-gray-600 hover:bg-white transition-colors shadow-sm"
                            >
                              {nudge}
                            </button>
                          ))}
                        </div>
                      )}
                      <form 
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className="relative flex items-center bg-white border border-gray-200 rounded-[2rem] shadow-xl px-2 py-2"
                      >
                        <input 
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="How are you feeling right now?"
                          className="flex-1 bg-transparent border-none focus:ring-0 px-4 text-sm"
                        />
                        <button type="submit" className="p-3 bg-orange-500 text-white rounded-full shadow-lg shadow-orange-200">
                          <Send className="w-5 h-5" />
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <button onClick={() => setActiveCircleId(null)} className="p-2 hover:bg-gray-100 rounded-full">
                      <ChevronRight className="w-5 h-5 rotate-180" />
                    </button>
                    <h3 className="font-bold text-gray-800">{circles.find(c => c.id === activeCircleId)?.name}</h3>
                    <div className="w-9" />
                  </div>
                  
                  <div className="flex-1 space-y-4 overflow-y-auto pb-32">
                    {circles.find(c => c.id === activeCircleId)?.messages.map((msg, idx) => (
                      <div key={idx} className={cn(
                        "flex flex-col",
                        msg.role === 'user' ? "items-end" : "items-start"
                      )}>
                        <div className="flex items-center gap-2 mb-1 px-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{msg.authorName}</span>
                        </div>
                        <div className={cn(
                          "max-w-[85%] px-6 py-3 rounded-2xl text-sm",
                          msg.role === 'user' 
                            ? "bg-indigo-600 text-white rounded-tr-none" 
                            : "bg-white border border-gray-100 text-gray-800 rounded-tl-none"
                        )}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-100 rounded-full w-fit">
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                      </div>
                    )}
                  </div>

                  <div className="fixed bottom-24 left-0 right-0 px-4">
                    <div className="max-w-2xl mx-auto">
                      <form 
                        onSubmit={(e) => { e.preventDefault(); handleCircleSend(activeCircleId!, input); }}
                        className="relative flex items-center bg-white border border-gray-200 rounded-full shadow-lg px-2 py-2"
                      >
                        <input 
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="Share with the circle..."
                          className="flex-1 bg-transparent border-none focus:ring-0 px-4 text-sm"
                        />
                        <button type="submit" className="p-2 bg-indigo-600 text-white rounded-full">
                          <Send className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'alerts' && (
            <motion.div 
              key="alerts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="pt-8 space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Daily Nudges</h2>
                <div className="p-2 bg-gray-50 rounded-xl">
                  <Settings className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6 text-orange-400" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500">New Insight</span>
                      <span className="text-[10px] text-gray-400 font-medium">2h ago</span>
                    </div>
                    <h3 className="text-base font-bold text-gray-800">Your "Portrait" has been updated</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">We've detected a new pattern in how you talk about your creative projects.</p>
                    <button className="text-sm font-bold text-orange-500 flex items-center gap-1">
                      View update <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">Village Activity</span>
                      <span className="text-[10px] text-gray-400 font-medium">5h ago</span>
                    </div>
                    <h3 className="text-base font-bold text-gray-800">3 new messages in "The Quiet Corner"</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">Your circle is discussing how to find peace in a busy week.</p>
                    <button className="text-sm font-bold text-indigo-500 flex items-center gap-1">
                      Join conversation <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm flex items-start gap-4 opacity-60">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
                    <Sprout className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Completed</span>
                      <span className="text-[10px] text-gray-400 font-medium">Yesterday</span>
                    </div>
                    <h3 className="text-base font-bold text-gray-800">Mindfulness Nugget: 5m Breathing</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">You earned 20 XP for completing your daily focus exercise.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'village' && (
            <motion.div 
              key="village"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="pt-8 space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Your Village</h2>
                <button className="p-2 bg-orange-500 text-white rounded-xl shadow-lg shadow-orange-100">
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search circles or topics..." 
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="space-y-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Active Circles</h3>
                <div className="grid grid-cols-1 gap-4">
                  {circles.map(circle => (
                    <div 
                      key={circle.id}
                      onClick={() => { setActiveCircleId(circle.id); setActiveTab('chat'); }}
                      className="bg-white border border-gray-100 p-6 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Users className="w-6 h-6 text-indigo-500" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800">{circle.name}</h4>
                            <p className="text-xs text-gray-400">{circle.members.length} members online</p>
                          </div>
                        </div>
                        <div className="flex -space-x-2">
                          {circle.members.slice(0, 3).map((m, i) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-indigo-600">
                              {m.name.charAt(0)}
                            </div>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                        {circle.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-indigo-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-2">Anonymous & Safe</h3>
                  <p className="text-indigo-200 text-sm leading-relaxed mb-6">
                    Your identity is never shared. Connect through shared experiences, not labels.
                  </p>
                  <button className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-6 py-2.5 rounded-full text-sm font-bold hover:bg-white/20 transition-colors">
                    Learn more
                  </button>
                </div>
                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl -mr-20 -mt-20" />
              </div>
            </motion.div>
          )}

          {activeTab === 'brief' && (
            <motion.div 
              key="brief"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="pt-8 space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Behavioral Brief</h2>
                <div className="p-2 bg-gray-50 rounded-xl">
                  <FileText className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm space-y-6">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-indigo-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">Weekly Summary</span>
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-gray-800">The "Aesthetic Seeker" Phase</h3>
                  <p className="text-gray-500 leading-relaxed">
                    This week, your conversations have centered around your environment and creative output. You've shown a high degree of "Openness to Experience" and a preference for visual processing.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-indigo-50 p-4 rounded-2xl text-center">
                    <div className="text-xl font-bold text-indigo-600">82%</div>
                    <div className="text-[10px] uppercase font-bold text-indigo-400">Openness</div>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-2xl text-center">
                    <div className="text-xl font-bold text-amber-600">12d</div>
                    <div className="text-[10px] uppercase font-bold text-amber-400">Streak</div>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-2xl text-center">
                    <div className="text-xl font-bold text-emerald-600">34%</div>
                    <div className="text-[10px] uppercase font-bold text-emerald-400">Portrait</div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-800">Key Patterns Detected</h3>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { type: 'NIGHT_OWL', label: 'Night Owl', desc: 'You are most reflective and creative after 10 PM.' },
                    { type: 'BREVITY', label: 'Brevity', desc: 'You prefer short, impactful exchanges over long dialogues.' },
                    { type: 'QUIET', label: 'Quiet Observer', desc: 'You listen more than you speak in group settings.' },
                  ].map((pattern) => (
                    <div key={pattern.type} className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0">
                        <Zap className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800">{pattern.label}</h4>
                        <p className="text-sm text-gray-400">{pattern.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-[2.5rem] space-y-4">
                <h3 className="text-lg font-bold text-indigo-900">Next Steps for Growth</h3>
                <ul className="space-y-3">
                  {[
                    'Try a morning reflection to balance your night owl energy.',
                    'Share one creative project in "The Design Den" circle.',
                    'Practice 5 minutes of mindful breathing before bed.',
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-indigo-200 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                      </div>
                      <span className="text-sm text-indigo-800 font-medium">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}

          {activeTab === 'exercises' && (
            <motion.div 
              key="exercises"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="pt-8 space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Exercises</h2>
                <div className="p-2 bg-gray-50 rounded-xl">
                  <Activity className="w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {EXERCISES.map((ex) => (
                  <button 
                    key={ex.id}
                    onClick={() => setActiveExercise(ex.id)}
                    className={cn(
                      "w-full text-left p-6 rounded-[2.5rem] border transition-all hover:shadow-md group",
                      ex.color,
                      ex.borderColor
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        {ex.icon}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{ex.subtitle}</span>
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">{ex.title}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{ex.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {activeExercise && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[3rem] p-8 max-w-md w-full shadow-2xl space-y-8 relative overflow-hidden"
            >
              <button 
                onClick={() => setActiveExercise(null)}
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Plus className="w-6 h-6 text-gray-400 rotate-45" />
              </button>

              {(() => {
                const ex = EXERCISES.find(e => e.id === activeExercise);
                if (!ex) return null;
                return (
                  <>
                    <div className="text-center space-y-4">
                      <div className={cn("w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto shadow-sm", ex.color)}>
                        {ex.icon}
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{ex.subtitle}</span>
                        <h2 className="text-2xl font-bold text-gray-800">{ex.title}</h2>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-gray-50 p-6 rounded-[2rem] space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Exercise</h4>
                        <p className="text-lg font-medium text-gray-800 leading-relaxed">
                          {ex.description}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-indigo-400" />
                          <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Why it works</h4>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed">
                          {ex.why}
                        </p>
                      </div>

                      <div className="pt-4">
                        <button 
                          onClick={() => {
                            setInput(ex.prompt);
                            setActiveTab('chat');
                            setActiveExercise(null);
                          }}
                          className={cn(
                            "w-full py-5 rounded-[2rem] text-white font-bold shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]",
                            ex.id === 'breathing' ? 'bg-blue-500 shadow-blue-100' :
                            ex.id === 'reframing' ? 'bg-purple-500 shadow-purple-100' :
                            ex.id === 'journaling' ? 'bg-emerald-500 shadow-emerald-100' :
                            ex.id === 'pattern' ? 'bg-orange-500 shadow-orange-100' :
                            ex.id === 'gratitude' ? 'bg-rose-500 shadow-rose-100' :
                            ex.id === 'grounding' ? 'bg-amber-500 shadow-amber-100' :
                            ex.id === 'compassion' ? 'bg-indigo-500 shadow-indigo-100' :
                            ex.id === 'movement' ? 'bg-emerald-500 shadow-emerald-100' :
                            ex.id === 'goals' ? 'bg-blue-500 shadow-blue-100' :
                            'bg-purple-500 shadow-purple-100'
                          )}
                        >
                          Start Exercise
                        </button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 px-6 py-4 z-50">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <NavButton 
            active={activeTab === 'home'} 
            onClick={() => setActiveTab('home')}
            icon={<Home className="w-6 h-6" />}
            label="Home"
          />
          <NavButton 
            active={activeTab === 'chat'} 
            onClick={() => setActiveTab('chat')}
            icon={<MessageSquare className="w-6 h-6" />}
            label="Chat"
          />
          <NavButton 
            active={activeTab === 'portrait'} 
            onClick={() => setActiveTab('portrait')}
            icon={<Fingerprint className="w-6 h-6" />}
            label="Portrait"
          />
          <NavButton 
            active={activeTab === 'alerts'} 
            onClick={() => setActiveTab('alerts')}
            icon={<Bell className="w-6 h-6" />}
            label="Alerts"
          />
          <NavButton 
            active={activeTab === 'village'} 
            onClick={() => setActiveTab('village')}
            icon={<Users className="w-6 h-6" />}
            label="Village"
          />
          <NavButton 
            active={activeTab === 'brief'} 
            onClick={() => setActiveTab('brief')}
            icon={<FileText className="w-6 h-6" />}
            label="Brief"
          />
          <NavButton 
            active={activeTab === 'exercises'} 
            onClick={() => setActiveTab('exercises')}
            icon={<Activity className="w-6 h-6" />}
            label="Exercises"
          />
        </div>
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-all",
        active ? "text-indigo-600 scale-110" : "text-gray-400 hover:text-gray-600"
      )}
    >
      <div className={cn(
        "p-1 rounded-xl transition-colors",
        active ? "bg-indigo-50" : "bg-transparent"
      )}>
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
}
