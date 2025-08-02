import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, Button, Input, Badge } from '@/components/ui';
import { useFocusFuelStore } from '@/store';

export interface UserProfileData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  timezone: string;
  language: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
    focusReminders: boolean;
    breakReminders: boolean;
    achievementAlerts: boolean;
    weeklyReports: boolean;
  };
  preferences: {
    defaultFocusDuration: number; // in minutes
    defaultBreakDuration: number; // in minutes
    autoStartBreaks: boolean;
    autoStartSessions: boolean;
    showNotifications: boolean;
    soundEnabled: boolean;
    zenMode: boolean;
  };
  privacy: {
    shareAnalytics: boolean;
    shareAchievements: boolean;
    publicProfile: boolean;
    allowInvites: boolean;
  };
  createdAt: string;
  lastActive: string;
}

export interface UserProfileProps {
  onSave?: (profile: UserProfileData) => void;
  className?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ onSave, className }) => {
  const store = useFocusFuelStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [profileData, setProfileData] = useState<UserProfileData>({
    id: 'user_1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: 'en',
    theme: 'auto',
    notifications: {
      email: true,
      push: true,
      desktop: true,
      focusReminders: true,
      breakReminders: true,
      achievementAlerts: true,
      weeklyReports: false
    },
    preferences: {
      defaultFocusDuration: 25,
      defaultBreakDuration: 5,
      autoStartBreaks: true,
      autoStartSessions: false,
      showNotifications: true,
      soundEnabled: true,
      zenMode: false
    },
    privacy: {
      shareAnalytics: true,
      shareAchievements: true,
      publicProfile: false,
      allowInvites: true
    },
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString()
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney'
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'ja', name: '日本語' },
    { code: 'zh', name: '中文' }
  ];

  const themes = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'auto', label: 'Auto' }
  ];

  const handleInputChange = (field: keyof UserProfileData, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleNestedChange = (section: 'notifications' | 'preferences' | 'privacy', field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!profileData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (profileData.preferences.defaultFocusDuration <= 0) {
      newErrors.defaultFocusDuration = 'Focus duration must be greater than 0';
    }

    if (profileData.preferences.defaultBreakDuration < 0) {
      newErrors.defaultBreakDuration = 'Break duration cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update store with new profile data
      // store.updateUserProfile(profileData);
      
      setIsEditing(false);
      onSave?.(profileData);
    } catch (error) {
      console.error('Error saving profile:', error);
      setErrors({ submit: 'Failed to save profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    // Reset to original data
    // setProfileData(originalProfileData);
  };

  const renderAvatarSection = () => (
    <div className="flex items-center space-x-4">
      <div className="relative">
        <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Avatar preview"
              className="w-full h-full object-cover"
            />
          ) : profileData.avatar ? (
            <img
              src={profileData.avatar}
              alt="Profile avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-gray-600">
              {profileData.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        {isEditing && (
          <label className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-1 cursor-pointer hover:bg-primary-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </label>
        )}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{profileData.name}</h3>
        <p className="text-sm text-gray-600">{profileData.email}</p>
        <p className="text-xs text-gray-500">
          Member since {new Date(profileData.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );

  const renderBasicInfo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <Input
            value={profileData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter your full name"
            error={errors.name}
            disabled={!isEditing}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <Input
            type="email"
            value={profileData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter your email"
            error={errors.email}
            disabled={!isEditing}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Timezone
          </label>
          <select
            value={profileData.timezone}
            onChange={(e) => handleInputChange('timezone', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
          >
            {timezones.map(timezone => (
              <option key={timezone} value={timezone}>
                {timezone}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Language
          </label>
          <select
            value={profileData.language}
            onChange={(e) => handleInputChange('language', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Theme
        </label>
        <div className="flex space-x-4">
          {themes.map(theme => (
            <label key={theme.value} className="flex items-center space-x-2">
              <input
                type="radio"
                name="theme"
                value={theme.value}
                checked={profileData.theme === theme.value}
                onChange={(e) => handleInputChange('theme', e.target.value)}
                disabled={!isEditing}
                className="text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">{theme.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-4">
      <h4 className="text-md font-semibold text-gray-900">Focus Preferences</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Default Focus Duration (minutes)
          </label>
          <Input
            type="number"
            min="1"
            max="240"
            value={profileData.preferences.defaultFocusDuration}
            onChange={(e) => handleNestedChange('preferences', 'defaultFocusDuration', parseInt(e.target.value))}
            error={errors.defaultFocusDuration}
            disabled={!isEditing}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Default Break Duration (minutes)
          </label>
          <Input
            type="number"
            min="0"
            max="60"
            value={profileData.preferences.defaultBreakDuration}
            onChange={(e) => handleNestedChange('preferences', 'defaultBreakDuration', parseInt(e.target.value))}
            error={errors.defaultBreakDuration}
            disabled={!isEditing}
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={profileData.preferences.autoStartBreaks}
            onChange={(e) => handleNestedChange('preferences', 'autoStartBreaks', e.target.checked)}
            disabled={!isEditing}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700">Auto-start breaks after focus sessions</span>
        </label>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={profileData.preferences.autoStartSessions}
            onChange={(e) => handleNestedChange('preferences', 'autoStartSessions', e.target.checked)}
            disabled={!isEditing}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700">Auto-start focus sessions</span>
        </label>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={profileData.preferences.showNotifications}
            onChange={(e) => handleNestedChange('preferences', 'showNotifications', e.target.checked)}
            disabled={!isEditing}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700">Show desktop notifications</span>
        </label>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={profileData.preferences.soundEnabled}
            onChange={(e) => handleNestedChange('preferences', 'soundEnabled', e.target.checked)}
            disabled={!isEditing}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700">Enable sound notifications</span>
        </label>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={profileData.preferences.zenMode}
            onChange={(e) => handleNestedChange('preferences', 'zenMode', e.target.checked)}
            disabled={!isEditing}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700">Enable zen mode (minimal distractions)</span>
        </label>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-4">
      <h4 className="text-md font-semibold text-gray-900">Notification Settings</h4>
      
      <div className="space-y-3">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={profileData.notifications.email}
            onChange={(e) => handleNestedChange('notifications', 'email', e.target.checked)}
            disabled={!isEditing}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700">Email notifications</span>
        </label>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={profileData.notifications.push}
            onChange={(e) => handleNestedChange('notifications', 'push', e.target.checked)}
            disabled={!isEditing}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700">Push notifications</span>
        </label>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={profileData.notifications.desktop}
            onChange={(e) => handleNestedChange('notifications', 'desktop', e.target.checked)}
            disabled={!isEditing}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700">Desktop notifications</span>
        </label>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={profileData.notifications.focusReminders}
            onChange={(e) => handleNestedChange('notifications', 'focusReminders', e.target.checked)}
            disabled={!isEditing}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700">Focus session reminders</span>
        </label>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={profileData.notifications.breakReminders}
            onChange={(e) => handleNestedChange('notifications', 'breakReminders', e.target.checked)}
            disabled={!isEditing}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700">Break reminders</span>
        </label>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={profileData.notifications.achievementAlerts}
            onChange={(e) => handleNestedChange('notifications', 'achievementAlerts', e.target.checked)}
            disabled={!isEditing}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700">Achievement alerts</span>
        </label>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={profileData.notifications.weeklyReports}
            onChange={(e) => handleNestedChange('notifications', 'weeklyReports', e.target.checked)}
            disabled={!isEditing}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700">Weekly progress reports</span>
        </label>
      </div>
    </div>
  );

  const renderPrivacy = () => (
    <div className="space-y-4">
      <h4 className="text-md font-semibold text-gray-900">Privacy Settings</h4>
      
      <div className="space-y-3">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={profileData.privacy.shareAnalytics}
            onChange={(e) => handleNestedChange('privacy', 'shareAnalytics', e.target.checked)}
            disabled={!isEditing}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700">Share anonymous analytics to improve FocusFuel</span>
        </label>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={profileData.privacy.shareAchievements}
            onChange={(e) => handleNestedChange('privacy', 'shareAchievements', e.target.checked)}
            disabled={!isEditing}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700">Share achievements on leaderboards</span>
        </label>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={profileData.privacy.publicProfile}
            onChange={(e) => handleNestedChange('privacy', 'publicProfile', e.target.checked)}
            disabled={!isEditing}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700">Make profile public</span>
        </label>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={profileData.privacy.allowInvites}
            onChange={(e) => handleNestedChange('privacy', 'allowInvites', e.target.checked)}
            disabled={!isEditing}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700">Allow others to invite me to focus rooms</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
              <p className="text-gray-600">Manage your account and preferences</p>
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} loading={isLoading}>
                    Save Changes
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Avatar Section */}
          {renderAvatarSection()}

          {/* Basic Information */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            {renderBasicInfo()}
          </div>

          {/* Preferences */}
          <div className="border-t border-gray-200 pt-6">
            {renderPreferences()}
          </div>

          {/* Notifications */}
          <div className="border-t border-gray-200 pt-6">
            {renderNotifications()}
          </div>

          {/* Privacy */}
          <div className="border-t border-gray-200 pt-6">
            {renderPrivacy()}
          </div>

          {/* Account Actions */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
            <div className="space-y-3">
              <Button variant="outline" fullWidth>
                Export Data
              </Button>
              <Button variant="outline" fullWidth>
                Change Password
              </Button>
              <Button variant="outline" fullWidth>
                Two-Factor Authentication
              </Button>
              <Button variant="destructive" fullWidth>
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile; 