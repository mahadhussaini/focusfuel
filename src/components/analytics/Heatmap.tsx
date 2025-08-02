import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui';

export interface HeatmapData {
  hour: number;
  day: number; // 0 = Sunday, 1 = Monday, etc.
  value: number;
  count: number;
}

export interface HeatmapProps {
  data: HeatmapData[];
  metric?: 'focusTime' | 'distractions' | 'productivityScore';
  className?: string;
}

const Heatmap: React.FC<HeatmapProps> = ({
  data,
  metric = 'focusTime',
  className
}) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const processedData = useMemo(() => {
    const heatmap = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));
    
    data.forEach(item => {
      heatmap[item.day][item.hour] = item.value;
    });
    
    return heatmap;
  }, [data]);

  const getMaxValue = () => {
    return Math.max(...data.map(item => item.value));
  };

  const getColor = (value: number) => {
    const maxValue = getMaxValue();
    const intensity = value / maxValue;
    
    switch (metric) {
      case 'focusTime':
        return `rgba(14, 165, 233, ${intensity})`;
      case 'distractions':
        return `rgba(239, 68, 68, ${intensity})`;
      case 'productivityScore':
        return `rgba(16, 185, 129, ${intensity})`;
      default:
        return `rgba(14, 165, 233, ${intensity})`;
    }
  };

  const getTooltipContent = (day: number, hour: number, value: number) => {
    const dayName = days[day];
    const timeString = `${hour.toString().padStart(2, '0')}:00`;
    
    let metricName = '';
    let unit = '';
    
    switch (metric) {
      case 'focusTime':
        metricName = 'Focus Time';
        const hours = Math.floor(value / 60);
        const minutes = value % 60;
        unit = `${hours}h ${minutes}m`;
        break;
      case 'distractions':
        metricName = 'Distractions';
        unit = `${value} events`;
        break;
      case 'productivityScore':
        metricName = 'Productivity Score';
        unit = `${value}%`;
        break;
      default:
        metricName = 'Value';
        unit = value.toString();
    }
    
    return `${dayName} ${timeString}: ${unit}`;
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour > 12) return `${hour - 12} PM`;
    return `${hour} AM`;
  };

  return (
    <Card className={className}>
      <CardHeader title={`${metric === 'focusTime' ? 'Focus Time' : metric === 'distractions' ? 'Distractions' : 'Productivity Score'} Heatmap`} />
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-max">
            {/* Header with hours */}
            <div className="flex">
              <div className="w-16 h-8"></div> {/* Empty corner */}
              {hours.map(hour => (
                <div
                  key={hour}
                  className="w-8 h-8 flex items-center justify-center text-xs text-gray-500 font-medium"
                >
                  {hour % 6 === 0 ? formatHour(hour) : ''}
                </div>
              ))}
            </div>
            
            {/* Heatmap grid */}
            <div className="flex">
              {/* Day labels */}
              <div className="w-16 flex flex-col">
                {days.map((day, index) => (
                  <div
                    key={day}
                    className="h-8 flex items-center justify-center text-xs text-gray-500 font-medium"
                  >
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Heatmap cells */}
              <div className="flex">
                {hours.map(hour => (
                  <div key={hour} className="flex flex-col">
                    {days.map((day, dayIndex) => {
                      const value = processedData[dayIndex][hour];
                      const hasValue = value > 0;
                      
                      return (
                        <div
                          key={`${day}-${hour}`}
                          className={`
                            w-8 h-8 border border-gray-100 cursor-pointer transition-all duration-200
                            ${hasValue ? 'hover:scale-110' : ''}
                          `}
                          style={{
                            backgroundColor: hasValue ? getColor(value) : '#f9fafb'
                          }}
                          title={hasValue ? getTooltipContent(dayIndex, hour, value) : `${day} ${formatHour(hour)}: No data`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Legend */}
            <div className="mt-4 flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-100 rounded"></div>
                <span className="text-xs text-gray-500">No data</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: getColor(getMaxValue() * 0.25) }}></div>
                <span className="text-xs text-gray-500">Low</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: getColor(getMaxValue() * 0.5) }}></div>
                <span className="text-xs text-gray-500">Medium</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: getColor(getMaxValue() * 0.75) }}></div>
                <span className="text-xs text-gray-500">High</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: getColor(getMaxValue()) }}></div>
                <span className="text-xs text-gray-500">Very High</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Heatmap; 