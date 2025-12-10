# NEXUS - AI-Powered Job Matching Platform
## Complete Implementation Guide (INFO 6150 Final Project)

---

## 📊 REQUIREMENTS MAPPING

### Your Course Requirements vs. Our Implementation

| Requirement | Course Spec | Our Implementation | Status |
|-------------|-------------|-------------------|--------|
| **Frontend Framework** | React OR Angular | **React** | ⏳ |
| **UI Library** | Bootstrap/Material/Tailwind/etc. | **Bootstrap 5** | ⏳ |
| **Backend Runtime** | Node.js | **Node.js** | ⏳ |
| **Backend Framework** | Express.js | **Express.js** | ⏳ |
| **Database** | MongoDB (preferred) or SQL | **MongoDB** | ⏳ |
| **API Architecture** | RESTful | **RESTful** | ⏳ |
| **Code Pattern** | MVC | **MVC** | ⏳ |
| **API Docs** | Swagger UI | **Swagger UI** | ⏳ |
| **File Upload** | Multer or Cloud Storage | **Multer + Cloudinary** | ⏳ |
| **User Roles** | Min 2 roles | **Admin, Job Seeker, Recruiter** | ⏳ |
| **Password Security** | bcrypt | **bcrypt** | ⏳ |
| **OAuth** | Google OAuth 2.0 | **Google OAuth 2.0** | ⏳ |
| **AI/Chatbot** | LLM API | **Anthropic Claude API** | ⏳ |
| **Min Pages** | 6-8 pages | **8+ pages** | ⏳ |
| **Transaction Flows** | Min 3 flows | **5 flows** | ⏳ |
| **Git Branching** | Feature branches | **Proper branching** | ⏳ |

---

## 🎯 PROJECT OVERVIEW

### Core Functionality Flow
```
1. USER → Upload resume (PDF/DOCX)
   ↓
2. AI → Parses and extracts skills/experience
   ↓
3. USER → Paste job description OR browse jobs
   ↓
4. AI → Analyzes job requirements
   ↓
5. OUTPUT → Shows:
   • Match score (e.g., "85% match!")
   • Why you're a good fit
   • Skills gap analysis
   • Custom cover letter
   • Likely interview questions
```

---

## 👥 USER ROLES & FLOWS

### Role 1: Job Seeker (Primary User)
**Complete Flow #1:** Registration → Profile Setup → Resume Upload → Job Search → Apply
**Complete Flow #2:** Login → Paste Job Description → AI Match Analysis → Generate Cover Letter

### Role 2: Recruiter
**Complete Flow #3:** Login → Post Jobs → View Applicants → AI-Ranked Candidates → Contact

### Role 3: Admin
**Complete Flow #4:** Login → Manage Users → View Analytics → System Configuration
**Complete Flow #5:** Login → Manage Jobs → Moderate Content → Generate Reports

---

## 📁 PROJECT STRUCTURE

