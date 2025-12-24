import { LaravelApiClient } from './laravelApi.js';
import { GoogleSearchService } from './googleSearch.js';
import { WebScraperService } from './webScraper.js';
import { OpenAIService } from './openai.js';
import { config } from '../config.js';

export class PipelineService {
  constructor() {
    this.laravelApi = new LaravelApiClient();
    this.googleSearch = new GoogleSearchService();
    this.webScraper = new WebScraperService();
    this.openaiService = new OpenAIService();
  }

  /**
   * Refresh content for a single article
   */
  async refreshArticle(articleId) {
    console.log(`\n🔄 Starting refresh for article ${articleId}`);
    
    try {
      // Step 1: Fetch article from Laravel API
      console.log('   Fetching article data...');
      const article = await this.laravelApi.getArticle(articleId);
      
      if (!article || !article.title) {
        throw new Error('Article not found or invalid');
      }

      console.log(`   Article: ${article.title}`);

      // Mark as processing
      await this.laravelApi.updateArticle(articleId, { status: 'processing' });

      // Step 2: Search for related content
      console.log('   Searching for related content...');
      const searchQuery = this.googleSearch.generateSearchQuery(article.title);
      const searchResults = await this.googleSearch.search(
        searchQuery,
        config.maxSearchResults
      );

      console.log(`   Found ${searchResults.length} related articles`);

      // Step 3: Scrape competitor content
      console.log('   Scraping competitor content...');
      const competitorUrls = searchResults.map(result => result.url);
      const scrapedContent = await this.webScraper.scrapeMultiple(competitorUrls);
      
      const successfulScrapes = scrapedContent.filter(item => item.success);
      console.log(`   Successfully scraped ${successfulScrapes.length} articles`);

      // Step 4: Rewrite content using OpenAI
      console.log('   Rewriting content with AI...');
      const rewriteResult = await this.openaiService.rewriteContent(
        article.original_content || '',
        successfulScrapes,
        article.title
      );

      console.log(`   Content rewritten (${rewriteResult.tokensUsed} tokens used)`);

      // Step 5: Update article with new content
      console.log('   Updating article...');
      const updatedArticle = await this.laravelApi.updateArticle(articleId, {
        updated_content: rewriteResult.content,
        status: 'updated',
      });

      console.log(`✅ Article ${articleId} refreshed successfully\n`);

      return {
        success: true,
        articleId,
        title: article.title,
        searchResultsCount: searchResults.length,
        scrapedCount: successfulScrapes.length,
        tokensUsed: rewriteResult.tokensUsed,
      };
    } catch (error) {
      console.error(`❌ Error refreshing article ${articleId}:`, error.message);
      
      // Mark as error
      try {
        await this.laravelApi.updateArticle(articleId, { status: 'error' });
      } catch (updateError) {
        console.error('Failed to update article status:', updateError.message);
      }

      return {
        success: false,
        articleId,
        error: error.message,
      };
    }
  }

  /**
   * Refresh multiple articles
   */
  async refreshMultipleArticles(articleIds) {
    console.log(`\n🚀 Starting batch refresh for ${articleIds.length} articles\n`);
    
    const results = [];
    
    for (const articleId of articleIds) {
      const result = await this.refreshArticle(articleId);
      results.push(result);
      
      // Add delay between articles to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`\n✅ Batch refresh completed: ${successCount}/${results.length} successful\n`);

    return results;
  }

  /**
   * Refresh all articles in database
   */
  async refreshAllArticles() {
    console.log('\n🌐 Fetching all articles for refresh...\n');
    
    try {
      const response = await this.laravelApi.getArticles({ per_page: 100 });
      const articles = response.data || response;
      
      if (!articles || articles.length === 0) {
        console.log('No articles found to refresh');
        return [];
      }

      const articleIds = articles.map(article => article.id);
      return await this.refreshMultipleArticles(articleIds);
    } catch (error) {
      console.error('Error fetching articles:', error.message);
      throw error;
    }
  }

  /**
   * Refresh articles with specific status
   */
  async refreshByStatus(status = 'scraped') {
    console.log(`\n🔍 Fetching articles with status: ${status}\n`);
    
    try {
      const response = await this.laravelApi.getArticles({ status, per_page: 100 });
      const articles = response.data || response;
      
      if (!articles || articles.length === 0) {
        console.log(`No articles found with status: ${status}`);
        return [];
      }

      const articleIds = articles.map(article => article.id);
      return await this.refreshMultipleArticles(articleIds);
    } catch (error) {
      console.error('Error fetching articles by status:', error.message);
      throw error;
    }
  }
}
