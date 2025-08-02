import React, { useState } from 'react';
import { Card, CardContent, CardHeader, Button, Badge } from '@/components/ui';
import { StatsCard } from '@/components/dashboard';
import { UserProfile, AppSettings } from '@/components/settings';
import { useFocusFuelStore } from '@/store';

export interface SettingsDashboardProps {
  className?: string;
}

const SettingsDashboard: React.FC<SettingsDashboardProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'app' | 'data' | 'help'>('overview');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const store = useFocusFuelStore();

  const handleExportData = async () => {
    setIsExporting(true);
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create export data
      const exportData = {
        userProfile: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          preferences: {
            defaultFocusDuration: 25,
            defaultBreakDuration: 5,
            theme: 'auto'
          }
        },
        focusSessions: store.sessionHistory,
        tasks: store.tasks,
        projects: store.projects,
        distractionEvents: store.distractionEvents,
        contentSummaries: store.summaries,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      };
      
      // Create and download file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `focusfuel-export-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    
    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      
      // Validate import data
      if (importData.version && importData.focusSessions) {
        // Update store with imported data
        // store.importData(importData);
        console.log('Data imported successfully:', importData);
      } else {
        throw new Error('Invalid import file format');
      }
      
    } catch (error) {
      console.error('Error importing data:', error);
    } finally {
      setIsImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account, preferences, and data</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Focus Sessions"
          value={store.sessionHistory.length.toString()}
          subtitle="Total sessions"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          variant="default"
        />
        
        <StatsCard
          title="Tasks"
          value={store.tasks.length.toString()}
          subtitle="Total tasks"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          variant="success"
        />
        
        <StatsCard
          title="Projects"
          value={store.projects.length.toString()}
          subtitle="Active projects"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
          variant="warning"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Account & Profile" />
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setActiveTab('profile')}
            >
              Edit Profile
            </Button>
            <Button
              variant="outline"
              fullWidth
              onClick={() => setActiveTab('app')}
            >
              App Settings
            </Button>
            <Button
              variant="outline"
              fullWidth
            >
              Change Password
            </Button>
            <Button
              variant="outline"
              fullWidth
            >
              Two-Factor Authentication
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Data Management" />
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              fullWidth
              onClick={handleExportData}
              loading={isExporting}
            >
              Export Data
            </Button>
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isImporting}
              />
              <Button
                variant="outline"
                fullWidth
                loading={isImporting}
              >
                Import Data
              </Button>
            </div>
            <Button
              variant="outline"
              fullWidth
            >
              Clear All Data
            </Button>
            <Button
              variant="destructive"
              fullWidth
            >
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Settings Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('profile')}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Profile Settings</h3>
                <p className="text-sm text-gray-600">Manage your account information</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('app')}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">App Settings</h3>
                <p className="text-sm text-gray-600">Configure FocusFuel behavior</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('data')}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Data & Privacy</h3>
                <p className="text-sm text-gray-600">Manage your data and privacy</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('help')}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Help & Support</h3>
                <p className="text-sm text-gray-600">Get help and contact support</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                <p className="text-sm text-gray-600">Manage notification preferences</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Integrations</h3>
                <p className="text-sm text-gray-600">Connect with other services</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader title="Recent Activity" />
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Settings updated</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <Badge variant="success" className="text-xs">
                Updated
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Data exported</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                Exported
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderProfile = () => (
    <UserProfile
      onSave={(profile) => {
        console.log('Profile saved:', profile);
        setActiveTab('overview');
      }}
    />
  );

  const renderApp = () => (
    <AppSettings
      onSave={(settings) => {
        console.log('App settings saved:', settings);
        setActiveTab('overview');
      }}
    />
  );

  const renderData = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Data & Privacy</h2>
        <p className="text-gray-600">Manage your data and privacy settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Data Export" />
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Export all your FocusFuel data including focus sessions, tasks, projects, and settings.
            </p>
            <Button
              onClick={handleExportData}
              loading={isExporting}
              fullWidth
            >
              Export All Data
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Data Import" />
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Import previously exported FocusFuel data to restore your settings and data.
            </p>
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isImporting}
              />
              <Button
                variant="outline"
                fullWidth
                loading={isImporting}
              >
                Import Data
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Privacy Settings" />
          <CardContent className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                defaultChecked={true}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Share anonymous analytics</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                defaultChecked={true}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Share achievements on leaderboards</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                defaultChecked={false}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Make profile public</span>
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Data Management" />
          <CardContent className="space-y-3">
            <Button variant="outline" fullWidth>
              Clear Focus Sessions
            </Button>
            <Button variant="outline" fullWidth>
              Clear Tasks
            </Button>
            <Button variant="outline" fullWidth>
              Clear All Data
            </Button>
            <Button variant="destructive" fullWidth>
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderHelp = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Help & Support</h2>
        <p className="text-gray-600">Get help and contact support</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Documentation" />
          <CardContent className="space-y-3">
            <Button variant="outline" fullWidth>
              User Guide
            </Button>
            <Button variant="outline" fullWidth>
              API Documentation
            </Button>
            <Button variant="outline" fullWidth>
              Troubleshooting
            </Button>
            <Button variant="outline" fullWidth>
              FAQ
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Contact Support" />
          <CardContent className="space-y-3">
            <Button variant="outline" fullWidth>
              Email Support
            </Button>
            <Button variant="outline" fullWidth>
              Live Chat
            </Button>
            <Button variant="outline" fullWidth>
              Report Bug
            </Button>
            <Button variant="outline" fullWidth>
              Feature Request
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Community" />
          <CardContent className="space-y-3">
            <Button variant="outline" fullWidth>
              Discord Community
            </Button>
            <Button variant="outline" fullWidth>
              GitHub Issues
            </Button>
            <Button variant="outline" fullWidth>
              Reddit Community
            </Button>
            <Button variant="outline" fullWidth>
              Twitter
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="About FocusFuel" />
          <CardContent className="space-y-3">
            <div className="text-sm text-gray-600">
              <p><strong>Version:</strong> 1.0.0</p>
              <p><strong>Build:</strong> 2024.01.15</p>
              <p><strong>License:</strong> MIT</p>
            </div>
            <Button variant="outline" fullWidth>
              Check for Updates
            </Button>
            <Button variant="outline" fullWidth>
              Release Notes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'profile':
        return renderProfile();
      case 'app':
        return renderApp();
      case 'data':
        return renderData();
      case 'help':
        return renderHelp();
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
            { id: 'profile', label: 'Profile' },
            { id: 'app', label: 'App Settings' },
            { id: 'data', label: 'Data & Privacy' },
            { id: 'help', label: 'Help & Support' }
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

export default SettingsDashboard; 