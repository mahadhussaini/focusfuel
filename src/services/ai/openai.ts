import OpenAI from 'openai';
import { SummaryRequest, Summary } from '@/types';

export interface OpenAIConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export class OpenAIService {
  private client: OpenAI;
  private config: OpenAIConfig;

  constructor(config: OpenAIConfig) {
    this.config = {
      model: 'gpt-4',
      maxTokens: 1000,
      temperature: 0.3,
      ...config
    };
    
    this.client = new OpenAI({
      apiKey: this.config.apiKey,
    });
  }

  async summarizeContent(request: SummaryRequest): Promise<Summary> {
    try {
      const { content, type, length = 'medium', language = 'en' } = request;

      const lengthMap = {
        short: '2-3 sentences',
        medium: '4-6 sentences',
        long: '8-10 sentences'
      };

      const typeMap = {
        article: 'article or blog post',
        paper: 'academic paper or research document',
        email: 'email or message',
        document: 'document or report'
      };

      const prompt = `Please provide a ${lengthMap[length]} summary of this ${typeMap[type || 'article']} in ${language}. 
      
Focus on:
- Key points and main arguments
- Important facts and data
- Action items or conclusions
- Maintain the original tone and context

Content to summarize:
${content}

Summary:`;

      const response = await this.client.chat.completions.create({
        model: this.config.model!,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that creates concise, accurate summaries of content while preserving key information and context.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature
      });

      const summary = response.choices[0]?.message?.content?.trim() || '';

              return {
          id: `summary_${Date.now()}`,
          userId: 'anonymous',
          url: request.url,
          title: 'Generated Summary',
          content: request.content,
          summary,
          keyPoints: [],
          tags: [],
          createdAt: new Date(),
          wordCount: summary.split(' ').length,
          readingTime: Math.ceil(summary.split(' ').length / 200) // ~200 words per minute
        };
    } catch (error) {
      console.error('Error summarizing content:', error);
      throw new Error('Failed to summarize content. Please try again.');
    }
  }

  async detectDistractionPattern(activity: {
    url: string;
    title: string;
    timeSpent: number;
    tabSwitches: number;
    scrollEvents: number;
    timeOfDay: string;
  }): Promise<{
    isDistracting: boolean;
    confidence: number;
    reason: string;
    suggestion?: string;
  }> {
    try {
      const prompt = `Analyze this browsing activity and determine if it's likely to be distracting:

URL: ${activity.url}
Title: ${activity.title}
Time spent: ${activity.timeSpent} seconds
Tab switches: ${activity.tabSwitches}
Scroll events: ${activity.scrollEvents}
Time of day: ${activity.timeOfDay}

Consider:
- Is this likely a productivity tool or entertainment site?
- Are the browsing patterns consistent with focused work?
- Is the time of day appropriate for this type of activity?
- Are there signs of rapid switching or excessive scrolling?

Respond with:
1. Is this distracting? (yes/no)
2. Confidence level (0-100)
3. Reason for the assessment
4. Suggestion for improvement (if distracting)`;

      const response = await this.client.chat.completions.create({
        model: this.config.model!,
        messages: [
          {
            role: 'system',
            content: 'You are a productivity assistant that analyzes browsing patterns to identify potential distractions and provide helpful suggestions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.2
      });

      const result = response.choices[0]?.message?.content?.trim() || '';
      
      // Parse the response (simplified parsing - in production, you'd want more robust parsing)
      const lines = result.split('\n');
      const isDistracting = lines[0]?.toLowerCase().includes('yes') || false;
      const confidenceMatch = lines[1]?.match(/(\d+)/);
      const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 50;
      const reason = lines[2]?.replace(/^.*?:/, '').trim() || 'Unable to determine';
      const suggestion = lines[3]?.replace(/^.*?:/, '').trim();

      return {
        isDistracting,
        confidence,
        reason,
        suggestion
      };
    } catch (error) {
      console.error('Error detecting distraction pattern:', error);
      return {
        isDistracting: false,
        confidence: 0,
        reason: 'Unable to analyze activity'
      };
    }
  }

  async generateMotivationalMessage(context: {
    timeOfDay: string;
    productivityLevel: 'high' | 'medium' | 'low';
    currentTask?: string;
    recentDistractions: number;
  }): Promise<string> {
    try {
      const prompt = `Generate a brief, motivational message for someone who:
- Current time: ${context.timeOfDay}
- Productivity level: ${context.productivityLevel}
- Current task: ${context.currentTask || 'general work'}
- Recent distractions: ${context.recentDistractions} in the last hour

The message should be:
- Encouraging but not overwhelming
- Specific to their current situation
- Actionable and practical
- 1-2 sentences maximum`;

      const response = await this.client.chat.completions.create({
        model: this.config.model!,
        messages: [
          {
            role: 'system',
            content: 'You are a supportive productivity coach who provides encouraging, actionable messages to help people stay focused.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 100,
        temperature: 0.7
      });

      return response.choices[0]?.message?.content?.trim() || 'Stay focused and keep going!';
    } catch (error) {
      console.error('Error generating motivational message:', error);
      return 'Stay focused and keep going!';
    }
  }

  async analyzeFocusSession(session: {
    duration: number;
    distractions: number;
    tasksCompleted: number;
    breaks: number;
  }): Promise<{
    score: number;
    feedback: string;
    suggestions: string[];
  }> {
    try {
      const prompt = `Analyze this focus session and provide feedback:

Session duration: ${session.duration} minutes
Distractions encountered: ${session.distractions}
Tasks completed: ${session.tasksCompleted}
Breaks taken: ${session.breaks}

Provide:
1. A productivity score (0-100)
2. Brief feedback on the session
3. 2-3 specific suggestions for improvement`;

      const response = await this.client.chat.completions.create({
        model: this.config.model!,
        messages: [
          {
            role: 'system',
            content: 'You are a productivity coach analyzing focus sessions to provide constructive feedback and improvement suggestions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.3
      });

      const result = response.choices[0]?.message?.content?.trim() || '';
      const lines = result.split('\n');
      
      const scoreMatch = lines[0]?.match(/(\d+)/);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 70;
      const feedback = lines[1]?.replace(/^.*?:/, '').trim() || 'Good effort!';
      const suggestions = lines.slice(2).filter(line => line.trim()).map(line => line.replace(/^[-•*]\s*/, '').trim());

      return {
        score,
        feedback,
        suggestions: suggestions.length > 0 ? suggestions : ['Keep up the good work!']
      };
    } catch (error) {
      console.error('Error analyzing focus session:', error);
      return {
        score: 70,
        feedback: 'Good effort on your focus session!',
        suggestions: ['Keep up the good work!']
      };
    }
  }
}

export default OpenAIService; 