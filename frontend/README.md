# React Frontend

This is the React + Vite frontend for the BeyondChats application. It displays articles in a side-by-side comparison view showing original and AI-enhanced content.

## Features

- Article listing with search and filter
- Side-by-side comparison view (original vs updated)
- Scraping trigger from UI
- Content refresh trigger
- Responsive design
- Real-time status updates

## Requirements

- Node.js 18+
- npm or yarn
- Running Laravel backend (port 8000)
- Running Node.js pipeline (port 3001)

## Installation

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Configure environment:
```bash
cp .env.example .env
```

3. Update `.env` with your API URLs:
```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_PIPELINE_URL=http://localhost:3001
```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Build for Production

Build the application:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

The built files will be in the `dist/` directory.

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   ├── pages/          # Page components
│   │   ├── ArticleList.jsx
│   │   ├── ArticleList.css
│   │   ├── ArticleComparison.jsx
│   │   └── ArticleComparison.css
│   ├── services/       # API services
│   │   └── api.js
│   ├── App.jsx         # Main app component
│   ├── App.css         # Global styles
│   ├── main.jsx        # Entry point
│   └── index.css       # Base styles
├── .env.example        # Environment template
├── package.json
└── vite.config.js
```

## Features Overview

### Article Listing
- View all articles in a grid layout
- Search articles by title
- Filter by status (scraped, processing, updated, error)
- Trigger bulk scraping
- Trigger refresh for all articles
- Individual article actions (view, refresh, delete)

### Article Comparison
- Side-by-side view of original and updated content
- Visual status indicators
- Trigger content refresh for specific article
- Link to original source
- Responsive layout for mobile devices

## API Integration

The frontend communicates with two services:

### Laravel API (Port 8000)
- `GET /api/articles` - List articles
- `GET /api/articles/:id` - Get article details
- `POST /api/articles` - Create article
- `PUT /api/articles/:id` - Update article
- `DELETE /api/articles/:id` - Delete article
- `POST /api/articles/scrape` - Trigger scraping

### Pipeline API (Port 3001)
- `GET /status` - Get pipeline status
- `POST /refresh/:id` - Refresh single article
- `POST /refresh` - Refresh multiple articles
- `POST /refresh-all` - Refresh all articles

## Styling

The application uses custom CSS with:
- Dark theme optimized for readability
- Responsive design for all screen sizes
- Smooth transitions and animations
- Accessible color contrast

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_BASE_URL | Laravel API base URL | http://localhost:8000/api |
| VITE_PIPELINE_URL | Pipeline service URL | http://localhost:3001 |

## Deployment

### Vercel Deployment

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel --prod
```

3. Set environment variables in Vercel dashboard

### Netlify Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist/` directory to Netlify

3. Configure environment variables in Netlify dashboard

### Manual Deployment

1. Build the project:
```bash
npm run build
```

2. Serve the `dist/` directory with any static file server:
```bash
# Using Python
python -m http.server 8080 --directory dist

# Using Node.js serve
npx serve dist

# Using nginx
# Configure nginx to serve dist/ directory
```

## Configuration

### Vite Configuration

The `vite.config.js` file contains:
- React plugin setup
- Build optimization
- Development server configuration

### CORS Configuration

Ensure the backend has CORS enabled for your frontend domain:
- Development: `http://localhost:5173`
- Production: Your deployed domain

## Troubleshooting

### API Connection Issues

**Problem**: Cannot connect to backend
**Solution**:
- Verify backend is running: `curl http://localhost:8000/api/articles`
- Check CORS configuration in Laravel
- Verify `.env` URLs are correct

### Build Errors

**Problem**: Build fails with module errors
**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Vite Port Already in Use

**Problem**: Port 5173 is already in use
**Solution**:
```bash
# Use a different port
npm run dev -- --port 3000
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Optimization

- Code splitting with React.lazy (can be added)
- Vite's built-in optimizations
- Asset optimization
- Production build minification

## Development Tips

### Hot Module Replacement (HMR)
Vite provides instant HMR for React components. Changes are reflected immediately without full page reload.

### ESLint
Run linter to check code quality:
```bash
npm run lint
```

### Debugging
- Use React DevTools browser extension
- Check browser console for errors
- Use network tab to inspect API calls

## Future Enhancements

- [ ] Add authentication
- [ ] Implement pagination
- [ ] Add article search with highlighting
- [ ] Real-time updates with WebSockets
- [ ] Export articles to PDF
- [ ] Diff view for content changes
- [ ] Dark/light theme toggle
- [ ] Accessibility improvements

## License

This project is part of the BeyondChats application.
