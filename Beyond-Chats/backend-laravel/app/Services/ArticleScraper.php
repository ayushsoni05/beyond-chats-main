<?php

namespace App\Services;

use App\Models\Article;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Throwable;

class ArticleScraper
{
    public function scrapeLastPage(string $url, int $take = 5): array
    {
        $response = Http::get($url);
        $response->throw();

        $dom = new \DOMDocument();
        libxml_use_internal_errors(true);
        $dom->loadHTML($response->body());
        libxml_clear_errors();

        $xpath = new \DOMXPath($dom);
        // Attempt to grab article links; adjust selectors as site evolves.
        $nodes = $xpath->query('//article//a[@href] | //div[contains(@class,"post") or contains(@class,"card")]//a[@href]');

        $links = [];
        foreach ($nodes as $node) {
            $href = $node->getAttribute('href');
            if (Str::startsWith($href, '/')) {
                $href = rtrim($url, '/') . $href;
            }
            $links[] = $href;
        }

        $links = array_values(array_unique($links));
        $links = array_slice($links, -$take); // last page => oldest

        $saved = [];
        foreach ($links as $link) {
            try {
                $saved[] = $this->scrapeArticlePage($link);
            } catch (Throwable $e) {
                // skip failures to keep run resilient
                continue;
            }
        }

        return Arr::where($saved, fn ($article) => $article !== null);
    }

    protected function scrapeArticlePage(string $url): ?Article
    {
        $resp = Http::get($url);
        $resp->throw();

        $dom = new \DOMDocument();
        libxml_use_internal_errors(true);
        $dom->loadHTML($resp->body());
        libxml_clear_errors();

        $xpath = new \DOMXPath($dom);
        $titleNode = $xpath->query('//h1')->item(0);
        $title = $titleNode?->textContent ?? 'Untitled';

        $bodyNodes = $xpath->query('//article//p | //main//p');
        $paragraphs = [];
        foreach ($bodyNodes as $p) {
            $text = trim($p->textContent);
            if ($text !== '') {
                $paragraphs[] = $text;
            }
        }
        $body = implode("\n\n", $paragraphs);

        return Article::firstOrCreate(
            ['slug' => Str::slug($title)],
            [
                'title' => $title,
                'summary' => Str::limit($body, 240),
                'body' => $body,
                'source_url' => $url,
                'published_at' => now(),
                'is_original' => true,
            ]
        );
    }
}
