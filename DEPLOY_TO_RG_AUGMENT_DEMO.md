# Deploy to Azure Resource Group: rg-augment-demo

## Quick Deployment Guide

This guide shows how to deploy the Task Manager app to the Azure resource group **rg-augment-demo**.

## Prerequisites

- Azure account (jwspeck@gmail.com)
- Azure CLI installed
- Git initialized in project

## Step 1: Login to Azure

```bash
az login
```

Login with **jwspeck@gmail.com**

## Step 2: Verify Resource Group Exists

```bash
# Check if rg-augment-demo exists
az group show --name rg-augment-demo
```

If it doesn't exist, create it:

```bash
# Create resource group in East US
az group create --name rg-augment-demo --location eastus
```

## Step 3: Create App Service Plan (Free Tier)

```bash
# Create F1 (Free) tier app service plan
az appservice plan create \
  --name plan-augment-demo \
  --resource-group rg-augment-demo \
  --sku F1 \
  --is-linux
```

## Step 4: Create Web App

```bash
# Create web app with Node.js 18 runtime
az webapp create \
  --name app-augment-demo-tasks \
  --resource-group rg-augment-demo \
  --plan plan-augment-demo \
  --runtime "NODE:18-lts"
```

**Note**: If `app-augment-demo-tasks` is taken, try:
- `app-augment-demo-tasks-2024`
- `app-augment-demo-jwspeck`
- Or any unique name

## Step 5: Configure Deployment

```bash
# Enable local git deployment
az webapp deployment source config-local-git \
  --name app-augment-demo-tasks \
  --resource-group rg-augment-demo
```

## Step 6: Get Deployment URL

```bash
# Get the Git deployment URL
az webapp deployment list-publishing-credentials \
  --name app-augment-demo-tasks \
  --resource-group rg-augment-demo \
  --query scmUri \
  --output tsv
```

Copy the URL that's displayed.

## Step 7: Deploy Your Code

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Deploy to rg-augment-demo"

# Add Azure remote (use URL from Step 6)
git remote add azure <paste-deployment-url-here>

# Push to Azure
git push azure main
```

If you're on `master` branch:
```bash
git push azure master:main
```

## Step 8: Open Your App

```bash
# Open in browser
az webapp browse \
  --name app-augment-demo-tasks \
  --resource-group rg-augment-demo
```

Or visit: **https://app-augment-demo-tasks.azurewebsites.net**

---

## GitHub Actions Deployment (Automated)

### Step 1: Update Workflow File

Edit `.github/workflows/deploy-azure.yml` and change the `WEBAPP_NAME`:

```yaml
env:
  WEBAPP_NAME: app-augment-demo-tasks  # Your app name
  NODE_VERSION: '18'
```

### Step 2: Get Publish Profile

```bash
# Download publish profile
az webapp deployment list-publishing-profiles \
  --name app-augment-demo-tasks \
  --resource-group rg-augment-demo \
  --xml
```

Copy the entire XML output.

### Step 3: Add GitHub Secret

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `AZURE_WEBAPP_PUBLISH_PROFILE`
5. Value: Paste the XML from Step 2
6. Click **Add secret**

### Step 4: Push to GitHub

```bash
git add .
git commit -m "Configure GitHub Actions for rg-augment-demo"
git push origin main
```

Now every push to `main` will automatically deploy to Azure!

---

## Resource Naming Convention

All resources in **rg-augment-demo**:

| Resource Type | Name | Purpose |
|---------------|------|---------|
| Resource Group | `rg-augment-demo` | Container for all resources |
| App Service Plan | `plan-augment-demo` | Hosting plan (F1 Free tier) |
| Web App | `app-augment-demo-tasks` | Your Node.js application |

---

## Verify Deployment

### Check App Status
```bash
az webapp show \
  --name app-augment-demo-tasks \
  --resource-group rg-augment-demo \
  --query state \
  --output tsv
```

Should return: `Running`

### View Logs
```bash
az webapp log tail \
  --name app-augment-demo-tasks \
  --resource-group rg-augment-demo
```

### Test API
```bash
# Test the API
curl https://app-augment-demo-tasks.azurewebsites.net/api/tasks
```

---

## Troubleshooting

### App Not Starting?
```bash
# Restart the app
az webapp restart \
  --name app-augment-demo-tasks \
  --resource-group rg-augment-demo

# Check logs
az webapp log tail \
  --name app-augment-demo-tasks \
  --resource-group rg-augment-demo
```

### Deployment Failed?
```bash
# Check deployment logs
az webapp log deployment show \
  --name app-augment-demo-tasks \
  --resource-group rg-augment-demo
```

### Wrong Node Version?
```bash
# Verify Node version
az webapp config show \
  --name app-augment-demo-tasks \
  --resource-group rg-augment-demo \
  --query linuxFxVersion
```

---

## Clean Up (Delete Everything)

If you want to delete all resources:

```bash
# Delete the entire resource group
az group delete --name rg-augment-demo --yes --no-wait
```

**Warning**: This deletes everything in the resource group!

---

## Summary

✅ Resource Group: `rg-augment-demo`  
✅ App Service Plan: `plan-augment-demo` (F1 Free)  
✅ Web App: `app-augment-demo-tasks`  
✅ URL: `https://app-augment-demo-tasks.azurewebsites.net`  
✅ Auto-deploy: GitHub Actions on push to main  

Your Task Manager app is now deployed to **rg-augment-demo**! 🎉

