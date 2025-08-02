import OpenAIService from './openai';

export interface NudgeContext {
  timeOfDay: string;
  productivityLevel: 'high' | 'medium' | 'low';
  currentTask?: string;
  recentDistractions: number;
  focusStreak: number;
  lastBreakTime?: string;
  mood?: 'focused' | 'tired' | 'stressed' | 'energetic';
}

export interface Nudge {
  id: string;
  type: 'motivation' | 'break' | 'focus' | 'achievement' | 'reminder';
  title: string;
  message: string;
  action?: string;
  priority: 'low' | 'medium' | 'high';
  expiresAt?: string;
  category: 'productivity' | 'wellness' | 'achievement';
}

export interface BreakSuggestion {
  type: 'micro-break' | 'stretch' | 'walk' | 'meditation' | 'breathing';
  duration: number; // in minutes
  description: string;
  benefits: string[];
}

export class NudgingService {
  private aiService: OpenAIService;
  private nudges: Map<string, Nudge> = new Map();

  constructor(aiService: OpenAIService) {
    this.aiService = aiService;
  }

  async generateMotivationalNudge(context: NudgeContext): Promise<Nudge> {
    try {
      const message = await this.aiService.generateMotivationalMessage(context);
      
      return {
        id: `nudge_${Date.now()}`,
        type: 'motivation',
        title: 'Stay Focused',
        message,
        priority: 'medium',
        category: 'productivity'
      };
    } catch (error) {
      console.error('Error generating motivational nudge:', error);
      return this.getFallbackNudge(context);
    }
  }

  async generateBreakSuggestion(context: NudgeContext): Promise<BreakSuggestion> {
    const suggestions: BreakSuggestion[] = [
      {
        type: 'micro-break',
        duration: 2,
        description: 'Take a quick 2-minute break to refresh your mind',
        benefits: ['Reduces eye strain', 'Improves focus', 'Prevents burnout']
      },
      {
        type: 'stretch',
        duration: 5,
        description: 'Do some light stretching to improve circulation',
        benefits: ['Reduces muscle tension', 'Improves posture', 'Boosts energy']
      },
      {
        type: 'walk',
        duration: 10,
        description: 'Take a short walk to clear your mind',
        benefits: ['Increases creativity', 'Reduces stress', 'Improves mood']
      },
      {
        type: 'meditation',
        duration: 5,
        description: 'Practice a quick mindfulness session',
        benefits: ['Reduces anxiety', 'Improves concentration', 'Enhances clarity']
      },
      {
        type: 'breathing',
        duration: 3,
        description: 'Practice deep breathing exercises',
        benefits: ['Reduces stress', 'Improves focus', 'Calms the mind']
      }
    ];

    // Select suggestion based on context
    let selectedSuggestion: BreakSuggestion;

    if (context.recentDistractions > 5) {
      selectedSuggestion = suggestions.find(s => s.type === 'meditation') || suggestions[0];
    } else if (context.focusStreak > 60) {
      selectedSuggestion = suggestions.find(s => s.type === 'walk') || suggestions[0];
    } else if (context.mood === 'tired') {
      selectedSuggestion = suggestions.find(s => s.type === 'stretch') || suggestions[0];
    } else {
      selectedSuggestion = suggestions.find(s => s.type === 'micro-break') || suggestions[0];
    }

    return selectedSuggestion;
  }

  async generateAchievementNudge(achievement: {
    type: string;
    value: number;
    previousBest?: number;
  }): Promise<Nudge> {
    const achievements: Record<string, { title: string; message: string }> = {
      focus_streak: {
        title: 'Focus Streak!',
        message: `Amazing! You've maintained focus for ${achievement.value} minutes straight. Keep up the great work!`
      },
      tasks_completed: {
        title: 'Task Master!',
        message: `You've completed ${achievement.value} tasks today. You're on fire!`
      },
      distraction_free: {
        title: 'Distraction Free!',
        message: `You've been distraction-free for ${achievement.value} minutes. Your focus is impressive!`
      },
      productivity_score: {
        title: 'High Score!',
        message: `Your productivity score is ${achievement.value}% today. Excellent work!`
      }
    };

    const achievementData = achievements[achievement.type] || {
      title: 'Achievement Unlocked!',
      message: `Great job! You've reached a new milestone: ${achievement.value}`
    };

    return {
      id: `achievement_${Date.now()}`,
      type: 'achievement',
      title: achievementData.title,
      message: achievementData.message,
      priority: 'high',
      category: 'achievement'
    };
  }

