<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreArticleRequest;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ArticleController extends Controller
{
    public function index(Request $request)
    {
        $query = Article::query();

        if ($request->boolean('updated_only')) {
            $query->where('is_original', false);
        }

        $query->orderBy(
            $request->input('sort', 'created_at'),
            $request->input('direction', 'desc')
        );

        if ($limit = $request->integer('limit')) {
            return $query->limit($limit)->get();
        }

        return $query->paginate($request->integer('per_page', 10));
    }

    public function show(Article $article)
    {
        return $article;
    }

    public function store(StoreArticleRequest $request)
    {
        $article = Article::create($request->validated());
        return response()->json($article, 201);
    }

    public function update(StoreArticleRequest $request, Article $article)
    {
        $article->update($request->validated());
        return $article;
    }

    public function destroy(Article $article)
    {
        $article->delete();
        return response()->noContent();
    }
}
