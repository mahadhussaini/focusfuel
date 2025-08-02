import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, Button, Badge } from '@/components/ui';
import { StatsCard } from '@/components/dashboard';
import { FocusRoom, Gamification } from '@/components/focus';
import { useFocusFuelStore } from '@/store';

export interface FocusDashboardProps {
  className?: string;
}

const FocusDashboard: React.FC<FocusDashboardProps> = ({ className }) => {
  const [activeView, setActiveView] = useState<'overview' | 'rooms' | 'gamification'>('overview');
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

  const store = useFocusFuelStore();

  const focusStats = useMemo(() => {
    const totalFocusTime = store.sessionHistory.reduce((sum, session) => sum + session.duration, 0);
    const totalSessions = store.sessionHistory.length;
    const completedTasks = store.tasks.filter(task => task.completed).length;
    const totalTasks = store.tasks.length;
    
    // Calculate XP and level
    const focusXp = Math.floor(totalFocusTime / 60) * 10;
    const sessionXp = totalSessions * 5;
    const taskXp = completedTasks * 3;
    const totalXp = focusXp + sessionXp + taskXp;
    const level = Math.floor(totalXp / 1000) + 1;
    
    // Calculate streaks
    const consecutiveDays = calculateConsecutiveDays();
    const currentStreak = calculateCurrentStreak();
    
    // Calculate productivity score
    const baseScore = 100;
    const distractionPenalty = store.distractionEvents.length * 2;
    const focusBonus = Math.min(totalFocusTime / 60, 40) * 2;
    const taskBonus = completedTasks * 5;
    const productivityScore = Math.max(0, Math.min(100, baseScore - distractionPenalty + focusBonus + taskBonus));
    
    return {
      totalFocusTime,
      totalSessions,
      completedTasks,
      totalTasks,
      totalXp,
      level,
      consecutiveDays,
      currentStreak,
      productivityScore,
      focusXp,
      sessionXp,
      taskXp
    };
  }, [store.sessionHistory, store.tasks, store.distractionEvents]);

  const recentSessions = useMemo(() => {
    return store.sessionHistory
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 5);
  }, [store.sessionHistory]);

  const upcomingTasks = useMemo(() => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return store.tasks
      .filter(task => 
        task.dueDate && 
        !task.completed && 
        new Date(task.dueDate) >= now && 
        new Date(task.dueDate) <= nextWeek
      )
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5);
  }, [store.tasks]);

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

  const calculateCurrentStreak = () => {
    if (store.sessionHistory.length === 0) return 0;
    
    const dates = [...new Set(store.sessionHistory.map(session =>
      new Date(session.startTime).toDateString()
    ))].sort();
    
    let currentStreak = 1;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    // Check if user has sessions today or yesterday
    const hasRecentSession = dates.includes(today) || dates.includes(yesterday);
    if (!hasRecentSession) return 0;
    
    for (let i = dates.length - 1; i > 0; i--) {
      const currDate = new Date(dates[i]);
      const prevDate = new Date(dates[i - 1]);
      const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    return currentStreak;
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getProductivityColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'destructive';
  };

  const handleJoinRoom = (roomId: string) => {
    setCurrentRoomId(roomId);
    setActiveView('rooms');
  };

  const handleLeaveRoom = () => {
    setCurrentRoomId(null);
    setActiveView('overview');
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Focus Dashboard</h1>
          <p className="text-gray-600">Track your focus sessions and productivity</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setActiveView('gamification')}
          >
            View Achievements
          </Button>
          <Button
            onClick={() => setActiveView('rooms')}
          >
            Join Focus Room
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Focus Time"
          value={formatTime(focusStats.totalFocusTime)}
          subtitle="All sessions"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          variant="default"
        />
        
        <StatsCard
          title="Productivity Score"
          value={`${focusStats.productivityScore}%`}
          subtitle="Overall performance"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          variant={getProductivityColor(focusStats.productivityScore) as any}
        />
        
        <StatsCard
          title="Current Streak"
          value={focusStats.currentStreak.toString()}
          subtitle="Consecutive days"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            </svg>
          }
          variant="warning"
        />
        
        <StatsCard
          title="Level"
          value={focusStats.level.toString()}
          subtitle={`${focusStats.totalXp} XP`}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
          variant="success"
        />
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Focus Progress" />
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Total Sessions</span>
                  <span className="text-gray-900 font-medium">{focusStats.totalSessions}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((focusStats.totalSessions / 100) * 100, 100)}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Task Completion</span>
                  <span className="text-gray-900 font-medium">
                    {focusStats.completedTasks}/{focusStats.totalTasks}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-success-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${focusStats.totalTasks > 0 ? (focusStats.completedTasks / focusStats.totalTasks) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Quick Actions" />
          <CardContent>
            <div className="space-y-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setActiveView('rooms')}
              >
                Join Focus Room
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => setActiveView('gamification')}
              >
                View Achievements
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  // Start focus session
                  console.log('Start focus session');
                }}
              >
                Start Focus Session
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  // View analytics
                  console.log('View analytics');
                }}
              >
                View Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Recent Sessions" />
          <CardContent>
            <div className="space-y-3">
              {recentSessions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No sessions yet</p>
              ) : (
                recentSessions.map(session => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {formatTime(session.duration)} Focus Session
                      </h4>
                      <p className="text-xs text-gray-500">
                        {new Date(session.startTime).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {session.duration >= 60 ? 'Long' : 'Short'}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Upcoming Tasks" />
          <CardContent>
            <div className="space-y-3">
              {upcomingTasks.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No upcoming tasks</p>
              ) : (
                upcomingTasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                      <p className="text-xs text-gray-500">
                        Due {new Date(task.dueDate!).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* XP Breakdown */}
      <Card>
        <CardHeader title="XP Breakdown" />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{focusStats.focusXp}</p>
              <p className="text-sm text-gray-600">Focus XP</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{focusStats.sessionXp}</p>
              <p className="text-sm text-gray-600">Session XP</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{focusStats.taskXp}</p>
              <p className="text-sm text-gray-600">Task XP</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{focusStats.totalXp}</p>
              <p className="text-sm text-gray-600">Total XP</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderRoomsView = () => (
    <FocusRoom
      roomId={currentRoomId || undefined}
      onJoin={handleJoinRoom}
      onLeave={handleLeaveRoom}
    />
  );

  const renderGamificationView = () => (
    <Gamification />
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return renderOverview();
      case 'rooms':
        return renderRoomsView();
      case 'gamification':
        return renderGamificationView();
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
            { id: 'rooms', label: 'Focus Rooms' },
            { id: 'gamification', label: 'Gamification' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm
                ${activeView === tab.id
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

export default FocusDashboard; 