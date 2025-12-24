import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const PIPELINE_URL = import.meta.env.VITE_PIPELINE_URL || 'http://localhost:3001';

// Create axios instances
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

const pipelineClient = axios.create({
  baseURL: PIPELINE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Articles API
export const articlesApi = {
  // Get all articles
  getAll: async (params = {}) => {
    const response = await apiClient.get('/articles', { params });
    return response.data;
  },

  // Get single article
  getById: async (id) => {
    const response = await apiClient.get(`/articles/${id}`);
    return response.data;
  },

  // Create article
  create: async (data) => {
    const response = await apiClient.post('/articles', data);
    return response.data;
  },

  // Update article
  update: async (id, data) => {
    const response = await apiClient.put(`/articles/${id}`, data);
    return response.data;
  },

  // Delete article
  delete: async (id) => {
    const response = await apiClient.delete(`/articles/${id}`);
    return response.data;
  },

  // Trigger scraping
  scrape: async (limit = 10) => {
    const response = await apiClient.post(`/articles/scrape?limit=${limit}`);
    return response.data;
  },

  // Scrape single article
  scrapeSingle: async (url) => {
    const response = await apiClient.post('/articles/scrape-single', { url });
    return response.data;
  },
};

// Pipeline API
export const pipelineApi = {
  // Get pipeline status
  getStatus: async () => {
    const response = await pipelineClient.get('/status');
    return response.data;
  },

  // Refresh single article
  refreshArticle: async (articleId) => {
    const response = await pipelineClient.post(`/refresh/${articleId}`);
    return response.data;
  },

  // Refresh multiple articles
  refreshMultiple: async (articleIds) => {
    const response = await pipelineClient.post('/refresh', { articleIds });
    return response.data;
  },

  // Refresh all articles
  refreshAll: async () => {
    const response = await pipelineClient.post('/refresh-all');
    return response.data;
  },

  // Refresh by status
  refreshByStatus: async (status) => {
    const response = await pipelineClient.post('/refresh-by-status', { status });
    return response.data;
  },
};

export default {
  articles: articlesApi,
  pipeline: pipelineApi,
};
