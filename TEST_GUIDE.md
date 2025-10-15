# 🧪 Testing Your Chaser Agent

## Quick Start Test

### 1. Start the Dev Server
```bash
npm run dev
```

### 2. Start the Scheduler
Open your browser and visit:
```
http://localhost:3000/api/scheduler/start
```

Or use curl:
```bash
curl -X POST http://localhost:3000/api/scheduler/start
```

You should see:
```json
{
  "success": true,
  "message": "Outreach scheduler started! Will check for pending emails every 30 minutes."
}
```

### 3. Create a Test Chaser

Go to: `http://localhost:3000`

Fill out the form with YOUR email:
- **TASK**: "Test chaser system"
- **Documents**: "Test Document"
- **Who**: "Your Name"
- **Urgency**: "High"

**Make sure to add your email in the form!** (You'll need to update the form to include an email field, or it will use test@example.com)

Click "🚀 Initialize Chaser"

### 4. Check Your Email!

**Within seconds**, you should receive:
```
Subject: Request for Test Document

Hi Your Name,

I hope this email finds you well. I'm reaching out regarding Test chaser system.

We need the following documents from you:
📄 Test Document

Could you please provide these at your earliest convenience?
...
```

### 5. Check Data File

```bash
cat data/chasers.json
```

You should see your chaser with:
- ✅ First schedule item marked as "sent"
- ⏰ Remaining items as "pending"
- 📅 Scheduled dates for follow-ups

### 6. Trigger Next Email Early (Don't Wait!)

```bash
# Manually trigger the scheduler
curl -X POST http://localhost:3000/api/scheduler/trigger
```

**Note**: This won't send the next email yet because it's not time! The next email for "High" urgency is scheduled for 1 day from now.

### 7. View All Chasers

```bash
curl http://localhost:3000/api/chasers | jq
```

Or visit: `http://localhost:3000/api/chasers`

## 📊 What Gets Sent

### For "High" Urgency:

| Attempt | Time | Medium | Status |
|---------|------|--------|--------|
| 1 | Immediate | Email | ✅ Sent |
| 2 | +6 hours | WhatsApp | ⏰ Pending |
| 3 | +1 day | Call | ⏰ Pending |
| 4 | +2 days | Email | ⏰ Pending |

## 🔍 Debugging

### Check Scheduler Status:
```bash
curl http://localhost:3000/api/scheduler/start
```

### Check Server Logs:
Look for these messages in your terminal:
```
📧 Sending first email immediately...
✅ Email sent successfully: msg_abc123
✅ First email sent successfully!
💾 Saved 1 chasers to file
📧 Emails sent today: 1/2000
```

### Check Data Directory:
```bash
ls -la data/
cat data/chasers.json | jq
```

### View Specific Chaser:
```bash
cat data/chasers.json | jq '.[0]'
```

## ⚠️ Common Issues

### "Error: Missing required fields"
- Make sure all form fields are filled
- Check that you have task, documents, who, and urgency

### "Error sending email"
- Check your `.env.local` file has all Gmail credentials
- Verify your refresh token is valid
- Test with: `http://localhost:3000/api/test-email` (if you create this endpoint)

### Scheduler not running
- Make sure you visited `/api/scheduler/start`
- Check server logs for errors
- Restart the dev server

### Email not received
- Check spam folder
- Verify the email address in the form
- Check Gmail quota (not exceeded 2000/day)
- Look at server logs for errors

## 🎯 Full Flow Test

1. ✅ Create chaser → First email sent
2. ⏰ Wait 6 hours → Second attempt (WhatsApp - not implemented yet, will be skipped)
3. ⏰ Wait 1 day → Third attempt (Call - not implemented yet)
4. ⏰ Wait 2 days → Fourth attempt (Email - will be sent!)

**To test faster**, change the urgency timing in:
`src/services/scheduleGenerator.ts`

```typescript
// For testing, change to minutes instead of days:
'High': { 
  initialDelay: 0,           // immediate
  intervals: [0.01, 0.02, 0.03]  // ~15min, 30min, 45min
}
```

## 📝 Expected Files After Test

```
/data/
  └── chasers.json  ← Your chaser data

Contents should look like:
[
  {
    "id": "chaser_1234...",
    "task": "Test chaser system",
    "documents": "Test Document",
    "who": "Your Name",
    "urgency": "High",
    "status": "scheduled",
    "currentAttempt": 1,
    "schedule": [
      {
        "id": "...",
        "attemptNumber": 1,
        "status": "sent",  ← ✅ First one sent!
        "sentAt": "2024-01-15T10:30:00Z"
      },
      {
        "attemptNumber": 2,
        "status": "pending",  ← ⏰ Waiting
        ...
      }
    ],
    ...
  }
]
```

## 🎉 Success Criteria

✅ First email arrives in your inbox  
✅ `data/chasers.json` file created  
✅ Scheduler starts without errors  
✅ Can view chasers in dashboard  
✅ Can manually trigger scheduler  

Happy testing! 🚀

