# Node.js Content Refresh Pipeline

This Node.js pipeline refreshes and enhances article content using Google Custom Search, web scraping, and OpenAI GPT.

## Features

- Google Custom Search integration for finding related content
- Web scraping of competitor articles
- AI-powered content rewriting using OpenAI GPT
- REST API for triggering refreshes
- Scheduled automatic refresh (cron)
- CLI tool for manual operations

## Requirements

- Node.js 18+
- npm or yarn
- Google Custom Search API credentials
- OpenAI API key
- Running Laravel backend

## Installation

1. Install dependencies:
```bash
cd pipeline
npm install
```

2. Configure environment:
```bash
cp .env.example .env
```

3. Update `.env` with your API keys:
```
GOOGLE_CUSTOM_SEARCH_API_KEY=your_google_api_key
GOOGLE_CUSTOM_SEARCH_ENGINE_ID=your_search_engine_id
OPENAI_API_KEY=your_openai_api_key
LARAVEL_API_URL=http://localhost:8000/api
```

## Getting API Keys

### Google Custom Search API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Custom Search API
4. Create credentials (API Key)
5. Create a Custom Search Engine at [programmablesearchengine.google.com](https://programmablesearchengine.google.com/)
6. Get your Search Engine ID

### OpenAI API
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new secret key

## Usage

### Start the Server
```bash
npm start
```

The pipeline server will run on `http://localhost:3001`

### Development Mode (with auto-reload)
```bash
npm run dev
```

### CLI Commands

Refresh a specific article:
```bash
npm run refresh article 1
```

Refresh all articles:
```bash
npm run refresh all
```

Refresh articles by status:
```bash
npm run refresh status scraped
```

## API Endpoints

### Health Check
```
GET /health
```

### Get Status
```
GET /status
```

Returns configuration and service status.

### Refresh Single Article
```
POST /refresh/:articleId
```

Refreshes content for a specific article.

### Refresh Multiple Articles
```
POST /refresh
Content-Type: application/json

{
  "articleIds": [1, 2, 3]
}
```

### Refresh All Articles
```
POST /refresh-all
```

Starts background refresh for all articles (non-blocking).

### Refresh by Status
```
POST /refresh-by-status
Content-Type: application/json

{
  "status": "scraped"
}
```

## How It Works

1. **Fetch Article**: Retrieves article data from Laravel API
2. **Search**: Generates search query and finds related content using Google Custom Search
3. **Scrape**: Scrapes content from competitor URLs
4. **Rewrite**: Uses OpenAI GPT to rewrite content, incorporating insights from competitors
5. **Update**: Saves the refreshed content back to Laravel API

## Scheduled Refresh

The pipeline can automatically refresh articles on a schedule using cron expressions.

Configure in `.env`:
```
REFRESH_INTERVAL=0 0 * * *  # Daily at midnight
```

Common patterns:
- `0 * * * *` - Every hour
- `0 0 * * *` - Daily at midnight
- `0 0 * * 0` - Weekly on Sunday
- `0 0 1 * *` - Monthly on 1st

## Architecture

```
src/
├── config.js              # Configuration management
├── index.js               # Express server & main entry
├── services/
│   ├── laravelApi.js      # Laravel API client
│   ├── googleSearch.js    # Google Custom Search
│   ├── webScraper.js      # Web scraping service
│   ├── openai.js          # OpenAI integration
│   └── pipeline.js        # Main pipeline orchestration
└── scripts/
    └── refresh.js         # CLI refresh script
```

## Configuration Options

| Variable | Description | Default |
|----------|-------------|---------|
| PIPELINE_PORT | Server port | 3001 |
| LARAVEL_API_URL | Laravel API base URL | http://localhost:8000/api |
| GOOGLE_CUSTOM_SEARCH_API_KEY | Google API key | - |
| GOOGLE_CUSTOM_SEARCH_ENGINE_ID | Search engine ID | - |
| OPENAI_API_KEY | OpenAI API key | - |
| OPENAI_MODEL | GPT model | gpt-3.5-turbo |
| MAX_SEARCH_RESULTS | Max competitor articles | 5 |
| REFRESH_INTERVAL | Cron schedule | 0 0 * * * |
| LOG_LEVEL | Logging level | info |

## Error Handling

The pipeline includes comprehensive error handling:
- Network errors are caught and logged
- Failed articles are marked with `status: 'error'`
- Rate limiting delays prevent API overload
- Graceful degradation if APIs are unavailable

## Rate Limiting

To avoid overwhelming external APIs:
- 1 second delay between scraping URLs
- 2 second delay between refreshing articles
- Configurable batch sizes

## Deployment

### Production Setup

1. Set environment variables in production
2. Use process manager (PM2 recommended):

```bash
npm install -g pm2
pm2 start src/index.js --name beyondchats-pipeline
pm2 startup
pm2 save
```

3. Configure reverse proxy (nginx) if needed
4. Set up monitoring and logging

### Docker Deployment

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
CMD ["npm", "start"]
```

## Monitoring

View logs:
```bash
# PM2
pm2 logs beyondchats-pipeline

# Direct
npm start | tee -a logs/pipeline.log
```

## Troubleshooting

### API Key Issues
- Verify all API keys are correctly set in `.env`
- Check API quotas and limits
- Ensure APIs are enabled in respective consoles

### Laravel Connection Failed
- Verify Laravel backend is running
- Check LARAVEL_API_URL is correct
- Test with: `curl http://localhost:8000/api/articles`

### Scraping Failures
- Some sites may block scrapers
- Adjust User-Agent in webScraper.js
- Consider using proxies for production

### OpenAI Rate Limits
- Reduce batch size
- Increase delays between requests
- Upgrade OpenAI plan if needed

## License

This project is part of the BeyondChats application.
