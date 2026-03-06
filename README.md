# 🎥 CrimeWatch AI — Complete Setup Guide

> **Real-time CCTV threat detection, violence alerting, and incident analysis powered by Google Gemini AI.**

This guide will take you from zero to a fully running application — no developer needed after following these steps.

---

## 📋 Table of Contents

1. [What Is CrimeWatch AI?](#1-what-is-crimewatch-ai)
2. [Architecture Overview](#2-architecture-overview)
3. [Prerequisites (Install These First)](#3-prerequisites-install-these-first)
4. [Step 1 — Clone the Repositories](#4-step-1--clone-the-repositories)
5. [Step 2 — Set Up Supabase (Database + Auth)](#5-step-2--set-up-supabase-database--auth)
6. [Step 3 — Set Up ImageKit (Video Storage)](#6-step-3--set-up-imagekit-video-storage)
7. [Step 4 — Set Up Google Gemini API](#7-step-4--set-up-google-gemini-api)
8. [Step 5 — Set Up Twilio (SMS Alerts)](#8-step-5--set-up-twilio-sms-alerts)
9. [Step 6 — Set Up Gmail Email Alerts](#9-step-6--set-up-gmail-email-alerts)
10. [Step 7 — Configure Backend Environment](#10-step-7--configure-backend-environment)
11. [Step 8 — Configure Frontend Environment](#11-step-8--configure-frontend-environment)
12. [Step 9 — Run the Application Locally](#12-step-9--run-the-application-locally)
13. [Step 10 — Deploy to Vercel (Production)](#13-step-10--deploy-to-vercel-production)
14. [Feature Guide — How to Use the App](#14-feature-guide--how-to-use-the-app)
15. [SMS Troubleshooting](#15-sms-troubleshooting)
16. [Common Errors & Fixes](#16-common-errors--fixes)

---

## 1. What Is CrimeWatch AI?

CrimeWatch AI is a full-stack web application that:

- 📹 **Accepts CCTV video uploads** from a browser
- 🤖 **Analyzes footage using Google Gemini AI** to detect violence, weapons, crowds, and suspicious activity
- 📊 **Generates a threat timeline** with timestamped incident segments and severity ratings
- 📱 **Sends SMS alerts** via Twilio when violence is detected — includes a 30-minute expiring video link
- 📧 **Sends email alerts** with a rich HTML email including a "Watch Footage Now" button
- 🗺️ **Includes Google Maps links** in alerts showing the exact camera GPS location
- 📍 **Auto-detects camera location** using the browser's GPS

---

## 2. Architecture Overview

```
┌─────────────────────────────────┐     ┌──────────────────────────────────┐
│  FRONTEND (Vite + React + TS)   │────▶│  BACKEND (Node.js + Express + TS)│
│  localhost:3000 / Vercel        │     │  localhost:5005 / Vercel          │
└─────────────────────────────────┘     └──────────────────┬───────────────┘
                                                           │
                         ┌─────────────────────────────────┼────────────────────────┐
                         ▼                                 ▼                        ▼
              ┌──────────────────┐            ┌─────────────────────┐   ┌──────────────────┐
              │  Supabase        │            │  Google Gemini AI   │   │  ImageKit CDN    │
              │  (DB + Auth)     │            │  (Video Analysis)   │   │  (Video Storage) │
              └──────────────────┘            └─────────────────────┘   └──────────────────┘
                         │
          ┌──────────────┴──────────────┐
          ▼                             ▼
┌──────────────────┐         ┌──────────────────────┐
│  Twilio SMS      │         │  Gmail SMTP Email    │
│  (+Maps + Link)  │         │  (HTML Alert Email)  │
└──────────────────┘         └──────────────────────┘
```

---

## 3. Prerequisites (Install These First)

| Tool | Why | Download |
|------|-----|----------|
| **Node.js 18+** | Runs both frontend and backend | https://nodejs.org |
| **Git** | Clone the repositories | https://git-scm.com |
| **npm** | Package manager (comes with Node.js) | Included with Node.js |

Verify installation:
```bash
node --version   # Should show v18.0.0 or higher
npm --version    # Should show 9.0.0 or higher
git --version    # Should show git version 2.x
```

---

## 4. Step 1 — Clone the Repositories

Open a terminal and run:

```bash
# Clone the frontend
git clone https://github.com/PranayGoudBurugu/CrimeDetection_Frontend.git
cd CrimeDetection_Frontend
npm install
cd ..

# Clone the backend
git clone https://github.com/PranayGoudBurugu/CrimeDetection_Backend.git
cd CrimeDetection_Backend
npm install
```

---

## 5. Step 2 — Set Up Supabase (Database + Auth)

Supabase provides the **PostgreSQL database** and **user authentication**.

### Create a free Supabase project:

1. Go to **https://supabase.com** and click **"Start for free"**
2. Sign up with GitHub or email
3. Click **"New Project"**
4. Fill in:
   - **Name:** `CrimeWatch AI`
   - **Database Password:** Choose a strong password — **save it somewhere!**
   - **Region:** Asia (Mumbai) — closest for India
5. Click **"Create new project"** and wait ~2 minutes for it to initialize

### Get your credentials:

6. In your project dashboard, go to **Settings → API**
7. Copy:
   - **Project URL** → looks like `https://xxxxx.supabase.co`
   - **anon / public key** → long string starting with `eyJ...`

8. Go to **Settings → Database → Connection string → URI**
9. Copy the **Connection pooling URI** (port 6543) — this is `DATABASE_URL`
10. Copy the **Direct connection URI** (port 5432) — this is `DIRECT_URL`
11. Replace `[YOUR-PASSWORD]` in both URIs with the password you saved in step 4

### Run the database schema:

12. In Supabase dashboard, click **SQL Editor** (left sidebar)
13. Paste and run this SQL to create the tables:

```sql
-- Create analyses table
CREATE TABLE IF NOT EXISTS analyses (
  id SERIAL PRIMARY KEY,
  video_filename TEXT NOT NULL,
  video_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  duration FLOAT,
  model_type TEXT DEFAULT 'gemini',
  status TEXT DEFAULT 'pending',
  ml_response JSONB,
  user_email TEXT,
  error_message TEXT,
  alert_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create settings table (for storing API keys via admin UI)
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  gemini_api_key TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings row
INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
```

14. Click **RUN** ✓

### Enable Email Auth:

15. Go to **Authentication → Providers → Email**
16. Make sure **Email** is enabled
17. Optional: Disable "Confirm email" for easier testing *(Authentication → Settings → "Enable email confirmations" → toggle off)*

---

## 6. Step 3 — Set Up ImageKit (Video Storage)

ImageKit stores the uploaded CCTV videos in the cloud so they can be accessed from any device.

1. Go to **https://imagekit.io** and create a free account
2. After signing in, go to **Developer Options** (left sidebar)
3. Copy:
   - **Public Key** → `public_xxx...`
   - **Private Key** → `private_xxx...` 
   - **URL Endpoint** → `https://ik.imagekit.io/yourusername`

> **Free tier:** 20 GB storage, 20 GB bandwidth/month — plenty for testing.

---

## 7. Step 4 — Set Up Google Gemini API

The Gemini API analyzes your CCTV video footage for threats.

1. Go to **https://aistudio.google.com/app/apikey**
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the API key (starts with `AIzaSy...`)

> **Free tier:** 15 requests/minute, 1 million tokens/day — sufficient for testing.  
> If you get quota errors, wait 60 seconds and retry — the app handles this automatically.

---

## 8. Step 5 — Set Up Twilio (SMS Alerts)

Twilio sends SMS alerts to your phone when violence is detected.

### Create a Twilio account:

1. Go to **https://www.twilio.com/try-twilio** and sign up (free trial includes $15.5 credit)
2. Verify your phone number during signup

### Get your credentials:

3. Go to **https://console.twilio.com**
4. On the dashboard, copy:
   - **Account SID** → starts with `AC...`
   - **Auth Token** → click the eye icon to reveal

### Create a Messaging Service:

5. In the console, go to **Messaging → Services**
6. Click **"Create Messaging Service"**
7. Name it `CrimeWatch Alerts`, click **Create**
8. Under "Sender Pool", click **"Add Senders"** → Select your Twilio trial number → **Add**
9. Copy the **Messaging Service SID** → starts with `MG...`

### ⚠️ IMPORTANT — Verify Recipient Number (Trial Account):

> Trial accounts can ONLY send SMS to verified phone numbers.

10. Go to **https://console.twilio.com/us1/develop/phone-numbers/manage/verified**
11. Click **"Add a new Caller ID"**
12. Enter the phone number you want to receive alerts on (with country code, e.g. `+917660066656`)
13. Twilio will call or text that number with a verification code — enter it
14. ✅ Your number is now verified and will receive SMS alerts

> **Indian numbers note:** India's TRAI regulations block commercial SMS from unregistered senders. If SMS doesn't deliver even after verification, use the **email alert** feature instead (Step 6) — it always works for Indian recipients.

---

## 9. Step 6 — Set Up Gmail Email Alerts

Email alerts work reliably for ALL countries including India, with no carrier restrictions.

### Generate a Gmail App Password:

> You must use an **App Password** — NOT your regular Gmail password.

1. Go to **https://myaccount.google.com/security**
2. Under "How you sign in to Google", click **"2-Step Verification"** and enable it
3. Go to **https://myaccount.google.com/apppasswords**
4. In "App name", type `CrimeWatch AI` and click **"Create"**
5. Google shows a **16-character password** like `abcd efgh ijkl mnop` — **copy it immediately** (it won't be shown again)
6. Remove the spaces: use `abcdefghijklmnop` as your `ALERT_EMAIL_PASS`

---

## 10. Step 7 — Configure Backend Environment

In the `CrimeDetection_Backend` folder, create a file named **`.env`**:

```bash
# Copy the example and edit it:
cp .env.example .env    # if .env.example exists, otherwise create .env manually
```

Open `.env` in any text editor and fill in:

```env
# ─────────────────────────────────────────────
# DATABASE (from Supabase → Settings → Database)
# ─────────────────────────────────────────────
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"

# ─────────────────────────────────────────────
# IMAGEKIT (from imagekit.io → Developer Options)
# ─────────────────────────────────────────────
IMAGEKIT_PRIVATE_KEY=private_XXXXXXXXXXXXXXXX
IMAGEKIT_PUBLIC_KEY=public_XXXXXXXXXXXXXXXX
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/yourusername

# ─────────────────────────────────────────────
# GEMINI AI (from aistudio.google.com/app/apikey)
# ─────────────────────────────────────────────
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# ─────────────────────────────────────────────
# SERVER CONFIG
# ─────────────────────────────────────────────
FRONTEND_URL=http://localhost:3000

# Public URL of this backend — change if deployed to Vercel
# For local testing via ngrok: PUBLIC_BACKEND_URL=https://abc123.ngrok-free.app
PUBLIC_BACKEND_URL=http://localhost:5005

# ─────────────────────────────────────────────
# TWILIO SMS (from console.twilio.com)
# ─────────────────────────────────────────────
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_MESSAGING_SERVICE_SID=MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_TO_PHONE=+91XXXXXXXXXX   # The verified phone number to send alerts TO

# ─────────────────────────────────────────────
# EMAIL ALERTS (Gmail SMTP)
# ─────────────────────────────────────────────
ALERT_EMAIL_USER=your-gmail@gmail.com       # Your Gmail address
ALERT_EMAIL_PASS=abcdefghijklmnop           # Gmail App Password (NO spaces)
ALERT_EMAIL_TO=your-gmail@gmail.com         # Where to send alert emails
```

### Run database migrations:

```bash
cd CrimeDetection_Backend
npx prisma db push
```

---

## 11. Step 8 — Configure Frontend Environment

In the `CrimeDetection_Frontend` folder, create a file named **`.env`**:

```env
# ─────────────────────────────────────────────
# SUPABASE (from supabase.com → Settings → API)
# ─────────────────────────────────────────────
VITE_NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ─────────────────────────────────────────────
# BACKEND API URL
# ─────────────────────────────────────────────
# For local development:
VITE_API_URL=http://localhost:5005

# For production (after deploying backend to Vercel):
# VITE_API_URL=https://your-backend.vercel.app
```

---

## 12. Step 9 — Run the Application Locally

Open **two terminal windows**:

**Terminal 1 — Backend:**
```bash
cd CrimeDetection_Backend
npm run dev
# Server starts at http://localhost:5005
```

**Terminal 2 — Frontend:**
```bash
cd CrimeDetection_Frontend
npm run dev
# App opens at http://localhost:3000
```

Open **http://localhost:3000** in your browser.

---

## 13. Step 10 — Deploy to Vercel (Production)

### Deploy Backend:

1. Go to **https://vercel.com** and sign in with GitHub
2. Click **"Add New Project"**
3. Import `CrimeDetection_Backend` from GitHub
4. Under **"Environment Variables"**, add ALL variables from your `.env` file (one by one)
5. Change `PUBLIC_BACKEND_URL` to your Vercel URL (e.g. `https://crime-detection-backend.vercel.app`)
6. Click **Deploy** ✓

### Deploy Frontend:

1. Import `CrimeDetection_Frontend` from GitHub in Vercel
2. Add environment variables from your frontend `.env`
3. Change `VITE_API_URL` to your deployed backend URL (e.g. `https://crime-detection-backend.vercel.app`)
4. Click **Deploy** ✓

> **Important:** After deploying, also set `FRONTEND_URL` in backend env vars to your frontend Vercel URL.

---

## 14. Feature Guide — How to Use the App

### 🔐 Sign Up / Log In
- Open the app and click **"Get Started"**
- Create an account with email + password
- Check your email for a verification link (if confirmation is enabled in Supabase)

### 📹 Upload and Analyze a Video
1. Click **"Analysis"** in the left sidebar
2. Click the upload area or drag-and-drop a CCTV video file
   - Supported formats: MP4, MOV, AVI, MKV, WEBM
   - Maximum size: 100MB
3. The **camera location** auto-fills from your GPS — you can edit it manually
4. Click **"Analyze"** — analysis takes 30–120 seconds depending on video length
5. The **Threat Detection Timeline** appears on the right showing all detected incidents

### 📊 Understanding the Timeline
Each timeline card shows:
- **Threat type** (e.g. "Mass Brawl with Weapons")
- **Severity level** — CRITICAL / HIGH / MEDIUM / LOW
- **Alert category** — VIOLENCE / WEAPON / CROWD / SUSPICIOUS
- **Timestamp** — when in the video it occurs
- **Description** of what was detected

Clicking a timeline card seeks the video to that moment.

### 🚨 Alert Notifications
When violence (CRITICAL or HIGH severity) is detected:
- **SMS is sent** to the configured phone number containing:
  - Threat type and severity
  - Camera location (GPS coordinates)
  - Google Maps link to the exact location
  - 30-minute expiring link to watch the footage
- **Email is sent** to the configured email address with:
  - Full threat details and incident summary
  - "Watch Footage Now" button (opens auto-playing video)
  - Google Maps button

### 📱 The Video Watch Link
The SMS contains a link like:
```
https://your-backend.vercel.app/watch/a3f9b2
```
- Clicking it opens a dark-themed auto-playing video page
- **No login required** — anyone with the link can view it
- The link **expires after 30 minutes** for security
- After expiry, the page shows "⏰ Link Expired"

### 📜 History
- Click **"History"** in the sidebar to see all past analyses
- Click any entry to review its timeline and footage
- Delete analyses you no longer need

### 👤 Profile Settings
1. Click **"Profile"** in the sidebar
2. Set your **Alert Phone Number** (with country code, e.g. `+917660066656`)
   - This overrides the default `TWILIO_TO_PHONE` from the backend `.env`
3. Click **"Save Changes"**

### ⚙️ Admin Settings (Admin users only)
- Admin users can update the **Gemini API key** from within the app
- Go to **Settings** → paste a new API key → save
- This avoids having to update the server's `.env` file

---

## 15. SMS Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| SMS shows "accepted" but not received | Twilio **Trial** — unverified number | Verify the number at [console.twilio.com/verified](https://console.twilio.com/us1/develop/phone-numbers/manage/verified) |
| Error code **30044** in Twilio logs | **Indian carrier DLT block** | Use Email alerts instead (works without any registration) |
| Error code **30003** | Invalid/unreachable number | Double-check the phone number format (must include `+` and country code) |
| SMS received but video link doesn't open | `PUBLIC_BACKEND_URL` is `localhost` | Set `PUBLIC_BACKEND_URL` to your deployed Vercel backend URL in `.env` |
| Video plays audio but no picture | Browser blocked autoplay | Tap/click the video — most mobile browsers require user interaction first |
| "All Gemini models failed" error | API quota exceeded | Wait 60 seconds and re-analyze — the app retries automatically |

---

## 16. Common Errors & Fixes

### `Cannot connect to database`
- Check your `DATABASE_URL` and `DIRECT_URL` in `.env`
- Make sure you replaced `[YOUR-PASSWORD]` with your actual Supabase password
- Run `npx prisma db push` to sync the schema

### `ML analysis failed` / Gemini 503 error
- The Gemini API is temporarily overloaded — wait 30–60 seconds and retry
- The app automatically tries 3 different models before failing

### `SMS not being sent` — Error 20003
- Your Twilio `ACCOUNT_SID` or `AUTH_TOKEN` is wrong
- Copy them fresh from https://console.twilio.com dashboard

### Video upload fails / times out
- Video file is too large (>100MB) — compress it first
- Check your ImageKit credentials

### `CORS error` in browser console
- Backend is not running, or `VITE_API_URL` points to wrong address
- Make sure backend is running on port 5005 and frontend `.env` has `VITE_API_URL=http://localhost:5005`

### Location not auto-detected
- Browser blocked GPS access — click the location icon in browser address bar and allow
- Alternatively, type the camera location manually in the input field

---

## 📁 Project Structure

```
CrimeDetection_Backend/
├── src/
│   ├── controllers/
│   │   ├── analysisController.ts   # Main video upload + analysis flow
│   │   └── settingsController.ts   # Admin API key management
│   ├── services/
│   │   ├── mlService.ts            # Gemini AI integration + model fallback
│   │   ├── twilioService.ts        # SMS alerts
│   │   ├── emailService.ts         # Email alerts (Gmail SMTP)
│   │   ├── videoLinkService.ts     # 30-min expiring video links
│   │   └── storageService.ts       # ImageKit video upload
│   ├── routes/
│   └── server.ts                   # Express app entry point
├── prisma/schema.prisma            # Database schema
└── .env                            # Your configuration (never commit this!)

CrimeDetection_Frontend/
├── pages/
│   ├── AnalysisPage.tsx            # Main analysis UI
│   ├── HistoryPage.tsx             # Past analyses
│   └── ProfilePage.tsx             # User settings
├── components/
│   ├── VideoPlayer.tsx             # Video + threat overlay
│   ├── Timeline.tsx                # Threat timeline sidebar
│   └── DashboardLayout.tsx         # App shell
├── services/
│   └── backendApi.ts               # API calls to backend
├── public/
│   ├── icon.png                    # App icon (CCTV camera)
│   └── favicon.svg                 # Browser tab icon
└── .env                            # Your configuration (never commit this!)
```

---

## 🔒 Security Notes

- **Never commit `.env` files** to GitHub — they contain secret API keys
- The `.gitignore` files already exclude `.env` — keep them that way
- The 30-minute video watch links require no login intentionally — for emergency responders who receive the SMS
- After 30 minutes, the links become permanently invalid

---

## 📞 Support

If you encounter issues not covered here:
1. Check the **browser console** (F12 → Console tab) for frontend errors
2. Check the **backend terminal** for server errors
3. Check **Twilio Console → Monitor → Logs → SMS** for delivery errors
4. Open a GitHub issue at https://github.com/PranayGoudBurugu/CrimeDetection_Backend/issues

---

*CrimeWatch AI — Powered by Google Gemini 2.5 · Built with React + Node.js + Supabase*
