import { DistractionDetectorService, OpenAIService } from '@/services/ai';
import { useFocusFuelStore } from '@/store';

// Initialize services
const aiService = new OpenAIService({
  apiKey: process.env.OPENAI_API_KEY || '',
  model: 'gpt-4',
  maxTokens: 1000,
  temperature: 0.3
});

const distractionDetector = new DistractionDetectorService(aiService);

// Tab tracking
interface TabData {
  id: number;
  url: string;
  title: string;
  startTime: number;
  lastActive: number;
  tabSwitches: number;
  scrollEvents: number;
  mouseMovements: number;
  clicks: number;
  keyboardEvents: number;
}

const activeTabs = new Map<number, TabData>();
let currentTabId: number | null = null;
let tabSwitchCount = 0;

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('FocusFuel extension installed');
  
  // Set up alarms for periodic checks
  chrome.alarms.create('distractionCheck', { periodInMinutes: 1 });
  chrome.alarms.create('dataSync', { periodInMinutes: 5 });
});

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const tabData: TabData = {
      id: tabId,
      url: tab.url,
      title: tab.title || '',
      startTime: Date.now(),
      lastActive: Date.now(),
      tabSwitches: 0,
      scrollEvents: 0,
      mouseMovements: 0,
      clicks: 0,
      keyboardEvents: 0
    };
    
    activeTabs.set(tabId, tabData);
    currentTabId = tabId;
  }
});

// Handle tab activation
chrome.tabs.onActivated.addListener((activeInfo) => {
  const previousTabId = currentTabId;
  currentTabId = activeInfo.tabId;
  
  if (previousTabId && previousTabId !== currentTabId) {
    tabSwitchCount++;
    
    // Update previous tab data
    const previousTab = activeTabs.get(previousTabId);
    if (previousTab) {
      previousTab.tabSwitches = tabSwitchCount;
      previousTab.lastActive = Date.now();
    }
  }
});

// Handle tab removal
chrome.tabs.onRemoved.addListener((tabId) => {
  const tabData = activeTabs.get(tabId);
  if (tabData) {
    // Process tab data before removal
    processTabActivity(tabData);
    activeTabs.delete(tabId);
  }
  
  if (currentTabId === tabId) {
    currentTabId = null;
  }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tabId = sender.tab?.id;
  if (!tabId) return;

  const tabData = activeTabs.get(tabId);
  if (!tabData) return;

  switch (message.type) {
    case 'SCROLL_EVENT':
      tabData.scrollEvents++;
      break;
      
    case 'MOUSE_MOVEMENT':
      tabData.mouseMovements++;
      break;
      
    case 'CLICK_EVENT':
      tabData.clicks++;
      break;
      
    case 'KEYBOARD_EVENT':
      tabData.keyboardEvents++;
      break;
      
    case 'REQUEST_SUMMARY':
      handleSummaryRequest(message, tabId, sendResponse);
      return true; // Keep message channel open for async response
      
    case 'DETECT_DISTRACTION':
      handleDistractionDetection(tabData, sendResponse);
      return true;
      
    case 'GET_TAB_STATS':
      sendResponse({
        timeSpent: Date.now() - tabData.startTime,
        tabSwitches: tabData.tabSwitches,
        scrollEvents: tabData.scrollEvents,
        mouseMovements: tabData.mouseMovements,
        clicks: tabData.clicks,
        keyboardEvents: tabData.keyboardEvents
      });
      break;
  }
});

// Handle alarms
chrome.alarms.onAlarm.addListener((alarm) => {
  switch (alarm.name) {
    case 'distractionCheck':
      checkForDistractions();
      break;
      
    case 'dataSync':
      syncDataWithStore();
      break;
  }
});

// Process tab activity and detect distractions
async function processTabActivity(tabData: TabData) {
  const timeSpent = Date.now() - tabData.startTime;
  
  if (timeSpent < 5000) return; // Skip very short sessions
  
  const activity = {
    url: tabData.url,
    title: tabData.title,
    timeSpent: Math.floor(timeSpent / 1000),
    tabSwitches: tabData.tabSwitches,
    scrollEvents: tabData.scrollEvents,
    timeOfDay: new Date().toLocaleTimeString(),
    mouseMovements: tabData.mouseMovements,
    clicks: tabData.clicks,
    keyboardEvents: tabData.keyboardEvents
  };

  try {
    const distractionEvent = await distractionDetector.generateDistractionEvent(activity);
    const store = useFocusFuelStore.getState();
    store.addDistractionEvent(distractionEvent);
    
    // Show notification if distraction detected
    if (distractionEvent.type === 'distraction' && (distractionEvent.confidence || 0) > 70) {
      showDistractionNotification(distractionEvent);
    }
  } catch (error) {
    console.error('Error processing tab activity:', error);
  }
}

