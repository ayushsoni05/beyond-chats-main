# BeyondChats Multi-Phase Solution

A full-stack monolithic repository that scrapes BeyondChats blog articles, refreshes them via Google search and LLM rewriting, and displays both original and updated versions side-by-side.

**🌐 Live Demo**: [https://your-deployed-frontend.vercel.app](https://your-deployed-frontend.vercel.app)

> **Note**: Replace the link above with your actual Vercel deployment URL after deploying the frontend.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture & Data Flow Diagram](#architecture--data-flow-diagram)
- [Local Setup Instructions](#local-setup-instructions)
- [Technology Stack](#technology-stack)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

This monolithic repository contains three integrated components:

1. **Laravel API Backend** (`backend-laravel/`): 
   - Scrapes BeyondChats blog articles using Cheerio
   - Stores articles in MySQL/PostgreSQL database
   - Provides REST API endpoints for CRUD operations

2. **Node.js Pipeline** (`node-pipeline/`): 
   - Fetches articles from Laravel API
   - Uses Google Custom Search API to find similar/competing articles
   - Scrapes competitor content
   - Rewrites content using OpenAI API (with deterministic fallback)
   - Updates database with refreshed content

3. **React Frontend** (`frontend-react/`): 
   - Displays original and updated articles side-by-side
   - Fetches data from Laravel API
   - Built with Vite + React 18

---

## 🏗️ Architecture & Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    BEYONDCHATS CONTENT PIPELINE                     │
└─────────────────────────────────────────────────────────────────────┘

                          ┌──────────────────┐
                          │   React Frontend │
                          │   (Port 5173)    │
                          │                  │
                          │  - View Articles │
                          │  - Compare Orig. │
                          │  - View Updated  │
                          └────────┬─────────┘
                                   │
                          GET /api/articles
                                   │
                                   ↓
                          ┌────────────────┐
                          │  Laravel API   │
                          │  (Port 8000)   │
                          │                │
                          │  - CRUD Ops    │
                          │  - Database    │
                          │  - Scraper     │
                          └────────┬───────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ↓                             ↓
          ┌─────────────────┐         ┌──────────────────┐
          │   MySQL/Postgres │         │  Node.js Pipeline│
          │                  │         │  (Manual Run)    │
          │  - Articles      │         │                  │
          │  - original_     │         │  1. Fetch        │
          │    content       │         │  2. Google       │
          │  - updated_      │         │     Search       │
          │    content       │         │  3. Scrape       │
          └─────────────────┘         │     Competitors  │
                    ↑                 │  4. LLM Rewrite  │
                    │                 │  5. Store Updated│
                    │                 └──────────────────┘
                    │                          │
                    └──────────────────────────┘
                             PUT /api/articles/{id}

External APIs Used:
┌────────────────────┐       ┌────────────────────┐
│  Google Custom     │       │  OpenAI GPT-3.5    │
│  Search API        │       │  (Optional)        │
│                    │       │                    │
│  - Find competing  │       │  - Rewrite content │
│    articles        │       │  - Uses fallback   │
└────────────────────┘       └────────────────────┘

Data Flow:
1. Frontend requests articles from Laravel API
2. Laravel retrieves from database and returns JSON
3. Pipeline fetches articles from API
4. Pipeline Google searches for competitor content
5. Pipeline scrapes competitor websites
6. LLM rewrites/refreshes content
7. Pipeline updates database via API
8. Frontend displays original vs updated side-by-side
```

---

## 🚀 Local Setup Instructions

### Prerequisites

Ensure you have the following installed:

- **PHP 8.2+** with Composer
- **Node.js 18+** and npm
- **MySQL** or **PostgreSQL**
- **Git**

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/Beyond-Chats.git
cd Beyond-Chats
```

### 2️⃣ Backend Setup (Laravel)

```bash
# Navigate to backend directory
cd backend-laravel

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database in .env file
# Open .env and set:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=beyondchats
# DB_USERNAME=root
# DB_PASSWORD=your_password
#
# SCRAPER_TARGET=https://beyondchats.com/blogs/

# Run database migrations
php artisan migrate

# Scrape initial articles (optional)
php artisan scrape:beyondchats

# Start Laravel development server
php artisan serve --host=0.0.0.0 --port=8000
```

**Laravel API will be running at**: `http://localhost:8000`

**Available API Endpoints**:
- `GET /api/articles` - Fetch all articles
- `GET /api/articles/{id}` - Fetch single article
- `POST /api/articles` - Create article
- `PUT /api/articles/{id}` - Update article
- `DELETE /api/articles/{id}` - Delete article

### 3️⃣ Node.js Pipeline Setup

Open a **new terminal** and run:

```bash
# Navigate to pipeline directory
cd node-pipeline

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure environment variables in .env:
# API_BASE=http://localhost:8000/api
# GOOGLE_API_KEY=your_google_custom_search_key
# GOOGLE_CX=your_custom_search_engine_id
# OPENAI_API_KEY=your_openai_api_key (optional)

# Run the pipeline (one-time execution)
npm start
# or
node index.js
```

**What the pipeline does**:
- Fetches articles from Laravel API
- Searches Google for competitor content
- Scrapes competitor websites
- Rewrites content using OpenAI (or fallback method)
- Updates articles in database

### 4️⃣ Frontend Setup (React)

Open a **new terminal** and run:

```bash
# Navigate to frontend directory
cd frontend-react

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure environment variables in .env:
# VITE_API_BASE=http://localhost:8000/api

# Start development server
npm run dev
```

**React frontend will be running at**: `http://localhost:5173`

### 5️⃣ Access the Application

1. Open your browser
2. Navigate to `http://localhost:5173`
3. You should see the BeyondChats article viewer with original and updated articles displayed side-by-side

---

## 🛠️ Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Backend Framework** | Laravel | 11.x |
| **Backend Language** | PHP | 8.2+ |
| **Database** | MySQL/PostgreSQL | 8.0+ / 15+ |
| **Frontend Framework** | React | 18.x |
| **Frontend Build Tool** | Vite | 5.x |
| **Pipeline Runtime** | Node.js | 18+ |
| **HTTP Client** | Axios | 1.6+ |
| **Web Scraping** | Cheerio | 1.0+ |
| **LLM Integration** | OpenAI API | Latest |
| **Search API** | Google Custom Search | v1 |

---

## 🌐 Deployment

### Frontend Deployment (Vercel)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. **Configure settings**:
   - **Root Directory**: `frontend-react`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Add Environment Variable**:
   - Name: `VITE_API_BASE`
   - Value: `https://your-backend-url.railway.app/api`
5. Click **Deploy**
6. Update the live demo link in this README

### Backend Deployment (Railway/Render)

**Option 1: Railway**
1. Go to [railway.app](https://railway.app)
2. Deploy from GitHub
3. Select `backend-laravel` folder
4. Add environment variables (see `.env.example`)
5. Railway auto-detects Laravel with provided Dockerfile

**Option 2: Render**
1. Go to [render.com](https://render.com)
2. New Web Service → GitHub
3. Select repo, runtime: Docker
4. Add environment variables
5. Deploy

**After backend deployment**, update the frontend environment variable `VITE_API_BASE` in Vercel to point to your deployed backend URL.

---

## 📝 API Documentation

### GET /api/articles

Retrieve all articles with original and updated content.

**Request**:
```bash
curl http://localhost:8000/api/articles
```

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "title": "How to Use BeyondChats for Customer Support",
      "original_content": "Original article content...",
      "updated_content": "Updated/refreshed content...",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-02T00:00:00Z"
    }
  ]
}
```

### POST /api/articles

Create a new article.

**Request**:
```bash
curl -X POST http://localhost:8000/api/articles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Article",
    "original_content": "Content here"
  }'
```

### PUT /api/articles/{id}

Update an existing article.

**Request**:
```bash
curl -X PUT http://localhost:8000/api/articles/1 \
  -H "Content-Type: application/json" \
  -d '{
    "updated_content": "Refreshed content here"
  }'
