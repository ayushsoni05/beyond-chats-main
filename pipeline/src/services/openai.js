import OpenAI from 'openai';
import { config } from '../config.js';

export class OpenAIService {
  constructor() {
    if (!config.openaiApiKey) {
      console.warn('OpenAI API key not configured. Content rewriting will not work.');
      this.client = null;
    } else {
      this.client = new OpenAI({
        apiKey: config.openaiApiKey,
      });
    }
    this.model = config.openaiModel;
  }

  /**
   * Rewrite content using OpenAI
   */
  async rewriteContent(originalContent, competitorContent, articleTitle) {
    if (!this.client) {
      throw new Error('OpenAI client not configured');
    }

    try {
      const prompt = this.buildPrompt(originalContent, competitorContent, articleTitle);

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a professional content writer. Your task is to rewrite and enhance articles by incorporating insights from competitor content while maintaining originality and improving quality.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const rewrittenContent = response.choices[0]?.message?.content || '';
      
      return {
        content: rewrittenContent,
        model: this.model,
        tokensUsed: response.usage?.total_tokens || 0,
      };
    } catch (error) {
      console.error('OpenAI rewrite error:', error.message);
      throw error;
    }
  }

  /**
   * Build prompt for content rewriting
   */
  buildPrompt(originalContent, competitorContent, articleTitle) {
    const competitorText = competitorContent
      .map((item, index) => `\nCompetitor ${index + 1} (${item.title}):\n${item.content.substring(0, 1000)}...`)
      .join('\n\n');

    return `
Title: ${articleTitle}

Original Content:
${originalContent.substring(0, 2000)}

Competitor Insights:
${competitorText}

Task: Rewrite the original content to make it more comprehensive and valuable by:
1. Keeping the core message and structure of the original
2. Incorporating relevant insights and information from competitor content
3. Improving clarity and readability
4. Adding value where the competitors provide better information
5. Maintaining a professional and engaging tone
6. Ensuring the content is original and not plagiarized

Please provide the rewritten content (aim for similar length to the original):
    `.trim();
  }

  /**
   * Generate summary of content
   */
  async summarizeContent(content, maxLength = 200) {
    if (!this.client) {
      throw new Error('OpenAI client not configured');
    }

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a professional content summarizer. Create concise, informative summaries.',
          },
          {
            role: 'user',
            content: `Summarize the following content in ${maxLength} words or less:\n\n${content}`,
          },
        ],
        temperature: 0.5,
        max_tokens: 300,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI summarize error:', error.message);
      throw error;
    }
  }
}
