import { PipelineService } from '../services/pipeline.js';
import { validateConfig } from '../config.js';

const pipeline = new PipelineService();

async function main() {
  console.log('🚀 BeyondChats Content Refresh CLI\n');
  
  // Validate configuration
  validateConfig();
  
  const args = process.argv.slice(2);
  const command = args[0];
  
  try {
    switch (command) {
      case 'article':
        // Refresh specific article
        const articleId = parseInt(args[1]);
        if (!articleId) {
          console.error('Usage: npm run refresh article <articleId>');
          process.exit(1);
        }
        await pipeline.refreshArticle(articleId);
        break;
        
      case 'all':
        // Refresh all articles
        await pipeline.refreshAllArticles();
        break;
        
      case 'status':
        // Refresh articles by status
        const status = args[1] || 'scraped';
        await pipeline.refreshByStatus(status);
        break;
        
      default:
        console.log('Usage:');
        console.log('  npm run refresh article <articleId>  - Refresh a specific article');
        console.log('  npm run refresh all                  - Refresh all articles');
        console.log('  npm run refresh status [status]      - Refresh articles by status (default: scraped)');
        process.exit(1);
    }
    
    console.log('\n✅ Refresh completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Refresh failed:', error.message);
    process.exit(1);
  }
}

main();
