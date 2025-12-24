# BeyondChats Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         BeyondChats System                       │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│                  │         │                  │         │                  │
│  React Frontend  │◄────────┤  Laravel API     │◄────────┤   Node.js        │
│  (Vite)          │         │  Backend         │         │   Pipeline       │
│                  │         │                  │         │                  │
│  Port: 5173      │         │  Port: 8000      │         │   Port: 3001     │
└──────────────────┘         └──────────────────┘         └──────────────────┘
        │                            │                             │
        │                            │                             │
        │                            ▼                             │
        │                    ┌──────────────┐                     │
        │                    │   MySQL      │                     │
        │                    │   Database   │                     │
        │                    └──────────────┘                     │
        │                                                          │
        └──────────────────────────────────────────────────────────┘
                            ▼                          ▼
                  ┌──────────────────┐    ┌──────────────────────┐
                  │  BeyondChats     │    │  Google Custom       │
                  │  Blog            │    │  Search API          │
                  │  (Scraping)      │    │                      │
                  └──────────────────┘    └──────────────────────┘
                                                    ▼
                                          ┌──────────────────────┐
                                          │  OpenAI API          │
                                          │  (Content Rewrite)   │
                                          └──────────────────────┘
```

## Component Overview

### 1. Laravel API Backend (`/backend`)
**Purpose**: Core API server for article management and scraping

**Responsibilities**:
- Scrape articles from BeyondChats blog
- Store articles in MySQL database
- Provide REST CRUD endpoints at `/api/articles`
- Manage original article content

**Key Endpoints**:
- `GET /api/articles` - List all articles
- `GET /api/articles/{id}` - Get single article
- `POST /api/articles` - Create article (manual or scrape)
- `PUT /api/articles/{id}` - Update article
- `DELETE /api/articles/{id}` - Delete article
- `POST /api/articles/scrape` - Trigger scraping

**Tech Stack**:
- Laravel 10.x
- MySQL 8.0+
- PHP 8.1+
- Guzzle HTTP Client

### 2. Node.js Pipeline (`/pipeline`)
**Purpose**: Content refresh and enhancement pipeline

**Responsibilities**:
- Fetch articles from Laravel API
- Search for related content using Google Custom Search
- Scrape competitor articles
- Rewrite content using OpenAI GPT
- Update articles with refreshed content

**Key Features**:
- Google Custom Search integration
- Web scraping with Puppeteer/Cheerio
- OpenAI GPT-3.5/4 integration
- Scheduled or on-demand execution

**Tech Stack**:
- Node.js 18+
- Express.js
- Axios for HTTP
- OpenAI SDK
- Google Custom Search API

### 3. React Frontend (`/frontend`)
**Purpose**: User interface for viewing and comparing articles

**Responsibilities**:
- Display list of all articles
- Show side-by-side comparison (original vs updated)
- Trigger content refresh
- Manage article CRUD operations

**Key Features**:
- Responsive design
- Side-by-side article comparison
- Real-time updates
- Search and filter

**Tech Stack**:
- React 18
- Vite
- Tailwind CSS / Material-UI
- Axios / Fetch API

## Data Flow

### 1. Initial Article Scraping
```
User Action → Frontend → Laravel API → BeyondChats Blog
                            ↓
                       Store in MySQL
                            ↓
                       Return Articles
```

### 2. Content Refresh Pipeline
```
User/Schedule → Pipeline → Laravel API (fetch articles)
                    ↓
              Google Search (find competitors)
                    ↓
              Scrape Competitors
                    ↓
              OpenAI (rewrite content)
                    ↓
              Laravel API (update articles)
```

### 3. Article Display
```
Frontend → Laravel API → MySQL → Return Articles
            ↓
    Display Side-by-Side
    (Original | Updated)
```

## API Contracts

### Laravel API Response Format

**Article Object**:
```json
{
  "id": 1,
  "title": "Article Title",
  "url": "https://beyondchats.com/blog/article",
  "original_content": "Original article text...",
  "updated_content": "Updated article text...",
  "scraped_at": "2025-12-24T10:00:00Z",
  "updated_at": "2025-12-24T12:00:00Z",
  "status": "updated"
}
```

### Pipeline API Format

**Refresh Request**:
```json
{
  "article_id": 1,
  "search_queries": ["topic keywords"],
  "model": "gpt-3.5-turbo"
}
```

## Database Schema

### Articles Table
```sql
CREATE TABLE articles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(500) NOT NULL,
    url TEXT NOT NULL,
    original_content TEXT,
    updated_content TEXT,
    meta_description TEXT,
    status ENUM('scraped', 'processing', 'updated', 'error') DEFAULT 'scraped',
    scraped_at TIMESTAMP,
    updated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Security Considerations

1. **API Keys**: Store in environment variables, never commit
2. **CORS**: Configure appropriate origins
3. **Rate Limiting**: Implement for external API calls
4. **Input Validation**: Sanitize all user inputs
5. **Authentication**: Add JWT/OAuth for production

## Deployment Strategy

### Development
- Run all three services locally
- Use separate terminals or docker-compose
- Hot reload enabled for all modules

### Production
- Backend: Deploy to Laravel Forge / AWS / DigitalOcean
- Pipeline: Deploy to AWS Lambda / DigitalOcean
- Frontend: Deploy to Vercel / Netlify
- Database: Managed MySQL (AWS RDS / DigitalOcean)

## Scalability Considerations

1. **Queue System**: Add Laravel queues for scraping
2. **Caching**: Redis for article caching
3. **CDN**: For frontend assets
4. **Load Balancing**: For high traffic
5. **Database Replication**: Read replicas for scaling

## Monitoring & Logging

- Laravel logs in `backend/storage/logs`
- Pipeline logs in `pipeline/logs`
- Frontend console logs
- Consider: Sentry, LogRocket, New Relic
