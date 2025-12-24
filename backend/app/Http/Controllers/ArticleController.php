<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Services\BeyondChatsScraper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ArticleController extends Controller
{
    protected $scraper;

    public function __construct(BeyondChatsScraper $scraper)
    {
        $this->scraper = $scraper;
    }

    /**
     * Display a listing of articles.
     */
    public function index(Request $request)
    {
        $query = Article::query();

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search by title
        if ($request->has('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $articles = $query->paginate($perPage);

        return response()->json($articles);
    }

    /**
     * Store a newly created article.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:500',
            'url' => 'required|url',
            'original_content' => 'nullable|string',
            'updated_content' => 'nullable|string',
            'meta_description' => 'nullable|string',
            'status' => 'nullable|in:scraped,processing,updated,error',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $article = Article::create($validator->validated());

        return response()->json($article, 201);
    }

    /**
     * Display the specified article.
     */
    public function show($id)
    {
        $article = Article::findOrFail($id);
        return response()->json($article);
    }

    /**
     * Update the specified article.
     */
    public function update(Request $request, $id)
    {
        $article = Article::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:500',
            'url' => 'sometimes|required|url',
            'original_content' => 'nullable|string',
            'updated_content' => 'nullable|string',
            'meta_description' => 'nullable|string',
            'status' => 'nullable|in:scraped,processing,updated,error',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $article->update($validator->validated());

        return response()->json($article);
    }

    /**
     * Remove the specified article.
     */
    public function destroy($id)
    {
        $article = Article::findOrFail($id);
        $article->delete();

        return response()->json(['message' => 'Article deleted successfully'], 200);
    }

    /**
     * Trigger scraping of BeyondChats blog.
     */
    public function scrape(Request $request)
    {
        try {
            $limit = $request->get('limit', 10);
            $articles = $this->scraper->scrapeArticles($limit);

            return response()->json([
                'message' => 'Scraping completed successfully',
                'count' => count($articles),
                'articles' => $articles,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Scraping failed',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Scrape a single article by URL.
     */
    public function scrapeSingle(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'url' => 'required|url',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $article = $this->scraper->scrapeArticle($request->url);

            if ($article) {
                return response()->json([
                    'message' => 'Article scraped successfully',
                    'article' => $article,
                ], 200);
            } else {
                return response()->json([
                    'error' => 'Failed to scrape article',
                ], 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Scraping failed',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}

