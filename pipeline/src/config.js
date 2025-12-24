import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server Configuration
  port: process.env.PIPELINE_PORT || 3001,
  
  // Laravel API Configuration
  laravelApiUrl: process.env.LARAVEL_API_URL || 'http://localhost:8000/api',
  
  // Google Custom Search Configuration
  googleApiKey: process.env.GOOGLE_CUSTOM_SEARCH_API_KEY || '',
  googleSearchEngineId: process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID || '',
  
  // OpenAI Configuration
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiModel: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
  
  // Pipeline Configuration
  maxSearchResults: parseInt(process.env.MAX_SEARCH_RESULTS) || 5,
  refreshInterval: process.env.REFRESH_INTERVAL || '0 0 * * *', // Daily at midnight
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
};

// Validate required configuration
export function validateConfig() {
  const errors = [];
  
  if (!config.googleApiKey) {
    errors.push('GOOGLE_CUSTOM_SEARCH_API_KEY is required');
  }
  
  if (!config.googleSearchEngineId) {
    errors.push('GOOGLE_CUSTOM_SEARCH_ENGINE_ID is required');
  }
  
  if (!config.openaiApiKey) {
    errors.push('OPENAI_API_KEY is required');
  }
  
  if (errors.length > 0) {
    console.warn('⚠️  Configuration warnings:');
    errors.forEach(error => console.warn(`   - ${error}`));
    console.warn('   The pipeline will have limited functionality without these keys.');
  }
  
  return errors.length === 0;
}
