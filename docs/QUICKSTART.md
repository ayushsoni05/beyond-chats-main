# Quick Start Guide

Get the BeyondChats application running in under 10 minutes!

## Prerequisites Check

Before you begin, verify you have:
```bash
php --version    # Should be 8.1+
node --version   # Should be 18+
composer --version
npm --version
```

## Step 1: Clone & Setup (2 minutes)

```bash
# Clone the repository
git clone https://github.com/ayushsoni05/BeyondChats.git
cd BeyondChats
```

## Step 2: Backend Setup (3 minutes)

```bash
# Navigate to backend
cd backend

# Install dependencies
composer install

# Setup environment
cp .env.example .env

# Generate application key
php artisan key:generate

# Run database migrations (uses SQLite by default)
php artisan migrate

# Start the server
php artisan serve
# Backend is now running on http://localhost:8000
```

**Keep this terminal open!**

## Step 3: Pipeline Setup (2 minutes)

Open a new terminal:

```bash
# Navigate to pipeline
cd pipeline

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# (Optional) Add your API keys to .env:
# GOOGLE_CUSTOM_SEARCH_API_KEY=your_key
# GOOGLE_CUSTOM_SEARCH_ENGINE_ID=your_id
# OPENAI_API_KEY=your_key

# Start the pipeline server
npm start
# Pipeline is now running on http://localhost:3001
```

**Keep this terminal open!**

## Step 4: Frontend Setup (2 minutes)

Open a third terminal:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Setup environment (optional - defaults work fine)
cp .env.example .env

# Start the development server
npm run dev
# Frontend is now running on http://localhost:5173
```

**Keep this terminal open!**

## Step 5: Start Using! (1 minute)

1. Open your browser and go to: **http://localhost:5173**

2. Click "📥 Scrape Articles" to fetch articles from BeyondChats blog

3. View articles in the list

4. Click "View Comparison" on any article to see side-by-side view

5. (Optional) Click "Refresh" to enhance content with AI (requires API keys)

## What You Should See

### Terminal 1 (Backend):
```
Laravel development server started: http://127.0.0.1:8000
```

### Terminal 2 (Pipeline):
```
✅ BeyondChats Pipeline Server running on port 3001
   Health check: http://localhost:3001/health
   Status: http://localhost:3001/status
```

### Terminal 3 (Frontend):
```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## Troubleshooting

### "Port already in use"
- **Backend**: Use `php artisan serve --port=8001` (update frontend .env)
- **Pipeline**: Change `PIPELINE_PORT` in .env
- **Frontend**: Run `npm run dev -- --port 3000`

### "Database connection failed"
- Backend uses SQLite by default (no setup needed)
- Check that `database/database.sqlite` exists
- Or run `touch database/database.sqlite` and `php artisan migrate` again

### "Cannot connect to API"
1. Verify backend is running on port 8000
2. Test: `curl http://localhost:8000/api/articles`
3. Check CORS settings in `backend/config/cors.php`

### "Module not found" errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- For backend: `composer install` again

## Testing the Setup

### Test Backend API:
```bash
# Should return empty article list
curl http://localhost:8000/api/articles

# Should create a test article
curl -X POST http://localhost:8000/api/articles \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","url":"https://example.com","original_content":"Test content"}'
```

### Test Pipeline:
```bash
# Should return health status
curl http://localhost:3001/health

# Should return pipeline configuration
curl http://localhost:3001/status
```

### Test Frontend:
- Open http://localhost:5173
- You should see the BeyondChats interface
- Click around to test the UI

## Next Steps

### Add API Keys (Optional but Recommended)

To enable content refresh with AI:

1. Get Google Custom Search API:
   - Visit: https://developers.google.com/custom-search/v1/overview
   - Create API key
   - Create search engine: https://programmablesearchengine.google.com/

2. Get OpenAI API key:
   - Visit: https://platform.openai.com/api-keys
   - Create new secret key

3. Add to `pipeline/.env`:
   ```
   GOOGLE_CUSTOM_SEARCH_API_KEY=your_google_key
   GOOGLE_CUSTOM_SEARCH_ENGINE_ID=your_engine_id
   OPENAI_API_KEY=your_openai_key
   ```

4. Restart pipeline server

### Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed production deployment guides for:
- DigitalOcean
- AWS
- Vercel/Netlify
- Traditional VPS

## Architecture Overview

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  Frontend   │────────▶│   Backend   │◀────────│   Pipeline  │
│  (React)    │         │  (Laravel)  │         │  (Node.js)  │
│  :5173      │         │   :8000     │         │   :3001     │
└─────────────┘         └─────────────┘         └─────────────┘
                               │
                               ▼
                        ┌─────────────┐
                        │   SQLite    │
                        │  Database   │
                        └─────────────┘
```

## Common Commands

### Backend
```bash
php artisan migrate          # Run migrations
php artisan migrate:fresh    # Reset database
php artisan route:list       # List all routes
php artisan tinker          # Interactive console
```

### Pipeline
```bash
npm start                   # Start server
npm run dev                # Start with auto-reload
npm run refresh article 1  # Refresh article #1
npm run refresh all        # Refresh all articles
```

### Frontend
```bash
npm run dev      # Development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Documentation

- [README.md](../README.md) - Complete documentation
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guides
- [backend/README.md](../backend/README.md) - Backend docs
- [pipeline/README.md](../pipeline/README.md) - Pipeline docs
- [frontend/README.md](../frontend/README.md) - Frontend docs

## Support

Having issues? Check:
1. All three servers are running
2. Ports 8000, 3001, 5173 are available
3. Dependencies are installed
4. Environment files are configured

Still stuck? Open an issue on GitHub!

---

**🎉 You're all set! Happy coding!**