```
nexus-job-match/
│
├── client/                          # React Frontend
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/              # Reusable Components
│   │   │   ├── common/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── LoadingSpinner.jsx
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   ├── SignupForm.jsx
│   │   │   │   └── GoogleAuth.jsx
│   │   │   ├── resume/
│   │   │   │   ├── ResumeUpload.jsx
│   │   │   │   ├── ResumePreview.jsx
│   │   │   │   └── ResumeAnalysis.jsx
│   │   │   ├── jobs/
│   │   │   │   ├── JobCard.jsx
│   │   │   │   ├── JobList.jsx
│   │   │   │   ├── JobDetails.jsx
│   │   │   │   └── JobMatchScore.jsx
│   │   │   ├── ai/
│   │   │   │   ├── AIAnalysis.jsx
│   │   │   │   ├── CoverLetterGenerator.jsx
│   │   │   │   ├── SkillsGap.jsx
│   │   │   │   └── Chatbot.jsx
│   │   │   └── admin/
│   │   │       ├── UserManagement.jsx
│   │   │       ├── JobManagement.jsx
│   │   │       └── Analytics.jsx
│   │   ├── pages/                   # Page Components
│   │   │   ├── Home.jsx             # Landing page
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx        # User dashboard
│   │   │   ├── JobSearch.jsx
│   │   │   ├── JobMatch.jsx         # AI matching page
│   │   │   ├── Profile.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── RecruiterDashboard.jsx
│   │   ├── context/                 # React Context
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── hooks/                   # Custom Hooks
│   │   │   ├── useAuth.js
│   │   │   └── useApi.js
│   │   ├── services/                # API Services
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── jobService.js
│   │   │   ├── resumeService.js
│   │   │   └── aiService.js
│   │   ├── utils/                   # Utilities
│   │   │   ├── validators.js
│   │   │   └── helpers.js
│   │   ├── styles/                  # CSS Files
│   │   │   ├── custom.css
│   │   │   └── components/
│   │   ├── App.jsx
│   │   └── index.js
│   ├── package.json
│   └── .env
│
├── server/                          # Express Backend
│   ├── config/
│   │   ├── db.js                    # MongoDB connection
│   │   ├── passport.js              # Google OAuth config
│   │   └── swagger.js               # Swagger configuration
│   ├── controllers/                 # MVC Controllers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── jobController.js
│   │   ├── resumeController.js
│   │   ├── matchController.js
│   │   └── aiController.js
│   ├── models/                      # MongoDB Models
│   │   ├── User.js
│   │   ├── Job.js
│   │   ├── Resume.js
│   │   ├── Application.js
│   │   └── Match.js
│   ├── routes/                      # Express Routes
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── jobRoutes.js
│   │   ├── resumeRoutes.js
│   │   ├── matchRoutes.js
│   │   └── aiRoutes.js
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification
│   │   ├── roleCheck.js             # Role-based access
│   │   ├── upload.js                # Multer config
│   │   └── errorHandler.js
│   ├── services/                    # Business Logic
│   │   ├── aiService.js             # Claude API integration
│   │   ├── resumeParser.js          # PDF/DOCX parsing
│   │   └── matchingService.js       # Job matching logic
│   ├── utils/
│   │   ├── validators.js
│   │   └── helpers.js
│   ├── app.js                       # Express app setup
│   ├── server.js                    # Server entry point
│   ├── package.json
│   └── .env
│
├── .gitignore
└── README.md
```

---

## 🗄️ DATABASE SCHEMA (MongoDB)

