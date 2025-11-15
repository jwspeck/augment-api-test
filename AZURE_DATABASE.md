# Adding a Database to Azure App Service

## Overview
The current app uses in-memory storage which resets when the app restarts. For persistent data, you need a database.

## Azure Free Database Options

### 1. Azure Cosmos DB (Recommended for this app)
- **Free Tier**: 1000 RU/s, 25 GB storage (forever free)
- **Best for**: Document storage, NoSQL, JSON data
- **Perfect for**: Task management apps
- **Setup time**: 5 minutes

### 2. Azure Database for PostgreSQL
- **Free Tier**: Not available (starts at ~$5/month)
- **Best for**: Relational data, complex queries
- **Setup time**: 10 minutes

### 3. Azure SQL Database
- **Free Tier**: Not available (starts at ~$5/month)
- **Best for**: Enterprise apps, complex relationships
- **Setup time**: 10 minutes

### 4. MongoDB Atlas (Third-party)
- **Free Tier**: 512 MB storage (forever free)
- **Best for**: MongoDB users, document storage
- **Setup time**: 5 minutes

## Option 1: Azure Cosmos DB (Free Tier) - RECOMMENDED

### Step 1: Create Cosmos DB Account

**Via Azure Portal:**
1. Go to [portal.azure.com](https://portal.azure.com)
2. Click **"Create a resource"**
3. Search for **"Azure Cosmos DB"**
4. Click **"Create"** → **"Azure Cosmos DB for NoSQL"**
5. Fill in details:
   - **Resource Group**: Use existing (task-manager-rg)
   - **Account Name**: Choose unique name (e.g., "task-manager-db")
   - **Location**: Same as your App Service
   - **Capacity mode**: Serverless (or Provisioned with Free Tier)
   - **Apply Free Tier Discount**: Yes
6. Click **"Review + create"** → **"Create"**
7. Wait 5-10 minutes for deployment

**Via Azure CLI:**
```bash
az cosmosdb create \
  --name task-manager-db \
  --resource-group task-manager-rg \
  --kind GlobalDocumentDB \
  --enable-free-tier true \
  --default-consistency-level Session
```

### Step 2: Create Database and Container

1. Go to your Cosmos DB account
2. Click **"Data Explorer"**
3. Click **"New Container"**
4. Fill in:
   - **Database id**: Create new → "TaskManagerDB"
   - **Container id**: "tasks"
   - **Partition key**: "/id"
   - **Throughput**: 400 RU/s (or use database-level)
5. Click **"OK"**

**Via Azure CLI:**
```bash
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

### Step 3: Get Connection String

1. Go to your Cosmos DB account
2. Click **"Keys"** in left menu
3. Copy **"PRIMARY CONNECTION STRING"**

### Step 4: Install Cosmos DB SDK

```bash
npm install @azure/cosmos
```

### Step 5: Create Database Module

Create `lib/cosmosdb.js`:

```javascript
const { CosmosClient } = require('@azure/cosmos');

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseId = 'TaskManagerDB';
const containerId = 'tasks';

const client = new CosmosClient({ endpoint, key });
const database = client.database(databaseId);
const container = database.container(containerId);

// Get all tasks
async function getAllTasks() {
  const { resources } = await container.items.readAll().fetchAll();
  return resources;
}

// Get task by ID
async function getTaskById(id) {
  try {
    const { resource } = await container.item(id.toString(), id.toString()).read();
    return resource;
  } catch (error) {
    if (error.code === 404) return null;
    throw error;
  }
}

// Create task
async function createTask(title) {
  const newTask = {
    id: Date.now().toString(),
    title,
    done: false,
    createdAt: new Date().toISOString()
  };
  
  const { resource } = await container.items.create(newTask);
  return resource;
}

// Update task
async function updateTask(id, updates) {
  const task = await getTaskById(id);
  if (!task) return null;
  
  const updatedTask = { ...task, ...updates };
  const { resource } = await container.item(id.toString(), id.toString()).replace(updatedTask);
  return resource;
}

// Delete task
async function deleteTask(id) {
  const task = await getTaskById(id);
  if (!task) return null;
  
  await container.item(id.toString(), id.toString()).delete();
  return task;
}

// Get completed tasks
async function getCompletedTasks() {
  const query = 'SELECT * FROM c WHERE c.done = true';
  const { resources } = await container.items.query(query).fetchAll();
  return resources;
}

// Get pending tasks
async function getPendingTasks() {
  const query = 'SELECT * FROM c WHERE c.done = false';
  const { resources } = await container.items.query(query).fetchAll();
  return resources;
}

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getCompletedTasks,
  getPendingTasks
};
```

### Step 6: Update routes/api-tasks.js

Replace the in-memory storage with Cosmos DB:

```javascript
const express = require("express");
const router = express.Router();
const db = require("../lib/cosmosdb");

// GET /api/tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await db.getAllTasks();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/tasks
router.post("/", async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    const newTask = await db.createTask(title);
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ... update other routes similarly
```

### Step 7: Set Environment Variables in Azure

1. Go to your App Service
2. Click **"Configuration"**
3. Add application settings:
   - `COSMOS_ENDPOINT` = `https://task-manager-db.documents.azure.com:443/`
   - `COSMOS_KEY` = `<your-primary-key>`
4. Click **"Save"**
5. Restart app

## Option 2: MongoDB Atlas (Free Tier)

### Step 1: Create MongoDB Atlas Account

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free
3. Create a cluster (M0 Free tier)
4. Choose cloud provider: Azure
5. Choose region: Same as your app
6. Click **"Create Cluster"**

### Step 2: Configure Access

1. **Database Access**: Create user with password
2. **Network Access**: Add IP (0.0.0.0/0 for Azure)
3. Get connection string

### Step 3: Install MongoDB Driver

```bash
npm install mongodb
```

### Step 4: Create Database Module

Create `lib/mongodb.js` - similar to Cosmos DB example

### Step 5: Set Environment Variable

Add to Azure App Service Configuration:
- `MONGODB_URI` = `mongodb+srv://username:password@cluster.mongodb.net/tasks`

## Comparison

| Feature | Cosmos DB | MongoDB Atlas | PostgreSQL |
|---------|-----------|---------------|------------|
| Free Tier | ✅ 1000 RU/s | ✅ 512 MB | ❌ ~$5/month |
| Setup | Easy | Easy | Medium |
| Azure Native | ✅ Yes | ❌ No | ✅ Yes |
| Best For | This app | MongoDB users | Complex queries |
| Scalability | Excellent | Good | Good |

## Recommendation

**For this Task Manager app**: Use **Azure Cosmos DB Free Tier**

**Why?**
- ✅ Forever free (1000 RU/s, 25 GB)
- ✅ Native Azure integration
- ✅ Perfect for JSON documents
- ✅ Excellent performance
- ✅ Easy to set up
- ✅ Automatic scaling

## Next Steps

1. Choose a database option
2. Create the database
3. Install SDK
4. Create database module
5. Update routes to use database
6. Set environment variables
7. Deploy and test

## Resources

- [Cosmos DB Free Tier](https://docs.microsoft.com/azure/cosmos-db/free-tier)
- [Cosmos DB Node.js SDK](https://docs.microsoft.com/azure/cosmos-db/sql/sql-api-nodejs-get-started)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

