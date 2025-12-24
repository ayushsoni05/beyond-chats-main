import axios from 'axios';
import { config } from '../config.js';

export class LaravelApiClient {
  constructor() {
    this.baseUrl = config.laravelApiUrl;
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  }

  /**
   * Get all articles
   */
  async getArticles(params = {}) {
    try {
      const response = await this.client.get('/articles', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching articles:', error.message);
      throw error;
    }
  }

  /**
   * Get single article
   */
  async getArticle(id) {
    try {
      const response = await this.client.get(`/articles/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching article ${id}:`, error.message);
      throw error;
    }
  }

  /**
   * Update article
   */
  async updateArticle(id, data) {
    try {
      const response = await this.client.put(`/articles/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating article ${id}:`, error.message);
      throw error;
    }
  }

  /**
   * Create article
   */
  async createArticle(data) {
    try {
      const response = await this.client.post('/articles', data);
      return response.data;
    } catch (error) {
      console.error('Error creating article:', error.message);
      throw error;
    }
  }

  /**
   * Delete article
   */
  async deleteArticle(id) {
    try {
      const response = await this.client.delete(`/articles/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting article ${id}:`, error.message);
      throw error;
    }
  }

  /**
   * Trigger scraping
   */
  async triggerScrape(limit = 10) {
    try {
      const response = await this.client.post('/articles/scrape', { limit });
      return response.data;
    } catch (error) {
      console.error('Error triggering scrape:', error.message);
      throw error;
    }
  }
}
