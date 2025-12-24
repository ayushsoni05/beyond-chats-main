# Deployment Guide

This guide covers deploying the BeyondChats application to various platforms.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Deployment](#backend-deployment)
3. [Pipeline Deployment](#pipeline-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Production Checklist](#production-checklist)
6. [Monitoring](#monitoring)

## Prerequisites

- Domain name (optional but recommended)
- SSL certificate (Let's Encrypt recommended)
- Production API keys (Google, OpenAI)
- Database server (MySQL 8.0+)

## Backend Deployment

### Option 1: DigitalOcean App Platform

1. Create a new app in DigitalOcean
2. Connect your GitHub repository
3. Configure build settings:
   - **Build Command**: `composer install --optimize-autoloader --no-dev`
   - **Run Command**: `php artisan serve --host=0.0.0.0 --port=${PORT}`
4. Set environment variables:
   ```
   APP_ENV=production
   APP_DEBUG=false
   APP_KEY=<generate with php artisan key:generate>
   DB_CONNECTION=mysql
   DB_HOST=<your-db-host>
   DB_DATABASE=<your-db-name>
   DB_USERNAME=<your-db-user>
   DB_PASSWORD=<your-db-password>
   ```
5. Run migrations: `php artisan migrate --force`
6. Deploy!

### Option 2: AWS Elastic Beanstalk

1. Install EB CLI: `pip install awsebcli`
2. Initialize: `eb init`
3. Create environment: `eb create production`
4. Configure `.ebextensions/laravel.config`:
   ```yaml
   option_settings:
     aws:elasticbeanstalk:container:php:phpini:
       document_root: /public
   ```
5. Set environment variables in AWS Console
6. Deploy: `eb deploy`

### Option 3: Traditional VPS (Ubuntu)

1. Install dependencies:
```bash
sudo apt update
sudo apt install nginx php8.2-fpm php8.2-mysql composer mysql-server
```

2. Clone and setup:
```bash
cd /var/www
git clone <your-repo> beyondchats
cd beyondchats/backend
composer install --optimize-autoloader --no-dev
```

3. Configure nginx:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    root /var/www/beyondchats/backend/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

4. Setup SSL with Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

5. Configure environment:
```bash
cp .env.example .env
php artisan key:generate
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Pipeline Deployment

### Option 1: DigitalOcean App Platform

1. Create new app for pipeline
2. Configure build settings:
   - **Build Command**: `npm ci`
   - **Run Command**: `npm start`
3. Set environment variables:
   ```
   NODE_ENV=production
   LARAVEL_API_URL=https://api.yourdomain.com/api
   GOOGLE_CUSTOM_SEARCH_API_KEY=<your-key>
   GOOGLE_CUSTOM_SEARCH_ENGINE_ID=<your-id>
   OPENAI_API_KEY=<your-key>
   ```
4. Deploy!

### Option 2: AWS Lambda (Serverless)

1. Install Serverless Framework: `npm install -g serverless`
2. Create `serverless.yml`:
```yaml
service: beyondchats-pipeline

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    LARAVEL_API_URL: ${env:LARAVEL_API_URL}
    GOOGLE_API_KEY: ${env:GOOGLE_API_KEY}
    OPENAI_API_KEY: ${env:OPENAI_API_KEY}

functions:
  refresh:
    handler: src/lambda.refresh
    events:
      - http:
          path: refresh/{id}
          method: post
  refreshAll:
    handler: src/lambda.refreshAll
    events:
      - schedule: rate(1 day)
```

3. Deploy: `serverless deploy`

### Option 3: Traditional VPS with PM2

1. Install PM2:
```bash
npm install -g pm2
```

2. Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'beyondchats-pipeline',
    script: 'src/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PIPELINE_PORT: 3001
    }
  }]
}
```

3. Start with PM2:
```bash
cd /var/www/beyondchats/pipeline
npm ci
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

4. Configure nginx reverse proxy:
```nginx
server {
    listen 80;
    server_name pipeline.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. Configure `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```
3. Deploy: `vercel --prod`
4. Set environment variables in Vercel dashboard

### Option 2: Netlify

1. Build locally:
```bash
cd frontend
npm run build
```

2. Deploy via Netlify CLI:
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

3. Or connect GitHub and configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

### Option 3: Static Hosting (Nginx)

1. Build the app:
```bash
cd frontend
npm run build
```

2. Copy to web server:
```bash
sudo cp -r dist/* /var/www/beyondchats-frontend/
```

3. Configure nginx:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/beyondchats-frontend;

    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

4. Setup SSL:
```bash
sudo certbot --nginx -d yourdomain.com
```

## Production Checklist

### Backend
- [ ] Set `APP_ENV=production`
- [ ] Set `APP_DEBUG=false`
- [ ] Generate new `APP_KEY`
- [ ] Configure production database
- [ ] Setup database backups
- [ ] Configure Redis for caching
- [ ] Setup queue workers
- [ ] Enable log rotation
- [ ] Configure CORS properly
- [ ] Run `composer install --optimize-autoloader --no-dev`
- [ ] Run optimization commands:
  ```bash
  php artisan config:cache
  php artisan route:cache
  php artisan view:cache
  ```

### Pipeline
- [ ] Set `NODE_ENV=production`
- [ ] Use production API keys
- [ ] Configure proper error logging
- [ ] Setup process manager (PM2)
- [ ] Configure rate limiting
- [ ] Setup monitoring
- [ ] Configure automatic restarts
- [ ] Test API integrations

### Frontend
- [ ] Build for production: `npm run build`
- [ ] Set production API URLs
- [ ] Enable asset compression
- [ ] Configure CDN (optional)
- [ ] Setup analytics (optional)
- [ ] Test on multiple devices
- [ ] Verify CORS settings
- [ ] Enable HTTPS

### Security
- [ ] SSL certificates installed
- [ ] Firewall configured
- [ ] Database credentials secured
- [ ] API keys in environment variables
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Input validation in place
- [ ] SQL injection prevention
- [ ] XSS protection enabled

### Monitoring
- [ ] Setup application monitoring
- [ ] Configure error tracking (Sentry)
- [ ] Setup uptime monitoring
- [ ] Configure log aggregation
- [ ] Setup performance monitoring
- [ ] Create backup strategy
- [ ] Document rollback procedure

## Monitoring

### Backend Monitoring

**Laravel Telescope** (Development):
```bash
composer require laravel/telescope --dev
php artisan telescope:install
php artisan migrate
```

**Sentry** (Production):
```bash
composer require sentry/sentry-laravel
php artisan sentry:publish --dsn=<your-dsn>
```

### Pipeline Monitoring

**PM2 Monitoring**:
```bash
pm2 monit
pm2 logs beyondchats-pipeline
```

**Winston Logger** (add to pipeline):
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Frontend Monitoring

**Sentry**:
```bash
npm install @sentry/react
```

**Google Analytics**:
```javascript
// Add to index.html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

### Uptime Monitoring

Use services like:
- UptimeRobot
- Pingdom
- StatusCake
- Better Uptime

### Log Aggregation

Consider using:
- Papertrail
- Loggly
- ELK Stack (Elasticsearch, Logstash, Kibana)
- AWS CloudWatch

## Database Backups

### Automated MySQL Backups

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u root -p$DB_PASSWORD beyondchats > /backups/beyondchats_$DATE.sql
# Keep only last 7 days
find /backups -name "beyondchats_*.sql" -mtime +7 -delete
```

Add to crontab:
```
0 2 * * * /path/to/backup.sh
```

## Scaling Considerations

### Backend Scaling
- Use Laravel Horizon for queue management
- Implement Redis caching
- Setup read replicas for database
- Use load balancer for multiple instances

### Pipeline Scaling
- Run multiple instances with PM2
- Use message queue (RabbitMQ/Redis)
- Implement job queuing
- Consider serverless for bursty workloads

### Frontend Scaling
- Use CDN (Cloudflare, CloudFront)
- Enable asset caching
- Implement lazy loading
- Optimize bundle size

## Rollback Procedure

1. **Backend**:
   ```bash
   git checkout <previous-version>
   composer install
   php artisan migrate:rollback
   php artisan cache:clear
   ```

2. **Pipeline**:
   ```bash
   git checkout <previous-version>
   npm ci
   pm2 restart beyondchats-pipeline
   ```

3. **Frontend**:
   - Redeploy previous version on hosting platform
   - Or rollback deployment in Vercel/Netlify dashboard

## Support

For deployment issues:
1. Check application logs
2. Verify environment variables
3. Test API connectivity
4. Review server resources
5. Consult platform documentation

---

**Last Updated**: December 2025
