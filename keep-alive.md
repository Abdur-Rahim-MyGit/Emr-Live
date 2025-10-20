# Keep Backend Alive on Render Free Tier

Render's free tier spins down your backend after 15 minutes of inactivity. Here are solutions to keep it alive:

## Option 1: External Monitoring Service (Recommended)

Use a free service like **UptimeRobot** or **Cron-Job.org**:

### UptimeRobot (Free - Recommended)
1. Sign up at [uptimerobot.com](https://uptimerobot.com)
2. Create a new monitor:
   - **Monitor Type**: HTTP(s)
   - **URL**: `https://your-backend.onrender.com/api/auth/health`
   - **Monitoring Interval**: 5 minutes (free tier)
3. Save and activate

### Cron-Job.org (Free)
1. Sign up at [cron-job.org](https://cron-job.org)
2. Create a new cron job:
   - **URL**: `https://your-backend.onrender.com/api/auth/health`
   - **Schedule**: Every 10 minutes
3. Save and enable

## Option 2: GitHub Actions (Free)

Create `.github/workflows/keep-alive.yml`:

```yaml
name: Keep Backend Alive

on:
  schedule:
    # Runs every 10 minutes
    - cron: '*/10 * * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Backend
        run: |
          curl -f https://your-backend.onrender.com/api/auth/health || exit 0
```

**Note**: Replace `your-backend.onrender.com` with your actual backend URL.

## Option 3: Render Cron Job (Paid)

If you upgrade to a paid plan, you can use Render's built-in cron jobs.

## ⚠️ Important Notes

1. **Free Tier Limitations**: Even with keep-alive, the first request after inactivity may be slow
2. **Better Solution**: Consider upgrading to Render's paid tier ($7/month) for always-on service
3. **Alternative**: Use other platforms like Railway, Fly.io, or AWS Free Tier

## 🎯 Recommended Approach

For production use:
- **Development/Testing**: Use free tier with UptimeRobot
- **Production**: Upgrade to paid tier for better reliability and performance

---

**Current Status**: Your backend will spin down after 15 minutes of inactivity on free tier.
**Impact**: First request after spin-down takes 30-60 seconds to wake up.
