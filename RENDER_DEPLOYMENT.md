# Render Deployment Guide for EMR Healthcare System

This guide will help you deploy your full-stack EMR application to Render.

## 🚀 Overview

Your application consists of:
- **Backend**: Node.js/Express API (Port 5001)
- **Frontend**: React/Vite static site
- **Database**: MongoDB (you'll need MongoDB Atlas)

## 📋 Prerequisites

1. **GitHub Repository**: Push your code to GitHub
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **MongoDB Atlas**: Set up a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

## 🗄️ Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (M0 Sandbox)
3. Create a database user with username and password
4. Whitelist all IPs (0.0.0.0/0) for Render access
5. Get your connection string (it looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority
   ```

## 📦 Step 2: Push Code to GitHub

```bash
cd "d:\SMAART - Backup (14.10.25)\Smaart - EMR Live  19-10-25\Emr-Live"
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

## 🌐 Step 3: Deploy to Render

### Option A: Using render.yaml (Recommended - Automatic)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file
5. Review the services (backend + frontend)
6. Click **"Apply"**

### Option B: Manual Deployment

#### Deploy Backend First:

1. Go to Render Dashboard
2. Click **"New"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `emr-backend`
   - **Region**: Singapore (or closest to you)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. Add Environment Variables (see below)
6. Click **"Create Web Service"**

#### Deploy Frontend:

1. Click **"New"** → **"Static Site"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `emr-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Plan**: Free

4. Add Environment Variable:
   - **Key**: `VITE_API_URL`
   - **Value**: Your backend URL (e.g., `https://emr-backend.onrender.com`)

5. Click **"Create Static Site"**

## 🔐 Step 4: Configure Environment Variables

### Backend Environment Variables

Add these in your backend service settings:

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `5001` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/emr` |
| `JWT_SECRET` | Secret for JWT tokens | `your-super-secret-key-change-this` |
| `JWT_EXPIRE` | Token expiration | `7d` |
| `EMAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | Email username | `your-email@gmail.com` |
| `EMAIL_PASS` | Email password/app password | `your-app-password` |
| `FRONTEND_URL` | Frontend URL | `https://emr-frontend.onrender.com` |

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://emr-backend.onrender.com` |

## 🔄 Step 5: Update CORS Settings

After deployment, update your backend CORS configuration if needed:

```javascript
// backend/server.js
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

## ✅ Step 6: Verify Deployment

1. **Backend Health Check**: Visit `https://your-backend-url.onrender.com/api/auth/health`
   - Should return: `{"success": true, "message": "Server is running"}`

2. **Frontend**: Visit `https://your-frontend-url.onrender.com`
   - Should load your application

3. **Test Login**: Try logging in to verify backend-frontend connection

## 🎯 Important Notes

### Free Tier Limitations:
- **Backend**: Spins down after 15 minutes of inactivity (first request may take 30-60 seconds)
- **Frontend**: Always available (static site)
- **Database**: MongoDB Atlas free tier has 512MB storage limit

### Performance Tips:
1. Keep your backend active by setting up a cron job to ping it every 10 minutes
2. Use MongoDB indexes for better query performance
3. Implement caching where possible

### Security Checklist:
- ✅ Never commit `.env` files to Git
- ✅ Use strong JWT_SECRET (generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- ✅ Enable MongoDB IP whitelist (or use 0.0.0.0/0 for Render)
- ✅ Use app-specific passwords for email (not your main password)

## 🔧 Troubleshooting

### Backend won't start:
- Check environment variables are set correctly
- Verify MongoDB connection string
- Check Render logs: Dashboard → Service → Logs

### Frontend can't connect to backend:
- Verify `VITE_API_URL` is set correctly
- Check CORS settings in backend
- Ensure backend is running (check health endpoint)

### Database connection fails:
- Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Check connection string format
- Ensure database user has correct permissions

## 📱 Updating Your Application

After making changes:

```bash
git add .
git commit -m "Your update message"
git push origin main
```

Render will automatically detect changes and redeploy both services.

## 🆘 Need Help?

- **Render Docs**: https://render.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/
- **Check Logs**: Always check service logs in Render dashboard

## 🎉 You're Done!

Your EMR Healthcare System is now live on Render!

- Backend API: `https://emr-backend.onrender.com`
- Frontend App: `https://emr-frontend.onrender.com`

Share your frontend URL with users to access the application.