  async generateFocusNudge(context: NudgeContext): Promise<Nudge> {
    const focusNudges = [
      {
        title: 'Time to Focus',
        message: 'Ready to dive deep into your work? Let\'s make this session count!',
        action: 'Start Focus Session'
      },
      {
        title: 'Deep Work Mode',
        message: 'Switch to deep work mode and eliminate distractions for maximum productivity.',
        action: 'Enable Focus Mode'
      },
      {
        title: 'Task Time',
        message: 'Your scheduled task is ready. Time to tackle it with full attention!',
        action: 'Begin Task'
      }
    ];

    const selectedNudge = focusNudges[Math.floor(Math.random() * focusNudges.length)];

    return {
      id: `focus_${Date.now()}`,
      type: 'focus',
      title: selectedNudge.title,
      message: selectedNudge.message,
      action: selectedNudge.action,
      priority: 'medium',
      category: 'productivity'
    };
  }

  async generateWellnessNudge(context: NudgeContext): Promise<Nudge> {
    const wellnessNudges = [
      {
        title: 'Eye Care',
        message: 'Remember the 20-20-20 rule: Look at something 20 feet away for 20 seconds every 20 minutes.',
        action: 'Take Eye Break'
      },
      {
        title: 'Hydration',
        message: 'Stay hydrated! Take a sip of water to keep your energy levels up.',
        action: 'Drink Water'
      },
      {
        title: 'Posture Check',
        message: 'Check your posture. Sit up straight and adjust your screen height if needed.',
        action: 'Adjust Posture'
      }
    ];

    const selectedNudge = wellnessNudges[Math.floor(Math.random() * wellnessNudges.length)];

    return {
      id: `wellness_${Date.now()}`,
      type: 'reminder',
      title: selectedNudge.title,
      message: selectedNudge.message,
      action: selectedNudge.action,
      priority: 'low',
      category: 'wellness'
    };
  }

  private getFallbackNudge(context: NudgeContext): Nudge {
    const fallbackMessages = [
      'Stay focused and keep going!',
      'You\'re doing great! Keep up the momentum.',
      'Every minute of focus brings you closer to your goals.',
      'Your future self will thank you for staying focused now.'
    ];

    const message = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];

    return {
      id: `fallback_${Date.now()}`,
      type: 'motivation',
      title: 'Keep Going',
      message,
      priority: 'medium',
      category: 'productivity'
    };
  }

  async analyzeFocusSession(session: {
    duration: number;
    distractions: number;
    tasksCompleted: number;
    breaks: number;
  }): Promise<{
    score: number;
    feedback: string;
    suggestions: string[];
  }> {
    try {
      return await this.aiService.analyzeFocusSession(session);
    } catch (error) {
      console.error('Error analyzing focus session:', error);
      return {
        score: 70,
        feedback: 'Good effort on your focus session!',
        suggestions: ['Keep up the good work!']
      };
    }
  }

  shouldShowNudge(context: NudgeContext): boolean {
    // Don't show nudges if user is in a high focus state
    if (context.productivityLevel === 'high' && context.recentDistractions < 2) {
      return false;
    }

    // Show nudges if there are many recent distractions
    if (context.recentDistractions > 5) {
      return true;
    }

    // Show nudges if focus streak is getting long (encourage breaks)
    if (context.focusStreak > 45) {
      return true;
    }

    // Show nudges during low productivity periods
    if (context.productivityLevel === 'low') {
      return true;
    }

    return false;
  }

  getNudgePriority(context: NudgeContext): 'low' | 'medium' | 'high' {
    if (context.recentDistractions > 10) {
      return 'high';
    }
    if (context.focusStreak > 60) {
      return 'high';
    }
    if (context.productivityLevel === 'low') {
      return 'medium';
    }
    return 'low';
  }

  addNudge(nudge: Nudge): void {
    this.nudges.set(nudge.id, nudge);
  }

  removeNudge(nudgeId: string): void {
    this.nudges.delete(nudgeId);
  }

  getActiveNudges(): Nudge[] {
    const now = new Date();
    return Array.from(this.nudges.values()).filter(nudge => {
      if (nudge.expiresAt) {
        return new Date(nudge.expiresAt) > now;
      }
      return true;
    });
  }

  clearExpiredNudges(): void {
    const now = new Date();
    for (const [id, nudge] of this.nudges.entries()) {
      if (nudge.expiresAt && new Date(nudge.expiresAt) <= now) {
        this.nudges.delete(id);
      }
    }
  }
}

export default NudgingService; 