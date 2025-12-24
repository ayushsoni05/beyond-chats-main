# BeyondChats - Full-Stack Article Management System

A full-stack monolithic application that scrapes articles from BeyondChats blog, refreshes their content using AI, and displays side-by-side comparisons. Built with Laravel (backend), Node.js (pipeline), and React (frontend).

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    BeyondChats System                        │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   React      │◄────────│   Laravel    │◄────────│   Node.js    │
│   Frontend   │         │   Backend    │         │   Pipeline   │
│  (Port 5173) │         │  (Port 8000) │         │  (Port 3001) │
└──────────────┘         └──────────────┘         └──────────────┘
                                │                         │
                                ▼                         │
                        ┌──────────────┐                 │
                        │   MySQL/     │                 │
                        │   SQLite     │                 │
                        └──────────────┘                 │
                                                          │
                    External Services:                    │
                    • BeyondChats Blog (scraping)        │
                    • Google Custom Search API◄──────────┘
                    • OpenAI GPT API◄───────────────────┘
```

## 🚀 Features

### Laravel Backend (`/backend`)
- RESTful API for article CRUD operations
- Web scraper for BeyondChats blog
- MySQL/SQLite database storage
- CORS-enabled for frontend integration
- Comprehensive API documentation

### Node.js Pipeline (`/pipeline`)
- Google Custom Search integration
- Competitor content scraping
- OpenAI GPT content rewriting
- Scheduled automatic refresh (cron)
- REST API and CLI interface

### React Frontend (`/frontend`)
- Article listing with search/filter
- Side-by-side content comparison
- Real-time status updates
- Responsive design
- Dark theme UI

## 📋 Prerequisites

- **PHP** 8.1+ with Composer
- **Node.js** 18+ with npm
- **MySQL** 8.0+ (or use SQLite for development)
- **Git**

### API Keys Required
- Google Custom Search API key ([Get it here](https://developers.google.com/custom-search/v1/overview))
- Google Search Engine ID ([Create here](https://programmablesearchengine.google.com/))
- OpenAI API key ([Get it here](https://platform.openai.com/api-keys))

## 🛠️ Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/ayushsoni05/Beyond-chats.git
cd Beyond-chats
```

### 2. Setup Backend (Laravel)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
# Backend runs on http://localhost:8000
```

### 3. Setup Pipeline (Node.js)
```bash
cd ../pipeline
npm install
cp .env.example .env
# Edit .env and add your API keys:
# GOOGLE_CUSTOM_SEARCH_API_KEY=your_key
# GOOGLE_CUSTOM_SEARCH_ENGINE_ID=your_id
# OPENAI_API_KEY=your_key
npm start
# Pipeline runs on http://localhost:3001
```

### 4. Setup Frontend (React)
```bash
cd ../frontend
npm install
cp .env.example .env
npm run dev
# Frontend runs on http://localhost:5173
```

### 5. Access Application
Open your browser and navigate to:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api
- **Pipeline API**: http://localhost:3001

## 📁 Project Structure

```
Beyond-chats/
├── backend/              # Laravel API Backend
│   ├── app/
│   │   ├── Http/Controllers/
│   │   │   └── ArticleController.php
│   │   ├── Models/
│   │   │   └── Article.php
│   │   └── Services/
│   │       └── BeyondChatsScraper.php
│   ├── database/migrations/
│   ├── routes/api.php
│   └── README.md
│
├── pipeline/             # Node.js Content Pipeline
│   ├── src/
│   │   ├── services/
│   │   │   ├── googleSearch.js
│   │   │   ├── webScraper.js
│   │   │   ├── openai.js
│   │   │   ├── laravelApi.js
│   │   │   └── pipeline.js
│   │   ├── scripts/
│   │   │   └── refresh.js
│   │   ├── config.js
│   │   └── index.js
│   └── README.md
│
├── frontend/             # React + Vite Frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── ArticleList.jsx
│   │   │   └── ArticleComparison.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── README.md
│
├── docs/
│   └── ARCHITECTURE.md   # Detailed architecture documentation
│
├── .env.example          # Root environment template
├── .gitignore
└── README.md             # This file
```

## 🔧 Configuration

### Backend Configuration (`.env`)
```env
DB_CONNECTION=sqlite  # or mysql
DB_DATABASE=/path/to/database.sqlite

