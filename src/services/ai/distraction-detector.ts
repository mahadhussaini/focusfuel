import OpenAIService from './openai';
import { DistractionEvent } from '@/types';

export interface ActivityData {
  url: string;
  title: string;
  timeSpent: number;
  tabSwitches: number;
  scrollEvents: number;
  timeOfDay: string;
  mouseMovements: number;
  clicks: number;
  keyboardEvents: number;
}

export interface DistractionPattern {
  pattern: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export class DistractionDetectorService {
  private aiService: OpenAIService;
  private blacklist: Set<string> = new Set();
  private whitelist: Set<string> = new Set();
  private sensitivityLevel: 'low' | 'medium' | 'high' = 'medium';

  constructor(aiService: OpenAIService) {
    this.aiService = aiService;
    this.loadDefaultLists();
  }

  private loadDefaultLists() {
    // Default blacklist - common distracting sites
    const defaultBlacklist = [
      'facebook.com',
      'twitter.com',
      'instagram.com',
      'tiktok.com',
      'youtube.com',
      'reddit.com',
      'netflix.com',
      'hulu.com',
      'amazon.com',
      'ebay.com'
    ];

    // Default whitelist - productivity tools
    const defaultWhitelist = [
      'github.com',
      'stackoverflow.com',
      'docs.google.com',
      'notion.so',
      'figma.com',
      'slack.com',
      'zoom.us',
      'teams.microsoft.com',
      'calendar.google.com',
      'drive.google.com'
    ];

    defaultBlacklist.forEach(site => this.blacklist.add(site));
    defaultWhitelist.forEach(site => this.whitelist.add(site));
  }

  async analyzeActivity(activity: ActivityData): Promise<{
    isDistracting: boolean;
    confidence: number;
    reason: string;
    suggestion?: string;
    pattern?: DistractionPattern;
  }> {
    // Quick checks first
    const quickCheck = this.performQuickCheck(activity);
    if (quickCheck.isDistracting) {
      return {
        ...quickCheck,
        pattern: {
          pattern: 'blacklist_match',
          confidence: 90,
          severity: 'high',
          description: 'Site is in blacklist'
        }
      };
    }

    if (quickCheck.confidence > 80) {
      return quickCheck;
    }

    // Use AI for more complex analysis
    try {
      const aiResult = await this.aiService.detectDistractionPattern(activity);
      
      // Combine AI analysis with pattern detection
      const patterns = this.detectPatterns(activity);
      const bestPattern = patterns.length > 0 ? patterns[0] : undefined;

      return {
        ...aiResult,
        pattern: bestPattern
      };
    } catch (error) {
      console.error('Error in AI analysis, falling back to pattern detection:', error);
      return this.performQuickCheck(activity);
    }
  }

  private performQuickCheck(activity: ActivityData): {
    isDistracting: boolean;
    confidence: number;
    reason: string;
    suggestion?: string;
  } {
    const domain = this.extractDomain(activity.url);
    
    // Check blacklist
    if (this.blacklist.has(domain)) {
      return {
        isDistracting: true,
        confidence: 95,
        reason: 'Site is in distraction blacklist',
        suggestion: 'Consider using this site during breaks instead'
      };
    }

    // Check whitelist
    if (this.whitelist.has(domain)) {
      return {
        isDistracting: false,
        confidence: 90,
        reason: 'Site is in productivity whitelist'
      };
    }

    // Pattern-based detection
    const patterns = this.detectPatterns(activity);
    if (patterns.length > 0) {
      const pattern = patterns[0];
      return {
        isDistracting: pattern.severity !== 'low',
        confidence: pattern.confidence,
        reason: pattern.description,
        suggestion: this.getSuggestionForPattern(pattern)
      };
    }

    return {
      isDistracting: false,
      confidence: 50,
      reason: 'Unable to determine distraction level'
    };
  }

  private detectPatterns(activity: ActivityData): DistractionPattern[] {
    const patterns: DistractionPattern[] = [];

    // Rapid tab switching pattern
    if (activity.tabSwitches > 10 && activity.timeSpent < 300) {
      patterns.push({
        pattern: 'rapid_tab_switching',
        confidence: 85,
        severity: 'high',
        description: 'Excessive tab switching indicates distraction'
      });
    }

    // Excessive scrolling pattern
    if (activity.scrollEvents > 50 && activity.timeSpent < 600) {
      patterns.push({
        pattern: 'excessive_scrolling',
        confidence: 75,
        severity: 'medium',
        description: 'High scroll activity suggests mindless browsing'
      });
    }

    // Short attention span pattern
    if (activity.timeSpent < 60 && activity.tabSwitches > 5) {
      patterns.push({
        pattern: 'short_attention_span',
        confidence: 80,
        severity: 'medium',
        description: 'Very short time spent with many switches'
      });
    }

    // Mouse movement pattern (if available)
    if (activity.mouseMovements > 100 && activity.clicks < 5) {
      patterns.push({
        pattern: 'passive_browsing',
        confidence: 70,
        severity: 'medium',
        description: 'High mouse movement with few clicks suggests passive browsing'
      });
    }

    // Time-based patterns
    const hour = new Date().getHours();
    if (hour >= 22 || hour <= 6) {
      patterns.push({
        pattern: 'late_night_browsing',
        confidence: 60,
        severity: 'low',
        description: 'Browsing during late hours'
      });
    }

    return patterns.sort((a, b) => b.confidence - a.confidence);
  }

  private extractDomain(url: string): string {
    try {
      const domain = new URL(url).hostname.toLowerCase();
      return domain.replace(/^www\./, '');
    } catch {
      return url.toLowerCase();
    }
  }

  private getSuggestionForPattern(pattern: DistractionPattern): string {
    const suggestions: Record<string, string> = {
      rapid_tab_switching: 'Try focusing on one task at a time',
      excessive_scrolling: 'Consider setting a time limit for browsing',
      short_attention_span: 'Take a short break to reset your focus',
      passive_browsing: 'Engage more actively with your work',
      late_night_browsing: 'Consider getting some rest'
    };

    return suggestions[pattern.pattern] || 'Consider taking a break to refocus';
  }

  addToBlacklist(domain: string): void {
    this.blacklist.add(domain.toLowerCase());
  }

  removeFromBlacklist(domain: string): void {
    this.blacklist.delete(domain.toLowerCase());
  }

  addToWhitelist(domain: string): void {
    this.whitelist.add(domain.toLowerCase());
  }

  removeFromWhitelist(domain: string): void {
    this.whitelist.delete(domain.toLowerCase());
  }

  setSensitivityLevel(level: 'low' | 'medium' | 'high'): void {
    this.sensitivityLevel = level;
  }

  getBlacklist(): string[] {
    return Array.from(this.blacklist);
  }

  getWhitelist(): string[] {
    return Array.from(this.whitelist);
  }

  async generateDistractionEvent(activity: ActivityData): Promise<DistractionEvent> {
    const analysis = await this.analyzeActivity(activity);
    
    return {
      id: `distraction_${Date.now()}`,
      userId: 'anonymous',
      url: activity.url,
      timestamp: new Date(),
      duration: activity.timeSpent,
      type: analysis.isDistracting ? 'distraction' : 'productive',
      confidence: analysis.confidence,
      category: 'other' as const,
      blocked: false
    };
  }
}

export default DistractionDetectorService; 