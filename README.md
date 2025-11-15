# Task Manager API

A full-featured task management application with Express.js backend and vanilla JavaScript frontend.

## 🚀 Quick Start

### Local Development
```bash
# Install dependencies
npm install

# Start server
npm start

# Open browser
http://localhost:3000
```

## ✨ Features

### Backend API
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Task filtering (completed, pending)
- ✅ Search functionality
- ✅ Bulk operations (complete all, clear completed)
- ✅ Task duplication
- ✅ Statistics endpoint
- ✅ RESTful API design

### Frontend
- ✅ Modern, responsive UI
- ✅ Real-time statistics dashboard
- ✅ Search and filter tasks
- ✅ Bulk action buttons
- ✅ Smooth animations
- ✅ Mobile-friendly design

## 📁 Project Structure

```
augment-api-test/
├── server.js                 # Main Express server
├── package.json              # Dependencies and scripts
├── routes/
│   ├── tasks.js             # Original task routes
│   └── api-tasks.js         # New API routes
├── public/
│   ├── index.html           # Frontend UI
│   ├── app.js               # Frontend JavaScript
│   └── styles.css           # Styles
├── api/                     # Vercel serverless functions
│   ├── tasks.js            # Serverless API handler
│   └── lib/
│       └── storage.js      # Storage layer
└── docs/
    ├── API_ENDPOINTS.md     # API documentation
    ├── FRONTEND_FEATURES.md # Frontend features
    └── DEPLOYMENT_OPTIONS.md # Deployment comparison
```

## 🌐 API Endpoints

### Core CRUD
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Filtering
- `GET /api/tasks/completed` - Get completed tasks
- `GET /api/tasks/pending` - Get pending tasks
- `GET /api/tasks/search?q=query` - Search tasks

### Bulk Operations
- `PATCH /api/tasks/complete-all` - Mark all as complete
- `PATCH /api/tasks/uncomplete-all` - Mark all as incomplete
- `DELETE /api/tasks/completed` - Delete all completed

### Other
- `POST /api/tasks/:id/duplicate` - Duplicate a task
- `GET /api/tasks/stats` - Get statistics

See `API_ENDPOINTS.md` for full documentation with examples.

## 🚀 Deployment

### Azure App Service (Recommended)
**Best for**: Production deployments, learning cloud platforms

```bash
# Quick deploy (5 minutes)
az login
az group create --name task-manager-rg --location eastus
az appservice plan create --name task-manager-plan --resource-group task-manager-rg --sku F1 --is-linux
az webapp create --name my-task-manager-app --resource-group task-manager-rg --plan task-manager-plan --runtime "NODE:18-lts"
az webapp deployment source config-local-git --name my-task-manager-app --resource-group task-manager-rg
git remote add azure <deployment-url>
git push azure main
```

**Free Tier Includes:**
- ✅ 1 GB RAM
- ✅ 1 GB Storage
- ✅ Custom domain + SSL
- ✅ 60 min/day compute

**Documentation:**
- Quick Start: `AZURE_QUICKSTART.md`
- Full Guide: `AZURE_DEPLOYMENT.md`
- Database Setup: `AZURE_DATABASE.md`

### Vercel (Alternative)
**Best for**: Serverless architecture, JAMstack apps

```bash
# Deploy with Vercel CLI
npm install -g vercel
vercel login
vercel
vercel --prod
```

**Documentation:**
- Guide: `VERCEL_DEPLOYMENT.md`

### Comparison
See `DEPLOYMENT_OPTIONS.md` for detailed comparison.

## 💾 Database Integration

### Current: In-Memory Storage
- Data stored in memory (resets on restart)
- Good for development and testing
- Not suitable for production

### Production: Azure Cosmos DB (Free Tier)
- Forever free tier (1000 RU/s, 25 GB)
- Perfect for this app
- Easy integration

**Setup Guide:** See `AZURE_DATABASE.md`

## 📚 Documentation

| Document | Description |
|----------|-------------|
| `API_ENDPOINTS.md` | Complete API reference with curl examples |
| `FRONTEND_FEATURES.md` | Frontend features and usage guide |
| `DEPLOYMENT_OPTIONS.md` | Comparison of deployment platforms |
| `AZURE_QUICKSTART.md` | 5-minute Azure deployment guide |
| `AZURE_DEPLOYMENT.md` | Comprehensive Azure deployment guide |
| `AZURE_DATABASE.md` | Database integration guide |
| `VERCEL_DEPLOYMENT.md` | Vercel deployment guide |

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js v5.1.0
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Deployment**: Azure App Service / Vercel
- **Database**: Azure Cosmos DB (optional)

## 📝 License

ISC

## 🤝 Contributing

This is a test/learning project. Feel free to fork and experiment!

## 🆘 Support

- Check documentation in the project root
- Review API examples in `API_ENDPOINTS.md`
- See deployment guides for platform-specific help

## 🎯 Next Steps

1. ✅ Run locally and test features
2. 🚀 Deploy to Azure (recommended) or Vercel
3. 💾 Add database for persistence
4. 🔒 Add authentication (optional)
5. 📊 Enable monitoring (Application Insights)
6. 🌐 Add custom domain (optional)

## 📊 Project Status

- [x] Core CRUD API
- [x] Advanced features (search, filter, bulk ops)
- [x] Frontend UI
- [x] Azure deployment ready
- [x] Vercel deployment ready
- [ ] Zod validation (planned)
- [ ] Jest tests (planned)
- [ ] Database integration (optional)
- [ ] Authentication (optional)

---

**Made with ❤️ using Express.js**