### User Model
```javascript
const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional for OAuth users
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['jobseeker', 'recruiter', 'admin'], 
    default: 'jobseeker' 
  },
  googleId: { type: String }, // For Google OAuth
  avatar: { type: String },
  phone: { type: String },
  location: { type: String },
  linkedIn: { type: String },
  company: { type: String }, // For recruiters
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

### Resume Model
```javascript
const resumeSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true }, // Cloudinary URL
  rawText: { type: String }, // Extracted text
  parsedData: {
    summary: String,
    skills: [String],
    experience: [{
      company: String,
      title: String,
      duration: String,
      description: String
    }],
    education: [{
      institution: String,
      degree: String,
      year: String
    }],
    certifications: [String]
  },
  uploadedAt: { type: Date, default: Date.now }
});
```

### Job Model
```javascript
const jobSchema = new Schema({
  recruiter: { type: Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, enum: ['full-time', 'part-time', 'contract', 'internship'] },
  salary: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'USD' }
  },
  description: { type: String, required: true },
  requirements: [String],
  responsibilities: [String],
  skills: [String],
  benefits: [String],
  isActive: { type: Boolean, default: true },
  applicationsCount: { type: Number, default: 0 },
  postedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }
});
```

### Application Model
```javascript
const applicationSchema = new Schema({
  job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  applicant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  resume: { type: Schema.Types.ObjectId, ref: 'Resume', required: true },
  coverLetter: { type: String },
  matchScore: { type: Number }, // AI-generated match score
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'],
    default: 'pending'
  },
  aiAnalysis: {
    matchPercentage: Number,
    strengths: [String],
    gaps: [String],
    recommendation: String
  },
  appliedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

### Match Model (for quick job matching)
```javascript
const matchSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  resumeText: { type: String },
  jobDescription: { type: String, required: true },
  result: {
    matchScore: { type: Number, required: true },
    summary: { type: String },
    strengths: [String],
    gaps: [String],
    interviewQuestions: [String],
    coverLetter: { type: String }
  },
  createdAt: { type: Date, default: Date.now }
});
```

---

## 🔐 API ENDPOINTS

### Authentication Routes (`/api/auth`)
```
POST   /api/auth/register     - Register new user
POST   /api/auth/login        - Login with email/password
POST   /api/auth/google       - Google OAuth login
POST   /api/auth/logout       - Logout user
GET    /api/auth/me           - Get current user
POST   /api/auth/refresh      - Refresh JWT token
POST   /api/auth/forgot       - Forgot password
POST   /api/auth/reset        - Reset password
```

### User Routes (`/api/users`)
```
GET    /api/users             - Get all users (Admin)
GET    /api/users/:id         - Get user by ID
PUT    /api/users/:id         - Update user profile
DELETE /api/users/:id         - Delete user (Admin)
PUT    /api/users/:id/role    - Change user role (Admin)
```

### Resume Routes (`/api/resumes`)
```
POST   /api/resumes/upload    - Upload resume (Multer)
GET    /api/resumes           - Get user's resumes
GET    /api/resumes/:id       - Get specific resume
DELETE /api/resumes/:id       - Delete resume
POST   /api/resumes/:id/parse - Parse resume with AI
```

### Job Routes (`/api/jobs`)
```
GET    /api/jobs              - Get all jobs (with filters)
GET    /api/jobs/:id          - Get job details
POST   /api/jobs              - Create job (Recruiter/Admin)
PUT    /api/jobs/:id          - Update job (Recruiter/Admin)
DELETE /api/jobs/:id          - Delete job (Recruiter/Admin)
GET    /api/jobs/search       - Search jobs
GET    /api/jobs/recommended  - AI recommended jobs
```

### Application Routes (`/api/applications`)
```
POST   /api/applications      - Apply to job
GET    /api/applications      - Get user's applications
GET    /api/applications/:id  - Get application details
PUT    /api/applications/:id  - Update application status
DELETE /api/applications/:id  - Withdraw application
```

### AI/Match Routes (`/api/ai`)
```
POST   /api/ai/match          - Match resume with job
POST   /api/ai/analyze        - Analyze resume
POST   /api/ai/cover-letter   - Generate cover letter
POST   /api/ai/interview      - Generate interview questions
POST   /api/ai/chat           - AI Chatbot endpoint
POST   /api/ai/skills-gap     - Analyze skills gap
```

### Admin Routes (`/api/admin`)
```
GET    /api/admin/stats       - Get platform statistics
GET    /api/admin/users       - Manage users
GET    /api/admin/jobs        - Manage all jobs
GET    /api/admin/reports     - Generate reports
```

---

## 📄 PAGES (8+ Required)

1. **Home/Landing Page** - Hero, features, how it works
2. **Login Page** - Email/password + Google OAuth
3. **Signup Page** - Registration with role selection
4. **User Dashboard** - Overview, recent matches, applications
5. **Job Search Page** - Browse and filter jobs
6. **Job Match Page** - Paste JD, get AI analysis (Core Feature)
7. **Profile Page** - Edit profile, manage resumes
8. **Admin Dashboard** - User management, analytics
9. **Recruiter Dashboard** - Post jobs, view applicants
10. **Job Details Page** - Full job info with apply button

---

## 🤖 AI INTEGRATION (Claude API)

### Core AI Features

#### 1. Resume-Job Matching
```javascript
// Prompt structure for matching
const matchPrompt = `
Analyze the compatibility between this resume and job description.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Provide a JSON response with:
{
  "matchScore": <0-100>,
  "summary": "<brief match summary>",
  "strengths": ["<strength1>", "<strength2>", ...],
  "gaps": ["<gap1>", "<gap2>", ...],
  "recommendation": "<overall recommendation>"
}
`;
```

#### 2. Cover Letter Generation
```javascript
const coverLetterPrompt = `
Write a professional cover letter for this position.

JOB: ${jobTitle} at ${company}
CANDIDATE BACKGROUND: ${resumeSummary}
KEY SKILLS MATCH: ${matchingSkills}

Write a compelling, personalized cover letter (300-400 words).
`;
```

#### 3. Interview Questions
```javascript
const interviewPrompt = `
Based on this job description and candidate resume, generate 
10 likely interview questions with suggested answers.

JOB: ${jobDescription}
RESUME: ${resumeText}

Format as JSON array:
[{"question": "...", "suggestedAnswer": "...", "tip": "..."}]
`;
```

#### 4. AI Chatbot (Career Assistant)
```javascript
const chatSystemPrompt = `
You are NEXUS AI, a career counseling assistant. Help users with:
- Resume improvement suggestions
- Job search strategies
- Interview preparation
- Salary negotiation tips
- Career path guidance

Be helpful, encouraging, and professional.
`;
```

---

## 🚀 IMPLEMENTATION PHASES

### Phase 1: Project Setup (Days 1-2)
- [x] Create React app with Vite
- [x] Set up Express server
- [x] Configure MongoDB connection
- [x] Set up project structure
- [x] Install dependencies
- [x] Configure environment variables

### Phase 2: Authentication (Days 3-5)
- [ ] User model with bcrypt
- [ ] JWT authentication
- [ ] Google OAuth 2.0
- [ ] Login/Signup pages
- [ ] Protected routes
- [ ] Role-based middleware

### Phase 3: Core Backend (Days 6-10)
- [ ] All MongoDB models
- [ ] CRUD operations
- [ ] Resume upload (Multer)
- [ ] Job management
- [ ] Application system
- [ ] Swagger documentation

### Phase 4: React Frontend (Days 11-18)
- [ ] All page components
- [ ] React Router setup
- [ ] API integration
- [ ] Forms with validation
- [ ] Responsive design
- [ ] State management

### Phase 5: AI Integration (Days 19-23)
- [ ] Claude API setup
- [ ] Resume parsing
- [ ] Job matching algorithm
- [ ] Cover letter generator
- [ ] Interview questions
- [ ] AI Chatbot

### Phase 6: Polish & Deploy (Days 24-28)
- [ ] Error handling
- [ ] Testing
- [ ] UI/UX refinement
- [ ] Documentation
- [ ] Deployment
- [ ] Final testing

---

## 📦 DEPENDENCIES

### Client (React)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.x",
    "axios": "^1.x",
    "bootstrap": "^5.3.0",
    "react-bootstrap": "^2.x",
    "react-icons": "^4.x",
    "react-toastify": "^9.x",
    "formik": "^2.x",
    "yup": "^1.x",
    "@react-oauth/google": "^0.x"
  }
}
```

### Server (Express)
```json
{
  "dependencies": {
    "express": "^4.18.x",
    "mongoose": "^7.x",
    "bcryptjs": "^2.x",
    "jsonwebtoken": "^9.x",
    "passport": "^0.6.x",
    "passport-google-oauth20": "^2.x",
    "multer": "^1.x",
    "cloudinary": "^1.x",
    "cors": "^2.x",
    "dotenv": "^16.x",
    "swagger-ui-express": "^5.x",
    "swagger-jsdoc": "^6.x",
    "pdf-parse": "^1.x",
    "mammoth": "^1.x",
    "@anthropic-ai/sdk": "^0.x",
    "express-validator": "^7.x",
    "helmet": "^7.x"
  }
}
```

---

## 🔧 ENVIRONMENT VARIABLES

### Client (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### Server (.env)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/nexus
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Cloudinary (File Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Anthropic Claude API
ANTHROPIC_API_KEY=your_anthropic_api_key
```

