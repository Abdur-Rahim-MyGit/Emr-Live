# 🚀 Render Deployment Guide - UPDATED

## ✅ Fixed Issues
The `render.yaml` has been corrected. Here's what changed:
- ❌ Removed invalid `fromService.property: url` references
- ❌ Removed `region` from static site (not allowed)
- ✅ Environment variables now use `sync: false` (you'll set them manually)

## 📋 Deployment Process

### Option 1: Blueprint Deployment (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Fix render.yaml configuration"
   git push origin main
   ```

2. **Deploy on Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click **"New"** → **"Blueprint"**
   - Connect your GitHub repository
   - Render will create 2 services:
     - `emr-backend` (Web Service)
     - `emr-frontend` (Static Site)

3. **Configure Environment Variables**
   
   After services are created, you need to manually set these:

   #### Backend Service (`emr-backend`):
   Go to service → Environment → Add:
   
   | Key | Value | Example |
   |-----|-------|---------|
   | `MONGODB_URI` | Your MongoDB Atlas connection | `mongodb+srv://user:pass@cluster.mongodb.net/emr` |
   | `JWT_SECRET` | Random 32+ char string | `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6` |
   | `EMAIL_HOST` | SMTP server | `smtp.gmail.com` |
   | `EMAIL_PORT` | SMTP port | `587` |
   | `EMAIL_USER` | Your email | `your-email@gmail.com` |
   | `EMAIL_PASS` | App password | `your-app-password` |
   | `FRONTEND_URL` | Frontend URL | `https://emr-frontend.onrender.com` |

   #### Frontend Service (`emr-frontend`):
   Go to service → Environment → Add:
   
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://emr-backend.onrender.com` |

4. **Redeploy Both Services**
   - After adding environment variables, click "Manual Deploy" → "Deploy latest commit"
   - Do this for both backend and frontend

### Option 2: Manual Deployment (Step by Step)

#### Step 1: Deploy Backend

1. Render Dashboard → **"New"** → **"Web Service"**
2. Connect GitHub repository
3. Configure:
   - **Name**: `emr-backend`
   - **Region**: Singapore (or closest to you)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. Add Environment Variables (see table above)

5. Click **"Create Web Service"**

6. **Copy the backend URL** (e.g., `https://emr-backend-abc123.onrender.com`)

#### Step 2: Deploy Frontend

1. Render Dashboard → **"New"** → **"Static Site"**
2. Connect GitHub repository
3. Configure:
   - **Name**: `emr-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Plan**: Free

4. Add Environment Variable:
   - **Key**: `VITE_API_URL`
   - **Value**: Your backend URL from Step 1 (e.g., `https://emr-backend-abc123.onrender.com`)

5. Click **"Create Static Site"**

#### Step 3: Update Backend with Frontend URL

1. Go back to backend service
2. Environment → Add variable:
   - **Key**: `FRONTEND_URL`
   - **Value**: Your frontend URL (e.g., `https://emr-frontend-xyz789.onrender.com`)
3. Redeploy backend

## 🔐 Environment Variables Reference

### Backend Required Variables:

```env
NODE_ENV=production                    # Auto-set by render.yaml
PORT=5001                              # Auto-set by render.yaml
MONGODB_URI=<your-mongodb-uri>         # YOU MUST SET
JWT_SECRET=<random-32-char-string>     # YOU MUST SET
JWT_EXPIRE=7d                          # Auto-set by render.yaml
EMAIL_HOST=smtp.gmail.com              # YOU MUST SET
EMAIL_PORT=587                         # YOU MUST SET
EMAIL_USER=<your-email>                # YOU MUST SET
EMAIL_PASS=<your-app-password>         # YOU MUST SET
FRONTEND_URL=<frontend-url>            # YOU MUST SET (after frontend deploys)
```

### Frontend Required Variables:

```env
VITE_API_URL=<backend-url>             # YOU MUST SET (after backend deploys)
```

## 📝 Important Notes

### Why Manual Environment Variables?

Render's Blueprint doesn't support automatic cross-service URL references with `fromService.property: url`. This is a Render limitation, not a configuration error.

**Solution**: Set these manually after both services are created.

### Deployment Order

1. ✅ Blueprint creates both services
2. ✅ Backend deploys first (may fail initially - that's OK)
3. ✅ Add backend environment variables
4. ✅ Redeploy backend
5. ✅ Copy backend URL
6. ✅ Add frontend environment variable (`VITE_API_URL`)
7. ✅ Redeploy frontend
8. ✅ Copy frontend URL
9. ✅ Add `FRONTEND_URL` to backend
10. ✅ Redeploy backend one final time

## ✅ Verification Steps

1. **Backend Health Check**:
   ```
   https://your-backend.onrender.com/api/auth/health
   ```
   Should return:
   ```json
   {
     "success": true,
     "message": "Server is running",
     "timestamp": "2025-10-20T..."
   }
   ```

2. **Frontend**: Visit your frontend URL - app should load

3. **Integration**: Try logging in - should work without CORS errors

## 🆘 Troubleshooting

### "Build failed" on backend
- Check logs for missing dependencies
- Verify `buildCommand` is correct
- Ensure all `package.json` dependencies are listed

### "CORS error" in browser
- Verify `FRONTEND_URL` is set in backend
- Check backend CORS configuration
- Ensure URLs don't have trailing slashes

### "Cannot connect to API"
- Verify `VITE_API_URL` is set in frontend
- Check backend is running (visit health check endpoint)
- Ensure backend URL is correct (no trailing slash)

## 🎉 Success Checklist

- [ ] Both services deployed successfully
- [ ] All environment variables set
- [ ] Backend health check returns success
- [ ] Frontend loads without errors
- [ ] Can login/register
- [ ] No CORS errors in browser console
- [ ] Data loads from backend

---

**Total deployment time**: 15-20 minutes (including environment variable setup)
