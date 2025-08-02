import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, Button, Input, Badge, Modal } from '@/components/ui';
import { useFocusFuelStore } from '@/store';

export interface DistractionBlockingSettings {
  enabled: boolean;
  mode: 'soft' | 'hard' | 'adaptive';
  blacklist: string[];
  whitelist: string[];
  sensitivity: 'low' | 'medium' | 'high';
  autoBlock: boolean;
  blockSocialMedia: boolean;
  blockNews: boolean;
  blockEntertainment: boolean;
  customRules: Array<{
    id: string;
    pattern: string;
    action: 'block' | 'warn' | 'allow';
    description: string;
  }>;
}

export interface FocusSettings {
  defaultDuration: number;
  autoStartBreaks: boolean;
  autoStartSessions: boolean;
  showTimer: boolean;
  showProgress: boolean;
  soundEnabled: boolean;
  zenMode: boolean;
  fullscreenMode: boolean;
  doNotDisturb: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  focusStart: boolean;
  focusEnd: boolean;
  breakStart: boolean;
  breakEnd: boolean;
  achievement: boolean;
  reminder: boolean;
  weeklyReport: boolean;
}

export interface AppSettingsData {
  distractionBlocking: DistractionBlockingSettings;
  focus: FocusSettings;
  notifications: NotificationSettings;
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    accentColor: string;
    fontSize: 'small' | 'medium' | 'large';
    compactMode: boolean;
    animations: boolean;
  };
  performance: {
    dataSync: boolean;
    autoBackup: boolean;
    cacheEnabled: boolean;
    analytics: boolean;
    crashReporting: boolean;
  };
  integrations: {
    calendar: boolean;
    email: boolean;
    slack: boolean;
    notion: boolean;
    trello: boolean;
  };
}

export interface AppSettingsProps {
  onSave?: (settings: AppSettingsData) => void;
  className?: string;
}

