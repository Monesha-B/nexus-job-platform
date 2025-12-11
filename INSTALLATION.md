# Installation Guide

## NEXUS - AI-Powered Job Matching Platform

This guide provides detailed instructions for setting up the NEXUS platform locally.

---

## Prerequisites

Before you begin, ensure you have the following installed:

| Software | Version | Download Link |
|----------|---------|---------------|
| Node.js | v18.0.0 or higher | [nodejs.org](https://nodejs.org/) |
| npm | v9.0.0 or higher | Comes with Node.js |
| Git | Latest | [git-scm.com](https://git-scm.com/) |
| MongoDB Atlas Account | - | [mongodb.com/atlas](https://www.mongodb.com/atlas) |

---

## Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/Monesha-B/nexus-job-platform.git

# Navigate to project directory
cd nexus-job-platform
```

---

## Step 2: Backend Setup

### 2.1 Install Dependencies

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install
```

### 2.2 Environment Configuration

Create a `.env` file in the `server` directory:

```bash
touch .env
```

Add the following environment variables:

```env
# Database
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# OpenAI
OPENAI_API_KEY=sk-proj-your-openai-api-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Server
NODE_ENV=development
PORT=5001
```

### 2.3 Start the Backend Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start at `http://localhost:5001`

### 2.4 Verify Backend

Open your browser and navigate to:
```
http://localhost:5001/api/health
```

You should see:
```json
{
  "success": true,
  "message": "NEXUS API is running"
}
```

---

## Step 3: Frontend Setup

### 3.1 Install Dependencies

```bash
# Navigate to client directory (from project root)
cd client

# Install dependencies
npm install
```

### 3.2 Environment Configuration

Create a `.env` file in the `client` directory:

```bash
touch .env
```

Add the following environment variables:

```env
# API URL
VITE_API_URL=http://localhost:5001

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 3.3 Start the Frontend Server

```bash
# Development mode
npm run dev
```

The application will start at `http://localhost:5173`

---

## Step 4: External Services Setup

### 4.1 MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account or sign in
3. Create a new cluster (Free tier available)
4. Create a database user:
   - Go to Database Access
   - Add New Database User
   - Set username and password (avoid special characters in password)
5. Configure Network Access:
   - Go to Network Access
   - Add IP Address: `0.0.0.0/0` (allows all IPs)
6. Get Connection String:
   - Go to Database > Connect
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password

### 4.2 OpenAI API

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API Keys
4. Create a new API key
5. Copy the key (starts with `sk-proj-`)
6. Add credits to your account (pay-as-you-go)

### 4.3 Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Navigate to APIs & Services > Credentials
4. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized JavaScript origins:
     - `http://localhost:5173`
     - `https://your-domain.vercel.app`
   - Authorized redirect URIs:
     - `http://localhost:5173`
     - `https://your-domain.vercel.app`
5. Copy the Client ID

---

## Step 5: Running the Full Application

### Terminal 1 - Backend
```bash
cd server
npm start
```

### Terminal 2 - Frontend
```bash
cd client
npm run dev
```

### Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5001
- API Health: http://localhost:5001/api/health

---

## Troubleshooting

### Common Issues

#### MongoDB Connection Error
```
MongoServerError: bad auth : authentication failed
```
**Solution:** Check your MongoDB password in the connection string. Avoid special characters like `!`, `@`, `#`.

#### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5001
```
**Solution:** Kill the process using the port:
```bash
# Find process
lsof -i :5001
# Kill process
kill -9 <PID>
```

#### CORS Error
```
Access to XMLHttpRequest has been blocked by CORS policy
```
**Solution:** Ensure CORS is configured in `server.js`:
```javascript
app.use(cors());
```

#### OpenAI Rate Limit
```
Error: Rate limit exceeded
```
**Solution:** Wait a few minutes or upgrade your OpenAI plan.

---

## Next Steps

After successful installation:
1. Create an admin account
2. Add sample job listings
3. Test the AI features
4. Explore the admin dashboard

---

*For deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)*
