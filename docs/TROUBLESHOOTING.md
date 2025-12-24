# Troubleshooting Guide

Common issues and their solutions when working with the BeyondChats application.

## Table of Contents
1. [Backend Issues](#backend-issues)
2. [Pipeline Issues](#pipeline-issues)
3. [Frontend Issues](#frontend-issues)
4. [Integration Issues](#integration-issues)
5. [Deployment Issues](#deployment-issues)

## Backend Issues

### Database Connection Failed

**Symptoms:**
- Error: "could not find driver"
- Connection timeout

**Solutions:**

1. **For SQLite (Default)**:
```bash
cd backend
touch database/database.sqlite
php artisan migrate
```

2. **For MySQL**:
```bash
# Update .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=beyondchats
DB_USERNAME=root
DB_PASSWORD=your_password

# Create database
mysql -u root -p
CREATE DATABASE beyondchats;
exit;

# Run migrations
php artisan migrate
```

3. **Check PHP Extensions**:
```bash
# For SQLite
php -m | grep sqlite

# For MySQL
php -m | grep pdo_mysql
```

### Migration Errors

**Symptoms:**
- "Table already exists"
- "Migration failed"

**Solutions:**
```bash
# Reset database
php artisan migrate:fresh

# Or rollback and re-run
php artisan migrate:rollback
php artisan migrate
```

### Port 8000 Already in Use

**Solutions:**
```bash
# Use different port
php artisan serve --port=8001

# Update frontend .env
VITE_API_BASE_URL=http://localhost:8001/api
```

### CORS Errors

**Symptoms:**
- "Access to XMLHttpRequest has been blocked by CORS policy"

**Solutions:**

1. Check `backend/config/cors.php`:
```php
'allowed_origins' => ['*'], // or ['http://localhost:5173']
```

2. Clear config cache:
```bash
php artisan config:clear
```

### Composer Issues

**Symptoms:**
- "composer.lock is out of sync"
- Package conflicts

**Solutions:**
```bash
rm composer.lock
rm -rf vendor/
composer install
```

## Pipeline Issues

### API Keys Not Working

**Symptoms:**
- "API key not configured"
- 401/403 errors from external APIs

**Solutions:**

1. **Verify keys are set**:
```bash
cat pipeline/.env | grep API_KEY
```

2. **Test Google API**:
```bash
curl "https://www.googleapis.com/customsearch/v1?key=YOUR_KEY&cx=YOUR_CX&q=test"
```

3. **Test OpenAI API**:
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_KEY"
```

### Module Not Found Errors

**Symptoms:**
- "Cannot find module"
- Import errors

**Solutions:**
```bash
cd pipeline
rm -rf node_modules package-lock.json
npm install
```

### Port 3001 Already in Use

**Solutions:**
```bash
# Change port in .env
PIPELINE_PORT=3002

# Update frontend .env
VITE_PIPELINE_URL=http://localhost:3002
```

### Connection to Laravel Failed

**Symptoms:**
- "ECONNREFUSED 127.0.0.1:8000"

**Solutions:**

1. Verify backend is running:
```bash
curl http://localhost:8000/api/articles
```

2. Check LARAVEL_API_URL in pipeline/.env:
```bash
LARAVEL_API_URL=http://localhost:8000/api
```

### Rate Limiting Issues

**Symptoms:**
- 429 errors from external APIs

**Solutions:**

1. Add delays in code
2. Reduce `MAX_SEARCH_RESULTS` in .env
3. Implement exponential backoff
4. Check API quota limits

## Frontend Issues

### Blank White Screen

**Symptoms:**
- Nothing displays
- Console errors

**Solutions:**

1. Check browser console for errors
2. Verify backend is running:
```bash
curl http://localhost:8000/api/articles
```

3. Check .env variables:
```bash
cat frontend/.env
```

4. Rebuild:
```bash
rm -rf node_modules dist
npm install
npm run dev
```

### API Connection Refused

**Symptoms:**
- "Network Error"
- "Failed to fetch"

**Solutions:**

1. Verify API URLs in `.env`:
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_PIPELINE_URL=http://localhost:3001
```

2. Check backend CORS config

3. Test APIs directly:
```bash
curl http://localhost:8000/api/articles
curl http://localhost:3001/health
```

### Build Errors

**Symptoms:**
- "Build failed"
- Module resolution errors

**Solutions:**

1. Clean install:
```bash
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

2. Check Node version:
```bash
node --version  # Should be 18+
```

3. Clear Vite cache:
```bash
rm -rf node_modules/.vite
```

### Routing Not Working in Production

**Symptoms:**
- 404 on page refresh
- Routes don't work after deployment

**Solutions:**

1. **For Nginx**:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

2. **For Apache** (`.htaccess`):
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

## Integration Issues

### Services Can't Communicate

**Symptoms:**
- Frontend can't reach backend
- Pipeline can't reach backend

**Solutions:**

1. Check all services are running:
```bash
# Backend
curl http://localhost:8000/api/articles

# Pipeline
curl http://localhost:3001/health

# Frontend
curl http://localhost:5173
```

2. Verify firewall rules allow local connections

3. Check network configuration in Docker/VM

### Data Not Syncing

**Symptoms:**
- Changes in backend don't appear in frontend
- Pipeline updates not visible

**Solutions:**

1. Hard refresh frontend (Ctrl+Shift+R)
2. Check browser cache
3. Verify API responses:
```bash
curl http://localhost:8000/api/articles/1
```

## Deployment Issues

### Production Build Fails

**Symptoms:**
- Build errors in CI/CD
- Missing dependencies

**Solutions:**

1. **Backend**:
```bash
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

2. **Pipeline**:
```bash
npm ci --production
```

3. **Frontend**:
```bash
npm ci
npm run build
```

### Environment Variables Not Loading

**Symptoms:**
- Config values are undefined
- Features don't work in production

**Solutions:**

1. Check deployment platform has env vars set
2. Verify .env file exists in production
3. For frontend, rebuild after env changes:
```bash
npm run build
```

### Database Migration Fails in Production

**Symptoms:**
- Migration errors
- Table creation fails

**Solutions:**

1. Run migrations manually:
```bash
php artisan migrate --force
```

2. Check database credentials in production .env

3. Verify database user has CREATE permissions

### SSL Certificate Issues

**Symptoms:**
- "Certificate not trusted"
- HTTPS errors

**Solutions:**

1. **Let's Encrypt**:
```bash
sudo certbot --nginx -d yourdomain.com
```

2. Verify certificate:
```bash
curl -I https://yourdomain.com
```

3. Check cert expiration:
```bash
echo | openssl s_client -servername yourdomain.com -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates
```

## Performance Issues

### Slow API Responses

**Solutions:**

1. **Enable caching**:
```bash
# Backend
php artisan config:cache
php artisan route:cache
```

2. **Database indexing**:
```sql
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_created ON articles(created_at);
```

3. **Redis caching**:
```bash
composer require predis/predis
# Update .env
CACHE_DRIVER=redis
```

### High Memory Usage

**Solutions:**

1. **Pipeline**:
```javascript
// Limit concurrent operations
// Increase delays between requests
```

2. **Backend**:
```bash
# Increase PHP memory limit
php -d memory_limit=512M artisan serve
```

### Frontend Loading Slow

**Solutions:**

1. Build for production:
```bash
npm run build
```

2. Enable gzip in server config

3. Use CDN for assets

## Debugging Tips

### Enable Verbose Logging

**Backend**:
```env
APP_DEBUG=true
LOG_LEVEL=debug
```

**Pipeline**:
```env
LOG_LEVEL=debug
```

### Check Logs

**Backend**:
```bash
tail -f backend/storage/logs/laravel.log
```

**Pipeline**:
```bash
tail -f pipeline/logs/pipeline.log
# Or if using PM2:
pm2 logs beyondchats-pipeline
```

### Network Debugging

```bash
# Check port usage
netstat -an | grep LISTEN

# Test connectivity
telnet localhost 8000
telnet localhost 3001

# Monitor requests
# Install: npm install -g http-proxy-cli
http-proxy 8080 localhost:8000
```

## Getting Help

If you're still stuck after trying these solutions:

1. Check existing GitHub issues
2. Review documentation in `/docs`
3. Enable debug mode and check logs
4. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Environment details (OS, PHP/Node versions)
   - Relevant logs

## Useful Commands

### Health Checks
```bash
# Backend
curl http://localhost:8000/api/articles

# Pipeline
curl http://localhost:3001/health

# Frontend
curl http://localhost:5173
```

### Reset Everything
```bash
# Backend
cd backend
php artisan migrate:fresh
php artisan cache:clear

# Pipeline
cd pipeline
rm -rf node_modules
npm install

# Frontend
cd frontend
rm -rf node_modules dist
npm install
```

### Check Versions
```bash
php --version
composer --version
node --version
npm --version
```

---

**Last Updated**: December 2025

For more help, see [QUICKSTART.md](QUICKSTART.md) or [README.md](../README.md)
