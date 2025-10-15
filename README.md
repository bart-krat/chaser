# 🎯 Chaser Agent

Automate document requests with intelligent follow-ups.

## 🚀 Features

- **Simple Form Interface**: Create chasers with just 4 text inputs (Task, Documents, Who, Urgency)
- **Intelligent Scheduling**: Automatically schedules follow-ups based on urgency level
- **Multi-Channel Outreach**: Email, WhatsApp, Call, and Hybrid strategies
- **Content Generation**: Pre-built templates for all communication channels
- **Dashboard**: Monitor all active chasers in real-time
- **Settings**: Configure urgency levels and communication mediums

## 🏗️ Architecture

### Frontend (Next.js + TypeScript)
- **Pages**: Home (Create), Dashboard, Settings (Urgency/Medium)
- **Components**: ChaserForm, ChaserDashboard, SettingsDropdown
- **Context**: Global state management for chasers
- **Styling**: Dark purple background with lime green accents

### Backend (Next.js API Routes + TypeScript)

#### Services
- **Schedule Generator** (`/src/services/scheduleGenerator.ts`)
  - Generates outreach schedules based on urgency
  - Supports Low, Medium, High, and Urgent priorities
  - Multi-channel escalation strategies

- **Content Generator** (`/src/services/contentGenerator.ts`)
  - Email, WhatsApp, and Call script templates
  - Dynamic content based on attempt number
  - Urgency-aware messaging

#### API Routes
- `POST /api/chasers` - Create new chaser
- `GET /api/chasers` - Get all chasers
- `GET /api/chasers/[id]` - Get specific chaser
- `PATCH /api/chasers/[id]` - Update chaser
- `DELETE /api/chasers/[id]` - Delete chaser
- `POST /api/webhooks/response` - Handle responses

## 📊 Urgency Timing

| Urgency | Initial Delay | Follow-ups |
|---------|--------------|------------|
| **Low** | 3 days | 7, 14, 30 days |
| **Medium** | 1 day | 3, 7, 14 days |
| **High** | 6 hours | 1, 2, 4, 7 days |
| **Urgent** | Immediate | 12h, 1d, 2d, 3d |

## 🔄 Medium Strategies

- **Email**: email → email → email → call
- **WhatsApp**: whatsapp → whatsapp → email
- **Call**: call → email → call
- **Hybrid**: email → whatsapp → call → email

## 💻 Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (TypeScript)
- **State**: React Context API
- **Styling**: Custom purple/lime theme

## 🚦 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chasers/
│   │   │   ├── route.ts          # Main chaser API
│   │   │   └── [id]/route.ts     # Individual chaser operations
│   │   └── webhooks/
│   │       └── response/route.ts # Response webhook
│   ├── dashboard/
│   │   └── page.tsx              # Dashboard page
│   ├── settings/
│   │   ├── layout.tsx
│   │   ├── urgency/page.tsx
│   │   └── medium/page.tsx
│   ├── layout.tsx
│   ├── page.tsx                  # Home/Create page
│   └── globals.css
├── components/
│   ├── ChaserForm.tsx
│   ├── ChaserDashboard.tsx
│   └── SettingsDropdown.tsx
├── context/
│   └── ChaserContext.tsx         # Global state
├── services/
│   ├── scheduleGenerator.ts      # Schedule logic
│   └── contentGenerator.ts       # Content templates
├── types/
│   ├── chaser.ts                 # Frontend types
│   └── backend.ts                # Backend types
├── data/
│   └── users.ts
└── lib/
    └── api.ts                    # API client functions
```

## 🔮 Production Roadmap

To make this production-ready, you'll need:

### 1. Database
```bash
# Example with Prisma + PostgreSQL
npm install prisma @prisma/client
npx prisma init
```

### 2. Job Queue
```bash
# BullMQ for scheduled outreach
npm install bullmq ioredis
```

### 3. Email Service
```bash
# SendGrid or similar
npm install @sendgrid/mail
```

### 4. WhatsApp Integration
```bash
# Twilio
npm install twilio
```

### 5. Authentication
```bash
# NextAuth.js
npm install next-auth
```

## 📝 Environment Variables

Create a `.env.local` file:

```env
# Database
DATABASE_URL="postgresql://..."

# Redis (for BullMQ)
REDIS_URL="redis://..."

# Email
SENDGRID_API_KEY="..."
SENDGRID_FROM_EMAIL="..."

# WhatsApp (Twilio)
TWILIO_ACCOUNT_SID="..."
TWILIO_AUTH_TOKEN="..."
TWILIO_WHATSAPP_NUMBER="..."

# Authentication
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
```

## 🎨 Color Scheme

- **Background**: Ultra dark purple (`#0a0118`)
- **Cards**: Dark purple (`#1a0d2e`)
- **Accents**: Lime green (`#84ff00`)
- **Text**: White (`#ffffff`)

## 📄 License

MIT
