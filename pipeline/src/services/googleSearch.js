import axios from 'axios';
import { config } from '../config.js';

export class GoogleSearchService {
  constructor() {
    this.apiKey = config.googleApiKey;
    this.searchEngineId = config.googleSearchEngineId;
    this.baseUrl = 'https://www.googleapis.com/customsearch/v1';
  }

  /**
   * Search for related content using Google Custom Search
   */
  async search(query, numResults = 5) {
    try {
      if (!this.apiKey || !this.searchEngineId) {
        throw new Error('Google Custom Search API credentials not configured');
      }

      const response = await axios.get(this.baseUrl, {
        params: {
          key: this.apiKey,
          cx: this.searchEngineId,
          q: query,
          num: Math.min(numResults, 10), // API max is 10
        },
      });

      if (response.data && response.data.items) {
        return response.data.items.map(item => ({
          title: item.title,
          url: item.link,
          snippet: item.snippet,
          displayUrl: item.displayLink,
        }));
      }

      return [];
    } catch (error) {
      console.error('Google Search error:', error.message);
      throw error;
    }
  }

  /**
   * Generate search query from article title
   */
  generateSearchQuery(articleTitle) {
    // Remove common words and clean up title
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'];
    const words = articleTitle
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(' ')
      .filter(word => word.length > 3 && !stopWords.includes(word));
    
    // Take first few important words
    return words.slice(0, 5).join(' ');
  }
}
