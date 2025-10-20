# 🚀 Quick Deployment Checklist

Use this checklist to ensure smooth deployment to Render.

## ✅ Pre-Deployment Checklist

### 1. Database Setup
- [ ] MongoDB Atlas account created
- [ ] Free cluster (M0) created
- [ ] Database user created with username/password
- [ ] IP whitelist set to 0.0.0.0/0 (allow all)
- [ ] Connection string copied

### 2. Code Preparation
- [ ] All code committed to Git
- [ ] `.env` files are in `.gitignore` (never commit secrets!)
- [ ] Code pushed to GitHub
- [ ] `render.yaml` file exists in root directory

### 3. Environment Variables Ready

#### Backend Variables:
- [ ] `MONGODB_URI` - Your MongoDB Atlas connection string
- [ ] `JWT_SECRET` - Generate a strong secret (32+ characters)
- [ ] `EMAIL_HOST` - SMTP server (e.g., smtp.gmail.com)
- [ ] `EMAIL_PORT` - SMTP port (e.g., 587)
- [ ] `EMAIL_USER` - Your email address
- [ ] `EMAIL_PASS` - App-specific password (not your main password)

#### Frontend Variables:
- [ ] `VITE_API_URL` - Will be set to backend URL after backend deploys

## 🌐 Deployment Steps

### Step 1: Deploy Backend
1. [ ] Go to [Render Dashboard](https://dashboard.render.com/)
2. [ ] Click "New" → "Blueprint" (or "Web Service" for manual)
3. [ ] Connect GitHub repository
4. [ ] Select `render.yaml` (or configure manually)
5. [ ] Add all backend environment variables
6. [ ] Click "Create" and wait for deployment
7. [ ] Copy backend URL (e.g., `https://emr-backend.onrender.com`)

### Step 2: Deploy Frontend
1. [ ] If using Blueprint, it deploys automatically
2. [ ] If manual: Click "New" → "Static Site"
3. [ ] Configure build settings
4. [ ] Add `VITE_API_URL` with your backend URL
5. [ ] Click "Create" and wait for deployment
6. [ ] Copy frontend URL (e.g., `https://emr-frontend.onrender.com`)

### Step 3: Update Backend CORS
1. [ ] Go to backend service settings
2. [ ] Add environment variable `FRONTEND_URL` with your frontend URL
3. [ ] Redeploy backend if needed

## ✅ Post-Deployment Verification

### Backend Tests:
- [ ] Visit: `https://your-backend.onrender.com/api/auth/health`
  - Should return: `{"success": true, "message": "Server is running"}`
- [ ] Check logs for any errors
- [ ] Verify MongoDB connection (check logs)

### Frontend Tests:
- [ ] Visit: `https://your-frontend.onrender.com`
- [ ] Application loads without errors
- [ ] Can navigate between pages
- [ ] Try to login/register
- [ ] Check browser console for errors

### Integration Tests:
- [ ] Login functionality works
- [ ] API calls succeed
- [ ] Data loads from backend
- [ ] No CORS errors in console

## 📝 Important URLs to Save

After deployment, save these URLs:

```
Backend API: https://_____________________.onrender.com
Frontend App: https://_____________________.onrender.com
MongoDB Atlas: https://cloud.mongodb.com
```

## 🔧 Common Issues & Solutions

### Issue: Backend takes 30+ seconds to respond
**Solution**: Free tier spins down after 15 min inactivity. First request wakes it up.

### Issue: CORS errors in browser console
**Solution**: 
1. Verify `FRONTEND_URL` is set in backend
2. Check CORS configuration in `server.js`
3. Ensure URLs don't have trailing slashes

### Issue: Database connection failed
**Solution**:
1. Check MongoDB Atlas IP whitelist (should be 0.0.0.0/0)
2. Verify connection string format
3. Ensure database user has read/write permissions

### Issue: Environment variables not working
**Solution**:
1. Verify variables are set in Render dashboard
2. Check for typos in variable names
3. Redeploy service after adding variables

## 🎉 Success!

Once all checkboxes are complete, your EMR system is live!

**Next Steps:**
- Share frontend URL with users
- Monitor logs for any issues
- Set up monitoring/alerts (optional)
- Consider upgrading to paid tier for better performance

---

**Need detailed instructions?** See `RENDER_DEPLOYMENT.md`
