import { InsightType } from './types';

export const SAMPLE_NUDGES = [
  "If you could master one skill in 30 days — what would it be and why?",
  "If money and family expectations didn't exist — what would you spend your days doing?",
  "What's one thing you're letting go of today?",
  "How has your energy shifted since this morning?",
  "What's a small win you're proud of today?",
  "Like yaar, sab log itne sure kaise hain? Do you ever feel that way?",
  "Pata nahi how, but what's that one dream you keep coming back to?",
  "Who’s your favorite actor — and what do you like about them?",
  "What’s your favorite place in the world?",
  "Which book or story stayed with you the longest?",
  "Who’s your favorite professor — and why?",
  "Did you always want to become what you are today?",
  "What kind of days drain you the most?",
  "What do you do when you don’t feel okay?",
  "When do you feel most like yourself?",
  "What do you wish people understood about you?",
  "If you could restart life, what would you choose differently?",
  "What kind of life feels ‘worth it’ to you?",
  "Are you moving toward something — or just moving?",
  "Do you withdraw or seek people when stressed?"
];

export const INSIGHT_TYPES_CONFIG = {
  [InsightType.EMOTIONAL]: { icon: 'Cloud', color: 'text-blue-500', bg: 'bg-blue-50' },
  [InsightType.BEHAVIORAL]: { icon: 'Repeat', color: 'text-orange-500', bg: 'bg-orange-50' },
  [InsightType.CONTRADICTION]: { icon: 'Puzzle', color: 'text-purple-500', bg: 'bg-purple-50' },
  [InsightType.THOUGHT]: { icon: 'Brain', color: 'text-indigo-500', bg: 'bg-indigo-50' },
  [InsightType.GROWTH]: { icon: 'Sprout', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  [InsightType.RISK]: { icon: 'AlertTriangle', color: 'text-rose-500', bg: 'bg-rose-50' },
  [InsightType.IDENTITY]: { icon: 'Fingerprint', color: 'text-amber-500', bg: 'bg-amber-50' },
  [InsightType.NIGHT_OWL]: { icon: 'Moon', color: 'text-indigo-400', bg: 'bg-indigo-50' },
  [InsightType.QUIET]: { icon: 'VolumeX', color: 'text-amber-400', bg: 'bg-amber-50' },
  [InsightType.BREVITY]: { icon: 'Zap', color: 'text-rose-400', bg: 'bg-rose-50' },
};