---

## 📊 GIT BRANCHING STRATEGY

```
main                    # Production-ready code
│
├── develop             # Integration branch
│   │
│   ├── feature/auth              # Authentication system
│   ├── feature/user-management   # User CRUD
│   ├── feature/job-management    # Job posting system
│   ├── feature/resume-upload     # File upload
│   ├── feature/ai-matching       # AI integration
│   ├── feature/chatbot           # AI Chatbot
│   ├── feature/admin-dashboard   # Admin features
│   ├── feature/swagger-docs      # API documentation
│   │
│   └── bugfix/xxx               # Bug fixes
```

### Commit Message Format
```
feat: add user authentication with JWT
fix: resolve resume upload validation error
docs: update API documentation
style: format code with prettier
refactor: restructure AI service module
test: add unit tests for matching algorithm
```

---

## ✅ CHECKLIST FOR SUBMISSION

### Mandatory Requirements
- [ ] React/Angular frontend ✓ (React)
- [ ] Node.js + Express backend ✓
- [ ] MongoDB database ✓
- [ ] 6-8+ pages ✓ (10 pages)
- [ ] 2+ user roles ✓ (3 roles)
- [ ] RESTful API ✓
- [ ] MVC pattern ✓
- [ ] Swagger documentation ✓
- [ ] File upload (Multer/Cloud) ✓
- [ ] bcrypt password hashing ✓
- [ ] Google OAuth 2.0 ✓
- [ ] LLM Chatbot integration ✓
- [ ] 3+ transaction flows ✓ (5 flows)
- [ ] Git branching strategy ✓
- [ ] Comprehensive README ✓

### Bonus
- [ ] Cloud deployment (+10 points)

---

## 🎯 READY TO START?

This guide covers everything you need to build NEXUS. Would you like me to:

1. **Generate the complete backend server** with all routes and models?
2. **Create the React frontend structure** with all pages?
3. **Set up the AI integration** with Claude API?
4. **Start with a specific feature** (auth, job matching, etc.)?

Let me know where you want to begin!
