<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Article extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'summary',
        'body',
        'source_url',
        'published_at',
        'is_original',
        'citations',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'is_original' => 'boolean',
        'citations' => 'array',
    ];

    protected static function booted(): void
    {
        static::creating(function (Article $article) {
            if (empty($article->slug)) {
                $article->slug = Str::slug($article->title . '-' . Str::random(6));
            }
        });
    }
}
