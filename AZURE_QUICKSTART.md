# Azure Deployment - Quick Start Guide

## 🚀 Deploy in 5 Minutes

### Prerequisites
- Azure account (free): [azure.microsoft.com/free](https://azure.microsoft.com/free)
- Git installed

### Step-by-Step

#### 1. Create Azure Web App
```bash
# Login to Azure
az login

# Create resource group
az group create --name task-manager-rg --location eastus

# Create free tier app service plan
az appservice plan create \
  --name task-manager-plan \
  --resource-group task-manager-rg \
  --sku F1 \
  --is-linux

# Create web app
az webapp create \
  --name my-task-manager-app \
  --resource-group task-manager-rg \
  --plan task-manager-plan \
  --runtime "NODE:18-lts"
```

#### 2. Deploy Your Code
```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"

# Configure local git deployment
az webapp deployment source config-local-git \
  --name my-task-manager-app \
  --resource-group task-manager-rg

# Get deployment URL
DEPLOY_URL=$(az webapp deployment list-publishing-credentials \
  --name my-task-manager-app \
  --resource-group task-manager-rg \
  --query scmUri \
  --output tsv)

# Add Azure remote
git remote add azure $DEPLOY_URL

# Deploy
git push azure main
```

#### 3. Open Your App
```bash
az webapp browse --name my-task-manager-app --resource-group task-manager-rg
```

Your app is now live at: `https://my-task-manager-app.azurewebsites.net`

## 📋 What You Get (Free Tier)

✅ **Completely Free** - No credit card required after trial  
✅ **1 GB RAM** - Enough for this app  
✅ **1 GB Storage** - Plenty of space  
✅ **Custom Domain** - Add your own domain  
✅ **Free SSL** - HTTPS included  
✅ **60 min/day** - Compute time limit  

## ⚠️ Free Tier Limitations

- App sleeps after 20 minutes of inactivity
- First request after sleep is slow (~10 seconds)
- 60 minutes/day compute time limit
- In-memory data resets on app restart

## 🔄 Update Your App

```bash
# Make changes to your code
git add .
git commit -m "Update feature"
git push azure main
```

Azure automatically redeploys!

## 📊 View Logs

```bash
# Real-time logs
az webapp log tail --name my-task-manager-app --resource-group task-manager-rg

# Or in Azure Portal
# Go to App Service → Log stream
```

## 🗄️ Add Database (Optional)

For persistent data, add Azure Cosmos DB (free tier):

```bash
# Create Cosmos DB account
az cosmosdb create \
  --name task-manager-db \
  --resource-group task-manager-rg \
  --enable-free-tier true

# Create database
az cosmosdb sql database create \
  --account-name task-manager-db \
  --resource-group task-manager-rg \
  --name TaskManagerDB

# Create container
az cosmosdb sql container create \
  --account-name task-manager-db \
  --resource-group task-manager-rg \
  --database-name TaskManagerDB \
  --name tasks \
  --partition-key-path "/id"
```

See `AZURE_DATABASE.md` for full integration guide.

## 🛠️ Troubleshooting

### App not starting?
```bash
# Check logs
az webapp log tail --name my-task-manager-app --resource-group task-manager-rg

# Restart app
az webapp restart --name my-task-manager-app --resource-group task-manager-rg
```

### Deployment failed?
- Check Node version in package.json matches Azure runtime
- Ensure all dependencies are in package.json
- Check deployment logs in Azure Portal

### App is slow?
- Free tier apps sleep after 20 minutes
- Upgrade to B1 tier ($13/month) for "Always On"

## 💰 Upgrade to Paid Tier (Optional)

If you need better performance:

```bash
# Upgrade to Basic B1 ($13/month)
az appservice plan update \
  --name task-manager-plan \
  --resource-group task-manager-rg \
  --sku B1

# Enable "Always On"
az webapp config set \
  --name my-task-manager-app \
  --resource-group task-manager-rg \
  --always-on true
```

## 🧹 Clean Up (Delete Everything)

```bash
# Delete entire resource group
az group delete --name task-manager-rg --yes
```

## 📚 Full Documentation

- **Deployment Guide**: See `AZURE_DEPLOYMENT.md`
- **Database Setup**: See `AZURE_DATABASE.md`
- **API Documentation**: See `API_ENDPOINTS.md`

## 🆘 Need Help?

- [Azure Documentation](https://docs.microsoft.com/azure/app-service/)
- [Azure Support](https://azure.microsoft.com/support/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/azure-web-app-service)

## ✅ Checklist

- [ ] Azure account created
- [ ] Azure CLI installed
- [ ] Resource group created
- [ ] App Service created (F1 tier)
- [ ] Code deployed via Git
- [ ] App is accessible online
- [ ] (Optional) Database added
- [ ] (Optional) Custom domain configured
- [ ] (Optional) SSL certificate enabled

## 🎉 You're Done!

Your Task Manager app is now running on Azure!

**Next Steps:**
1. Test all features
2. Add a database for persistence
3. Share your app URL
4. Consider upgrading if you need "Always On"