const AppSettings: React.FC<AppSettingsProps> = ({ onSave, className }) => {
  const [activeTab, setActiveTab] = useState<'blocking' | 'focus' | 'notifications' | 'appearance' | 'performance' | 'integrations'>('blocking');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [newRule, setNewRule] = useState({ pattern: '', action: 'block' as const, description: '' });

  const store = useFocusFuelStore();

  const [settings, setSettings] = useState<AppSettingsData>({
    distractionBlocking: {
      enabled: true,
      mode: 'adaptive',
      blacklist: ['facebook.com', 'twitter.com', 'instagram.com', 'youtube.com'],
      whitelist: ['focusfuel.com', 'notion.so', 'github.com'],
      sensitivity: 'medium',
      autoBlock: true,
      blockSocialMedia: true,
      blockNews: false,
      blockEntertainment: true,
      customRules: [
        {
          id: 'rule_1',
          pattern: '*.reddit.com/*',
          action: 'block',
          description: 'Block Reddit during focus sessions'
        }
      ]
    },
    focus: {
      defaultDuration: 25,
      autoStartBreaks: true,
      autoStartSessions: false,
      showTimer: true,
      showProgress: true,
      soundEnabled: true,
      zenMode: false,
      fullscreenMode: false,
      doNotDisturb: true
    },
    notifications: {
      enabled: true,
      sound: true,
      vibration: false,
      focusStart: true,
      focusEnd: true,
      breakStart: true,
      breakEnd: true,
      achievement: true,
      reminder: true,
      weeklyReport: false
    },
    appearance: {
      theme: 'auto',
      accentColor: '#0ea5e9',
      fontSize: 'medium',
      compactMode: false,
      animations: true
    },
    performance: {
      dataSync: true,
      autoBackup: true,
      cacheEnabled: true,
      analytics: true,
      crashReporting: false
    },
    integrations: {
      calendar: false,
      email: false,
      slack: false,
      notion: false,
      trello: false
    }
  });

  const handleSettingChange = (section: keyof AppSettingsData, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedChange = (section: keyof AppSettingsData, subsection: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...(prev[section] as any)[subsection],
          [field]: value
        }
      }
    }));
  };

  const handleAddBlacklistSite = (site: string) => {
    if (site && !settings.distractionBlocking.blacklist.includes(site)) {
      handleSettingChange('distractionBlocking', 'blacklist', [
        ...settings.distractionBlocking.blacklist,
        site
      ]);
    }
  };

  const handleRemoveBlacklistSite = (site: string) => {
    handleSettingChange('distractionBlocking', 'blacklist', 
      settings.distractionBlocking.blacklist.filter(s => s !== site)
    );
  };

  const handleAddWhitelistSite = (site: string) => {
    if (site && !settings.distractionBlocking.whitelist.includes(site)) {
      handleSettingChange('distractionBlocking', 'whitelist', [
        ...settings.distractionBlocking.whitelist,
        site
      ]);
    }
  };

  const handleRemoveWhitelistSite = (site: string) => {
    handleSettingChange('distractionBlocking', 'whitelist', 
      settings.distractionBlocking.whitelist.filter(s => s !== site)
    );
  };

  const handleAddCustomRule = () => {
    if (newRule.pattern && newRule.description) {
      const rule = {
        id: `rule_${Date.now()}`,
        pattern: newRule.pattern,
        action: newRule.action,
        description: newRule.description
      };
      
      handleSettingChange('distractionBlocking', 'customRules', [
        ...settings.distractionBlocking.customRules,
        rule
      ]);
      
      setNewRule({ pattern: '', action: 'block', description: '' });
      setShowAddRuleModal(false);
    }
  };

  const handleRemoveCustomRule = (ruleId: string) => {
    handleSettingChange('distractionBlocking', 'customRules', 
      settings.distractionBlocking.customRules.filter(rule => rule.id !== ruleId)
    );
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update store with new settings
      // store.updateAppSettings(settings);
      
      onSave?.(settings);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderDistractionBlocking = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Distraction Blocking</h3>
          <p className="text-sm text-gray-600">Configure how FocusFuel blocks distracting websites</p>
        </div>
        <Badge variant={settings.distractionBlocking.enabled ? 'success' : 'destructive'}>
          {settings.distractionBlocking.enabled ? 'Enabled' : 'Disabled'}
        </Badge>
      </div>

      <div className="space-y-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.distractionBlocking.enabled}
            onChange={(e) => handleSettingChange('distractionBlocking', 'enabled', e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700">Enable distraction blocking</span>
        </label>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Blocking Mode
          </label>
          <select
            value={settings.distractionBlocking.mode}
            onChange={(e) => handleSettingChange('distractionBlocking', 'mode', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="soft">Soft Block (Show warning)</option>
            <option value="hard">Hard Block (Prevent access)</option>
            <option value="adaptive">Adaptive (AI-powered)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sensitivity Level
          </label>
          <select
            value={settings.distractionBlocking.sensitivity}
            onChange={(e) => handleSettingChange('distractionBlocking', 'sensitivity', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="low">Low (Block only major distractions)</option>
            <option value="medium">Medium (Block common distractions)</option>
            <option value="high">High (Block all potential distractions)</option>
          </select>
        </div>

        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.distractionBlocking.autoBlock}
              onChange={(e) => handleSettingChange('distractionBlocking', 'autoBlock', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Auto-block during focus sessions</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.distractionBlocking.blockSocialMedia}
              onChange={(e) => handleSettingChange('distractionBlocking', 'blockSocialMedia', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Block social media sites</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.distractionBlocking.blockNews}
              onChange={(e) => handleSettingChange('distractionBlocking', 'blockNews', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Block news sites</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.distractionBlocking.blockEntertainment}
              onChange={(e) => handleSettingChange('distractionBlocking', 'blockEntertainment', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Block entertainment sites</span>
          </label>
        </div>

        {/* Blacklist */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Blocked Sites (Blacklist)
          </label>
          <div className="space-y-2">
            {settings.distractionBlocking.blacklist.map(site => (
              <div key={site} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-700">{site}</span>
                <button
                  onClick={() => handleRemoveBlacklistSite(site)}
                  className="text-red-600 hover:text-red-800"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            <div className="flex space-x-2">
              <Input
                placeholder="Add site to block (e.g., example.com)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddBlacklistSite((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
                className="flex-1"
              />
              <Button size="sm" variant="outline">
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Whitelist */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Allowed Sites (Whitelist)
          </label>
          <div className="space-y-2">
            {settings.distractionBlocking.whitelist.map(site => (
              <div key={site} className="flex items-center justify-between p-2 bg-green-50 rounded">
                <span className="text-sm text-gray-700">{site}</span>
                <button
                  onClick={() => handleRemoveWhitelistSite(site)}
                  className="text-red-600 hover:text-red-800"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            <div className="flex space-x-2">
              <Input
                placeholder="Add site to allow (e.g., work.com)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddWhitelistSite((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
                className="flex-1"
              />
              <Button size="sm" variant="outline">
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Custom Rules */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Custom Rules
            </label>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddRuleModal(true)}
            >
              Add Rule
            </Button>
          </div>
          <div className="space-y-2">
            {settings.distractionBlocking.customRules.map(rule => (
              <div key={rule.id} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                <div>
                  <p className="text-sm font-medium text-gray-900">{rule.pattern}</p>
                  <p className="text-xs text-gray-600">{rule.description}</p>
                  <Badge variant="outline" className="text-xs mt-1">
                    {rule.action}
                  </Badge>
                </div>
                <button
                  onClick={() => handleRemoveCustomRule(rule.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderFocusSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Focus Settings</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Focus Duration (minutes)
            </label>
            <Input
              type="number"
              min="1"
              max="240"
              value={settings.focus.defaultDuration}
              onChange={(e) => handleSettingChange('focus', 'defaultDuration', parseInt(e.target.value))}
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.focus.autoStartBreaks}
              onChange={(e) => handleSettingChange('focus', 'autoStartBreaks', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Auto-start breaks after focus sessions</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.focus.autoStartSessions}
              onChange={(e) => handleSettingChange('focus', 'autoStartSessions', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Auto-start focus sessions</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.focus.showTimer}
              onChange={(e) => handleSettingChange('focus', 'showTimer', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Show timer during focus sessions</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.focus.showProgress}
              onChange={(e) => handleSettingChange('focus', 'showProgress', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Show progress bar</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.focus.soundEnabled}
              onChange={(e) => handleSettingChange('focus', 'soundEnabled', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Enable sound notifications</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.focus.zenMode}
              onChange={(e) => handleSettingChange('focus', 'zenMode', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Enable zen mode (minimal UI)</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.focus.fullscreenMode}
              onChange={(e) => handleSettingChange('focus', 'fullscreenMode', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Fullscreen mode during focus</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.focus.doNotDisturb}
              onChange={(e) => handleSettingChange('focus', 'doNotDisturb', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Enable Do Not Disturb mode</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
      
      <div className="space-y-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={settings.notifications.enabled}
            onChange={(e) => handleSettingChange('notifications', 'enabled', e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700">Enable notifications</span>
        </label>

        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.notifications.sound}
              onChange={(e) => handleSettingChange('notifications', 'sound', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Sound notifications</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.notifications.vibration}
              onChange={(e) => handleSettingChange('notifications', 'vibration', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Vibration notifications</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.notifications.focusStart}
              onChange={(e) => handleSettingChange('notifications', 'focusStart', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Focus session start</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.notifications.focusEnd}
              onChange={(e) => handleSettingChange('notifications', 'focusEnd', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Focus session end</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.notifications.breakStart}
              onChange={(e) => handleSettingChange('notifications', 'breakStart', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Break start</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.notifications.breakEnd}
              onChange={(e) => handleSettingChange('notifications', 'breakEnd', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Break end</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.notifications.achievement}
              onChange={(e) => handleSettingChange('notifications', 'achievement', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Achievement unlocks</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.notifications.reminder}
              onChange={(e) => handleSettingChange('notifications', 'reminder', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Focus reminders</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.notifications.weeklyReport}
              onChange={(e) => handleSettingChange('notifications', 'weeklyReport', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Weekly progress reports</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderAppearance = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Appearance</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Theme
          </label>
          <select
            value={settings.appearance.theme}
            onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto (System)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Accent Color
          </label>
          <input
            type="color"
            value={settings.appearance.accentColor}
            onChange={(e) => handleSettingChange('appearance', 'accentColor', e.target.value)}
            className="w-16 h-10 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Font Size
          </label>
          <select
            value={settings.appearance.fontSize}
            onChange={(e) => handleSettingChange('appearance', 'fontSize', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>

        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.appearance.compactMode}
              onChange={(e) => handleSettingChange('appearance', 'compactMode', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Compact mode</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.appearance.animations}
              onChange={(e) => handleSettingChange('appearance', 'animations', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Enable animations</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Performance & Data</h3>
      
      <div className="space-y-4">
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.performance.dataSync}
              onChange={(e) => handleSettingChange('performance', 'dataSync', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Sync data across devices</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.performance.autoBackup}
              onChange={(e) => handleSettingChange('performance', 'autoBackup', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Auto-backup data</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.performance.cacheEnabled}
              onChange={(e) => handleSettingChange('performance', 'cacheEnabled', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Enable caching for better performance</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.performance.analytics}
              onChange={(e) => handleSettingChange('performance', 'analytics', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Share anonymous usage analytics</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.performance.crashReporting}
              onChange={(e) => handleSettingChange('performance', 'crashReporting', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Send crash reports</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderIntegrations = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Integrations</h3>
      
      <div className="space-y-4">
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.integrations.calendar}
              onChange={(e) => handleSettingChange('integrations', 'calendar', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Google Calendar</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.integrations.email}
              onChange={(e) => handleSettingChange('integrations', 'email', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Email (Gmail, Outlook)</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.integrations.slack}
              onChange={(e) => handleSettingChange('integrations', 'slack', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Slack</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.integrations.notion}
              onChange={(e) => handleSettingChange('integrations', 'notion', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Notion</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.integrations.trello}
              onChange={(e) => handleSettingChange('integrations', 'trello', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Trello</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'blocking':
        return renderDistractionBlocking();
      case 'focus':
        return renderFocusSettings();
      case 'notifications':
        return renderNotifications();
      case 'appearance':
        return renderAppearance();
      case 'performance':
        return renderPerformance();
      case 'integrations':
        return renderIntegrations();
      default:
        return renderDistractionBlocking();
    }
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">App Settings</h2>
              <p className="text-gray-600">Configure FocusFuel behavior and preferences</p>
            </div>
            <Button onClick={handleSave} loading={isLoading}>
              Save Settings
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'blocking', label: 'Distraction Blocking' },
                { id: 'focus', label: 'Focus Settings' },
                { id: 'notifications', label: 'Notifications' },
                { id: 'appearance', label: 'Appearance' },
                { id: 'performance', label: 'Performance' },
                { id: 'integrations', label: 'Integrations' }
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
        </CardContent>
      </Card>

      {/* Add Custom Rule Modal */}
      <Modal
        isOpen={showAddRuleModal}
        onClose={() => setShowAddRuleModal(false)}
        title="Add Custom Rule"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL Pattern *
            </label>
            <Input
              value={newRule.pattern}
              onChange={(e) => setNewRule(prev => ({ ...prev, pattern: e.target.value }))}
              placeholder="*.example.com/*"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action
            </label>
            <select
              value={newRule.action}
              onChange={(e) => setNewRule(prev => ({ ...prev, action: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="block">Block</option>
              <option value="warn">Warn</option>
              <option value="allow">Allow</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <Input
              value={newRule.description}
              onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe this rule"
              className="w-full"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowAddRuleModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddCustomRule}>
              Add Rule
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AppSettings; 