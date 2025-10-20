# 🚀 Quick Start: Deploy to Render in 5 Steps

## Before You Start
- [ ] Have a GitHub account
- [ ] Have a Render account (sign up at render.com)
- [ ] Have MongoDB Atlas set up (free tier at mongodb.com/cloud/atlas)

## Step 1: Prepare MongoDB (5 minutes)
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create free cluster → Create database user
3. Network Access → Add IP: `0.0.0.0/0` (allow all)
4. Copy connection string (looks like: `mongodb+srv://user:pass@cluster.mongodb.net/`)

## Step 2: Push to GitHub (2 minutes)
```bash
cd "d:\SMAART - Backup (14.10.25)\Smaart - EMR Live  19-10-25\Emr-Live"
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

## Step 3: Deploy on Render (5 minutes)
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render detects `render.yaml` automatically
5. Click **"Apply"**

## Step 4: Add Environment Variables (3 minutes)

### Backend Service Settings:
Add these environment variables:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Any random 32+ character string |
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_USER` | Your Gmail address |
| `EMAIL_PASS` | Your Gmail app password* |

*Get Gmail app password: Google Account → Security → 2-Step Verification → App passwords

### Frontend Service Settings:
Will be auto-configured by render.yaml! ✅

## Step 5: Verify (2 minutes)
1. Wait for both services to deploy (green checkmark)
2. Click on backend service → Copy URL
3. Visit: `https://your-backend-url.onrender.com/api/auth/health`
   - Should see: `{"success": true, "message": "Server is running"}`
4. Click on frontend service → Click "Open" button
5. Your app should load! 🎉

## 🎯 Total Time: ~15-20 minutes

## ⚠️ Important Notes

### Free Tier Behavior:
- Backend sleeps after 15 min inactivity
- First request takes 30-60 seconds to wake up
- Frontend is always fast (static site)

### Keep Backend Alive:
Use [UptimeRobot](https://uptimerobot.com) (free):
1. Sign up
2. Add monitor: `https://your-backend.onrender.com/api/auth/health`
3. Set interval: 5 minutes

## 🆘 Troubleshooting

### "Database connection failed"
- Check MongoDB Atlas IP whitelist is `0.0.0.0/0`
- Verify connection string format
- Ensure database user has read/write permissions

### "CORS error" in browser
- Wait for both services to fully deploy
- Check `FRONTEND_URL` is set in backend
- Redeploy backend after setting variables

### "Service won't start"
- Check Render logs (Service → Logs tab)
- Verify all environment variables are set
- Check for typos in variable names

## 📱 Your URLs

After deployment, save these:

```
Backend:  https://emr-backend-XXXX.onrender.com
Frontend: https://emr-frontend-XXXX.onrender.com
```

## 🎉 Success!

Your EMR system is now live! Share the frontend URL with your users.

---

**Need more details?** See:
- `DEPLOYMENT_CHECKLIST.md` - Complete checklist
- `RENDER_DEPLOYMENT.md` - Detailed guide
- `keep-alive.md` - Keep backend active
