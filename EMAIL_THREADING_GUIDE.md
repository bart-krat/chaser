# 🔗 Email Threading Implementation

## ✅ What's Been Implemented

Your Chaser Agent now sends **properly threaded emails** using Gmail's threading mechanism!

## 📧 How Email Threading Works

### Thread 1: Initial Outreach
```
Email 1 (Immediate)
  Subject: Document Requirements - Bank statements...
  Message-ID: msg_abc123
  ↓
Email 2 (+delay) - THREADED REPLY
  Subject: Re: Document Requirements - Bank statements...
  In-Reply-To: msg_abc123  ← Links to Email 1
  References: msg_abc123   ← Thread chain
```

### Thread 2: Escalated Outreach  
```
Email 3 (+delay) - NEW THREAD
  Subject: URGENT: Document Requirements...
  Message-ID: msg_def456
  ↓
Email 4 (+delay) - THREADED REPLY
  Subject: Re: URGENT: Document Requirements...
  In-Reply-To: msg_def456  ← Links to Email 3
  References: msg_def456   ← Thread chain
```

## 🔧 Technical Implementation

### 1. **Database Schema**
Added to `OutreachSchedule` table:
```prisma
messageId  String?  // Gmail Message-ID for threading
threadId   String?  // Gmail Thread-ID
```

### 2. **Gmail Headers**
When sending Email 2 or 4:
```
In-Reply-To: <previous-message-id>
References: <previous-message-id>
```

These headers tell Gmail: "This is a reply!"

### 3. **Message ID Storage**
```typescript
// When Email 1 is sent:
const result = await sendGmailEmail({ ... });

// Store the Message-ID in database
await prisma.outreachSchedule.update({
  data: {
    messageId: result.messageId,  // Save for later!
    threadId: result.threadId
  }
});
```

### 4. **Threading on Follow-Up**
```typescript
// When Email 2 is ready to send:
const previousEmail = await prisma.outreachSchedule.findFirst({
  where: { attemptNumber: 1 }  // Get Email 1
});

// Send as a reply
await sendGmailEmail({
  subject: `Re: ${originalSubject}`,
  inReplyTo: previousEmail.messageId,  // ← Thread it!
  references: previousEmail.messageId
});
```

## 📬 What Recipients See in Gmail

### Before (No Threading):
```
Inbox:
├─ Document Requirements - Bank statements... (Oct 15)
├─ Document Requirements - Bank statements... (Oct 15) ← Duplicate!
├─ URGENT: Document Requirements... (Oct 16)
└─ URGENT: Document Requirements... (Oct 17) ← Another duplicate!

4 separate emails ❌
```

### After (With Threading):
```
Inbox:
├─ 📧 Document Requirements - Bank statements... (2 messages)
│   ├─ Initial email (Oct 15, 12:00 PM)
│   └─ Re: Follow-up (Oct 15, 6:00 PM)
│
└─ 📧 URGENT: Document Requirements... (2 messages)
    ├─ Urgent email (Oct 16, 12:00 PM)
    └─ Re: Follow-up (Oct 17, 12:00 PM)

2 threaded conversations ✅
```

## 🎯 Complete Flow

```
1. Create Chaser
        ↓
2. Generate 4 emails (AI for 1&3, template for 2&4)
        ↓
3. Save to database
        ↓
4. Send Email 1 immediately
   ├─ Gmail returns: Message-ID = "msg_abc123"
   └─ Store in database: messageId = "msg_abc123"
        ↓
5. Scheduler sends Email 2 (6 hours later)
   ├─ Get Email 1's messageId from database
   ├─ Add headers: In-Reply-To: msg_abc123
   ├─ Add subject: "Re: Document Requirements..."
   └─ Gmail threads it with Email 1! ✅
        ↓
6. Scheduler sends Email 3 (1 day later)
   ├─ New thread (no In-Reply-To)
   ├─ Gmail returns: Message-ID = "msg_def456"
   └─ Store: messageId = "msg_def456"
        ↓
7. Scheduler sends Email 4 (2 days later)
   ├─ Get Email 3's messageId from database
   ├─ Add headers: In-Reply-To: msg_def456
   ├─ Add subject: "Re: URGENT: Document..."
   └─ Gmail threads it with Email 3! ✅
```

## 🧪 Testing Email Threading

### Step 1: Fix Gmail API Setup
Make sure your `.env.local` has valid credentials:
```env
GOOGLE_REFRESH_TOKEN="your-valid-token"
```

### Step 2: Create a Chaser
Use your own email in the "Who" field to test!

### Step 3: Watch Console Logs
```
📧 Sending first email immediately...
✅ Email sent successfully
   Message-ID: 17c4a2b3c5d6e7f8
   Thread-ID: 17c4a2b3c5d6e7f8
💾 Stored message ID for threading
```

### Step 4: Check Database
In Prisma Studio (`localhost:5555`):
```
OutreachSchedule table:
├─ Attempt 1: messageId = "17c4a2b3c5d6e7f8" ✅
├─ Attempt 2: messageId = null (not sent yet)
├─ Attempt 3: messageId = null
└─ Attempt 4: messageId = null
```

### Step 5: When Email 2 Sends (Use Trigger)
```bash
# Don't wait, trigger manually
curl -X POST http://localhost:3000/api/scheduler/trigger
```

Console should show:
```
🔗 This is a reply to attempt 1
🔗 Threading: Reply to message 17c4a2b3c5d6e7f8
✅ Email sent successfully
   Message-ID: 17c4a2c8d9e1f2g3  ← New ID
   Thread-ID: 17c4a2b3c5d6e7f8  ← SAME as Email 1! ✅
```

### Step 6: Check Your Gmail
Open Gmail and you'll see:
- **One conversation** with 2 emails (Email 1 + Email 2)
- Click to expand and see both messages
- Email 2 shows as a reply to Email 1

## 🎯 Key Features

| Feature | Status |
|---------|--------|
| **Proper threading** | ✅ Uses In-Reply-To header |
| **Subject continuity** | ✅ Uses "Re:" prefix |
| **Message ID storage** | ✅ Stored in database |
| **Thread ID tracking** | ✅ Groups conversations |
| **Fallback safety** | ✅ Works even if no previous ID |

## 📊 Database Updates

Each sent email now stores:
```json
{
  "attemptNumber": 1,
  "status": "sent",
  "messageId": "17c4a2b3c5d6e7f8",  ← Gmail's ID
  "threadId": "17c4a2b3c5d6e7f8",   ← Thread ID
  "sentAt": "2025-10-15T12:00:00Z"
}
```

## ⚠️ Important Notes

1. **Gmail API required**: Threading only works when actually sending emails
2. **Message IDs**: Only available after email is sent
3. **Email 2 timing**: Must wait until Email 1 is sent (has message ID)
4. **Thread IDs**: Gmail automatically groups when headers match

## 🚀 Everything is Ready!

Once you fix your Gmail API credentials:
1. Email 1 will send → Store message ID
2. Email 2 will send as reply → Thread with Email 1 ✅
3. Email 3 will send (new thread) → Store message ID
4. Email 4 will send as reply → Thread with Email 3 ✅

**Professional, threaded email automation!** 🎉