```

---

## 🔐 Environment Variables

### Backend (.env)
```env
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=beyondchats
DB_USERNAME=root
DB_PASSWORD=

SCRAPER_TARGET=https://beyondchats.com/blogs/
```

### Pipeline (.env)
```env
API_BASE=http://localhost:8000/api
GOOGLE_API_KEY=your_google_api_key
GOOGLE_CX=your_custom_search_cx
OPENAI_API_KEY=your_openai_api_key
```

### Frontend (.env)
```env
VITE_API_BASE=http://localhost:8000/api
```

---

## 🐛 Troubleshooting

### Laravel Migrations Fail
```bash
# Check database connection
php artisan tinker
# In tinker: DB::connection()->getPdo();

# Reset migrations
php artisan migrate:fresh
```

### Pipeline Timeout Errors
- Verify API keys are valid
- Check that Laravel API is running
- Ensure internet connection is stable
- Increase timeout in Node.js if needed

### React Can't Connect to API
- Verify `VITE_API_BASE` environment variable is set correctly
- Ensure Laravel server is running on port 8000
- Check browser console for CORS errors
- Verify API endpoint returns data: `curl http://localhost:8000/api/articles`

### Missing Dependencies
```bash
# For Laravel
cd backend-laravel
composer install

# For Node pipeline
cd node-pipeline
rm -rf node_modules package-lock.json
npm install

# For React frontend
cd frontend-react
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Project Structure

```
Beyond-Chats/
├── backend-laravel/           # Laravel API Backend
│   ├── app/
│   │   ├── Console/Commands/ScrapeBeyondChats.php
│   │   ├── Http/Controllers/ArticleController.php
│   │   ├── Models/Article.php
│   │   └── Services/ArticleScraper.php
│   ├── database/migrations/
│   ├── routes/api.php
│   ├── Dockerfile
│   ├── Procfile
│   └── .env.example
│
├── node-pipeline/             # Content Refresh Pipeline
│   ├── index.js
│   ├── package.json
│   └── .env.example
│
├── frontend-react/            # React Frontend
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
│
├── README.md                  # This file
├── .gitignore
└── VERCEL_DEPLOYMENT.md      # Deployment guide
```

---

## 📝 Notes

- The LLM rewrite step uses a deterministic fallback when `OPENAI_API_KEY` is not set
- Google Custom Search API has a free tier limit of ~100 queries/day
- Pipeline can be run manually or scheduled via cron job
- All three modules can run independently
- CORS is configured in Laravel to allow frontend requests

---

## 📄 License

MIT License - Feel free to use this project for personal or commercial purposes.

---

## 👥 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Review inline code comments
- Check the troubleshooting section above

---

**Repository**: [https://github.com/YOUR_USERNAME/Beyond-Chats](https://github.com/YOUR_USERNAME/Beyond-Chats)  
**Status**: Public ✅ (Accessible for team review)  
**Last Updated**: December 2025

---

**✨ Happy Coding!**

