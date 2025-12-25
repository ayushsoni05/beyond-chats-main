# Vercel Deployment Instructions

## Deploy Frontend to Vercel

### Method 1: Vercel Dashboard (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. **IMPORTANT: Configure these settings:**
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend-react` (click "Edit" and select this folder)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Add Environment Variables:**
   - Click "Environment Variables"
   - Name: `VITE_API_BASE`
   - Value: `http://localhost:8000/api` (or your deployed backend URL)
   - Click "Add"

5. Click **Deploy**

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd frontend-react

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? beyondchats-frontend
# - Directory? ./
# - Override settings? Yes
#   - Build Command: npm run build
#   - Output Directory: dist
# - Deploy? Yes
```

### After Deployment

1. Get your deployment URL (e.g., `https://beyondchats-frontend.vercel.app`)
2. Update environment variable `VITE_API_BASE` with your actual backend URL
3. Redeploy if needed

### Troubleshooting 404 Error

If you get 404 error:

1. **Check Root Directory**: Must be set to `frontend-react` in Vercel dashboard
2. **Check Build Logs**: Look for errors in the deployment logs
3. **Verify Files**:
   ```bash
   cd frontend-react
   npm install
   npm run build
   # Check if dist/ folder is created
   ```
4. **Check Vercel Settings**:
   - Settings → General → Root Directory → `frontend-react`
   - Settings → Build & Development Settings → Output Directory → `dist`

### Common Issues

**Issue**: 404 NOT_FOUND
**Solution**: Ensure root directory is `frontend-react`, not the repo root

**Issue**: Build fails
**Solution**: Check dependencies in package.json and run `npm install` locally first

**Issue**: Can't connect to API
**Solution**: Set `VITE_API_BASE` environment variable in Vercel

## Deploy Backend (Railway/Render)

See main README.md for backend deployment instructions.

---

**Quick Checklist:**
- [ ] Root directory set to `frontend-react`
- [ ] Framework preset: Vite
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Environment variable `VITE_API_BASE` set
- [ ] Deployment successful
