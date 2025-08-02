import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import type { 
  User, 
  FocusSession, 
  DistractionEvent, 
  Summary, 
  Task, 
  Project, 
  Achievement, 
  Notification,
  UserPreferences,
  UserStats,
  AppState 
} from '@/types';

interface FocusFuelState extends AppState {
  // User management
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Focus session management
  currentSession: FocusSession | null;
  sessionHistory: FocusSession[];
  isSessionActive: boolean;
  sessionStartTime: Date | null;
  sessionDuration: number; // in minutes

  // Distraction tracking
  distractionEvents: DistractionEvent[];
  isBlockingEnabled: boolean;
  blockedSites: string[];
  focusMode: boolean;

  // Content and AI
  summaries: Summary[];
  recentSummaries: Summary[];
  isSummarizing: boolean;

  // Task management
  tasks: Task[];
  projects: Project[];
  currentTask: Task | null;

  // Analytics and insights
  dailyStats: {
    focusTime: number;
    sessions: number;
    productivityScore: number;
    distractions: number;
  };
  weeklyStats: {
    totalFocusTime: number;
    averageSessionLength: number;
    streak: number;
    goals: {
      focusTime: number;
      sessions: number;
      productivityScore: number;
    };
  };
  userStats: UserStats;

  // Gamification
  achievements: Achievement[];
  currentStreak: number;
  totalXP: number;
  level: number;

  // Notifications
  notifications: Notification[];
  unreadNotifications: number;

  // Settings and preferences
  preferences: UserPreferences;
  theme: 'light' | 'dark' | 'auto';
  language: string;

  // UI state
  activeTab: string;
  sidebarOpen: boolean;
  modalOpen: boolean;
  modalType: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Session actions
  startSession: (duration: number, type: 'pomodoro' | 'free' | 'task', taskId?: string) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => void;
  updateSessionProgress: (progress: number) => void;

  // Distraction actions
  addDistractionEvent: (event: DistractionEvent) => void;
  toggleBlocking: () => void;
  updateBlockedSites: (sites: string[]) => void;
  setFocusMode: (enabled: boolean) => void;

  // Content actions
  addSummary: (summary: Summary) => void;
  updateSummary: (id: string, updates: Partial<Summary>) => void;
  deleteSummary: (id: string) => void;
  setSummarizing: (isSummarizing: boolean) => void;

  // Task actions
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setCurrentTask: (task: Task | null) => void;

  // Project actions
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Analytics actions
  updateDailyStats: (stats: Partial<FocusFuelState['dailyStats']>) => void;
  updateWeeklyStats: (stats: Partial<FocusFuelState['weeklyStats']>) => void;
  resetDailyStats: () => void;
  resetWeeklyStats: () => void;

  // Achievement actions
  unlockAchievement: (achievementId: string) => void;
  updateAchievementProgress: (achievementId: string, progress: number) => void;
  addXP: (amount: number) => void;
  levelUp: () => void;

  // Notification actions
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  removeNotification: (id: string) => void;

  // Settings actions
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  setLanguage: (language: string) => void;

  // UI actions
  setActiveTab: (tab: string) => void;
  toggleSidebar: () => void;
  openModal: (type: string) => void;
  closeModal: () => void;

  // Utility actions
  resetState: () => void;
  exportData: () => any;
  importData: (data: any) => void;
  updateSessionData: (data: any) => void;
  updateFromStorage: (key: string, value: any) => void;
}