// Check for distractions in active tabs
async function checkForDistractions() {
  for (const [tabId, tabData] of activeTabs.entries()) {
    const timeSinceLastActive = Date.now() - tabData.lastActive;
    
    // Only check tabs that have been active recently
    if (timeSinceLastActive < 300000) { // 5 minutes
      await processTabActivity(tabData);
    }
  }
}

// Handle summary requests
async function handleSummaryRequest(message: any, tabId: number, sendResponse: (response: any) => void) {
  try {
    const { content, options } = message;
    
    // For now, we'll use a simple text extraction
    // In a full implementation, you'd want to extract content from the page
    const summary = await aiService.summarizeContent({
      url: '',
      content: content || 'Content to be summarized',
      length: options?.length || 'medium',
      includeKeyPoints: true,
      tags: [],
      type: 'article',
      language: options?.language || 'en'
    });
    
    sendResponse({ success: true, summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    sendResponse({ success: false, error: 'Failed to generate summary' });
  }
}

// Handle distraction detection requests
async function handleDistractionDetection(tabData: TabData, sendResponse: (response: any) => void) {
  try {
    const activity = {
      url: tabData.url,
      title: tabData.title,
      timeSpent: Math.floor((Date.now() - tabData.startTime) / 1000),
      tabSwitches: tabData.tabSwitches,
      scrollEvents: tabData.scrollEvents,
      timeOfDay: new Date().toLocaleTimeString(),
      mouseMovements: tabData.mouseMovements,
      clicks: tabData.clicks,
      keyboardEvents: tabData.keyboardEvents
    };

    const analysis = await distractionDetector.analyzeActivity(activity);
    sendResponse({ success: true, analysis });
  } catch (error) {
    console.error('Error detecting distraction:', error);
    sendResponse({ success: false, error: 'Failed to analyze activity' });
  }
}

// Show distraction notification
function showDistractionNotification(distractionEvent: any) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title: 'FocusFuel - Distraction Detected',
    message: distractionEvent.suggestion || 'Consider taking a break to refocus.',
    buttons: [
      { title: 'Take Break' },
      { title: 'Continue' }
    ]
  });
}

// Sync data with store
function syncDataWithStore() {
  const store = useFocusFuelStore.getState();
  
  // Sync tab statistics
  const tabStats = Array.from(activeTabs.values()).map(tab => ({
    url: tab.url,
    title: tab.title,
    timeSpent: Date.now() - tab.startTime,
    tabSwitches: tab.tabSwitches,
    scrollEvents: tab.scrollEvents
  }));
  
  // Update store with current session data
  store.updateSessionData({
    activeTabs: tabStats,
    currentTabId,
    tabSwitchCount
  });
}

// Handle notification clicks
chrome.notifications.onClicked.addListener((notificationId) => {
  // Handle notification click
  console.log('Notification clicked:', notificationId);
});

// Handle notification button clicks
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (buttonIndex === 0) {
    // Take Break button
    chrome.tabs.create({ url: 'chrome-extension://__MSG_@@extension_id__/break.html' });
  }
  // Continue button (buttonIndex === 1) - do nothing
});

// Handle extension commands
chrome.commands.onCommand.addListener((command) => {
  switch (command) {
    case 'start-focus-session':
      chrome.tabs.create({ url: 'chrome-extension://__MSG_@@extension_id__/focus.html' });
      break;
      
    case 'toggle-blocking':
      toggleDistractionBlocking();
      break;
  }
});

// Toggle distraction blocking
function toggleDistractionBlocking() {
  const store = useFocusFuelStore.getState();
  const currentSettings = store.preferences.blocking;
  
  store.updatePreferences({
    blocking: {
      ...currentSettings,
      enabled: !currentSettings.enabled
    }
  });
  
  // Show notification
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title: 'FocusFuel',
    message: currentSettings.enabled ? 'Distraction blocking disabled' : 'Distraction blocking enabled'
  });
}

// Handle storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    // Sync changes with store
    const store = useFocusFuelStore.getState();
    
    Object.keys(changes).forEach(key => {
      const change = changes[key];
      if (change.newValue !== undefined) {
        store.updateFromStorage(key, change.newValue);
      }
    });
  }
});

// Export for testing
export {
  activeTabs,
  currentTabId,
  processTabActivity,
  checkForDistractions,
  handleSummaryRequest,
  handleDistractionDetection
}; 