# 🎯 Chaser Agent - Setup Guide

## ✅ You've Implemented:

### 1. **Gmail API Integration** ✨
- First email sends immediately when chaser is created
- Gmail API configured with your Google Workspace account
- Tracks daily email count (2,000/day limit)

### 2. **File-Based Persistence** 💾
- Chasers saved to `data/chasers.json`
- Survives server restarts
- No database needed for MVP

### 3. **Job Scheduler** ⏰
- Node-cron runs every 30 minutes
- Automatically sends follow-up emails
- Processes all pending outreach

## 🚀 How to Use

### Start the App:
```bash
npm run dev
```

### Start the Scheduler:
```bash
# In another terminal or visit in browser:
curl -X POST http://localhost:3000/api/scheduler/start

# Or visit:
http://localhost:3000/api/scheduler/start
```

### Create a Chaser:
1. Go to http://localhost:3000
2. Fill out the form:
   - TASK: "Get Q4 financials"
   - Documents: "VAT Receipt"
   - Who: "John Smith"
   - Urgency: "High"
3. Click "Initialize Chaser"
4. **First email sends immediately!** 📧

### What Happens Next:
```
✅ First email: Sent immediately
⏰ Follow-up 1: Sent after delay (based on urgency)
⏰ Follow-up 2: Sent after another delay
⏰ Follow-up 3: Sent after final delay
```

### Check Scheduler Status:
```bash
# Check if running
curl http://localhost:3000/api/scheduler/start

# Manually trigger (for testing)
curl -X POST http://localhost:3000/api/scheduler/trigger
```

### View All Chasers:
```bash
# API
curl http://localhost:3000/api/chasers

# Or visit dashboard
http://localhost:3000/dashboard
```

### Where Data is Stored:
```
/data/chasers.json  ← All your chasers
```

## 📊 Urgency Schedule

| Urgency | First Email | Follow-up 1 | Follow-up 2 | Follow-up 3 |
|---------|-------------|-------------|-------------|-------------|
| **High** | Immediate | 6 hours | 1 day | 2 days |
| **Medium** | Immediate | 1 day | 3 days | 7 days |
| **Low** | Immediate | 3 days | 7 days | 14 days |

## 🔧 Testing

### Test Email Sending:
1. Create a chaser with your own email
2. Check your inbox - first email should arrive instantly!
3. Wait for scheduled follow-ups (or trigger manually)

### Manual Trigger (Don't Wait):
```bash
curl -X POST http://localhost:3000/api/scheduler/trigger
```

## 📝 Environment Variables

Make sure your `.env.local` has:
```env
GOOGLE_CLIENT_ID="your-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-secret"
GOOGLE_REFRESH_TOKEN="your-refresh-token"
GMAIL_FROM_EMAIL="you@yourbusiness.com"
```

## 🎯 Next Steps

**You now have:**
✅ First email sends automatically
✅ Follow-ups scheduled automatically  
✅ Data persists to file
✅ Cron job runs every 30 minutes

**To upgrade later:**
- Add database (PostgreSQL + Prisma)
- Add BullMQ for more robust scheduling
- Add WhatsApp integration (Twilio)
- Add response webhooks

## 🚨 Important Notes

1. **Start the scheduler** after starting the dev server
2. **Check `data/chasers.json`** to see all chasers
3. **Scheduler runs every 30 minutes** - be patient or trigger manually
4. **First email is immediate** - check your inbox!

Happy chasing! 🎉