const initialState: Omit<FocusFuelState, keyof {
  setUser: any;
  setAuthenticated: any;
  setLoading: any;
  setError: any;
  startSession: any;
  pauseSession: any;
  resumeSession: any;
  endSession: any;
  updateSessionProgress: any;
  addDistractionEvent: any;
  toggleBlocking: any;
  updateBlockedSites: any;
  setFocusMode: any;
  addSummary: any;
  updateSummary: any;
  deleteSummary: any;
  setSummarizing: any;
  addTask: any;
  updateTask: any;
  deleteTask: any;
  setCurrentTask: any;
  addProject: any;
  updateProject: any;
  deleteProject: any;
  updateDailyStats: any;
  updateWeeklyStats: any;
  resetDailyStats: any;
  resetWeeklyStats: any;
  unlockAchievement: any;
  updateAchievementProgress: any;
  addXP: any;
  levelUp: any;
  addNotification: any;
  markNotificationAsRead: any;
  clearNotifications: any;
  removeNotification: any;
  updatePreferences: any;
  setTheme: any;
  setLanguage: any;
  setActiveTab: any;
  toggleSidebar: any;
  openModal: any;
  closeModal: any;
  resetState: any;
  exportData: any;
  importData: any;
  updateSessionData: any;
  updateFromStorage: any;
}> = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  currentSession: null,
  sessionHistory: [],
  isSessionActive: false,
  sessionStartTime: null,
  sessionDuration: 0,

  distractionEvents: [],
  isBlockingEnabled: false,
  blockedSites: [],
  focusMode: false,

  summaries: [],
  recentSummaries: [],
  isSummarizing: false,

  tasks: [],
  projects: [],
  currentTask: null,

  dailyStats: {
    focusTime: 0,
    sessions: 0,
    productivityScore: 0,
    distractions: 0,
  },

  weeklyStats: {
    totalFocusTime: 0,
    averageSessionLength: 0,
    streak: 0,
    goals: {
      focusTime: 0,
      sessions: 0,
      productivityScore: 0,
    },
  },

  achievements: [],
  currentStreak: 0,
  totalXP: 0,
  level: 1,
  focusRooms: [],
  userStats: {
    totalFocusTime: 0,
    totalSessions: 0,
    currentStreak: 0,
    longestStreak: 0,
    averageSessionLength: 0,
    productivityScore: 0,
    weeklyGoals: [],
    monthlyStats: [],
  },

  notifications: [],
  unreadNotifications: 0,

  preferences: {
    theme: 'auto',
    notifications: {
      enabled: true,
      sound: true,
      desktop: true,
      browser: true,
      breakReminders: true,
      focusAlerts: true,
      weeklyReports: true,
    },
    focus: {
      dailyGoal: 480, // 8 hours
      breakDuration: 5,
      longBreakDuration: 15,
      sessionsBeforeLongBreak: 4,
      autoStartBreaks: true,
      autoStartSessions: false,
      sessionDuration: 25, // minutes
    },
    blocking: {
      enabled: true,
      mode: 'smart',
      sensitivity: 'medium',
      blacklist: [],
      whitelist: [],
      schedule: [],
      motivationalMessages: [
        "Stay focused! You're doing great!",
        "Every distraction avoided is progress made.",
        "Your future self will thank you for staying focused.",
        "You've got this! Keep going strong!"
      ],
    },
    pomodoro: {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      sessionsBeforeLongBreak: 4,
      autoStartBreaks: true,
      autoStartSessions: false,
      soundEnabled: true,
      desktopNotifications: true,
    },
    ai: {
      summarizationEnabled: true,
      maxSummaryLength: 'medium',
      includeKeyPoints: true,
      saveSummaries: true,
      model: 'gpt-3.5-turbo',
    },
    privacy: {
      analyticsEnabled: true,
      dataSync: true,
      shareStats: false,
      allowTracking: true,
    },
  },

  theme: 'auto',
  language: 'en',

  activeTab: 'dashboard',
  sidebarOpen: true,
  modalOpen: false,
  modalType: null,
};

