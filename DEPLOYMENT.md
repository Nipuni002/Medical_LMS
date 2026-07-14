# 🏥 Medical LMS — Full Deployment Guide

> **Stack:** React (CRA) · Node.js / Express · MongoDB Atlas  
> **Frontend Hosting:** [Vercel](https://vercel.com)  
> **Backend Hosting:** [Railway](https://railway.app)  
> **Database:** [MongoDB Atlas](https://cloud.mongodb.com)

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#1-pre-deployment-checklist)
2. [Step 1 — Set Up MongoDB Atlas](#2-step-1--set-up-mongodb-atlas)
3. [Step 2 — Deploy Backend on Railway](#3-step-2--deploy-backend-on-railway)
4. [Step 3 — Update CORS in Backend](#4-step-3--update-cors-in-backend)
5. [Step 4 — Deploy Frontend on Vercel](#5-step-4--deploy-frontend-on-vercel)
6. [Step 5 — Set Frontend URL in Railway](#6-step-5--set-frontend-url-in-railway)
7. [Step 6 — Verify End-to-End](#7-step-6--verify-end-to-end)
8. [Environment Variables Reference](#8-environment-variables-reference)
9. [Updating After Code Changes](#9-updating-after-code-changes)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Pre-Deployment Checklist

Before you deploy, make sure the following are done locally:

- [ ] Project runs locally without errors (`npm run dev` from root)
- [ ] `.env` files are **NOT** committed to Git (already in `.gitignore` ✅)
- [ ] A **GitHub repository** exists for this project (public or private)
- [ ] You have accounts on:
  - [GitHub](https://github.com)
  - [MongoDB Atlas](https://cloud.mongodb.com) (free tier is fine)
  - [Railway](https://railway.app) (free tier available)
  - [Vercel](https://vercel.com) (free tier available)

---

## 2. Step 1 — Set Up MongoDB Atlas

> Skip this step if you already have a live MongoDB Atlas cluster.

### 2.1 — Create a Cluster

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and sign in.
2. Click **"Build a Database"** → choose **"Free Shared"** (M0).
3. Select your preferred cloud provider (AWS/GCP/Azure) and a nearby region.
4. Click **"Create Cluster"** (takes ~2–3 minutes).

### 2.2 — Create a Database User

1. In the left sidebar, go to **Database Access** → **Add New Database User**.
2. Choose **Password** authentication.
3. Enter a username (e.g., `medical-lms-user`) and a **strong password**.
4. Set the role to **"Read and Write to any database"**.
5. Click **"Add User"**.

### 2.3 — Allow Network Access

1. In the left sidebar, go to **Network Access** → **Add IP Address**.
2. Click **"Allow Access from Anywhere"** → this sets `0.0.0.0/0`.
   > ⚠️ This is required for Railway (dynamic IPs). For production, restrict to Railway's IP ranges later.
3. Click **"Confirm"**.

### 2.4 — Get Your Connection String

1. Go to **Database** → click **"Connect"** on your cluster.
2. Choose **"Connect your application"**.
3. Select **Driver: Node.js**, Version: **4.1 or later**.
4. Copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` and `<password>` with your actual credentials.
6. Add your database name before the `?`:
   ```
   mongodb+srv://medical-lms-user:yourpassword@cluster0.xxxxx.mongodb.net/medical_lms?retryWrites=true&w=majority
   ```
7. **Save this string** — you'll need it in Step 2.

---

## 3. Step 2 — Deploy Backend on Railway

### 3.1 — Push Code to GitHub

Make sure your latest code is pushed to GitHub:

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

> **Important:** Your `server/` folder must have its own `package.json` with a `"start": "node index.js"` script. ✅ Already done.

### 3.2 — Create a New Railway Project

1. Go to [https://railway.app](https://railway.app) and log in with GitHub.
2. Click **"New Project"** → **"Deploy from GitHub repo"**.
3. Authorize Railway to access your GitHub account if prompted.
4. Select your **Medical_LMS** repository.
5. Railway will detect the project. Click **"Deploy Now"**.

### 3.3 — Configure the Root Directory

By default, Railway may try to deploy from the repo root. Since your backend is in `/server`:

1. Once the project is created, click on the service tile.
2. Go to **Settings** tab.
3. Under **"Source"**, set **Root Directory** to: `server`
4. Railway will now treat `server/` as the project root.

### 3.4 — Add Environment Variables

1. In your Railway service, go to the **Variables** tab.
2. Click **"Raw Editor"** and paste the following (fill in your values):

```env
PORT=5000
MONGODB_URI=mongodb+srv://medical-lms-user:yourpassword@cluster0.xxxxx.mongodb.net/medical_lms?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
JWT_EXPIRE=30d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_gmail_app_password
EMAIL_FROM=your_gmail@gmail.com
APP_NAME=Medical LMS
```

> **Gmail App Password:** Go to your Google Account → Security → 2-Step Verification → App passwords. Generate one for "Mail".

3. Click **"Update Variables"**. Railway will automatically redeploy.

### 3.5 — Get Your Railway Backend URL

1. Go to the **Settings** tab of your Railway service.
2. Under **"Networking"**, click **"Generate Domain"**.
3. Railway will give you a URL like:
   ```
   https://medical-lms-production-xxxx.up.railway.app
   ```
4. **Copy this URL** — you need it for the frontend.

### 3.6 — Verify Backend is Running

Open your browser and visit:
```
https://medical-lms-production-xxxx.up.railway.app/api/health
```

You should see:
```json
{
  "message": "Server is running",
  "database": "MongoDB Connected"
}
```

✅ **Backend is live!**

---

## 4. Step 3 — Update CORS in Backend

Before the frontend can talk to the backend, you must update CORS to allow your Vercel domain.

Open `server/index.js` and replace the current `app.use(cors())` with:

```js
// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  process.env.CLIENT_URL, // your Vercel URL (set as env variable)
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
```

Then add `CLIENT_URL` as an environment variable in Railway (you'll fill this in after Step 4):
```
CLIENT_URL=https://your-app.vercel.app
```

> **Quick Alternative:** You can keep `app.use(cors())` (allow all origins) for now and restrict it later for security.

Commit and push the change:
```bash
git add server/index.js
git commit -m "Update CORS for production"
git push origin main
```

Railway will auto-redeploy on push.

---

## 5. Step 4 — Deploy Frontend on Vercel

### 5.1 — Go to Vercel

1. Go to [https://vercel.com](https://vercel.com) and log in with GitHub.
2. Click **"Add New..."** → **"Project"**.
3. Select your **Medical_LMS** repository.

### 5.2 — Configure the Project

In the import configuration screen:

| Setting | Value |
|---|---|
| **Framework Preset** | `Create React App` |
| **Root Directory** | `client` |
| **Build Command** | `npm run build` |
| **Output Directory** | `build` |
| **Install Command** | `npm install` |

> ✅ Vercel auto-detects CRA. Just make sure the Root Directory is set to `client`.

### 5.3 — Add Environment Variables (in Vercel UI)

Before clicking Deploy, scroll down to **"Environment Variables"** and add:

| Name | Value |
|---|---|
| `REACT_APP_API_URL` | `https://medical-lms-production-xxxx.up.railway.app` |

> Replace the value with your actual Railway URL from Step 3.5.

### 5.4 — Deploy

Click **"Deploy"**. Vercel will:
1. Clone your repo
2. Install dependencies
3. Run `npm run build`
4. Deploy the static output to a global CDN

This takes ~1–3 minutes.

### 5.5 — Get Your Vercel URL

After deployment, Vercel gives you a URL like:
```
https://medical-lms.vercel.app
```

**Copy this URL** — go back to Railway and add it as `CLIENT_URL`.

---

## 6. Step 5 — Set Frontend URL in Railway

1. Go back to your Railway service → **Variables** tab.
2. Add the following variable:

```env
CLIENT_URL=https://medical-lms.vercel.app
```

3. Click **"Update Variables"** → Railway redeploys automatically.

---

## 7. Step 6 — Verify End-to-End

Test the complete flow:

| Test | URL | Expected |
|---|---|---|
| Backend health | `https://xxxx.railway.app/api/health` | `{"message":"Server is running",...}` |
| Frontend loads | `https://medical-lms.vercel.app` | React app renders |
| Login works | Register/login on frontend | JWT returned, no CORS errors |
| API calls work | Open browser DevTools → Network | Requests go to Railway URL, 200 responses |

---

## 8. Environment Variables Reference

### Backend (Railway) — `server/.env`

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port the server listens on | `5000` |
| `MONGODB_URI` | Full MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster...` |
| `JWT_SECRET` | Secret key for signing JWTs (min 32 chars) | `a8f3k2...` |
| `JWT_EXPIRE` | JWT expiration duration | `30d` |
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP login email | `your@gmail.com` |
| `SMTP_PASS` | SMTP password or app password | `abcd efgh ijkl mnop` |
| `EMAIL_FROM` | Sender email address | `noreply@medicallms.com` |
| `APP_NAME` | Application name for emails | `Medical LMS` |
| `CLIENT_URL` | Your Vercel frontend URL (for CORS) | `https://medical-lms.vercel.app` |

### Frontend (Vercel) — `client/.env`

| Variable | Description | Example |
|---|---|---|
| `REACT_APP_API_URL` | Your Railway backend URL | `https://xxxx.up.railway.app` |

> ⚠️ All React environment variables **must** start with `REACT_APP_` to be accessible in the browser.

---

## 9. Updating After Code Changes

### Update Backend (Railway)

Railway automatically redeploys when you push to your GitHub `main` branch:

```bash
# Make your backend changes
git add .
git commit -m "Update backend feature"
git push origin main
# Railway detects the push and redeploys automatically ✅
```

You can also trigger a manual redeploy from the Railway dashboard → **Deployments** → **Redeploy**.

### Update Frontend (Vercel)

Vercel automatically redeploys when you push to `main`:

```bash
# Make your frontend changes
git add .
git commit -m "Update UI feature"
git push origin main
# Vercel detects the push and redeploys automatically ✅
```

You can also trigger a manual redeploy from the Vercel dashboard → **Deployments** → **Redeploy**.

---

## 10. Troubleshooting

### ❌ CORS Error in Browser Console

**Symptom:** `Access to XMLHttpRequest at '...' from origin '...' has been blocked by CORS policy`

**Fix:**
1. Check `server/index.js` — make sure the CORS `allowedOrigins` array includes your exact Vercel URL (no trailing slash).
2. Check that `CLIENT_URL` env variable is set correctly in Railway.
3. Redeploy the backend after making changes.

---

### ❌ `Cannot GET /` on Railway URL

**Symptom:** Visiting `https://xxxx.railway.app` returns `Cannot GET /`

**Fix:** This is **normal** — the backend has no root route. Use `/api/health` to verify:
```
https://xxxx.railway.app/api/health
```

---

### ❌ Blank White Page on Vercel

**Symptom:** Vercel URL loads but shows a blank page

**Fix:**
1. Open browser DevTools → **Console** tab — look for errors.
2. Check that `REACT_APP_API_URL` is set correctly in Vercel (no trailing slash).
3. Make sure the **Root Directory** in Vercel is set to `client`.
4. Check the Vercel build logs for compile errors.

---

### ❌ Railway Build Fails

**Symptom:** Railway deployment fails with an error

**Common causes & fixes:**
- **Missing `start` script:** Ensure `server/package.json` has `"start": "node index.js"` ✅
- **Wrong root directory:** Go to Railway → Settings → set Root Directory to `server`.
- **Missing env variables:** Check all required variables are set in Railway Variables tab.
- **Port conflict:** Make sure your app uses `process.env.PORT` (not hardcoded). ✅ Already done.

---

### ❌ MongoDB Connection Error

**Symptom:** Server starts but logs `MongoDB connection error: ...`

**Fix:**
1. Check `MONGODB_URI` in Railway — make sure username/password are correct and URL-encoded (e.g., `@` in password should be `%40`).
2. In MongoDB Atlas → **Network Access** — ensure `0.0.0.0/0` is allowed.
3. In MongoDB Atlas → **Database Access** — ensure the user has read/write permissions.

---

### ❌ Vercel Environment Variables Not Working

**Symptom:** `REACT_APP_API_URL` is `undefined` at runtime

**Fix:**
1. Go to Vercel → **Project Settings** → **Environment Variables**.
2. Make sure the variable name starts with `REACT_APP_`.
3. After adding/changing env variables, you **must trigger a new deployment** (Vercel doesn't hot-reload env vars).
4. Go to **Deployments** → click **Redeploy** on the latest deployment.

---

### ❌ Login Emails Not Sending

**Symptom:** Login confirmation emails are not received

**Fix:**
1. Verify `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` in Railway Variables.
2. For Gmail: use an **App Password** (not your regular Gmail password). Enable 2FA first, then generate one at: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
3. Check spam/junk folder.

---

## 🎉 Deployment Complete!

Once all steps are done, your app is live at:

| Service | URL |
|---|---|
| 🌐 **Frontend** | `https://medical-lms.vercel.app` |
| ⚙️ **Backend API** | `https://xxxx.up.railway.app` |
| 🗄️ **Database** | MongoDB Atlas (cloud) |

---

## 🔗 Quick Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Railway Dashboard](https://railway.app/dashboard)
- [MongoDB Atlas](https://cloud.mongodb.com)
- [Gmail App Passwords](https://myaccount.google.com/apppasswords)

---

*Generated for Medical LMS — MERN Stack Application*
