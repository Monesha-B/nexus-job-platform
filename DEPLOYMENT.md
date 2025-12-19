# Deployment Guide

## NEXUS - AI-Powered Job Matching Platform

This guide covers deploying NEXUS to production using Vercel (Frontend) and Render (Backend).

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION SETUP                          │
│                                                              │
│  ┌─────────────────┐         ┌─────────────────┐           │
│  │     VERCEL      │         │     RENDER      │           │
│  │   (Frontend)    │ ──────► │    (Backend)    │           │
│  │                 │  HTTPS  │                 │           │
│  │  React App      │         │  Express API    │           │
│  └─────────────────┘         └────────┬────────┘           │
│                                       │                     │
│                                       ▼                     │
│                              ┌─────────────────┐           │
│                              │  MONGODB ATLAS  │           │
│                              │   (Database)    │           │
│                              └─────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

Before deployment, ensure you have:
- GitHub repository with your code
- MongoDB Atlas account with database set up
- OpenAI API key
- Google Cloud Console project with OAuth configured

---

## Part 1: Deploy Backend to Render

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### Step 2: Create New Web Service
1. Click "New +" > "Web Service"
2. Connect your GitHub repository
3. Configure the service:

| Setting | Value |
|---------|-------|
| Name | `nexus-api` |
| Root Directory | `server` |
| Runtime | `Node` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Instance Type | `Free` |

### Step 3: Add Environment Variables

Click "Environment" and add:

```
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/nexus?retryWrites=true&w=majority
JWT_SECRET = your_jwt_secret_key_here
OPENAI_API_KEY = sk-proj-your-openai-key
GOOGLE_CLIENT_ID = your-google-client-id.apps.googleusercontent.com
NODE_ENV = production
```

### Step 4: Deploy
1. Click "Create Web Service"
2. Wait for deployment (2-5 minutes)
3. Note your URL: `https://your-app.onrender.com`

### Step 5: Verify Backend
Visit: `https://your-app.onrender.com/api/health`

Expected response:
```json
{
  "success": true,
  "message": "NEXUS API is running"
}
```

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub

### Step 2: Import Project
1. Click "Add New..." > "Project"
2. Import your GitHub repository
3. Configure the project:

| Setting | Value |
|---------|-------|
| Framework Preset | `Vite` |
| Root Directory | `client` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

### Step 3: Add Environment Variables

```
VITE_API_URL = https://your-app.onrender.com
VITE_GOOGLE_CLIENT_ID = your-google-client-id.apps.googleusercontent.com
```

### Step 4: Deploy
1. Click "Deploy"
2. Wait for deployment (1-2 minutes)
3. Note your URL: `https://your-app.vercel.app`

---

## Part 3: Configure Google OAuth for Production

### Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to APIs & Services > Credentials
3. Edit your OAuth 2.0 Client ID
4. Add production URLs:

**Authorized JavaScript Origins:**
```
https://your-app.vercel.app
```

**Authorized Redirect URIs:**
```
https://your-app.vercel.app
```

5. Click "Save"
6. Wait 5 minutes for changes to propagate

---

## Part 4: Post-Deployment Configuration

### Add SPA Routing for Vercel

Create `client/vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

This ensures React Router works correctly on direct URL access.

### Update MongoDB Network Access

1. Go to MongoDB Atlas
2. Navigate to Network Access
3. Add IP Address: `0.0.0.0/0` (Allow from anywhere)

---

## Deployment Checklist

### Backend (Render)
- [ ] Web service created
- [ ] Root directory set to `server`
- [ ] Environment variables configured
- [ ] Health check endpoint responding
- [ ] MongoDB connection successful

### Frontend (Vercel)
- [ ] Project imported from GitHub
- [ ] Root directory set to `client`
- [ ] Environment variables configured
- [ ] Build successful
- [ ] Site accessible

### External Services
- [ ] MongoDB Atlas network access configured
- [ ] Google OAuth URLs updated
- [ ] OpenAI API key valid with credits

---

## Troubleshooting

### Backend Issues

**MongoDB Connection Failed**
```
MongoServerError: bad auth : authentication failed
```
- Check password in connection string
- Avoid special characters in password
- Verify network access allows all IPs

**Port Binding Error**
```
Port scan timeout reached, no open ports detected
```
- Ensure `server.js` uses `process.env.PORT`
- Check start command is `npm start`

### Frontend Issues

**404 on Direct URL Access**
- Add `vercel.json` with rewrites configuration
- Redeploy after adding the file

**API Connection Failed**
- Verify `VITE_API_URL` is correct
- Check CORS configuration on backend
- Ensure backend is running

### Google OAuth Issues

**"redirect_uri_mismatch" Error**
- Add exact production URL to Google Console
- Wait 5 minutes after updating
- Check for trailing slashes

---

## Continuous Deployment

Both Vercel and Render automatically deploy when you push to `main` branch:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

- **Vercel:** Deploys frontend in ~1 minute
- **Render:** Deploys backend in ~2-3 minutes

---

## Monitoring

### Render
- View logs: Dashboard > Your Service > Logs
- Monitor: Dashboard > Your Service > Metrics

### Vercel
- View deployments: Dashboard > Your Project > Deployments
- Analytics: Dashboard > Your Project > Analytics

---

## Cost Summary

| Service | Plan | Cost |
|---------|------|------|
| Vercel | Hobby | Free |
| Render | Free | Free |
| MongoDB Atlas | M0 | Free |
| OpenAI | Pay-as-you-go | ~$0.01-0.10/request |
| Google Cloud | OAuth | Free |

**Total Monthly Cost:** ~$1-5 (OpenAI usage only)

---

*For local development setup, see [INSTALLATION.md](INSTALLATION.md)*
