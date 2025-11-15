# Deploying to Vercel

## Overview
This guide explains how to deploy the Task Manager app to Vercel.

## What Changed for Vercel

### 1. **Serverless Architecture**
- Converted from Express server to Vercel serverless functions
- Created `/api/tasks.js` as the main API handler
- All routes handled in a single serverless function

### 2. **Storage Solution**
- Created `/api/lib/storage.js` for in-memory storage
- **⚠️ Important**: In-memory storage resets on each deployment and cold start
- For production, you should use a database (see recommendations below)

### 3. **File Structure**
```
augment-api-test/
├── api/
│   ├── tasks.js           # Serverless function handler
│   └── lib/
│       └── storage.js     # Storage layer
├── public/
│   ├── index.html         # Frontend
│   ├── app.js             # Frontend JavaScript
│   └── styles.css         # Styles
├── vercel.json            # Vercel configuration
├── .vercelignore          # Files to ignore
└── package.json
```

## Deployment Steps

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - Project name? Press enter or type a name
   - In which directory is your code located? **.**
   - Want to override settings? **N**

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via GitHub

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Click "Deploy"

### Option 3: Deploy via Vercel Dashboard

1. **Prepare your code**
   - Zip your project folder (exclude node_modules)

2. **Upload to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Click "Deploy" and drag your folder

## Configuration

### vercel.json
The `vercel.json` file configures how Vercel builds and routes your app:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/public/$1"
    }
  ]
}
```

## Important Limitations

### ⚠️ In-Memory Storage
The current implementation uses in-memory storage which has limitations:

1. **Data resets** on each deployment
2. **Data resets** on cold starts (after ~5 minutes of inactivity)
3. **Not shared** across serverless function instances
4. **Not suitable** for production use

### Recommended Database Solutions

For production, replace the in-memory storage with a real database:

#### 1. **Vercel KV (Redis)** - Easiest
```bash
# Install
npm install @vercel/kv

# Add to Vercel project
vercel env add KV_REST_API_URL
vercel env add KV_REST_API_TOKEN
```

#### 2. **MongoDB Atlas** - Popular
```bash
npm install mongodb
```

#### 3. **Vercel Postgres**
```bash
npm install @vercel/postgres
```

#### 4. **Supabase** - Full Backend
```bash
npm install @supabase/supabase-js
```

## Testing Your Deployment

After deployment, Vercel will give you a URL like:
```
https://your-project.vercel.app
```

Test the API:
```bash
# Get all tasks
curl https://your-project.vercel.app/api/tasks

# Create a task
curl -X POST https://your-project.vercel.app/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Test task"}'

# Get stats
curl https://your-project.vercel.app/api/tasks/stats
```

## Environment Variables

If you add a database, set environment variables in Vercel:

1. Go to your project dashboard
2. Click "Settings" → "Environment Variables"
3. Add your variables (e.g., `DATABASE_URL`)

## Custom Domain

To add a custom domain:

1. Go to your project dashboard
2. Click "Settings" → "Domains"
3. Add your domain and follow DNS instructions

## Troubleshooting

### API Routes Not Working
- Check that `api/tasks.js` exists
- Verify `vercel.json` configuration
- Check Vercel function logs in dashboard

### CORS Errors
- CORS headers are already configured in `api/tasks.js`
- If issues persist, check browser console for specific errors

### Cold Starts
- First request after inactivity may be slow
- Consider upgrading to Vercel Pro for faster cold starts

### Data Loss
- Remember: in-memory storage resets frequently
- Implement a database for persistent storage

## Next Steps

1. ✅ Deploy to Vercel
2. ⚠️ Add a database for persistent storage
3. 🔒 Add authentication (optional)
4. 📊 Set up analytics (Vercel Analytics)
5. 🌐 Add custom domain (optional)

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [Vercel KV](https://vercel.com/docs/storage/vercel-kv)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)

