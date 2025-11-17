# Deployment Guide

## Security Configuration

This application uses **Azure Easy Auth** for user authentication and rate limiting for security.

### Local Development

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Set `NODE_ENV=development` in `.env`:
   ```
   NODE_ENV=development
   ```

3. In development mode, the app uses a test user automatically (no login required)

4. Start the server:
   ```bash
   npm start
   ```

### Azure Deployment - Enable Authentication

**IMPORTANT:** You must enable Azure Easy Auth for the app to work in production.

#### Step 1: Enable Authentication in Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to your App Service: `augment-api-johnspeck`
3. In the left menu, go to **Settings** → **Authentication**
4. Click **Add identity provider**
5. Choose an identity provider:
   - **Microsoft** (recommended for work/school accounts)
   - **Google** (recommended for personal use)
   - **GitHub**
   - **Facebook**
   - **Twitter**

#### Step 2: Configure the Identity Provider

**For Microsoft:**
1. Select **Microsoft** as the identity provider
2. Choose **Create new app registration** or use existing
3. Supported account types: Choose based on your needs
   - **Current tenant only** - Only your organization
   - **Any Azure AD directory** - Any organization
   - **Any Azure AD + personal Microsoft accounts** - Anyone with Microsoft account
4. Click **Add**

**For Google:**
1. Select **Google** as the identity provider
2. You'll need to create OAuth credentials in Google Cloud Console first
3. Enter the Client ID and Client Secret
4. Click **Add**

#### Step 3: Configure Authentication Settings

1. After adding the provider, go back to **Authentication** settings
2. Set **Restrict access** to:
   - **Require authentication** - Users must log in
3. Set **Unauthenticated requests** to:
   - **HTTP 302 Found redirect: recommended for websites** - Redirects to login page
4. Click **Save**

#### Step 4: Test Authentication

1. Open your app URL: `https://augment-api-johnspeck-gdbhd5grggd7aqfj.canadacentral-01.azurewebsites.net/`
2. You should be redirected to the login page
3. Log in with your chosen provider
4. After login, you'll see your name in the top-right corner
5. Your tasks are now private to your account!

### Azure CLI Alternative

```bash
# Enable Microsoft authentication
az webapp auth microsoft update \
  --name augment-api-johnspeck \
  --resource-group rg-augment-demo \
  --client-id <your-client-id> \
  --client-secret <your-client-secret> \
  --issuer https://login.microsoftonline.com/<tenant-id>/v2.0 \
  --allowed-audiences <your-client-id>

# Require authentication
az webapp auth update \
  --name augment-api-johnspeck \
  --resource-group rg-augment-demo \
  --enabled true \
  --action LoginWithAzureActiveDirectory
```

## How It Works

### User Authentication Flow

1. **User visits the app** → Azure redirects to login page
2. **User logs in** → Azure validates credentials
3. **Azure injects headers** → `x-ms-client-principal-name`, `x-ms-client-principal-id`
4. **Backend extracts user info** → Associates tasks with user ID
5. **User sees only their tasks** → Complete data isolation

### Multi-User Support

- ✅ Each user has their own task list
- ✅ Tasks are filtered by user ID automatically
- ✅ Users cannot see or modify other users' tasks
- ✅ User info displayed in top-right corner

## Security Features

### 1. User Authentication (Azure Easy Auth)
- All `/api/*` and `/tasks/*` endpoints require authentication
- Returns 401 Unauthorized if not logged in
- Automatic redirect to login page for unauthenticated users
- Supports multiple identity providers

### 2. Data Isolation
- Tasks are associated with user IDs
- All queries filter by current user
- Users cannot access other users' data
- Parent/child task relationships respect user boundaries

### 3. Rate Limiting
- **General API:** 100 requests per 15 minutes per IP
- **Task Creation:** 20 tasks per minute per IP
- Returns 429 Too Many Requests when exceeded

### 4. Input Validation
- Title: Required, max 200 characters
- Description: Optional, max 500 characters
- Details: Optional, max 10,000 characters
- Task IDs: Must be positive integers
- Parent IDs: Must be null or positive integers

## Testing

### Test Local Development

```bash
npm start
# Open http://localhost:3000
# You'll see "Developer User" in top-right (test user)
# Create some tasks - they'll be associated with the test user
```

### Test Azure Authentication

1. Deploy to Azure (see deployment checklist below)
2. Enable Azure Easy Auth (see Step 1-3 above)
3. Open your app URL
4. You should be redirected to login
5. After login, you should see your name in top-right
6. Create tasks - they're private to your account
7. Log out and log in with different account - you'll see different tasks

### Test Multi-User Isolation

1. Log in as User A, create some tasks
2. Log out
3. Log in as User B, create different tasks
4. User B should NOT see User A's tasks
5. Log back in as User A - your original tasks should still be there

## Deployment Checklist

- [ ] Commit and push code to GitHub
- [ ] Wait for GitHub Actions deployment (~90 seconds)
- [ ] Enable Azure Easy Auth in Azure Portal
- [ ] Configure identity provider (Microsoft/Google/GitHub)
- [ ] Set authentication to "Require authentication"
- [ ] Test login flow
- [ ] Verify user name appears in top-right
- [ ] Test creating tasks
- [ ] Test multi-user isolation (optional)

## Troubleshooting

### "Authentication required. Please log in."
- Azure Easy Auth is not enabled
- Follow Steps 1-3 in "Azure Deployment - Enable Authentication" above

### "Developer User" shows in production
- `NODE_ENV` is set to `development` in Azure
- Remove the `NODE_ENV` environment variable in Azure Portal
- Or set it to `production`

### Can't see my tasks after logging in
- Check browser console for errors
- Verify you're logged in (name shows in top-right)
- Try refreshing the page
- Check that Azure Easy Auth headers are being sent (use browser dev tools)

### Other users can see my tasks
- This should NOT happen - it's a bug
- Verify that `userId` is being set correctly in the backend
- Check browser console and server logs

### "Too many requests"
- You've hit the rate limit (100 requests per 15 minutes)
- Wait 15 minutes or reduce request frequency

