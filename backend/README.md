# Laravel API Backend

This is the Laravel API backend for the BeyondChats application. It provides REST CRUD endpoints for articles and scraping functionality.

## Features

- REST API for article management (CRUD operations)
- Web scraping of BeyondChats blog articles
- MySQL database storage
- CORS enabled for frontend integration
- API versioning ready

## Requirements

- PHP 8.1 or higher
- Composer
- MySQL 8.0+
- Laravel 12.x

## Installation

1. Install dependencies:
```bash
cd backend
composer install
```

2. Configure environment:
```bash
cp .env.example .env
php artisan key:generate
```

3. Update database configuration in `.env`:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=beyondchats
DB_USERNAME=root
DB_PASSWORD=your_password
```

4. Run migrations:
```bash
php artisan migrate
```

5. Start the development server:
```bash
php artisan serve
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Articles

- `GET /api/articles` - List all articles
  - Query params: `status`, `search`, `sort_by`, `sort_order`, `per_page`
  
- `GET /api/articles/{id}` - Get single article

- `POST /api/articles` - Create new article
  ```json
  {
    "title": "Article Title",
    "url": "https://example.com/article",
    "original_content": "Content...",
    "meta_description": "Description"
  }
  ```

- `PUT /api/articles/{id}` - Update article

- `DELETE /api/articles/{id}` - Delete article

### Scraping

- `POST /api/articles/scrape` - Scrape multiple articles from BeyondChats blog
  - Query param: `limit` (default: 10)

- `POST /api/articles/scrape-single` - Scrape single article
  ```json
  {
    "url": "https://www.beyondchats.com/blog/article-url"
  }
  ```

## Database Schema

### Articles Table

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| title | VARCHAR(500) | Article title |
| url | TEXT | Article URL |
| original_content | TEXT | Original scraped content |
| updated_content | TEXT | Updated/refreshed content |
| meta_description | TEXT | Meta description |
| status | ENUM | scraped, processing, updated, error |
| scraped_at | TIMESTAMP | When article was scraped |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

## Development

### Run Tests
```bash
php artisan test
```

### Code Style
```bash
./vendor/bin/pint
```

### Clear Cache
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

## Deployment

### Production Setup

1. Set environment to production in `.env`:
```
APP_ENV=production
APP_DEBUG=false
```

2. Optimize for production:
```bash
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

3. Configure web server (Nginx/Apache) to point to `public/` directory

4. Set up SSL certificate

5. Configure database backups

### Environment Variables

See `.env.example` for all available configuration options.

## Architecture

- **Models**: `app/Models/Article.php`
- **Controllers**: `app/Http/Controllers/ArticleController.php`
- **Services**: `app/Services/BeyondChatsScraper.php`
- **Routes**: `routes/api.php`
- **Migrations**: `database/migrations/`

## Troubleshooting

### Database Connection Error
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database exists: `CREATE DATABASE beyondchats;`

### CORS Issues
- Check `config/cors.php` configuration
- Verify `allowed_origins` includes frontend URL

### Scraping Failures
- Check target website structure hasn't changed
- Verify SSL verification settings in scraper
- Check network connectivity

## License

This project is part of the BeyondChats application.
