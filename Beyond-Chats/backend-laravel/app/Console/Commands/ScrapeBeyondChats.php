<?php

namespace App\Console\Commands;

use App\Services\ArticleScraper;
use Illuminate\Console\Command;

class ScrapeBeyondChats extends Command
{
    protected $signature = 'scrape:beyondchats {--take=5} {--url=}';

    protected $description = 'Scrape the last page of BeyondChats blogs and persist the oldest articles';

    public function handle(ArticleScraper $scraper): int
    {
        $url = $this->option('url') ?? config('app.scraper_target', env('SCRAPER_TARGET', 'https://beyondchats.com/blogs/'));
        $take = (int) $this->option('take');

        $this->info("Scraping {$url} (taking {$take})...");
        $articles = $scraper->scrapeLastPage($url, $take);
        $this->info('Stored ' . count($articles) . ' articles');
        return self::SUCCESS;
    }
}
