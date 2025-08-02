import React, { useMemo } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader } from '@/components/ui';

export interface ProductivityData {
  date: string;
  focusTime: number; // in minutes
  distractions: number;
  productivityScore: number;
  tasksCompleted: number;
  sessions: number;
}

export interface ProductivityChartProps {
  data: ProductivityData[];
  type?: 'line' | 'area' | 'bar' | 'pie';
  timeRange?: 'day' | 'week' | 'month';
  metric?: 'focusTime' | 'distractions' | 'productivityScore' | 'tasksCompleted';
  className?: string;
}

const ProductivityChart: React.FC<ProductivityChartProps> = ({
  data,
  type = 'line',
  timeRange = 'week',
  metric = 'focusTime',
  className
}) => {
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      focusTimeHours: item.focusTime / 60,
      productivityScorePercent: item.productivityScore
    }));
  }, [data]);

  const getMetricConfig = () => {
    switch (metric) {
      case 'focusTime':
        return {
          dataKey: 'focusTimeHours',
          name: 'Focus Time',
          unit: 'hours',
          color: '#0ea5e9'
        };
      case 'distractions':
        return {
          dataKey: 'distractions',
          name: 'Distractions',
          unit: 'count',
          color: '#ef4444'
        };
      case 'productivityScore':
        return {
          dataKey: 'productivityScorePercent',
          name: 'Productivity Score',
          unit: '%',
          color: '#10b981'
        };
      case 'tasksCompleted':
        return {
          dataKey: 'tasksCompleted',
          name: 'Tasks Completed',
          unit: 'count',
          color: '#f59e0b'
        };
      default:
        return {
          dataKey: 'focusTimeHours',
          name: 'Focus Time',
          unit: 'hours',
          color: '#0ea5e9'
        };
    }
  };

  const config = getMetricConfig();

  const formatXAxis = (tickItem: string) => {
    if (timeRange === 'day') {
      return new Date(tickItem).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (timeRange === 'week') {
      return new Date(tickItem).toLocaleDateString([], { weekday: 'short' });
    } else {
      return new Date(tickItem).toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const formatTooltip = (value: any, name: string) => {
    if (metric === 'focusTime') {
      const hours = Math.floor(value);
      const minutes = Math.round((value - hours) * 60);
      return [`${hours}h ${minutes}m`, config.name];
    }
    return [value, config.name];
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxis}
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip
              formatter={formatTooltip}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Line
              type="monotone"
              dataKey={config.dataKey}
              stroke={config.color}
              strokeWidth={3}
              dot={{ fill: config.color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: config.color, strokeWidth: 2 }}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxis}
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip
              formatter={formatTooltip}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Area
              type="monotone"
              dataKey={config.dataKey}
              stroke={config.color}
              fill={config.color}
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxis}
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip
              formatter={formatTooltip}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar
              dataKey={config.dataKey}
              fill={config.color}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );

      case 'pie':
        const pieData = processedData.map(item => ({
          name: formatXAxis(item.date),
          value: item[config.dataKey as keyof typeof item] as number
        }));
        
        const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={formatTooltip}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
          </PieChart>
        );

      default:
        return null;
    }
  };

  const getChartTitle = () => {
    const metricNames = {
      focusTime: 'Focus Time',
      distractions: 'Distractions',
      productivityScore: 'Productivity Score',
      tasksCompleted: 'Tasks Completed'
    };

    const rangeNames = {
      day: 'Today',
      week: 'This Week',
      month: 'This Month'
    };

    return `${metricNames[metric]} - ${rangeNames[timeRange]}`;
  };

  return (
    <Card className={className}>
      <CardHeader title={getChartTitle()} />
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart() || <div>No data available</div>}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductivityChart; 