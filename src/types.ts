export enum InsightType {
  EMOTIONAL = 'emotional',
  BEHAVIORAL = 'behavioral',
  CONTRADICTION = 'contradiction',
  THOUGHT = 'thought',
  GROWTH = 'growth',
  RISK = 'risk',
  IDENTITY = 'identity',
  NIGHT_OWL = 'night_owl',
  QUIET = 'quiet',
  BREVITY = 'brevity'
}

export interface PersonalityDimensions {
  openness: number;
  warmth: number;
  steadiness: number;
  expressiveness: number;
  curiosity: number;
}

export interface BehavioralBrief {
  patientId: string;
  period: string;
  preparedFor: string;
  trajectory: { label: string; value: number; date: string }[];
  themes: string[];
  triggers: { date: string; description: string }[];
  clinicalFlag?: string;
}

export interface Insight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  timestamp: string;
  isNew: boolean;
  unlockedAt: number; // progress level
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface MoodLog {
  id: string;
  mood: number; // 1-10
  timestamp: string;
  note?: string;
}

export interface CircleMember {
  id: string;
  name: string;
  avatar?: string;
}

export interface CircleMessage {
  id: string;
  role: 'user' | 'assistant' | 'peer';
  authorName: string;
  content: string;
  timestamp: string;
  author?: CircleMember;
}

export interface Circle {
  id: string;
  name: string;
  description: string;
  messages: CircleMessage[];
  members: CircleMember[];
}

export interface UserState {
  messages: Message[];
  moodLogs: MoodLog[];
  insights: Insight[];
  circles: Circle[];
  level: number;
  experience: number;
  streak: number;
  portraitProgress: number;
  dimensions: PersonalityDimensions;
  brief?: BehavioralBrief;
}
