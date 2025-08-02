import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Button, Card, CardContent, CardHeader, Progress, Badge } from '@/components/ui';
import { useFocusFuelStore } from '@/store';

const Popup: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSession, setActiveSession] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);

  const store = useFocusFuelStore();

  useEffect(() => {
    // Get current tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        setCurrentTab(tabs[0]);
      }
    });

    // Check if there's an active focus session
    const checkActiveSession = () => {
      chrome.storage.local.get(['activeSession'], (result) => {
        if (result.activeSession) {
          setActiveSession(true);
          const startTime = result.activeSession.startTime;
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          setSessionTime(elapsed);
        }
      });
    };

    checkActiveSession();
    const interval = setInterval(checkActiveSession, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startFocusSession = async () => {
    setIsLoading(true);
    try {
      const sessionData = {
        startTime: Date.now(),
        tabId: currentTab?.id,
        url: currentTab?.url
      };

      await chrome.storage.local.set({ activeSession: sessionData });
      setActiveSession(true);
      setSessionTime(0);

      // Send message to background script
      chrome.runtime.sendMessage({
        type: 'START_FOCUS_SESSION',
        data: sessionData
      });
    } catch (error) {
      console.error('Error starting focus session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stopFocusSession = async () => {
    try {
      await chrome.storage.local.remove(['activeSession']);
      setActiveSession(false);
      setSessionTime(0);

      // Send message to background script
      chrome.runtime.sendMessage({
        type: 'STOP_FOCUS_SESSION'
      });
    } catch (error) {
      console.error('Error stopping focus session:', error);
    }
  };

  const summarizeCurrentPage = async () => {
    setIsLoading(true);
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'REQUEST_SUMMARY',
        content: 'Current page content',
        options: { length: 'medium' }
      });

      if (response.success) {
        // Open summary in new tab
        chrome.tabs.create({
          url: `chrome-extension://${chrome.runtime.id}/summary.html?data=${encodeURIComponent(JSON.stringify(response.summary))}`
        });
      }
    } catch (error) {
      console.error('Error summarizing page:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openDashboard = () => {
    chrome.tabs.create({
      url: `chrome-extension://${chrome.runtime.id}/dashboard.html`
    });
  };

  const openSettings = () => {
    chrome.tabs.create({
      url: `chrome-extension://${chrome.runtime.id}/options.html`
    });
  };

  const getProductivityScore = (): number => {
    // Calculate productivity score based on recent activity
    const recentDistractions = store.distractionEvents.filter(
      event => Date.now() - new Date(event.timestamp).getTime() < 3600000 // Last hour
    ).length;

    const baseScore = 100;
    const distractionPenalty = recentDistractions * 10;
    return Math.max(0, baseScore - distractionPenalty);
  };

  const productivityScore = getProductivityScore();

  return (
    <div className="w-80 p-4 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-gray-900">FocusFuel</h1>
        </div>
        <Badge variant={productivityScore > 70 ? 'success' : productivityScore > 40 ? 'warning' : 'destructive'}>
          {productivityScore}%
        </Badge>
      </div>

      {/* Current Tab Info */}
      {currentTab && (
        <Card className="mb-4">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-200 rounded flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {currentTab.title}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {currentTab.url}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Focus Session */}
      {activeSession ? (
        <Card className="mb-4">
          <CardHeader title="Focus Session Active" />
          <CardContent className="p-3">
            <div className="text-center mb-3">
              <div className="text-2xl font-mono font-bold text-primary-600">
                {formatTime(sessionTime)}
              </div>
              <p className="text-xs text-gray-500">Session Time</p>
            </div>
            <Button
              onClick={stopFocusSession}
              variant="destructive"
              size="sm"
              fullWidth
            >
              End Session
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-4">
          <CardContent className="p-3">
            <Button
              onClick={startFocusSession}
              loading={isLoading}
              size="sm"
              fullWidth
            >
              Start Focus Session
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="space-y-2 mb-4">
        <Button
          onClick={summarizeCurrentPage}
          loading={isLoading}
          variant="outline"
          size="sm"
          fullWidth
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        >
          Summarize Page
        </Button>

        <Button
          onClick={openDashboard}
          variant="ghost"
          size="sm"
          fullWidth
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        >
          Open Dashboard
        </Button>

        <Button
          onClick={openSettings}
          variant="ghost"
          size="sm"
          fullWidth
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        >
          Settings
        </Button>
      </div>

      {/* Stats Preview */}
      <Card>
        <CardHeader title="Today's Stats" />
        <CardContent className="p-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Focus Time</span>
              <span className="font-medium">{Math.floor(store.userStats.totalFocusTime / 60)}m</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Distractions</span>
              <span className="font-medium">{store.distractionEvents.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tasks Completed</span>
              <span className="font-medium">{store.tasks.filter(task => task.completed).length}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Render the popup
ReactDOM.render(<Popup />, document.getElementById('root')); 