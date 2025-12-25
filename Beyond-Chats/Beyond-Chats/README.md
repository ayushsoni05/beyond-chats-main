# BeyondChats Multi-Phase Solution

This workspace contains three parts:
- Laravel API backend (scrape BeyondChats blog, store articles, CRUD)
- Node.js refresh pipeline (Google search, scrape competitors, LLM-style rewrite, publish)
- React frontend (display original and updated articles)

## Quick Start

### Prerequisites
- PHP 8.2+, Composer, MySQL/Postgres (Laravel)
- Node.js 18+
- npm or yarn

### Backend (Laravel)
1) `cd backend-laravel`
2) If a Laravel app is not present, scaffold one: `composer create-project laravel/laravel .`
3) Copy the provided files in `app`, `database/migrations`, and `routes` into the Laravel app (overwriting placeholders if needed).
4) Install dependencies: `composer install`
5) Create `.env` and set DB plus `SCRAPER_TARGET=https://beyondchats.com/blogs/`.
6) Run migrations: `php artisan migrate`
7) Seed with scraper: `php artisan scrape:beyondchats` (stores 5 oldest from last blog page)
8) Serve API: `php artisan serve --host=0.0.0.0 --port=8000`

### Node pipeline
1) `cd node-pipeline`
2) `npm install`
3) Set `.env` with:
   - `API_BASE=http://localhost:8000/api`
   - `GOOGLE_API_KEY=your_google_custom_search_key`
   - `GOOGLE_CX=your_custom_search_cx`
   - `OPENAI_API_KEY=your_llm_key` (or leave blank to use deterministic fallback)
4) Run once: `node index.js`

### React frontend
1) `cd frontend-react`
2) `npm install`
3) Set `.env` with `VITE_API_BASE=http://localhost:8000/api`
4) Start dev server: `npm run dev`

## Notes
- The LLM step uses a placeholder when `OPENAI_API_KEY` is absent.
- Google search uses Custom Search API; update env values accordingly.
- Partial work is acceptable; see inline comments for assumptions.
