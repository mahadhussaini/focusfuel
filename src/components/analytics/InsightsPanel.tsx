import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, Button, Badge } from '@/components/ui';
import { useFocusFuelStore } from '@/store';

export interface Insight {
  id: string;
  type: 'positive' | 'improvement' | 'warning' | 'tip';
  title: string;
  description: string;
  action?: string;
  onAction?: () => void;
  priority: 'low' | 'medium' | 'high';
  category: 'focus' | 'distractions' | 'productivity' | 'wellness';
}

export interface InsightsPanelProps {
  className?: string;
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({ className }) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const store = useFocusFuelStore();

  useEffect(() => {
    generateInsights();
  }, [store.sessionHistory, store.distractionEvents, store.tasks]);

  const generateInsights = async () => {
    setIsLoading(true);
    
    try {
      // Analyze recent data to generate insights
      const recentSessions = store.sessionHistory.filter(
        session => Date.now() - new Date(session.startTime).getTime() < 7 * 24 * 60 * 60 * 1000 // Last 7 days
      );
      
      const recentDistractions = store.distractionEvents.filter(
        event => Date.now() - new Date(event.timestamp).getTime() < 7 * 24 * 60 * 60 * 1000
      );
      
      const completedTasks = store.tasks.filter(task => task.completed);
      
      const newInsights: Insight[] = [];
      
      // Focus time insights
      const totalFocusTime = recentSessions.reduce((sum, session) => sum + session.duration, 0);
      const avgSessionLength = recentSessions.length > 0 ? totalFocusTime / recentSessions.length : 0;
      
      if (totalFocusTime > 20 * 60) { // More than 20 hours
        newInsights.push({
          id: 'focus-achievement',
          type: 'positive',
          title: 'Excellent Focus Time!',
          description: `You've spent ${Math.floor(totalFocusTime / 60)} hours focusing this week. Keep up the great work!`,
          priority: 'high',
          category: 'focus'
        });
      } else if (totalFocusTime < 5 * 60) { // Less than 5 hours
        newInsights.push({
          id: 'focus-improvement',
          type: 'improvement',
          title: 'Increase Focus Time',
          description: 'You\'ve only spent a few hours focusing this week. Try starting with shorter sessions.',
          action: 'Start Focus Session',
          onAction: () => {
            // Trigger focus session
            console.log('Starting focus session');
          },
          priority: 'high',
          category: 'focus'
        });
      }
      
      // Session length insights
      if (avgSessionLength > 45) {
        newInsights.push({
          id: 'long-sessions',
          type: 'positive',
          title: 'Long Focus Sessions',
          description: `Your average session length is ${Math.floor(avgSessionLength)} minutes. You're building great focus stamina!`,
          priority: 'medium',
          category: 'focus'
        });
      } else if (avgSessionLength < 15) {
        newInsights.push({
          id: 'short-sessions',
          type: 'improvement',
          title: 'Short Focus Sessions',
          description: `Your average session is only ${Math.floor(avgSessionLength)} minutes. Try extending your sessions gradually.`,
          priority: 'medium',
          category: 'focus'
        });
      }
      
      // Distraction insights
      const distractionCount = recentDistractions.length;
      if (distractionCount === 0) {
        newInsights.push({
          id: 'no-distractions',
          type: 'positive',
          title: 'Distraction Free!',
          description: 'You haven\'t had any distractions this week. Amazing focus!',
          priority: 'high',
          category: 'distractions'
        });
      } else if (distractionCount > 10) {
        newInsights.push({
          id: 'many-distractions',
          type: 'warning',
          title: 'High Distraction Rate',
          description: `You've had ${distractionCount} distractions this week. Consider using focus mode more often.`,
          action: 'Enable Focus Mode',
          onAction: () => {
            // Enable focus mode
            console.log('Enabling focus mode');
          },
          priority: 'high',
          category: 'distractions'
        });
      }
      
      // Task completion insights
      const completionRate = store.tasks.length > 0 ? (completedTasks.length / store.tasks.length) * 100 : 0;
      
      if (completionRate > 80) {
        newInsights.push({
          id: 'high-completion',
          type: 'positive',
          title: 'High Task Completion',
          description: `You've completed ${completionRate.toFixed(0)}% of your tasks. Excellent productivity!`,
          priority: 'medium',
          category: 'productivity'
        });
      } else if (completionRate < 50) {
        newInsights.push({
          id: 'low-completion',
          type: 'improvement',
          title: 'Low Task Completion',
          description: `You've only completed ${completionRate.toFixed(0)}% of your tasks. Try breaking them into smaller pieces.`,
          priority: 'medium',
          category: 'productivity'
        });
      }
      
      // Productivity patterns
      const morningSessions = recentSessions.filter(session => {
        const hour = new Date(session.startTime).getHours();
        return hour >= 6 && hour <= 12;
      });
      
      if (morningSessions.length > recentSessions.length * 0.6) {
        newInsights.push({
          id: 'morning-person',
          type: 'tip',
          title: 'Morning Person',
          description: 'You\'re most productive in the mornings. Schedule important tasks early in the day.',
          priority: 'low',
          category: 'productivity'
        });
      }
      
      // Wellness insights
      const longSessions = recentSessions.filter(session => session.duration > 60);
      if (longSessions.length > 3) {
        newInsights.push({
          id: 'take-breaks',
          type: 'tip',
          title: 'Remember to Take Breaks',
          description: 'You\'ve had several long sessions. Make sure to take regular breaks to maintain energy.',
          priority: 'medium',
          category: 'wellness'
        });
      }
      
      // Streak insights
      const consecutiveDays = calculateConsecutiveDays(recentSessions);
      if (consecutiveDays >= 7) {
        newInsights.push({
          id: 'week-streak',
          type: 'positive',
          title: 'Week-Long Streak!',
          description: `You've been focusing for ${consecutiveDays} consecutive days. Amazing consistency!`,
          priority: 'high',
          category: 'focus'
        });
      }
      
      setInsights(newInsights);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateConsecutiveDays = (sessions: any[]) => {
    if (sessions.length === 0) return 0;
    
    const dates = [...new Set(sessions.map(session => 
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

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'improvement':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'tip':
        return (
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'focus':
        return 'bg-blue-100 text-blue-800';
      case 'distractions':
        return 'bg-red-100 text-red-800';
      case 'productivity':
        return 'bg-green-100 text-green-800';
      case 'wellness':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredInsights = selectedCategory === 'all' 
    ? insights 
    : insights.filter(insight => insight.category === selectedCategory);

  const categories = [
    { id: 'all', label: 'All', count: insights.length },
    { id: 'focus', label: 'Focus', count: insights.filter(i => i.category === 'focus').length },
    { id: 'distractions', label: 'Distractions', count: insights.filter(i => i.category === 'distractions').length },
    { id: 'productivity', label: 'Productivity', count: insights.filter(i => i.category === 'productivity').length },
    { id: 'wellness', label: 'Wellness', count: insights.filter(i => i.category === 'wellness').length }
  ];

  return (
    <Card className={className}>
      <CardHeader title="AI Insights" />
      <CardContent>
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.label} ({category.count})
            </button>
          ))}
        </div>

        {/* Insights List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredInsights.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <p>No insights available yet. Keep using FocusFuel to generate personalized insights!</p>
            </div>
          ) : (
            filteredInsights.map(insight => (
              <div
                key={insight.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-sm font-medium text-gray-900">{insight.title}</h4>
                      <Badge variant="outline" className={getPriorityColor(insight.priority)}>
                        {insight.priority}
                      </Badge>
                      <Badge variant="outline" className={getCategoryColor(insight.category)}>
                        {insight.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                    {insight.action && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={insight.onAction}
                      >
                        {insight.action}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Refresh Button */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button
            onClick={generateInsights}
            loading={isLoading}
            variant="ghost"
            size="sm"
            fullWidth
          >
            Refresh Insights
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InsightsPanel; 