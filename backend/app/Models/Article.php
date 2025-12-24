<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    protected $fillable = [
        'title',
        'url',
        'original_content',
        'updated_content',
        'meta_description',
        'status',
        'scraped_at',
    ];

    protected $casts = [
        'scraped_at' => 'datetime',
    ];
}
