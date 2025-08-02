import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/utils/cn';
import { Button, Card, CardContent, CardHeader, Progress } from '@/components/ui';

export interface FocusTimerProps {
  workDuration?: number; // in minutes
  breakDuration?: number; // in minutes
  longBreakDuration?: number; // in minutes
  sessionsBeforeLongBreak?: number;
  onSessionComplete?: (sessionType: 'work' | 'break') => void;
  className?: string;
}

type TimerState = 'idle' | 'work' | 'break' | 'longBreak' | 'paused';

const FocusTimer: React.FC<FocusTimerProps> = ({
  workDuration = 25,
  breakDuration = 5,
  longBreakDuration = 15,
  sessionsBeforeLongBreak = 4,
  onSessionComplete,
  className
}) => {
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [timeLeft, setTimeLeft] = useState(workDuration * 60);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const getCurrentDuration = useCallback(() => {
    switch (timerState) {
      case 'work':
        return workDuration * 60;
      case 'break':
        return breakDuration * 60;
      case 'longBreak':
        return longBreakDuration * 60;
      default:
        return workDuration * 60;
    }
  }, [workDuration, breakDuration, longBreakDuration, timerState]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    const totalDuration = getCurrentDuration();
    return ((totalDuration - timeLeft) / totalDuration) * 100;
  };

  const startTimer = () => {
    if (timerState === 'idle') {
      setTimerState('work');
      setTimeLeft(workDuration * 60);
    }
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    setTimerState('paused');
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimerState('idle');
    setTimeLeft(workDuration * 60);
    setSessionsCompleted(0);
  };

  const skipTimer = () => {
    if (timerState === 'work') {
      setSessionsCompleted(prev => prev + 1);
      const shouldTakeLongBreak = (sessionsCompleted + 1) % sessionsBeforeLongBreak === 0;
      setTimerState(shouldTakeLongBreak ? 'longBreak' : 'break');
      setTimeLeft(shouldTakeLongBreak ? longBreakDuration * 60 : breakDuration * 60);
    } else {
      setTimerState('work');
      setTimeLeft(workDuration * 60);
    }
    setIsRunning(true);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Timer completed
            if (timerState === 'work') {
              setSessionsCompleted(prev => prev + 1);
              const shouldTakeLongBreak = (sessionsCompleted + 1) % sessionsBeforeLongBreak === 0;
              const nextState = shouldTakeLongBreak ? 'longBreak' : 'break';
              const nextDuration = shouldTakeLongBreak ? longBreakDuration * 60 : breakDuration * 60;
              
              setTimerState(nextState);
              setTimeLeft(nextDuration);
              onSessionComplete?.('work');
            } else {
              setTimerState('work');
              setTimeLeft(workDuration * 60);
              onSessionComplete?.('break');
            }
            return timeLeft;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, timeLeft, timerState, sessionsCompleted, workDuration, breakDuration, longBreakDuration, sessionsBeforeLongBreak, onSessionComplete]);

  const getTimerLabel = (): string => {
    switch (timerState) {
      case 'work':
        return 'Focus Time';
      case 'break':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
      case 'paused':
        return 'Paused';
      default:
        return 'Ready to Focus';
    }
  };

  const getTimerColor = (): string => {
    switch (timerState) {
      case 'work':
        return 'bg-primary-600';
      case 'break':
      case 'longBreak':
        return 'bg-success-600';
      case 'paused':
        return 'bg-warning-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      <CardHeader
        title={getTimerLabel()}
        subtitle={`Session ${sessionsCompleted + 1}`}
      />
      <CardContent className="space-y-6">
        {/* Timer Display */}
        <div className="text-center">
          <div className="text-6xl font-mono font-bold text-gray-900 mb-4">
            {formatTime(timeLeft)}
          </div>
          <Progress
            value={getProgress()}
            variant={timerState === 'work' ? 'default' : 'success'}
            className="w-full"
          />
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-3">
          {timerState === 'idle' ? (
            <Button onClick={startTimer} size="lg" className="px-8">
              Start Focus Session
            </Button>
          ) : (
            <>
              {isRunning ? (
                <Button onClick={pauseTimer} variant="outline" size="lg">
                  Pause
                </Button>
              ) : (
                <Button onClick={startTimer} size="lg">
                  Resume
                </Button>
              )}
              <Button onClick={skipTimer} variant="ghost" size="lg">
                Skip
              </Button>
              <Button onClick={resetTimer} variant="ghost" size="lg">
                Reset
              </Button>
            </>
          )}
        </div>

        {/* Session Info */}
        <div className="text-center text-sm text-gray-500">
          <p>Completed sessions: {sessionsCompleted}</p>
          <p>Next long break after: {sessionsBeforeLongBreak - (sessionsCompleted % sessionsBeforeLongBreak)} sessions</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FocusTimer; 