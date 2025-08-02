import { SummaryRequest, Summary } from '@/types';
import OpenAIService from './openai';

export interface ContentExtractor {
  extractText(url: string): Promise<string>;
  extractTextFromHTML(html: string): Promise<string>;
  extractTextFromSelection(selection: string): Promise<string>;
}

export class SummarizerService {
  private aiService: OpenAIService;
  private extractor: ContentExtractor;

  constructor(aiService: OpenAIService, extractor: ContentExtractor) {
    this.aiService = aiService;
    this.extractor = extractor;
  }

  async summarizeFromURL(url: string, options: Partial<SummaryRequest> = {}): Promise<Summary> {
    try {
      const text = await this.extractor.extractText(url);
      return this.summarizeContent(text, options);
    } catch (error) {
      console.error('Error summarizing from URL:', error);
      throw new Error('Failed to extract content from URL');
    }
  }

  async summarizeFromHTML(html: string, options: Partial<SummaryRequest> = {}): Promise<Summary> {
    try {
      const text = await this.extractor.extractTextFromHTML(html);
      return this.summarizeContent(text, options);
    } catch (error) {
      console.error('Error summarizing from HTML:', error);
      throw new Error('Failed to extract content from HTML');
    }
  }

  async summarizeFromSelection(selection: string, options: Partial<SummaryRequest> = {}): Promise<Summary> {
    try {
      const text = await this.extractor.extractTextFromSelection(selection);
      return this.summarizeContent(text, options);
    } catch (error) {
      console.error('Error summarizing from selection:', error);
      throw new Error('Failed to extract content from selection');
    }
  }

  private async summarizeContent(text: string, options: Partial<SummaryRequest> = {}): Promise<Summary> {
    const request: SummaryRequest = {
      url: options.url || '',
      content: text,
      length: 'medium',
      includeKeyPoints: true,
      tags: [],
      type: 'article',
      language: 'en',
      ...options
    };

    return this.aiService.summarizeContent(request);
  }

  async generateTLDR(content: string): Promise<string> {
    try {
      const summary = await this.aiService.summarizeContent({
        url: '',
        content,
        length: 'short',
        includeKeyPoints: true,
        tags: [],
        type: 'article',
        language: 'en'
      });
      return summary.summary;
    } catch (error) {
      console.error('Error generating TLDR:', error);
      throw new Error('Failed to generate TLDR');
    }
  }

  async generateBulletPoints(content: string): Promise<string[]> {
    try {
      const summary = await this.aiService.summarizeContent({
        url: '',
        content,
        length: 'long',
        includeKeyPoints: true,
        tags: [],
        type: 'article',
        language: 'en'
      });

      // Split the summary into bullet points
      const points = summary.summary
        .split(/[.!?]+/)
        .map(point => point.trim())
        .filter(point => point.length > 10)
        .slice(0, 5); // Limit to 5 key points

      return points;
    } catch (error) {
      console.error('Error generating bullet points:', error);
      throw new Error('Failed to generate bullet points');
    }
  }
}

export default SummarizerService; 