APP_URL=http://localhost:8000
```

### Pipeline Configuration (`.env`)
```env
LARAVEL_API_URL=http://localhost:8000/api
GOOGLE_CUSTOM_SEARCH_API_KEY=your_key_here
GOOGLE_CUSTOM_SEARCH_ENGINE_ID=your_engine_id
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-3.5-turbo
```

### Frontend Configuration (`.env`)
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_PIPELINE_URL=http://localhost:3001
```

## 📖 Usage Guide

### Scraping Articles
1. Open frontend at http://localhost:5173
2. Click "📥 Scrape Articles" button
3. Wait for scraping to complete
4. Articles will appear in the list

### Refreshing Content
1. Click "🔄 Refresh All" to refresh all articles
2. Or click "Refresh" on individual articles
3. Pipeline will:
   - Search for related content
   - Scrape competitor articles
   - Rewrite content using AI
   - Update the article

### Viewing Comparisons
1. Click "View Comparison" on any article
2. See original and updated content side-by-side
3. Trigger manual refresh if needed

## 🧪 API Documentation

### Backend API Endpoints

#### Articles
```
GET    /api/articles          - List all articles
GET    /api/articles/{id}     - Get single article
POST   /api/articles          - Create article
PUT    /api/articles/{id}     - Update article
DELETE /api/articles/{id}     - Delete article
POST   /api/articles/scrape   - Trigger scraping
```

### Pipeline API Endpoints

#### Refresh Operations
```
GET  /health                   - Health check
GET  /status                   - Pipeline status
POST /refresh/{id}             - Refresh single article
POST /refresh                  - Refresh multiple articles
POST /refresh-all              - Refresh all articles
POST /refresh-by-status        - Refresh by status
```

## 🚀 Deployment

### Backend Deployment
- **Laravel Forge**: Automatic deployment
- **DigitalOcean**: Use App Platform or Droplet
- **AWS**: Elastic Beanstalk or EC2
- **Heroku**: Using Heroku PHP buildpack

### Pipeline Deployment
- **DigitalOcean**: App Platform or Droplet
- **AWS Lambda**: Serverless deployment
- **Heroku**: Node.js buildpack
- **PM2**: Process manager for production

### Frontend Deployment
- **Vercel**: `vercel --prod`
- **Netlify**: Deploy `dist/` folder
- **GitHub Pages**: Static hosting
- **Cloudflare Pages**: Git integration

See individual README files in each directory for detailed deployment instructions.

## 🔍 Development

### Run Tests

Backend:
```bash
cd backend
php artisan test
```

Frontend:
```bash
cd frontend
npm run lint
```

### Code Style

Backend:
```bash
cd backend
./vendor/bin/pint
```

## 📊 Database Schema

### Articles Table
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| title | VARCHAR(500) | Article title |
| url | TEXT | Source URL |
| original_content | TEXT | Scraped content |
| updated_content | TEXT | AI-enhanced content |
| meta_description | TEXT | Meta description |
| status | ENUM | scraped/processing/updated/error |
| scraped_at | TIMESTAMP | Scrape timestamp |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last update |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🐛 Troubleshooting

### Backend not starting
- Check PHP version: `php --version`
- Verify database connection in `.env`
- Run `php artisan migrate`

### Pipeline errors
- Verify API keys in `.env`
- Check Laravel backend is running
- Review logs in `pipeline/logs/`

### Frontend connection issues
- Ensure backend and pipeline are running
- Check CORS configuration
- Verify API URLs in `.env`

### Scraping failures
- Target website may have changed structure
- Check network connectivity
- Adjust scraper selectors in code

## 📚 Additional Resources

- [Laravel Documentation](https://laravel.com/docs)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Google Custom Search API](https://developers.google.com/custom-search)

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation in `/docs`
- Review individual README files

---

**Built with ❤️ using Laravel, Node.js, and React**
