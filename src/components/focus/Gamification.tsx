import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, Button, Badge, Progress } from '@/components/ui';
import { StatsCard } from '@/components/dashboard';
import { useFocusFuelStore } from '@/store';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'focus' | 'streak' | 'social' | 'milestone' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
  xpReward: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'daily' | 'weekly' | 'monthly' | 'special';
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar?: string;
  xp: number;
  level: number;
  focusTime: number;
  achievements: number;
  rank: number;
}

export interface GamificationProps {
  className?: string;
}

const Gamification: React.FC<GamificationProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'badges' | 'leaderboard'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const store = useFocusFuelStore();

  // Mock gamification data
  const userStats = useMemo(() => {
    const totalFocusTime = store.sessionHistory.reduce((sum, session) => sum + session.duration, 0);
    const totalSessions = store.sessionHistory.length;
    const completedTasks = store.tasks.filter(task => task.completed).length;
    const totalTasks = store.tasks.length;
    
    // Calculate XP based on various activities
    const focusXp = Math.floor(totalFocusTime / 60) * 10; // 10 XP per hour
    const sessionXp = totalSessions * 5; // 5 XP per session
    const taskXp = completedTasks * 3; // 3 XP per completed task
    const streakXp = calculateStreakBonus();
    
    const totalXp = focusXp + sessionXp + taskXp + streakXp;
    const level = Math.floor(totalXp / 1000) + 1; // Level up every 1000 XP
    const levelProgress = totalXp % 1000;
    
    return {
      totalXp,
      level,
      levelProgress,
      totalFocusTime,
      totalSessions,
      completedTasks,
      totalTasks,
      focusXp,
      sessionXp,
      taskXp,
      streakXp
    };
  }, [store.sessionHistory, store.tasks]);

  const achievements = useMemo(() => [
    {
      id: 'first_session',
      name: 'First Steps',
      description: 'Complete your first focus session',
      icon: '🎯',
      category: 'focus' as const,
      rarity: 'common' as const,
      unlocked: store.sessionHistory.length > 0,
      unlockedAt: store.sessionHistory.length > 0 ? store.sessionHistory[0].startTime : undefined,
      xpReward: 50
    },
    {
      id: 'hour_focus',
      name: 'Hour Warrior',
      description: 'Complete a 1-hour focus session',
      icon: '⏰',
      category: 'focus' as const,
      rarity: 'common' as const,
      unlocked: store.sessionHistory.some(s => s.duration >= 60),
      xpReward: 100
    },
    {
      id: 'week_streak',
      name: 'Week Warrior',
      description: 'Focus for 7 consecutive days',
      icon: '🔥',
      category: 'streak' as const,
      rarity: 'rare' as const,
      unlocked: calculateConsecutiveDays() >= 7,
      progress: Math.min(calculateConsecutiveDays(), 7),
      maxProgress: 7,
      xpReward: 200
    },
    {
      id: 'task_master',
      name: 'Task Master',
      description: 'Complete 50 tasks',
      icon: '✅',
      category: 'milestone' as const,
      rarity: 'epic' as const,
      unlocked: store.tasks.filter(t => t.completed).length >= 50,
      progress: store.tasks.filter(t => t.completed).length,
      maxProgress: 50,
      xpReward: 500
    },
    {
      id: 'social_butterfly',
      name: 'Social Butterfly',
      description: 'Join 5 focus rooms',
      icon: '🦋',
      category: 'social' as const,
      rarity: 'rare' as const,
      unlocked: false, // Mock data
      progress: 2,
      maxProgress: 5,
      xpReward: 150
    },
    {
      id: 'early_bird',
      name: 'Early Bird',
      description: 'Complete 5 focus sessions before 9 AM',
      icon: '🌅',
      category: 'special' as const,
      rarity: 'epic' as const,
      unlocked: false, // Mock data
      progress: 3,
      maxProgress: 5,
      xpReward: 300
    }
  ], [store.sessionHistory, store.tasks]);

  const badges = useMemo(() => [
    {
      id: 'daily_focus',
      name: 'Daily Focus',
      description: 'Complete a focus session today',
      icon: '📅',
      category: 'daily' as const,
      unlocked: hasFocusSessionToday(),
      unlockedAt: hasFocusSessionToday() ? new Date().toISOString() : undefined
    },
    {
      id: 'weekly_streak',
      name: 'Weekly Streak',
      description: 'Focus for 5 days this week',
      icon: '📈',
      category: 'weekly' as const,
      unlocked: getWeeklyFocusDays() >= 5,
      progress: getWeeklyFocusDays(),
      maxProgress: 5
    },
    {
      id: 'monthly_master',
      name: 'Monthly Master',
      description: 'Complete 30 focus sessions this month',
      icon: '🏆',
      category: 'monthly' as const,
      unlocked: getMonthlySessions() >= 30,
      progress: getMonthlySessions(),
      maxProgress: 30
    }
  ], [store.sessionHistory]);

  const leaderboard = useMemo(() => [
    {
      id: 'user_1',
      name: 'Alex Chen',
      xp: 15420,
      level: 15,
      focusTime: 120,
      achievements: 12,
      rank: 1
    },
    {
      id: 'user_2',
      name: 'Sarah Johnson',
      xp: 12850,
      level: 12,
      focusTime: 95,
      achievements: 10,
      rank: 2
    },
    {
      id: 'user_3',
      name: 'Mike Davis',
      xp: 11200,
      level: 11,
      focusTime: 88,
      achievements: 8,
      rank: 3
    },
    {
      id: 'current_user',
      name: 'You',
      xp: userStats.totalXp,
      level: userStats.level,
      focusTime: Math.floor(userStats.totalFocusTime / 60),
      achievements: achievements.filter(a => a.unlocked).length,
      rank: 4
    }
  ], [userStats, achievements]);

  const calculateStreakBonus = () => {
    const consecutiveDays = calculateConsecutiveDays();
    return consecutiveDays * 10; // 10 XP per consecutive day
  };

  const calculateConsecutiveDays = () => {
    if (store.sessionHistory.length === 0) return 0;
    
    const dates = [...new Set(store.sessionHistory.map(session =>
      new Date(session.startTime).toDateString()
    ))].sort();
    
    let maxStreak = 1;
    let currentStreak = 1;
    
    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1]);
      const currDate = new Date(dates[i]);
      const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (diffDays === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }
    
    return maxStreak;
  };

  const hasFocusSessionToday = () => {
    const today = new Date().toDateString();
    return store.sessionHistory.some(session => 
      new Date(session.startTime).toDateString() === today
    );
  };

  const getWeeklyFocusDays = () => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const uniqueDays = new Set();
    
    store.sessionHistory.forEach(session => {
      const sessionDate = new Date(session.startTime);
      if (sessionDate >= weekAgo) {
        uniqueDays.add(sessionDate.toDateString());
      }
    });
    
    return uniqueDays.size;
  };

  const getMonthlySessions = () => {
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return store.sessionHistory.filter(session => 
      new Date(session.startTime) >= monthAgo
    ).length;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-100 text-gray-800';
      case 'rare':
        return 'bg-blue-100 text-blue-800';
      case 'epic':
        return 'bg-purple-100 text-purple-800';
      case 'legendary':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'focus':
        return 'bg-green-100 text-green-800';
      case 'streak':
        return 'bg-orange-100 text-orange-800';
      case 'social':
        return 'bg-blue-100 text-blue-800';
      case 'milestone':
        return 'bg-purple-100 text-purple-800';
      case 'special':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Level and XP */}
      <Card>
        <CardHeader title="Your Progress" />
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">{userStats.level}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Level {userStats.level}</h3>
              <p className="text-gray-600">{userStats.totalXp} XP</p>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Progress to Level {userStats.level + 1}</span>
                <span className="text-gray-900 font-medium">{userStats.levelProgress}/1000 XP</span>
              </div>
              <Progress
                value={(userStats.levelProgress / 1000) * 100}
                variant="default"
                className="h-3"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* XP Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Focus XP"
          value={userStats.focusXp.toString()}
          subtitle="From focus time"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          variant="default"
        />
        
        <StatsCard
          title="Session XP"
          value={userStats.sessionXp.toString()}
          subtitle="From sessions"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
          variant="default"
        />
        
        <StatsCard
          title="Task XP"
          value={userStats.taskXp.toString()}
          subtitle="From completed tasks"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          variant="success"
        />
        
        <StatsCard
          title="Streak XP"
          value={userStats.streakXp.toString()}
          subtitle="From streaks"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            </svg>
          }
          variant="warning"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{userStats.totalSessions}</p>
              <p className="text-sm text-gray-600">Total Sessions</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{formatTime(userStats.totalFocusTime)}</p>
              <p className="text-sm text-gray-600">Total Focus Time</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{achievements.filter(a => a.unlocked).length}</p>
              <p className="text-sm text-gray-600">Achievements Unlocked</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Achievements</h2>
          <p className="text-gray-600">Unlock achievements by completing various activities</p>
        </div>
        
        <div className="flex space-x-2">
          {['all', 'focus', 'streak', 'social', 'milestone', 'special'].map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements
          .filter(achievement => selectedCategory === 'all' || achievement.category === selectedCategory)
          .map(achievement => (
            <Card
              key={achievement.id}
              className={`transition-all duration-200 ${
                achievement.unlocked ? 'ring-2 ring-green-500' : 'opacity-75'
              }`}
            >
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-4xl mb-3">{achievement.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-1">{achievement.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                  
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <Badge variant="outline" className={getRarityColor(achievement.rarity)}>
                      {achievement.rarity}
                    </Badge>
                    <Badge variant="outline" className={getCategoryColor(achievement.category)}>
                      {achievement.category}
                    </Badge>
                  </div>
                  
                  {achievement.progress !== undefined && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{achievement.progress}/{achievement.maxProgress}</span>
                      </div>
                      <Progress
                        value={(achievement.progress / achievement.maxProgress!) * 100}
                        variant="default"
                        className="h-2"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">+{achievement.xpReward} XP</span>
                    {achievement.unlocked && (
                      <Badge variant="success" className="text-xs">
                        Unlocked
                      </Badge>
                    )}
                  </div>
                  
                  {achievement.unlockedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );

  const renderBadges = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Badges</h2>
        <p className="text-gray-600">Earn badges for consistent productivity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map(badge => (
          <Card
            key={badge.id}
            className={`transition-all duration-200 ${
              badge.unlocked ? 'ring-2 ring-green-500' : 'opacity-75'
            }`}
          >
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-4xl mb-3">{badge.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{badge.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
                
                <Badge variant="outline" className={getCategoryColor(badge.category)}>
                  {badge.category}
                </Badge>
                
                {badge.progress !== undefined && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{badge.progress}/{badge.maxProgress}</span>
                    </div>
                    <Progress
                      value={(badge.progress / badge.maxProgress!) * 100}
                      variant="default"
                      className="h-2"
                    />
                  </div>
                )}
                
                {badge.unlocked && (
                  <Badge variant="success" className="mt-2">
                    Unlocked
                  </Badge>
                )}
                
                {badge.unlockedAt && (
                  <p className="text-xs text-gray-500 mt-2">
                    Unlocked {new Date(badge.unlockedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderLeaderboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Leaderboard</h2>
        <p className="text-gray-600">See how you rank against other users</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="space-y-2">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.id}
                className={`flex items-center justify-between p-4 ${
                  entry.id === 'current_user' ? 'bg-primary-50 border-l-4 border-primary-500' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 font-bold text-gray-700">
                    {entry.rank}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {entry.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{entry.name}</h4>
                      <p className="text-sm text-gray-600">Level {entry.level}</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-medium text-gray-900">{entry.xp.toLocaleString()} XP</p>
                  <p className="text-sm text-gray-600">
                    {formatTime(entry.focusTime)} • {entry.achievements} achievements
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'achievements':
        return renderAchievements();
      case 'badges':
        return renderBadges();
      case 'leaderboard':
        return renderLeaderboard();
      default:
        return renderOverview();
    }
  };

  return (
    <div className={className}>
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'achievements', label: 'Achievements' },
            { id: 'badges', label: 'Badges' },
            { id: 'leaderboard', label: 'Leaderboard' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      {renderContent()}
    </div>
  );
};

export default Gamification; 