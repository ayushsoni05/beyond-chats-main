import express from 'express';
import cron from 'node-cron';
import { config, validateConfig } from './config.js';
import { PipelineService } from './services/pipeline.js';

const app = express();
const pipeline = new PipelineService();

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'beyondchats-pipeline',
    timestamp: new Date().toISOString(),
  });
});

// Refresh single article
app.post('/refresh/:articleId', async (req, res) => {
  try {
    const { articleId } = req.params;
    const result = await pipeline.refreshArticle(parseInt(articleId));
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Refresh multiple articles
app.post('/refresh', async (req, res) => {
  try {
    const { articleIds } = req.body;
    
    if (!articleIds || !Array.isArray(articleIds)) {
      return res.status(400).json({ 
        success: false, 
        error: 'articleIds must be an array' 
      });
    }
    
    const results = await pipeline.refreshMultipleArticles(articleIds);
    res.json({ 
      success: true, 
      results 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Refresh all articles
app.post('/refresh-all', async (req, res) => {
  try {
    // Start the refresh process asynchronously
    res.json({ 
      success: true, 
      message: 'Refresh process started',
      note: 'This may take some time. Check logs for progress.' 
    });
    
    // Run in background
    pipeline.refreshAllArticles().catch(err => {
      console.error('Background refresh error:', err);
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Refresh articles by status
app.post('/refresh-by-status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ 
        success: false, 
        error: 'status is required' 
      });
    }
    
    // Start the refresh process asynchronously
    res.json({ 
      success: true, 
      message: `Refresh process started for articles with status: ${status}`,
      note: 'This may take some time. Check logs for progress.' 
    });
    
    // Run in background
    pipeline.refreshByStatus(status).catch(err => {
      console.error('Background refresh error:', err);
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get pipeline status
app.get('/status', (req, res) => {
  res.json({
    service: 'beyondchats-pipeline',
    version: '1.0.0',
    config: {
      laravelApiUrl: config.laravelApiUrl,
      openaiModel: config.openaiModel,
      maxSearchResults: config.maxSearchResults,
      refreshInterval: config.refreshInterval,
      hasGoogleApiKey: !!config.googleApiKey,
      hasOpenAiKey: !!config.openaiApiKey,
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Setup scheduled refresh (optional)
function setupScheduledRefresh() {
  if (config.refreshInterval) {
    console.log(`⏰ Scheduled refresh enabled: ${config.refreshInterval}`);
    
    cron.schedule(config.refreshInterval, async () => {
      console.log('\n⏰ Scheduled refresh triggered');
      try {
        await pipeline.refreshByStatus('scraped');
      } catch (error) {
        console.error('Scheduled refresh error:', error);
      }
    });
  }
}

// Start server
function startServer() {
  // Validate configuration
  console.log('🔧 Validating configuration...');
  validateConfig();
  
  // Start Express server
  app.listen(config.port, () => {
    console.log(`\n✅ BeyondChats Pipeline Server running on port ${config.port}`);
    console.log(`   Health check: http://localhost:${config.port}/health`);
    console.log(`   Status: http://localhost:${config.port}/status\n`);
  });
  
  // Setup scheduled refresh
  setupScheduledRefresh();
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();
