import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Button, Card, CardContent, CardHeader, Input, Badge } from '@/components/ui';
import { useFocusFuelStore } from '@/store';

const Options: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [blacklist, setBlacklist] = useState<string[]>([]);
  const [whitelist, setWhitelist] = useState<string[]>([]);
  const [newSite, setNewSite] = useState('');
  const [listType, setListType] = useState<'blacklist' | 'whitelist'>('blacklist');

  const store = useFocusFuelStore();

  useEffect(() => {
    // Load settings from storage
    chrome.storage.local.get(['apiKey', 'blacklist', 'whitelist'], (result) => {
      if (result.apiKey) setApiKey(result.apiKey);
      if (result.blacklist) setBlacklist(result.blacklist);
      if (result.whitelist) setWhitelist(result.whitelist);
    });
  }, []);

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      await chrome.storage.local.set({
        apiKey,
        blacklist,
        whitelist
      });

      // Update store preferences
      store.updatePreferences({
        blocking: {
          ...store.preferences.blocking,
          blacklist,
          whitelist
        },
        ai: {
          ...store.preferences.ai,
          apiKey
        }
      });

      // Show success message
      showNotification('Settings saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showNotification('Error saving settings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  const addSiteToList = () => {
    if (!newSite.trim()) return;

    const site = newSite.trim().toLowerCase();
    if (listType === 'blacklist') {
      if (!blacklist.includes(site)) {
        setBlacklist([...blacklist, site]);
      }
    } else {
      if (!whitelist.includes(site)) {
        setWhitelist([...whitelist, site]);
      }
    }
    setNewSite('');
  };

  const removeSiteFromList = (site: string, list: string[], setList: (list: string[]) => void) => {
    setList(list.filter(s => s !== site));
  };

  const exportData = async () => {
    try {
      const data = await chrome.storage.local.get(null);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'focusfuel-data.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      showNotification('Error exporting data', 'error');
    }
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        await chrome.storage.local.set(data);
        
        // Reload settings
        const result = await chrome.storage.local.get(['apiKey', 'blacklist', 'whitelist']);
        if (result.apiKey) setApiKey(result.apiKey);
        if (result.blacklist) setBlacklist(result.blacklist);
        if (result.whitelist) setWhitelist(result.whitelist);
        
        showNotification('Data imported successfully!', 'success');
      } catch (error) {
        console.error('Error importing data:', error);
        showNotification('Error importing data', 'error');
      }
    };
    reader.readAsText(file);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'blocking', label: 'Blocking', icon: '🚫' },
    { id: 'ai', label: 'AI Settings', icon: '🤖' },
    { id: 'data', label: 'Data', icon: '📊' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">FocusFuel Settings</h1>
          </div>
          <p className="text-gray-600">Configure your productivity assistant</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <Card>
              <CardHeader title="General Settings" />
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Focus Session Duration (minutes)
                  </label>
                  <Input
                    type="number"
                    value={store.preferences.focus.sessionDuration}
                    onChange={(e) => store.updatePreferences({
                      focus: {
                        ...store.preferences.focus,
                        sessionDuration: parseInt(e.target.value) || 25
                      }
                    })}
                    min="5"
                    max="120"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Break Duration (minutes)
                  </label>
                  <Input
                    type="number"
                    value={store.preferences.focus.breakDuration}
                    onChange={(e) => store.updatePreferences({
                      focus: {
                        ...store.preferences.focus,
                        breakDuration: parseInt(e.target.value) || 5
                      }
                    })}
                    min="1"
                    max="30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Long Break Duration (minutes)
                  </label>
                  <Input
                    type="number"
                    value={store.preferences.focus.longBreakDuration}
                    onChange={(e) => store.updatePreferences({
                      focus: {
                        ...store.preferences.focus,
                        longBreakDuration: parseInt(e.target.value) || 15
                      }
                    })}
                    min="5"
                    max="60"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Blocking Settings */}
          {activeTab === 'blocking' && (
            <div className="space-y-6">
              <Card>
                <CardHeader title="Distraction Blocking" />
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="blocking-enabled"
                      checked={store.preferences.blocking.enabled}
                      onChange={(e) => store.updatePreferences({
                        blocking: {
                          ...store.preferences.blocking,
                          enabled: e.target.checked
                        }
                      })}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="blocking-enabled" className="text-sm font-medium text-gray-700">
                      Enable distraction blocking
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blocking Sensitivity
                    </label>
                    <select
                      value={store.preferences.blocking.sensitivity}
                      onChange={(e) => store.updatePreferences({
                        blocking: {
                          ...store.preferences.blocking,
                          sensitivity: e.target.value as 'low' | 'medium' | 'high'
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader title="Site Lists" />
                <CardContent className="space-y-4">
                  <div className="flex space-x-4 mb-4">
                    <button
                      onClick={() => setListType('blacklist')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        listType === 'blacklist'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      Blacklist
                    </button>
                    <button
                      onClick={() => setListType('whitelist')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        listType === 'whitelist'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      Whitelist
                    </button>
                  </div>

                  <div className="flex space-x-2">
                    <Input
                      placeholder={`Add site to ${listType}`}
                      value={newSite}
                      onChange={(e) => setNewSite(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSiteToList()}
                    />
                    <Button onClick={addSiteToList} size="sm">
                      Add
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {(listType === 'blacklist' ? blacklist : whitelist).map((site) => (
                      <div key={site} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">{site}</span>
                        <Button
                          onClick={() => removeSiteFromList(
                            site,
                            listType === 'blacklist' ? blacklist : whitelist,
                            listType === 'blacklist' ? setBlacklist : setWhitelist
                          )}
                          variant="ghost"
                          size="sm"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* AI Settings */}
          {activeTab === 'ai' && (
            <Card>
              <CardHeader title="AI Configuration" />
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OpenAI API Key
                  </label>
                  <Input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Your API key is stored locally and never shared
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI Model
                  </label>
                  <select
                    value={store.preferences.ai.model}
                    onChange={(e) => store.updatePreferences({
                      ai: {
                        ...store.preferences.ai,
                        model: e.target.value as 'gpt-3.5-turbo' | 'gpt-4' | 'claude-3-sonnet'
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Summary Length
                  </label>
                  <select
                    value={store.preferences.ai.summaryLength}
                    onChange={(e) => store.updatePreferences({
                      ai: {
                        ...store.preferences.ai,
                        summaryLength: e.target.value as 'short' | 'medium' | 'long'
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="short">Short (2-3 sentences)</option>
                    <option value="medium">Medium (4-6 sentences)</option>
                    <option value="long">Long (8-10 sentences)</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data Settings */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <Card>
                <CardHeader title="Data Management" />
                <CardContent className="space-y-4">
                  <div className="flex space-x-4">
                    <Button onClick={exportData} variant="outline">
                      Export Data
                    </Button>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".json"
                        onChange={importData}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Button variant="outline">
                        Import Data
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {store.sessionHistory.length}
                      </div>
                      <div className="text-sm text-blue-600">Focus Sessions</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {store.tasks.filter(t => t.completed).length}
                      </div>
                      <div className="text-sm text-green-600">Tasks Completed</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {store.distractionEvents.length}
                      </div>
                      <div className="text-sm text-red-600">Distractions</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader title="Privacy" />
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="analytics-enabled"
                      checked={store.preferences.privacy.analyticsEnabled}
                      onChange={(e) => store.updatePreferences({
                        privacy: {
                          ...store.preferences.privacy,
                          analyticsEnabled: e.target.checked
                        }
                      })}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="analytics-enabled" className="text-sm font-medium text-gray-700">
                      Enable anonymous analytics
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="data-sync"
                      checked={store.preferences.privacy.dataSync}
                      onChange={(e) => store.updatePreferences({
                        privacy: {
                          ...store.preferences.privacy,
                          dataSync: e.target.checked
                        }
                      })}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="data-sync" className="text-sm font-medium text-gray-700">
                      Sync data across devices
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <Button onClick={saveSettings} loading={isLoading} size="lg">
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

// Render the options page
ReactDOM.render(<Options />, document.getElementById('root')); 