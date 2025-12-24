<?php

use App\Http\Controllers\ArticleController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public article routes
Route::get('/articles', [ArticleController::class, 'index']);
Route::get('/articles/{id}', [ArticleController::class, 'show']);
Route::post('/articles', [ArticleController::class, 'store']);
Route::put('/articles/{id}', [ArticleController::class, 'update']);
Route::delete('/articles/{id}', [ArticleController::class, 'destroy']);

// Scraping routes
Route::post('/articles/scrape', [ArticleController::class, 'scrape']);
Route::post('/articles/scrape-single', [ArticleController::class, 'scrapeSingle']);

// User route (protected)
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