export const useFocusFuelStore = create<FocusFuelState>()(
  devtools(
    subscribeWithSelector(
      persist(
        (set, get) => ({
          ...initialState,

          // User management
          setUser: (user) => set({ user, isAuthenticated: !!user }),
          setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
          setLoading: (isLoading) => set({ isLoading }),
          setError: (error) => set({ error }),

          // Session management
          startSession: (duration, type, taskId) => {
            const session: FocusSession = {
              id: Date.now().toString(),
              userId: get().user?.id || 'anonymous',
              startTime: new Date(),
              duration,
              type,
              taskId,
              productivityScore: 0,
              interruptions: 0,
              tags: [],
            };

            set({
              currentSession: session,
              isSessionActive: true,
              sessionStartTime: new Date(),
              sessionDuration: duration,
              sessionHistory: [...get().sessionHistory, session],
            });
          },

          pauseSession: () => {
            const { currentSession } = get();
            if (currentSession) {
              set({
                isSessionActive: false,
                currentSession: {
                  ...currentSession,
                  endTime: new Date(),
                },
              });
            }
          },

          resumeSession: () => {
            set({ isSessionActive: true });
          },

          endSession: () => {
            const { currentSession, sessionHistory } = get();
            if (currentSession) {
              const updatedSession = {
                ...currentSession,
                endTime: new Date(),
              };

              set({
                currentSession: null,
                isSessionActive: false,
                sessionStartTime: null,
                sessionDuration: 0,
                sessionHistory: sessionHistory.map(s => 
                  s.id === currentSession.id ? updatedSession : s
                ),
              });
            }
          },

          updateSessionProgress: (progress) => {
            const { currentSession } = get();
            if (currentSession) {
              set({
                currentSession: {
                  ...currentSession,
                  productivityScore: progress,
                },
              });
            }
          },

          // Distraction management
          addDistractionEvent: (event) => {
            set({
              distractionEvents: [...get().distractionEvents, event],
              dailyStats: {
                ...get().dailyStats,
                distractions: get().dailyStats.distractions + 1,
              },
            });
          },

          toggleBlocking: () => {
            const { isBlockingEnabled } = get();
            set({ isBlockingEnabled: !isBlockingEnabled });
          },

          updateBlockedSites: (sites) => set({ blockedSites: sites }),
          setFocusMode: (enabled) => set({ focusMode: enabled }),

          // Content management
          addSummary: (summary) => {
            const { summaries, recentSummaries } = get();
            set({
              summaries: [...summaries, summary],
              recentSummaries: [summary, ...recentSummaries.slice(0, 9)],
            });
          },

          updateSummary: (id, updates) => {
            const { summaries } = get();
            set({
              summaries: summaries.map(s => 
                s.id === id ? { ...s, ...updates } : s
              ),
            });
          },

          deleteSummary: (id) => {
            const { summaries } = get();
            set({
              summaries: summaries.filter(s => s.id !== id),
            });
          },

          setSummarizing: (isSummarizing) => set({ isSummarizing }),

          // Task management
          addTask: (task) => {
            set({ tasks: [...get().tasks, task] });
          },

          updateTask: (id, updates) => {
            const { tasks } = get();
            set({
              tasks: tasks.map(t => 
                t.id === id ? { ...t, ...updates } : t
              ),
            });
          },

          deleteTask: (id) => {
            const { tasks } = get();
            set({ tasks: tasks.filter(t => t.id !== id) });
          },

          setCurrentTask: (task) => set({ currentTask: task }),

          // Project management
          addProject: (project) => {
            set({ projects: [...get().projects, project] });
          },

          updateProject: (id, updates) => {
            const { projects } = get();
            set({
              projects: projects.map(p => 
                p.id === id ? { ...p, ...updates } : p
              ),
            });
          },

          deleteProject: (id) => {
            const { projects } = get();
            set({ projects: projects.filter(p => p.id !== id) });
          },

          // Analytics
          updateDailyStats: (stats) => {
            set({
              dailyStats: { ...get().dailyStats, ...stats },
            });
          },

          updateWeeklyStats: (stats) => {
            set({
              weeklyStats: { ...get().weeklyStats, ...stats },
            });
          },

          resetDailyStats: () => {
            set({
              dailyStats: {
                focusTime: 0,
                sessions: 0,
                productivityScore: 0,
                distractions: 0,
              },
            });
          },

          resetWeeklyStats: () => {
            set({
              weeklyStats: {
                totalFocusTime: 0,
                averageSessionLength: 0,
                streak: 0,
                goals: {
                  focusTime: 0,
                  sessions: 0,
                  productivityScore: 0,
                },
              },
            });
          },

          // Achievements
          unlockAchievement: (achievementId) => {
            const { achievements } = get();
            const achievement = achievements.find(a => a.id === achievementId);
            if (achievement && !achievement.unlockedAt) {
              set({
                achievements: achievements.map(a => 
                  a.id === achievementId 
                    ? { ...a, unlockedAt: new Date() }
                    : a
                ),
              });
            }
          },

          updateAchievementProgress: (achievementId, progress) => {
            const { achievements } = get();
            set({
              achievements: achievements.map(a => 
                a.id === achievementId 
                  ? { ...a, progress }
                  : a
              ),
            });
          },

          addXP: (amount) => {
            const { totalXP, level } = get();
            const newXP = totalXP + amount;
            const newLevel = Math.floor(newXP / 1000) + 1;
            
            set({ 
              totalXP: newXP,
              level: newLevel > level ? newLevel : level,
            });

            if (newLevel > level) {
              get().levelUp();
            }
          },

          levelUp: () => {
            const { level } = get();
            get().addNotification({
              id: Date.now().toString(),
              type: 'success',
              title: 'Level Up!',
              message: `Congratulations! You've reached level ${level + 1}!`,
              timestamp: new Date(),
              read: false,
            });
          },

          // Notifications
          addNotification: (notification) => {
            const { notifications } = get();
            set({
              notifications: [notification, ...notifications],
              unreadNotifications: get().unreadNotifications + 1,
            });
          },

          markNotificationAsRead: (id) => {
            const { notifications, unreadNotifications } = get();
            const updatedNotifications = notifications.map(n => 
              n.id === id ? { ...n, read: true } : n
            );
            
            set({
              notifications: updatedNotifications,
              unreadNotifications: Math.max(0, unreadNotifications - 1),
            });
          },

          clearNotifications: () => {
            set({ notifications: [], unreadNotifications: 0 });
          },

          removeNotification: (id) => {
            const { notifications } = get();
            set({
              notifications: notifications.filter(n => n.id !== id),
            });
          },

          // Settings
          updatePreferences: (preferences) => {
            set({
              preferences: { ...get().preferences, ...preferences },
            });
          },

          setTheme: (theme) => set({ theme }),
          setLanguage: (language) => set({ language }),

          // UI
          setActiveTab: (tab) => set({ activeTab: tab }),
          toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
          openModal: (type) => set({ modalOpen: true, modalType: type }),
          closeModal: () => set({ modalOpen: false, modalType: null }),

          // Utilities
          resetState: () => set(initialState),
          
          exportData: () => {
            const state = get();
            return {
              user: state.user,
              sessionHistory: state.sessionHistory,
              distractionEvents: state.distractionEvents,
              summaries: state.summaries,
              tasks: state.tasks,
              projects: state.projects,
              achievements: state.achievements,
              preferences: state.preferences,
              dailyStats: state.dailyStats,
              weeklyStats: state.weeklyStats,
            };
          },

          importData: (data) => {
            set({
              user: data.user || null,
              sessionHistory: data.sessionHistory || [],
              distractionEvents: data.distractionEvents || [],
              summaries: data.summaries || [],
              tasks: data.tasks || [],
              projects: data.projects || [],
              achievements: data.achievements || [],
              preferences: data.preferences || initialState.preferences,
              dailyStats: data.dailyStats || initialState.dailyStats,
              weeklyStats: data.weeklyStats || initialState.weeklyStats,
            });
          },

          updateSessionData: (data) => {
            // Update session-related data from background script
            console.log('Updating session data:', data);
          },

          updateFromStorage: (key, value) => {
            // Update store from storage changes
            console.log('Updating from storage:', key, value);
          },
        }),
        {
          name: 'focusfuel-storage',
          partialize: (state) => ({
            user: state.user,
            sessionHistory: state.sessionHistory,
            distractionEvents: state.distractionEvents,
            summaries: state.summaries,
            tasks: state.tasks,
            projects: state.projects,
            achievements: state.achievements,
            preferences: state.preferences,
            dailyStats: state.dailyStats,
            weeklyStats: state.weeklyStats,
            theme: state.theme,
            language: state.language,
            currentStreak: state.currentStreak,
            totalXP: state.totalXP,
            level: state.level,
          }),
        }
      )
    ),
    {
      name: 'focusfuel-store',
    }
  )
);

