// Core application types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  preferences: UserPreferences;
  stats: UserStats;
  createdAt: Date;
  lastActive: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationSettings;
  focus: FocusSettings;
  blocking: BlockingSettings;
  pomodoro: PomodoroSettings;
  ai: AISettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
  browser: boolean;
  breakReminders: boolean;
  focusAlerts: boolean;
  weeklyReports: boolean;
}

export interface FocusSettings {
  dailyGoal: number; // minutes
  breakDuration: number; // minutes
  longBreakDuration: number; // minutes
  sessionsBeforeLongBreak: number;
  autoStartBreaks: boolean;
  autoStartSessions: boolean;
  sessionDuration: number; // minutes - for compatibility
}

export interface BlockingSettings {
  enabled: boolean;
  mode: 'soft' | 'hard' | 'smart';
  sensitivity: 'low' | 'medium' | 'high';
  blacklist: string[];
  whitelist: string[];
  schedule: BlockingSchedule[];
  motivationalMessages: string[];
}

export interface BlockingSchedule {
  id: string;
  name: string;
  days: number[]; // 0-6, Sunday-Saturday
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  enabled: boolean;
}

export interface PomodoroSettings {
  workDuration: number; // minutes
  shortBreakDuration: number; // minutes
  longBreakDuration: number; // minutes
  sessionsBeforeLongBreak: number;
  autoStartBreaks: boolean;
  autoStartSessions: boolean;
  soundEnabled: boolean;
  desktopNotifications: boolean;
}

export interface AISettings {
  summarizationEnabled: boolean;
  maxSummaryLength: 'short' | 'medium' | 'long';
  includeKeyPoints: boolean;
  saveSummaries: boolean;
  apiKey?: string;
  model: 'gpt-3.5-turbo' | 'gpt-4' | 'claude-3-sonnet';
  summaryLength?: 'short' | 'medium' | 'long'; // alias for compatibility
}

export interface PrivacySettings {
  analyticsEnabled: boolean;
  dataSync: boolean;
  shareStats: boolean;
  allowTracking: boolean;
}

// Analytics and tracking types
export interface UserStats {
  totalFocusTime: number; // minutes
  totalSessions: number;
  currentStreak: number;
  longestStreak: number;
  averageSessionLength: number;
  productivityScore: number; // 0-100
  weeklyGoals: WeeklyGoal[];
  monthlyStats: MonthlyStats[];
}

export interface WeeklyGoal {
  week: string; // YYYY-WW format
  goal: number; // minutes
  achieved: number; // minutes
  completed: boolean;
}

export interface MonthlyStats {
  month: string; // YYYY-MM format
  totalFocusTime: number;
  totalSessions: number;
  averageProductivityScore: number;
  topFocusHours: number[];
  mostProductiveDays: string[];
}

export interface FocusSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // minutes
  type: 'pomodoro' | 'free' | 'task';
  taskId?: string;
  productivityScore: number;
  interruptions: number;
  notes?: string;
  tags: string[];
}

export interface DistractionEvent {
  id: string;
  userId: string;
  timestamp: Date;
  type: 'url' | 'app_switch' | 'scroll' | 'tab_switch' | 'distraction' | 'productive';
  url?: string;
  appName?: string;
  duration: number; // seconds
  blocked: boolean;
  category: 'social' | 'entertainment' | 'news' | 'shopping' | 'other';
  confidence?: number; // 0-100
}

// AI and content summarization types
export interface Summary {
  id: string;
  userId: string;
  url: string;
  title: string;
  content: string;
  summary: string;
  keyPoints: string[];
  tags: string[];
  createdAt: Date;
  wordCount: number;
  readingTime: number; // minutes
}

export interface SummaryRequest {
  url: string;
  content: string;
  length: 'short' | 'medium' | 'long';
  includeKeyPoints: boolean;
  tags?: string[];
  type?: 'article' | 'paper' | 'email' | 'document';
  language?: string;
}

// Task and project management types
export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  estimatedDuration: number; // minutes
  /** Alias for compatibility with codebase */
  estimatedTime?: number; // minutes
  actualDuration?: number; // minutes
  tags: string[];
  projectId?: string;
  createdAt: Date;
  updatedAt: Date;
  // Added for compatibility with usages
  completed?: boolean;
  completedAt?: Date;
  archived?: boolean;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  color: string;
  tasks: Task[];
  createdAt: Date;
  updatedAt: Date;
}

// Focus room and social features
export interface FocusRoom {
  id: string;
  name: string;
  description?: string;
  hostId: string;
  participants: FocusRoomParticipant[];
  maxParticipants: number;
  isActive: boolean;
  startTime: Date;
  endTime?: Date;
  settings: FocusRoomSettings;
}

export interface FocusRoomParticipant {
  userId: string;
  name: string;
  avatar?: string;
  joinedAt: Date;
  isHost: boolean;
  focusTime: number; // minutes
  status: 'active' | 'break' | 'away' | 'completed';
}

export interface FocusRoomSettings {
  isPublic: boolean;
  allowChat: boolean;
  allowVideo: boolean;
  sessionDuration: number; // minutes
  breakDuration: number; // minutes
}

// Gamification types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'focus' | 'streak' | 'productivity' | 'social';
  points: number;
  unlockedAt?: Date;
  progress: number; // 0-100
  maxProgress: number;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  avatar?: string;
  score: number;
  focusTime: number;
  streak: number;
  achievements: number;
}

// API and integration types
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  source: 'google' | 'outlook' | 'notion';
  sourceId: string;
}

export interface HealthData {
  userId: string;
  timestamp: Date;
  heartRate?: number;
  steps?: number;
  sleepHours?: number;
  stressLevel?: number; // 1-10
  source: 'apple_health' | 'google_fit' | 'fitbit';
}

// State management types
export interface AppState {
  user: User | null;
  currentSession: FocusSession | null;
  isBlockingEnabled: boolean;
  activeTab: string;
  notifications: Notification[];
  achievements: Achievement[];
  focusRooms: FocusRoom[];
  isLoading: boolean;
  error: string | null;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    callback: () => void;
  };
}

// Extension-specific types
export interface ExtensionState {
  isEnabled: boolean;
  currentTab: chrome.tabs.Tab | null;
  blockedSites: string[];
  focusMode: boolean;
  pomodoroActive: boolean;
  sessionStartTime?: Date;
}

export interface ContentScriptMessage {
  type: 'BLOCK_SITE' | 'ENABLE_FOCUS_MODE' | 'UPDATE_STATS' | 'SHOW_NOTIFICATION';
  payload: any;
}

export interface BackgroundMessage {
  type: 'TAB_UPDATED' | 'SESSION_START' | 'SESSION_END' | 'DISTRACTION_DETECTED';
  payload: any;
} 