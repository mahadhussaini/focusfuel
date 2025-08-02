import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, Button, Badge } from '@/components/ui';
import { StatsCard } from '@/components/dashboard';
import { ProductivityChart, Heatmap, InsightsPanel } from '@/components/analytics';
import { useFocusFuelStore } from '@/store';

export interface DashboardProps {
  className?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ className }) => {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [selectedMetric, setSelectedMetric] = useState<'focusTime' | 'distractions' | 'productivityScore' | 'tasksCompleted'>('focusTime');
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar' | 'pie'>('line');

  const store = useFocusFuelStore();

  // Generate productivity data based on time range
  const productivityData = useMemo(() => {
    const now = new Date();
    const data: any[] = [];
    
    let days = 7;
    if (timeRange === 'day') days = 1;
    else if (timeRange === 'month') days = 30;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      // Filter sessions for this date
      const daySessions = store.sessionHistory.filter(session => {
        const sessionDate = new Date(session.startTime).toISOString().split('T')[0];
        return sessionDate === dateString;
      });
      
      // Filter distractions for this date
      const dayDistractions = store.distractionEvents.filter(event => {
        const eventDate = new Date(event.timestamp).toISOString().split('T')[0];
        return eventDate === dateString;
      });
      
      // Filter tasks for this date
      const dayTasks = store.tasks.filter(task => {
        if (!task.completedAt) return false;
        const taskDate = new Date(task.completedAt).toISOString().split('T')[0];
        return taskDate === dateString;
      });
      
      const totalFocusTime = daySessions.reduce((sum, session) => sum + session.duration, 0);
      const distractionCount = dayDistractions.length;
      const tasksCompleted = dayTasks.length;
      
      // Calculate productivity score (0-100)
      const baseScore = 100;
      const distractionPenalty = distractionCount * 5;
      const focusBonus = Math.min(totalFocusTime / 60, 8) * 5; // Max 8 hours bonus
      const taskBonus = tasksCompleted * 3;
      const productivityScore = Math.max(0, Math.min(100, baseScore - distractionPenalty + focusBonus + taskBonus));
      
      data.push({
        date: dateString,
        focusTime: totalFocusTime,
        distractions: distractionCount,
        productivityScore: Math.round(productivityScore),
        tasksCompleted,
        sessions: daySessions.length
      });
    }
    
    return data;
  }, [store.sessionHistory, store.distractionEvents, store.tasks, timeRange]);

  // Generate heatmap data
  const heatmapData = useMemo(() => {
    const data: any[] = [];
    
    // Group sessions by hour and day of week
    const sessionsByHourDay: { [key: string]: number } = {};
    
    store.sessionHistory.forEach(session => {
      const sessionDate = new Date(session.startTime);
      const day = sessionDate.getDay();
      const hour = sessionDate.getHours();
      const key = `${day}-${hour}`;
      
      if (!sessionsByHourDay[key]) {
        sessionsByHourDay[key] = 0;
      }
      sessionsByHourDay[key] += session.duration;
    });
    
    // Convert to heatmap format
    Object.keys(sessionsByHourDay).forEach(key => {
      const [day, hour] = key.split('-').map(Number);
      data.push({
        hour,
        day,
        value: sessionsByHourDay[key],
        count: 1
      });
    });
    
    return data;
  }, [store.sessionHistory]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalFocusTime = store.sessionHistory.reduce((sum, session) => sum + session.duration, 0);
    const totalDistractions = store.distractionEvents.length;
    const completedTasks = store.tasks.filter(task => task.completed).length;
    const totalTasks = store.tasks.length;
    const avgSessionLength = store.sessionHistory.length > 0
      ? totalFocusTime / store.sessionHistory.length
      : 0;
    
    // Calculate productivity score
    const baseScore = 100;
    const distractionPenalty = totalDistractions * 2;
    const focusBonus = Math.min(totalFocusTime / 60, 40) * 2; // Max 40 hours bonus
    const taskBonus = completedTasks * 5;
    const productivityScore = Math.max(0, Math.min(100, baseScore - distractionPenalty + focusBonus + taskBonus));
    
    return {
      totalFocusTime: Math.floor(totalFocusTime / 60), // Convert to hours
      totalDistractions,
      completedTasks,
      totalTasks,
      avgSessionLength: Math.floor(avgSessionLength),
      productivityScore: Math.round(productivityScore),
      sessionCount: store.sessionHistory.length
    };
  }, [store.sessionHistory, store.distractionEvents, store.tasks]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getProductivityColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'destructive';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your productivity and focus patterns</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTimeRange('day')}
            className={timeRange === 'day' ? 'bg-primary-100 text-primary-700' : ''}
          >
            Day
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTimeRange('week')}
            className={timeRange === 'week' ? 'bg-primary-100 text-primary-700' : ''}
          >
            Week
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTimeRange('month')}
            className={timeRange === 'month' ? 'bg-primary-100 text-primary-700' : ''}
          >
            Month
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Focus Time"
          value={formatTime(summaryStats.totalFocusTime * 60)}
          subtitle="This period"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          variant="default"
        />
        
        <StatsCard
          title="Productivity Score"
          value={`${summaryStats.productivityScore}%`}
          subtitle="Overall performance"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          variant={getProductivityColor(summaryStats.productivityScore) as any}
        />
        
        <StatsCard
          title="Tasks Completed"
          value={`${summaryStats.completedTasks}/${summaryStats.totalTasks}`}
          subtitle="Task completion rate"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          variant="success"
        />
        
        <StatsCard
          title="Focus Sessions"
          value={summaryStats.sessionCount.toString()}
          subtitle="Total sessions"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
          variant="default"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity Chart */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Productivity Trends</h3>
            <div className="flex items-center space-x-2">
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="focusTime">Focus Time</option>
                <option value="distractions">Distractions</option>
                <option value="productivityScore">Productivity Score</option>
                <option value="tasksCompleted">Tasks Completed</option>
              </select>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="line">Line</option>
                <option value="area">Area</option>
                <option value="bar">Bar</option>
                <option value="pie">Pie</option>
              </select>
            </div>
          </div>
          <ProductivityChart
            data={productivityData}
            type={chartType}
            timeRange={timeRange}
            metric={selectedMetric}
          />
        </div>

        {/* Heatmap */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Activity Heatmap</h3>
            <Badge variant="outline">Focus Time Distribution</Badge>
          </div>
          <Heatmap data={heatmapData} metric="focusTime" />
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader title="Session Statistics" />
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Average Session Length</span>
              <span className="text-sm font-medium">{formatTime(summaryStats.avgSessionLength)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Longest Session</span>
              <span className="text-sm font-medium">
                {store.sessionHistory.length > 0 
                  ? formatTime(Math.max(...store.sessionHistory.map(s => s.duration)))
                  : '0m'
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Sessions</span>
              <span className="text-sm font-medium">{summaryStats.sessionCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Distraction Analysis" />
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Distractions</span>
              <span className="text-sm font-medium">{summaryStats.totalDistractions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Distraction Rate</span>
              <span className="text-sm font-medium">
                {summaryStats.sessionCount > 0 
                  ? `${(summaryStats.totalDistractions / summaryStats.sessionCount).toFixed(1)} per session`
                  : '0 per session'
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Focus Ratio</span>
              <span className="text-sm font-medium">
                {summaryStats.totalFocusTime > 0 
                  ? `${((summaryStats.totalFocusTime * 60) / (summaryStats.totalFocusTime * 60 + summaryStats.totalDistractions * 5)).toFixed(1)}%`
                  : '0%'
                }
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Task Performance" />
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Completion Rate</span>
              <span className="text-sm font-medium">
                {summaryStats.totalTasks > 0 
                  ? `${((summaryStats.completedTasks / summaryStats.totalTasks) * 100).toFixed(0)}%`
                  : '0%'
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Tasks Completed</span>
              <span className="text-sm font-medium">{summaryStats.completedTasks}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Pending Tasks</span>
              <span className="text-sm font-medium">{summaryStats.totalTasks - summaryStats.completedTasks}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InsightsPanel />
        
        <Card>
          <CardHeader title="Quick Actions" />
          <CardContent className="space-y-3">
            <Button variant="outline" fullWidth>
              Export Data
            </Button>
            <Button variant="outline" fullWidth>
              Share Report
            </Button>
            <Button variant="outline" fullWidth>
              Set Goals
            </Button>
            <Button variant="outline" fullWidth>
              View History
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard; 