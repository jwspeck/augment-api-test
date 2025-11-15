# Deploying to Azure App Service (Free Tier)

## Overview
This guide explains how to deploy the Task Manager app to Azure App Service using the **Free Tier (F1)**.

## Why Azure is Great for This Project

✅ **Traditional Node.js Support** - No need to convert to serverless  
✅ **Free Tier Available** - F1 tier is completely free  
✅ **Persistent Storage** - In-memory storage works (until app restarts)  
✅ **Easy Deployment** - Multiple deployment options  
✅ **Custom Domains** - Even on free tier  
✅ **SSL/HTTPS** - Free SSL certificates  

## Prerequisites

1. **Azure Account** (Free)
   - Sign up at [azure.microsoft.com/free](https://azure.microsoft.com/free)
   - Get $200 credit for 30 days + free services for 12 months

2. **Azure CLI** (Optional but recommended)
   ```bash
   # Windows (PowerShell)
   winget install Microsoft.AzureCLI
   
   # macOS
   brew install azure-cli
   
   # Linux
   curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
   ```

3. **Git** (for deployment)
   ```bash
   git --version
   ```

## Deployment Methods

### Method 1: Azure Portal (Easiest for Beginners)

#### Step 1: Create App Service

1. Go to [portal.azure.com](https://portal.azure.com)
2. Click **"Create a resource"**
3. Search for **"Web App"** and click **Create**
4. Fill in the details:
   - **Subscription**: Select your subscription
   - **Resource Group**: Create new (e.g., "task-manager-rg")
   - **Name**: Choose a unique name (e.g., "my-task-manager-app")
   - **Publish**: Code
   - **Runtime stack**: Node 18 LTS (or latest)
   - **Operating System**: Linux (recommended) or Windows
   - **Region**: Choose closest to you
   - **Pricing Plan**: 
     - Click "Change size"
     - Select "Dev/Test" tab
     - Choose **F1 (Free)** - 1 GB RAM, 60 min/day compute
     - Click "Apply"

5. Click **"Review + create"**
6. Click **"Create"**
7. Wait for deployment (1-2 minutes)

#### Step 2: Configure Deployment

1. Go to your App Service
2. In the left menu, click **"Deployment Center"**
3. Choose deployment source:

   **Option A: Local Git**
   - Source: Local Git
   - Click "Save"
   - Copy the Git Clone Uri
   - Set deployment credentials (username/password)

   **Option B: GitHub**
   - Source: GitHub
   - Authorize Azure to access GitHub
   - Select your repository
   - Select branch (main/master)
   - Click "Save"

#### Step 3: Deploy Your Code

**If using Local Git:**
```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit"

# Add Azure remote
git remote add azure <Git-Clone-Uri-from-Azure>

# Push to Azure
git push azure main
```

**If using GitHub:**
- Just push to your GitHub repository
- Azure will automatically deploy

#### Step 4: Access Your App

Your app will be available at:
```
https://your-app-name.azurewebsites.net
```

### Method 2: Azure CLI (Faster for Developers)

```bash
# Login to Azure
az login

# Create resource group
az group create --name task-manager-rg --location eastus

# Create App Service plan (Free tier)
az appservice plan create \
  --name task-manager-plan \
  --resource-group task-manager-rg \
  --sku F1 \
  --is-linux

# Create Web App
az webapp create \
  --name my-task-manager-app \
  --resource-group task-manager-rg \
  --plan task-manager-plan \
  --runtime "NODE:18-lts"

# Configure deployment from local git
az webapp deployment source config-local-git \
  --name my-task-manager-app \
  --resource-group task-manager-rg

# Get deployment URL
az webapp deployment list-publishing-credentials \
  --name my-task-manager-app \
  --resource-group task-manager-rg \
  --query scmUri \
  --output tsv

# Deploy
git remote add azure <deployment-url>
git push azure main

# Open in browser
az webapp browse --name my-task-manager-app --resource-group task-manager-rg
```

### Method 3: VS Code Extension

1. Install **Azure App Service** extension in VS Code
2. Click Azure icon in sidebar
3. Sign in to Azure
4. Right-click on "App Services"
5. Select "Create New Web App"
6. Follow prompts
7. Right-click your app → "Deploy to Web App"

## Configuration

### Environment Variables

Set environment variables in Azure Portal:

1. Go to your App Service
2. Click **"Configuration"** in left menu
3. Click **"New application setting"**
4. Add settings:
   - `NODE_ENV` = `production`
   - `PORT` = `8080` (Azure sets this automatically)
   - `WEBSITE_NODE_DEFAULT_VERSION` = `18-lts`

### Port Configuration

Azure automatically sets the `PORT` environment variable. Update `server.js` if needed:

```javascript
const port = process.env.PORT || 3000;
```

## Free Tier Limitations

### F1 (Free) Tier Includes:
- ✅ 1 GB RAM
- ✅ 1 GB Storage
- ✅ 60 minutes/day compute time
- ✅ Custom domain support
- ✅ Free SSL certificate
- ✅ 10 apps per subscription

### Limitations:
- ⚠️ App sleeps after 20 minutes of inactivity
- ⚠️ First request after sleep is slow (cold start)
- ⚠️ 60 minutes/day compute limit
- ⚠️ No auto-scaling
- ⚠️ No deployment slots
- ⚠️ Shared infrastructure

### Upgrade Options:
- **B1 (Basic)**: $13/month - Always on, no time limits
- **S1 (Standard)**: $70/month - Auto-scaling, deployment slots
- **P1V2 (Premium)**: $146/month - Better performance

## Monitoring & Logs

### View Logs

**Azure Portal:**
1. Go to your App Service
2. Click **"Log stream"** in left menu
3. See real-time logs

**Azure CLI:**
```bash
az webapp log tail --name my-task-manager-app --resource-group task-manager-rg
```

### Application Insights (Optional)

Enable free monitoring:
1. Go to your App Service
2. Click **"Application Insights"**
3. Click **"Turn on Application Insights"**
4. Create new resource
5. Click **"Apply"**

## Custom Domain

Add a custom domain (even on free tier):

1. Go to your App Service
2. Click **"Custom domains"**
3. Click **"Add custom domain"**
4. Enter your domain
5. Add DNS records at your domain provider:
   - **CNAME**: `www` → `your-app.azurewebsites.net`
   - **TXT**: `asuid.your-domain.com` → verification code

## SSL Certificate

Get free SSL:
1. After adding custom domain
2. Click **"Add binding"**
3. Select **"App Service Managed Certificate"** (Free)
4. Click **"Add"**

## Troubleshooting

### App Not Starting
```bash
# Check logs
az webapp log tail --name my-task-manager-app --resource-group task-manager-rg

# Restart app
az webapp restart --name my-task-manager-app --resource-group task-manager-rg
```

### Port Issues
Make sure server.js uses:
```javascript
const port = process.env.PORT || 3000;
```

### Deployment Fails
- Check Node version matches package.json engines
- Ensure all dependencies are in package.json
- Check deployment logs in Azure Portal

### App Sleeps (Free Tier)
- Upgrade to B1 tier for "Always On"
- Or use a ping service to keep it awake

## Cost Optimization

### Stay on Free Tier:
- Use F1 tier (completely free)
- Monitor 60 min/day limit
- Consider multiple apps if needed

### Upgrade Strategically:
- B1 ($13/month) for "Always On"
- Use Azure Cost Management to track spending
- Set up budget alerts

## Next Steps

1. ✅ Deploy to Azure
2. 🔒 Add authentication (Azure AD B2C)
3. 💾 Add database (Azure Cosmos DB free tier)
4. 📊 Enable Application Insights
5. 🌐 Add custom domain
6. 🔐 Enable SSL

## Resources

- [Azure Free Account](https://azure.microsoft.com/free)
- [Azure App Service Docs](https://docs.microsoft.com/azure/app-service/)
- [Azure CLI Reference](https://docs.microsoft.com/cli/azure/)
- [Node.js on Azure](https://docs.microsoft.com/azure/app-service/quickstart-nodejs)

