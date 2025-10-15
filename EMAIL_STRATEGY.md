# 📧 Email Chain Strategy

## 🎯 Two-Chain Approach

Your Chaser Agent uses a **smart two-chain email strategy** to maximize response rates while minimizing AI costs.

## 📨 Email Flow

### **Chain 1: Initial Polite Outreach**

#### Email 1 (Immediate) - NEW THREAD 🤖 AI-Generated
```
Subject: Document Requirements - Bank statements...
─────────────────────────────────────────────

Hi Bart Kratochvil,

I hope this finds you well.

In reference to Prepare VAT for Q3/2025, we will require 
the following documents from you:

Bank statements in PDF format confirming bank balances at 30.09.2025.
The last sale invoice in Xero is Inv-5 from 12.06.2025...
[Full document list - preserved exactly]

Could you please send these when you have a chance?

Best regards
```

#### Email 2 (+delay) - REPLY TO EMAIL 1 📝 Template
```
Subject: Re: Document Requirements - Bank statements...
─────────────────────────────────────────────

Hi Bart,

Just following up to see if you got my last email regarding 
the document requirements.

──────────────────────────────
Previous Email:
──────────────────────────────

[QUOTES EMAIL 1 IN FULL]

──────────────────────────────

Could you please send these over when you get a chance?

Thank you!
```

---

### **Chain 2: Escalated Urgent Outreach**

#### Email 3 (+delay) - NEW THREAD 🤖 AI-Generated (More Urgent)
```
Subject: URGENT: Document Requirements - Bank statements...
─────────────────────────────────────────────

Hi Bart Kratochvil,

I hope this finds you well.

In reference to Prepare VAT for Q3/2025, we will require 
the following documents from you:

[Full document list - preserved exactly]

Could you please prioritize sending these documents?

Best regards
```

#### Email 4 (+delay) - REPLY TO EMAIL 3 📝 Template
```
Subject: Re: URGENT: Document Requirements - Bank statements...
─────────────────────────────────────────────

Hi Bart,

Just following up to see if you got my last email regarding 
the document requirements.

──────────────────────────────
Previous Email:
──────────────────────────────

[QUOTES EMAIL 3 IN FULL]

──────────────────────────────

Could you please send these over when you get a chance?

Thank you!
```

## 💰 Cost Optimization

### AI Calls per Chaser:
- Email 1: AI-generated ✅
- Email 2: Template (quotes Email 1) 💰 FREE
- Email 3: AI-generated ✅  
- Email 4: Template (quotes Email 3) 💰 FREE

**Total AI calls**: 2 per chaser (instead of 4)
**Cost savings**: 50% reduction!

### Actual Costs:
- **4 AI emails**: $0.0004 per chaser
- **2 AI emails**: $0.0002 per chaser ✅
- **1000 chasers**: $0.20 instead of $0.40

## 🎯 Benefits

### 1. **Email Threading**
- Follow-ups use "Re:" so they stay in same thread
- Easier for recipient to see context
- Gmail/Outlook group them together

### 2. **Full Context**
- Follow-up quotes the entire original email
- Recipient doesn't have to search
- All document details visible again

### 3. **Cost Efficient**
- Only 2 AI calls per chaser
- Follow-ups are simple templates
- Still maintains quality

### 4. **Escalation Built-In**
- Chain 1: Polite initial + gentle reminder
- Chain 2: Urgent initial + urgent reminder
- Natural progression

## 📊 Timeline Example (High Urgency)

```
Day 1, 12:00 PM:
  Email 1 (AI) → "Hi Bart, In reference to..."
  
Day 1, 6:00 PM:
  Email 2 (Template) → "Re: ... Just following up..."
                         [Quotes Email 1]

Day 2, 12:00 PM:
  Email 3 (AI) → "URGENT: Hi Bart, In reference to..."
                 (New thread, more direct tone)

Day 3, 12:00 PM:
  Email 4 (Template) → "Re: URGENT: ... Just following up..."
                        [Quotes Email 3]
```

## 🔧 How It Works

### During Chaser Creation:

```typescript
// Generate Email 1 & 3 with AI
for (attempt 1, 3) {
  content = await generateEmailWithAI(params);
}

// Generate Email 2 & 4 as simple templates
for (attempt 2, 4) {
  const previousEmail = schedule[attemptNumber - 1];
  content = `Hi ${firstName},
  
  Just following up...
  
  ─────────
  Previous Email:
  ─────────
  
  ${previousEmail.content}
  
  Could you please send these over?
  
  Thank you!`;
}
```

## ✅ What Gets Stored in Database

Each OutreachSchedule item:

```json
{
  "attemptNumber": 2,
  "medium": "email",
  "content": "Hi Bart,\n\nJust following up...\n\n──────\nPrevious Email:\n──────\n\n[Full Email 1 content]\n\n──────",
  "scheduledFor": "2025-10-16T18:00:00Z",
  "status": "pending"
}
```

## 🎨 User Experience

Recipients see:
1. **First email**: Professional request with all details
2. **Second email**: "Re:" reply with original email quoted
3. **Third email**: New urgent thread (they might have missed first)
4. **Fourth email**: "Re:" reply to urgent email

Clean, professional, threaded conversations! 📬

## 🚀 Testing

Create a chaser and check Prisma Studio (`localhost:5555`):
- **OutreachSchedule** table
- Look at attempts 2 & 4
- See the "Previous Email" section quoting the earlier message!

---

**This is production-ready email automation!** 🎉

