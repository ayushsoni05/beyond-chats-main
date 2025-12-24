import axios from 'axios';
import * as cheerio from 'cheerio';

export class WebScraperService {
  constructor() {
    this.timeout = 30000;
  }

  /**
   * Scrape content from a URL
   */
  async scrapeUrl(url) {
    try {
      const response = await axios.get(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });

      const html = response.data;
      const $ = cheerio.load(html);

      // Remove unwanted elements
      $('script, style, nav, header, footer, iframe, noscript').remove();

      // Extract main content
      const content = this.extractMainContent($);
      const title = this.extractTitle($);

      return {
        url,
        title,
        content,
        success: true,
      };
    } catch (error) {
      console.error(`Error scraping ${url}:`, error.message);
      return {
        url,
        title: '',
        content: '',
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Extract title from page
   */
  extractTitle($) {
    // Try multiple selectors for title
    const titleSelectors = [
      'h1',
      'title',
      '.article-title',
      '.post-title',
      '[class*="title"]',
    ];

    for (const selector of titleSelectors) {
      const title = $(selector).first().text().trim();
      if (title) {
        return title;
      }
    }

    return 'Untitled';
  }

  /**
   * Extract main content from page
   */
  extractMainContent($) {
    // Try multiple selectors for main content
    const contentSelectors = [
      'article',
      'main',
      '[role="main"]',
      '.article-content',
      '.post-content',
      '.entry-content',
      '[class*="content"]',
      'body',
    ];

    for (const selector of contentSelectors) {
      const element = $(selector).first();
      if (element.length) {
        // Get text content, preserving paragraphs
        let content = '';
        element.find('p, h1, h2, h3, h4, h5, h6').each((i, el) => {
          const text = $(el).text().trim();
          if (text) {
            content += text + '\n\n';
          }
        });

        if (content.length > 200) {
          return content.trim();
        }
      }
    }

    // Fallback: get all paragraph text
    let content = '';
    $('p').each((i, el) => {
      const text = $(el).text().trim();
      if (text.length > 50) {
        content += text + '\n\n';
      }
    });

    return content.trim();
  }

  /**
   * Scrape multiple URLs
   */
  async scrapeMultiple(urls) {
    const results = [];
    
    for (const url of urls) {
      const result = await this.scrapeUrl(url);
      results.push(result);
      
      // Add a small delay to avoid overwhelming servers
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
  }
}