// Selectors for common state access
export const useUser = () => useFocusFuelStore((state) => state.user);
export const useIsAuthenticated = () => useFocusFuelStore((state) => state.isAuthenticated);
export const useCurrentSession = () => useFocusFuelStore((state) => state.currentSession);
export const useIsSessionActive = () => useFocusFuelStore((state) => state.isSessionActive);
export const useSessionDuration = () => useFocusFuelStore((state) => state.sessionDuration);
export const useIsBlockingEnabled = () => useFocusFuelStore((state) => state.isBlockingEnabled);
export const useFocusMode = () => useFocusFuelStore((state) => state.focusMode);
export const useDailyStats = () => useFocusFuelStore((state) => state.dailyStats);
export const useWeeklyStats = () => useFocusFuelStore((state) => state.weeklyStats);
export const useTasks = () => useFocusFuelStore((state) => state.tasks);
export const useProjects = () => useFocusFuelStore((state) => state.projects);
export const useSummaries = () => useFocusFuelStore((state) => state.summaries);
export const useAchievements = () => useFocusFuelStore((state) => state.achievements);
export const useNotifications = () => useFocusFuelStore((state) => state.notifications);
export const useUnreadNotifications = () => useFocusFuelStore((state) => state.unreadNotifications);
export const usePreferences = () => useFocusFuelStore((state) => state.preferences);
export const useTheme = () => useFocusFuelStore((state) => state.theme);
export const useActiveTab = () => useFocusFuelStore((state) => state.activeTab);
export const useSidebarOpen = () => useFocusFuelStore((state) => state.sidebarOpen);
export const useModalOpen = () => useFocusFuelStore((state) => state.modalOpen);
export const useModalType = () => useFocusFuelStore((state) => state.modalType); 