<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreArticleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'summary' => ['nullable', 'string'],
            'body' => ['required', 'string'],
            'source_url' => ['nullable', 'url'],
            'published_at' => ['nullable', 'date'],
            'is_original' => ['boolean'],
            'citations' => ['nullable', 'array'],
            'citations.*' => ['string'],
        ];
    }
}
