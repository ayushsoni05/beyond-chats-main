<?php

namespace App\Services;

use App\Models\Article;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class BeyondChatsScraper
{
    protected $client;
    protected $baseUrl = 'https://www.beyondchats.com';

    public function __construct()
    {
        $this->client = new Client([
            'timeout' => 30,
            'verify' => false,
        ]);
    }

    /**
     * Scrape articles from BeyondChats blog
     */
    public function scrapeArticles($limit = 10)
    {
        try {
            $blogUrl = $this->baseUrl . '/blog';
            $response = $this->client->get($blogUrl);
            $html = (string) $response->getBody();

            // Parse HTML to extract article links
            $articles = $this->parseArticleLinks($html, $limit);

            $scrapedArticles = [];
            foreach ($articles as $articleUrl) {
                $article = $this->scrapeArticle($articleUrl);
                if ($article) {
                    $scrapedArticles[] = $article;
                }
            }

            return $scrapedArticles;
        } catch (\Exception $e) {
            Log::error('Error scraping BeyondChats blog: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Parse article links from blog page HTML
     */
    protected function parseArticleLinks($html, $limit)
    {
        $links = [];
        
        // Simple regex to extract article URLs
        // Adjust pattern based on actual BeyondChats blog structure
        preg_match_all('/<a[^>]+href=["\']([^"\']*\/blog\/[^"\']+)["\'][^>]*>/i', $html, $matches);
        
        if (isset($matches[1])) {
            $links = array_unique($matches[1]);
            $links = array_slice($links, 0, $limit);
            
            // Ensure full URLs
            $links = array_map(function($link) {
                if (strpos($link, 'http') !== 0) {
                    return $this->baseUrl . $link;
                }
                return $link;
            }, $links);
        }

        return $links;
    }

    /**
     * Scrape a single article
     */
    public function scrapeArticle($url)
    {
        try {
            $response = $this->client->get($url);
            $html = (string) $response->getBody();

            $title = $this->extractTitle($html);
            $content = $this->extractContent($html);
            $metaDescription = $this->extractMetaDescription($html);

            // Check if article already exists
            $article = Article::where('url', $url)->first();

            if ($article) {
                // Update existing article
                $article->update([
                    'title' => $title,
                    'original_content' => $content,
                    'meta_description' => $metaDescription,
                    'scraped_at' => now(),
                ]);
            } else {
                // Create new article
                $article = Article::create([
                    'title' => $title,
                    'url' => $url,
                    'original_content' => $content,
                    'meta_description' => $metaDescription,
                    'status' => 'scraped',
                    'scraped_at' => now(),
                ]);
            }

            return $article;
        } catch (\Exception $e) {
            Log::error('Error scraping article ' . $url . ': ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Extract title from HTML
     */
    protected function extractTitle($html)
    {
        if (preg_match('/<title[^>]*>(.*?)<\/title>/is', $html, $matches)) {
            return trim(strip_tags($matches[1]));
        }

        if (preg_match('/<h1[^>]*>(.*?)<\/h1>/is', $html, $matches)) {
            return trim(strip_tags($matches[1]));
        }

        return 'Untitled Article';
    }

    /**
     * Extract main content from HTML
     */
    protected function extractContent($html)
    {
        // Remove script and style tags
        $html = preg_replace('/<script[^>]*>.*?<\/script>/is', '', $html);
        $html = preg_replace('/<style[^>]*>.*?<\/style>/is', '', $html);

        // Try to find article content
        // Common patterns: <article>, <main>, <div class="content">, etc.
        $patterns = [
            '/<article[^>]*>(.*?)<\/article>/is',
            '/<main[^>]*>(.*?)<\/main>/is',
            '/<div[^>]*class=["\'][^"\']*content[^"\']*["\'][^>]*>(.*?)<\/div>/is',
            '/<div[^>]*class=["\'][^"\']*post[^"\']*["\'][^>]*>(.*?)<\/div>/is',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $html, $matches)) {
                $content = $matches[1];
                // Strip remaining HTML tags but keep structure
                $content = strip_tags($content, '<p><br><h1><h2><h3><h4><h5><h6><ul><ol><li>');
                return trim($content);
            }
        }

        // Fallback: extract all paragraph content
        preg_match_all('/<p[^>]*>(.*?)<\/p>/is', $html, $matches);
        if (isset($matches[1])) {
            $content = implode("\n\n", array_map('strip_tags', $matches[1]));
            return trim($content);
        }

        return '';
    }

    /**
     * Extract meta description from HTML
     */
    protected function extractMetaDescription($html)
    {
        if (preg_match('/<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']*)["\'][^>]*>/i', $html, $matches)) {
            return trim($matches[1]);
        }

        if (preg_match('/<meta[^>]*content=["\']([^"\']*)["\'][^>]*name=["\']description["\'][^>]*>/i', $html, $matches)) {
            return trim($matches[1]);
        }

        return '';
    }
}
