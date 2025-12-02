# Deployment Guide

This guide will walk you through deploying your Todo API to production using Render or Railway.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [MongoDB Atlas Setup](#mongodb-atlas-setup)
3. [Deploy to Render](#deploy-to-render)
4. [Deploy to Railway](#deploy-to-railway)
5. [Post-Deployment Checklist](#post-deployment-checklist)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, make sure you have:

- ✅ A GitHub account
- ✅ Your code pushed to a GitHub repository
- ✅ A MongoDB Atlas account (free tier available)
- ✅ Node.js installed locally (for testing)

## MongoDB Atlas Setup

### Step 1: Create a MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Sign Up" and create a free account
3. Verify your email address

### Step 2: Create a Cluster

1. After logging in, click "Build a Database"
2. Choose the **FREE (M0)** tier
3. Select a cloud provider and region (choose one close to your users)
4. Give your cluster a name (e.g., "todo-cluster")
5. Click "Create Cluster"
6. Wait 3-5 minutes for the cluster to be created

### Step 3: Create Database User

1. In the Security section, click "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication method
4. Create a username and strong password (save these!)
5. Under "Database User Privileges", select "Read and write to any database"
6. Click "Add User"

### Step 4: Configure Network Access

1. In the Security section, click "Network Access"
2. Click "Add IP Address"
3. For deployment platforms, you have two options:
   - **Option A (Easier)**: Click "Allow Access from Anywhere" (adds `0.0.0.0/0`)
     - ⚠️ Less secure, but easier for getting started
   - **Option B (More Secure)**: Add your deployment platform's IP ranges:
     - Render: Check [Render IP ranges](https://render.com/docs/ip-addresses)
     - Railway: Uses dynamic IPs, so use `0.0.0.0/0` or check their docs
4. Click "Confirm"

### Step 5: Get Your Connection String

1. Go to "Database" section and click "Connect"
2. Choose "Connect your application"
3. Select "Node.js" as the driver
4. Copy the connection string (looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)
5. Replace `<username>` and `<password>` with your database user credentials
6. Add your database name after the `/` (e.g., `mongodb+srv://...mongodb.net/todos-app?retryWrites=true&w=majority`)
7. Save this connection string - you'll need it for deployment!

**Example connection string format:**
```
mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/todos-app?retryWrites=true&w=majority
```

## Deploy to Render

### Step 1: Create Render Account

1. Go to [Render](https://render.com)
2. Click "Get Started for Free"
3. Sign up with your GitHub account

### Step 2: Create New Web Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select the repository containing your Todo API

### Step 3: Configure Service

1. **Name**: Give your service a name (e.g., "todo-api")
2. **Region**: Choose the region closest to your users
3. **Branch**: Select the branch to deploy (usually `main` or `master`)
4. **Root Directory**: Leave empty (or specify if your app is in a subdirectory)
5. **Runtime**: Node
6. **Build Command**: `npm install`
7. **Start Command**: `npm start`
8. Click "Advanced" to add environment variables

### Step 4: Add Environment Variables

Click "Add Environment Variable" for each:

- `MONGO_URI` - Your MongoDB Atlas connection string
- `JWT_SECRET` - A strong random string (32+ characters). Generate one with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- `JWT_EXPIRES_IN` - Token expiration (e.g., `90d`)
- `NODE_ENV` - `production`
- `CORS_ORIGIN` - Your frontend URL (e.g., `https://yourfrontend.com`)
- `PORT` - Usually auto-set by Render, but you can set it if needed

### Step 5: Deploy

1. Scroll down and click "Create Web Service"
2. Render will start building and deploying your app
3. Watch the logs - first deployment takes 3-5 minutes
4. Once deployed, you'll see your API URL (e.g., `https://todo-api.onrender.com`)

### Step 6: Test Your API

1. Copy your API URL
2. Test the health endpoint or try signing up:
   ```bash
   curl https://your-api-url.onrender.com/api/v1/users/signup \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"password123","passwordConfirm":"password123"}'
   ```

## Deploy to Railway

### Step 1: Create Railway Account

1. Go to [Railway](https://railway.app)
2. Click "Start a New Project"
3. Sign up with your GitHub account

### Step 2: Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Authorize Railway to access your GitHub
4. Select your repository

### Step 3: Configure Deployment

1. Railway will auto-detect Node.js
2. It will automatically run `npm install` and `npm start`
3. If needed, you can configure build settings in the project settings

### Step 4: Add Environment Variables

1. Go to the "Variables" tab
2. Click "New Variable" for each:

- `MONGO_URI` - Your MongoDB Atlas connection string
- `JWT_SECRET` - A strong random string (32+ characters)
- `JWT_EXPIRES_IN` - Token expiration (e.g., `90d`)
- `NODE_ENV` - `production`
- `CORS_ORIGIN` - Your frontend URL

### Step 5: Deploy

1. Railway will automatically deploy when you add environment variables
2. Go to the "Settings" tab
3. Click "Generate Domain" to get your API URL
4. Your API will be live at that URL

### Step 6: Test Your API

Test using the same methods as Render above.

## Post-Deployment Checklist

After deploying, verify:

- [ ] API is accessible at your deployment URL
- [ ] Health check endpoint works (if you have one)
- [ ] Signup endpoint works
- [ ] Login endpoint works
- [ ] Todos endpoints are protected (require authentication)
- [ ] CORS is configured correctly (if you have a frontend)
- [ ] Environment variables are set correctly
- [ ] MongoDB connection is working (check logs)
- [ ] Rate limiting is working
- [ ] Error handling returns proper responses

## Troubleshooting

### MongoDB Connection Issues

**Problem**: "MongoServerError: Authentication failed"
- **Solution**: Double-check your MongoDB username and password in the connection string

**Problem**: "MongoNetworkError: failed to connect"
- **Solution**: 
  1. Check Network Access in MongoDB Atlas - ensure `0.0.0.0/0` is added (or your platform's IP)
  2. Verify your connection string is correct
  3. Check that your database name is included in the connection string

### CORS Issues

**Problem**: Frontend can't access API (CORS error)
- **Solution**: 
  1. Set `CORS_ORIGIN` environment variable to your frontend URL (exact match)
  2. For multiple origins, use comma-separated values: `https://app1.com,https://app2.com`
  3. Restart your service after changing environment variables

### JWT Token Issues

**Problem**: "Invalid token" errors
- **Solution**: 
  1. Ensure `JWT_SECRET` is the same across all services
  2. Check that `JWT_EXPIRES_IN` is set correctly
  3. Verify token is being sent in Authorization header: `Bearer <token>`

### Build/Deployment Failures

**Problem**: Build fails during deployment
- **Solution**:
  1. Check build logs for specific errors
  2. Ensure `package.json` has correct start script: `"start": "node app.js"`
  3. Verify all dependencies are listed in `package.json`
  4. Check that Node.js version is compatible

### Environment Variables Not Working

**Problem**: Environment variables not being read
- **Solution**:
  1. Verify variable names match exactly (case-sensitive)
  2. Restart the service after adding/changing variables
  3. Check logs to see if variables are being validated

## Security Best Practices

1. ✅ **Never commit `.env` file** - Already in `.gitignore`
2. ✅ **Use strong JWT_SECRET** - Generate with crypto.randomBytes
3. ✅ **Set specific CORS_ORIGIN** - Don't use wildcard in production
4. ✅ **Use MongoDB Atlas database user** - Not admin user
5. ✅ **Enable IP whitelisting** - Restrict MongoDB access where possible
6. ✅ **Regularly update dependencies** - Keep packages up to date
7. ✅ **Monitor logs** - Check for suspicious activity

## Updating Your Deployment

To update your deployed API:

1. **Render**: Push changes to your connected branch - auto-deploys
2. **Railway**: Push changes to your connected branch - auto-deploys
3. Both platforms will rebuild and redeploy automatically

To manually redeploy:
- **Render**: Go to your service → "Manual Deploy" → "Deploy latest commit"
- **Railway**: Go to your service → "Deployments" → "Redeploy"

## Getting Help

If you encounter issues:

1. Check the deployment platform logs
2. Verify all environment variables are set
3. Test locally with production environment variables
4. Check MongoDB Atlas connection status
5. Review error messages in your error handler

## Next Steps

After successful deployment:

1. Update your frontend to use the production API URL
2. Test all endpoints thoroughly
3. Monitor logs for the first few days
4. Set up monitoring/alerting if available
5. Consider adding a health check endpoint

---

**Need help?** Check the main README.md or open an issue in your repository.

