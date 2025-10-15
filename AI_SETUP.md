# 🤖 AI-Powered Email Generation

## ✅ What's Been Implemented

Your Chaser Agent now uses **OpenAI GPT-4o-mini** to generate dynamic, contextual emails!

## 🎯 How It Works

### Without AI (Templates):
```
Create Chaser
  ↓
Use static template
  ↓
"Hi {name}, We need your {document}..."
```

### With AI (Dynamic):
```
Create Chaser
  ↓
Call OpenAI API
  ↓
Generate custom email based on:
  - Contact name
  - Document type
  - Task description
  - Urgency level
  - Attempt number
  ↓
Unique, contextual email! ✨
```

## 📝 Setup Instructions

### Step 1: Get OpenAI API Key

1. Go to: https://platform.openai.com/api-keys
2. Sign in or create account
3. Click **"Create new secret key"**
4. Name it: "Chaser Agent"
5. Copy the key (starts with `sk-proj-...`)

### Step 2: Add to Environment Variables

Add to your `.env.local`:

```env
# OpenAI API Key
OPENAI_API_KEY="sk-proj-YOUR_ACTUAL_KEY_HERE"
```

### Step 3: Restart Your Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

That's it! AI is now active! 🎉

## 🎨 What AI Generates

### Example for Attempt 1 (Friendly):
```
Hi Bart,

I hope this email finds you well. I'm reaching out regarding your tax return.

We need the VAT Receipt to proceed with processing. Could you please provide 
this at your earliest convenience?

If you have any questions or need assistance, please don't hesitate to reach out.

Best regards
```

### Example for Attempt 3 (Urgent):
```
Hi Bart,

This is our third attempt to reach you regarding the VAT Receipt for your 
tax return.

This is marked as High priority and we need these documents urgently to proceed. 
Could you please respond by end of day?

If there are any blockers preventing you from submitting these, please let me 
know immediately so I can assist.

Thank you for your prompt attention.
```

## 💡 Smart Features

### 1. **Tone Adaptation**
- **Attempt 1**: Friendly, helpful
- **Attempt 2**: Polite but firm
- **Attempt 3**: Urgent, direct
- **Attempt 4**: Final warning

### 2. **Context-Aware**
Each email mentions:
- ✅ Specific document requested
- ✅ The task/purpose
- ✅ Urgency level
- ✅ Attempt number (for follow-ups)

### 3. **Auto-Fallback**
If OpenAI fails (API down, quota exceeded, etc.):
- Automatically uses template-based content
- No errors shown to user
- Logs the issue for debugging

### 4. **Cost Optimization**
- Uses **GPT-4o-mini** (not GPT-4)
- 80% cheaper than GPT-4
- Still excellent quality
- ~$0.0001 per email

## 💰 Pricing

### OpenAI API Costs:

**GPT-4o-mini** (What we're using):
- $0.15 per 1M input tokens
- $0.60 per 1M output tokens
- **~$0.0001 per email** (~100 tokens in, 200 tokens out)

### Real-World Costs:

| Volume | Cost per Month |
|--------|----------------|
| 100 emails | $0.01 |
| 1,000 emails | $0.10 |
| 10,000 emails | $1.00 |
| 100,000 emails | $10.00 |

**Basically free** for most use cases! 🎉

## 🔄 How Content is Generated

### For Email (Uses AI):
```typescript
generateEmailWithAI({
  contactName: "Bart Kratochvil",
  documents: "VAT Receipt",
  task: "tax return",
  urgency: "High",
  attemptNumber: 1
})
  ↓
OpenAI generates custom email
  ↓
Saved to database
  ↓
Sent via Gmail
```

### For WhatsApp/Call (Uses Templates):
```typescript
generateContent(template, context)
  ↓
Static template with variables
  ↓
"Hi {name}, quick reminder about {document}..."
```

## 🎯 Testing

### Without OpenAI Key:
- ✅ Falls back to templates
- ✅ Still works perfectly
- Console shows: "AI disabled (using templates)"

### With OpenAI Key:
- ✅ Generates unique emails
- ✅ Adapts to context
- Console shows: "🤖 AI email generated"

## 📊 Monitoring

Check your console logs:
```bash
🤖 AI Content Generation: Enabled
🤖 Generating AI email for attempt 1...
✅ AI email generated (287 chars)
🤖 AI Subject: Request for VAT Receipt - Action Required
```

Or if disabled:
```bash
🤖 AI Content Generation: Disabled (using templates)
```

## 🚀 Next Steps

1. **Get your OpenAI API key** from platform.openai.com
2. **Add to `.env.local`**:
   ```env
   OPENAI_API_KEY="sk-proj-..."
   ```
3. **Restart server**: `npm run dev`
4. **Create a chaser** and check the email content!

## 🔧 Configuration

To change the AI model or behavior, edit:
```
/src/services/aiContentGenerator.ts
```

Change:
- Model: `gpt-4o-mini` → `gpt-4o` (more expensive but better)
- Temperature: `0.7` → `0.9` (more creative) or `0.5` (more consistent)
- Max tokens: Adjust email length

## ✨ Benefits of AI Generation

| Template-Based | AI-Generated |
|----------------|--------------|
| Same email every time | Unique each time ✅ |
| Generic language | Context-specific ✅ |
| Rigid structure | Adaptive tone ✅ |
| No personalization | Truly personalized ✅ |
| Free | $0.0001 per email |

**The emails will feel more human and get better response rates!** 🎯

Ready to add your OpenAI key and test it? 🚀

