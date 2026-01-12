# GitHub Copilot Instructions for Beyond-Chats

## Project Overview

BeyondChats Multi-Phase Solution is a full-stack application that scrapes BeyondChats blog articles, refreshes their content via Google search and LLM rewriting, and displays both original and updated versions.

## Architecture

This is a monorepo containing three main components:

1. **backend-laravel** - Laravel API backend for scraping BeyondChats blog, storing articles, and CRUD operations
2. **node-pipeline** - Node.js refresh pipeline for Google search, competitor scraping, and LLM-style rewriting
3. **frontend-react** - React frontend for displaying original and updated articles
4. **backend-express** - Express.js backend (alternative/additional backend service)

## Tech Stack

### Backend (Laravel)
- PHP 8.2+
- Laravel framework
- Composer for dependency management
- MySQL/Postgres database
- Artisan CLI commands

### Node Pipeline & Express Backend
- Node.js 18+
- ES Modules (type: "module" in package.json)
- Dependencies: axios, cheerio, dotenv, openai
- npm for package management

### Frontend (React)
- React 18.2+
- Vite as build tool
- ES Modules
- Axios for API calls

## Development Commands

### Laravel Backend
```bash
cd Beyond-Chats/backend-laravel
composer install                          # Install dependencies
php artisan migrate                       # Run migrations
php artisan scrape:beyondchats           # Seed with scraped articles
php artisan serve --host=0.0.0.0 --port=8000  # Start server
```

### Node Pipeline
```bash
cd Beyond-Chats/node-pipeline
npm install                               # Install dependencies
node index.js                             # Run pipeline once
```

### Express Backend
```bash
cd Beyond-Chats/backend-express
npm install                               # Install dependencies
npm run dev                               # Start dev server with watch mode
npm start                                 # Start production server
```

### React Frontend
```bash
cd Beyond-Chats/frontend-react
npm install                               # Install dependencies
npm run dev                               # Start dev server
npm run build                             # Build for production
npm run preview                           # Preview production build
```

## Code Style and Conventions

### General
- Use clear, descriptive variable and function names
- Add comments for complex logic or business rules
- Keep functions small and focused on a single responsibility

### JavaScript/Node.js
- Use ES6+ syntax (const/let, arrow functions, async/await)
- Use ES Modules (import/export) - all Node.js projects use `"type": "module"`
- Prefer async/await over promise chains
- Handle errors appropriately with try/catch blocks

### React
- Use functional components with hooks
- Keep components focused and reusable
- Use proper prop types and meaningful prop names

### PHP/Laravel
- Follow Laravel conventions and directory structure
- Use Eloquent ORM for database operations
- Create Artisan commands for CLI operations
- Use migrations for database schema changes

## Environment Configuration

### Laravel (.env)
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=beyondchats
DB_USERNAME=root
DB_PASSWORD=
SCRAPER_TARGET=https://beyondchats.com/blogs/
```

### Node Pipeline (.env)
```
API_BASE=http://localhost:8000/api
GOOGLE_API_KEY=your_google_custom_search_key
GOOGLE_CX=your_custom_search_cx
OPENAI_API_KEY=your_llm_key
```

### React Frontend (.env)
```
VITE_API_BASE=http://localhost:8000/api
```

## Important Notes

- The LLM step uses a placeholder/fallback when `OPENAI_API_KEY` is not provided
- Google search requires Custom Search API credentials (API key and CX)
- The scraper targets the last page of BeyondChats blog and stores the 5 oldest articles
- All services expect the Laravel API to be running on port 8000
- Frontend uses Vite's environment variables (prefix with `VITE_`)

## Testing

Currently, there is no test infrastructure in place. When adding tests:
- Consider using PHPUnit for Laravel backend tests
- Use Jest or Vitest for JavaScript/React tests
- Follow the testing patterns common in the respective frameworks

## File Structure Guidelines

- Place Laravel controllers in `backend-laravel/app/Http/Controllers/`
- Place Laravel models in `backend-laravel/app/Models/`
- Place Laravel migrations in `backend-laravel/database/migrations/`
- Place Laravel routes in `backend-laravel/routes/`
- Place React components appropriately within `frontend-react/src/`
- Keep pipeline logic in `node-pipeline/index.js` or modularize into separate files
- Keep Express routes and controllers in `backend-express/`

## Dependencies Management

- Use `composer require` for adding PHP dependencies
- Use `npm install <package>` for adding Node.js dependencies
- Keep dependencies up to date but test thoroughly after updates
- Only add dependencies that are necessary

## API Integration

- The Laravel backend exposes REST API endpoints at `/api/*`
- Frontend and pipeline communicate with the backend via these API endpoints
- Use proper HTTP methods (GET, POST, PUT, DELETE) for CRUD operations
- Handle API errors gracefully with user-friendly messages

## Security Considerations

- Never commit `.env` files with real credentials
- Validate and sanitize all user inputs
- Use Laravel's built-in CSRF protection for forms
- Implement proper authentication if user management is added
- Be cautious with external API keys and rate limits
