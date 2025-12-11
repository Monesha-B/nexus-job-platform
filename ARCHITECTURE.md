# System Architecture

## NEXUS - AI-Powered Job Matching Platform

Technical architecture documentation for the NEXUS platform.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                 USERS                                        │
│                    (Job Seekers / Administrators)                            │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  │ HTTPS
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND LAYER                                     │
│                         (Vercel - CDN)                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         REACT APPLICATION                              │  │
│  │                                                                        │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │  │
│  │  │    PAGES     │  │  COMPONENTS  │  │   SERVICES   │                │  │
│  │  │              │  │              │  │              │                │  │
│  │  │ - Home       │  │ - Navbar     │  │ - api.js     │                │  │
│  │  │ - Dashboard  │  │ - JobCard    │  │ - auth       │                │  │
│  │  │ - Jobs       │  │ - Modal      │  │ - jobs       │                │  │
│  │  │ - Profile    │  │ - Forms      │  │ - ai         │                │  │
│  │  │ - Admin      │  │ - Chatbot    │  │              │                │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                │  │
│  │                                                                        │  │
│  │  ┌──────────────┐  ┌──────────────┐                                   │  │
│  │  │   CONTEXT    │  │    HOOKS     │                                   │  │
│  │  │              │  │              │                                   │  │
│  │  │ - AuthContext│  │ - useAuth    │                                   │  │
│  │  │              │  │ - useJobs    │                                   │  │
│  │  └──────────────┘  └──────────────┘                                   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  │ REST API (HTTPS)
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND LAYER                                      │
│                         (Render - Node.js)                                   │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                       EXPRESS APPLICATION                              │  │
│  │                                                                        │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │  │
│  │  │   ROUTES     │  │ CONTROLLERS  │  │  MIDDLEWARE  │                │  │
│  │  │              │  │              │  │              │                │  │
│  │  │ - /auth      │  │ - authCtrl   │  │ - auth.js    │                │  │
│  │  │ - /jobs      │  │ - jobCtrl    │  │ - upload.js  │                │  │
│  │  │ - /apps      │  │ - appCtrl    │  │ - error.js   │                │  │
│  │  │ - /ai        │  │ - aiCtrl     │  │              │                │  │
│  │  │ - /resumes   │  │ - resumeCtrl │  │              │                │  │
│  │  │ - /admin     │  │ - adminCtrl  │  │              │                │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                │  │
│  │                                                                        │  │
│  │  ┌──────────────┐  ┌──────────────┐                                   │  │
│  │  │   MODELS     │  │    UTILS     │                                   │  │
│  │  │              │  │              │                                   │  │
│  │  │ - User       │  │ - AppError   │                                   │  │
│  │  │ - Job        │  │ - helpers    │                                   │  │
│  │  │ - Application│  │              │                                   │  │
│  │  │ - Resume     │  │              │                                   │  │
│  │  └──────────────┘  └──────────────┘                                   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└────────────┬────────────────────────────────────┬────────────────────────────┘
             │                                    │
             │                                    │
             ▼                                    ▼
┌────────────────────────┐          ┌────────────────────────┐
│    MONGODB ATLAS       │          │   EXTERNAL SERVICES    │
│    (Database)          │          │                        │
│                        │          │  ┌──────────────────┐  │
│  Collections:          │          │  │     OpenAI       │  │
│  - users               │          │  │   (GPT-4o-mini)  │  │
│  - jobs                │          │  │                  │  │
│  - applications        │          │  │  - Cover Letter  │  │
│  - resumes             │          │  │  - Job Match     │  │
│                        │          │  │  - Chatbot       │  │
│                        │          │  └──────────────────┘  │
│                        │          │                        │
│                        │          │  ┌──────────────────┐  │
│                        │          │  │   Google OAuth   │  │
│                        │          │  │                  │  │
│                        │          │  │  - Sign In       │  │
│                        │          │  │  - User Info     │  │
│                        │          │  └──────────────────┘  │
│                        │          │                        │
│                        │          │  ┌──────────────────┐  │
│                        │          │  │ Google Analytics │  │
│                        │          │  │                  │  │
│                        │          │  │  - Page Views    │  │
│                        │          │  │  - User Behavior │  │
│                        │          │  └──────────────────┘  │
└────────────────────────┘          └────────────────────────┘
```

---

## Component Architecture

### Frontend Components

```
src/
├── components/
│   └── common/
│       ├── Navbar.jsx          # Navigation bar
│       ├── Footer.jsx          # Footer component
│       ├── LoadingSpinner.jsx  # Loading indicator
│       └── AIChatbot.jsx       # AI chat widget
│
├── context/
│   └── AuthContext.jsx         # Authentication state
│
├── hooks/
│   └── useAuth.js              # Auth custom hook
│
├── pages/
│   ├── Home.jsx                # Landing page
│   ├── AuthPage.jsx            # Login/Register
│   ├── Dashboard.jsx           # User dashboard
│   ├── AdminDashboard.jsx      # Admin panel
│   ├── JobSearch.jsx           # Job listings
│   ├── JobDetails.jsx          # Single job view
│   ├── JobMatch.jsx            # AI matching
│   ├── MyApplications.jsx      # User applications
│   └── Profile.jsx             # User profile
│
├── services/
│   └── api.js                  # Axios configuration
│
└── styles/
    └── custom.css              # Custom styles
```

### Backend Components

```
server/
├── config/
│   └── swagger.js              # API documentation
│
├── controllers/
│   ├── authController.js       # Authentication logic
│   ├── jobController.js        # Job CRUD operations
│   ├── applicationController.js # Application handling
│   ├── resumeController.js     # Resume management
│   ├── aiController.js         # AI features
│   └── adminController.js      # Admin operations
│
├── middleware/
│   ├── auth.js                 # JWT verification
│   ├── upload.js               # File upload handling
│   └── errorHandler.js         # Error middleware
│
├── models/
│   ├── User.js                 # User schema
│   ├── Job.js                  # Job schema
│   ├── Application.js          # Application schema
│   └── Resume.js               # Resume schema
│
├── routes/
│   ├── authRoutes.js           # /api/auth
│   ├── jobRoutes.js            # /api/jobs
│   ├── applicationRoutes.js    # /api/applications
│   ├── resumeRoutes.js         # /api/resumes
│   ├── aiRoutes.js             # /api/ai
│   └── adminRoutes.js          # /api/admin
│
├── utils/
│   └── AppError.js             # Custom error class
│
└── server.js                   # Entry point
```

---

## Database Schema

### User Collection

```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['jobseeker', 'admin']),
  googleId: String (optional),
  avatar: String (optional),
  phone: String (optional),
  bio: String (optional),
  skills: [String],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Job Collection

```javascript
{
  _id: ObjectId,
  title: String,
  company: String,
  location: String,
  locationType: String (enum: ['onsite', 'remote', 'hybrid']),
  type: String (enum: ['full-time', 'part-time', 'contract', 'internship']),
  experienceLevel: String (enum: ['entry', 'mid', 'senior', 'lead']),
  description: String,
  requirements: [String],
  responsibilities: [String],
  skills: [String],
  benefits: [String],
  salary: {
    min: Number,
    max: Number,
    currency: String,
    isVisible: Boolean
  },
  postedBy: ObjectId (ref: User),
  isActive: Boolean,
  applicationsCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Application Collection

```javascript
{
  _id: ObjectId,
  job: ObjectId (ref: Job),
  applicant: ObjectId (ref: User),
  resume: ObjectId (ref: Resume),
  coverLetter: String,
  isAIGenerated: Boolean,
  status: String (enum: ['pending', 'reviewed', 'shortlisted', 
                         'interview', 'offered', 'rejected', 'withdrawn']),
  matchScore: Number,
  aiAnalysis: {
    matchPercentage: Number,
    strengths: [String],
    gaps: [String],
    recommendation: String
  },
  statusHistory: [{
    status: String,
    changedAt: Date,
    changedBy: ObjectId
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Resume Collection

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  fileName: String,
  originalName: String,
  fileUrl: String,
  fileType: String (enum: ['pdf', 'docx', 'doc']),
  fileSize: Number,
  rawText: String,
  parsedData: {
    summary: String,
    contactInfo: Object,
    skills: [String],
    experience: [Object],
    education: [Object],
    certifications: [Object]
  },
  isParsed: Boolean,
  isPrimary: Boolean,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                           │
└─────────────────────────────────────────────────────────────────┘

1. EMAIL/PASSWORD LOGIN
   ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
   │  Client  │────>│  Server  │────>│ MongoDB  │────>│  bcrypt  │
   │          │     │          │     │          │     │  compare │
   └──────────┘     └──────────┘     └──────────┘     └──────────┘
        │                                                   │
        │                ┌──────────┐                      │
        │<───────────────│   JWT    │<─────────────────────┘
        │                │  Token   │
        │                └──────────┘
        │
        ▼
   Store in localStorage


2. GOOGLE OAUTH LOGIN
   ┌──────────┐     ┌──────────┐     ┌──────────┐
   │  Client  │────>│  Google  │────>│  Server  │
   │          │     │  OAuth   │     │          │
   └──────────┘     └──────────┘     └──────────┘
        │                                 │
        │                                 ▼
        │                          ┌──────────┐
        │                          │  Verify  │
        │                          │  Token   │
        │                          └──────────┘
        │                                 │
        │                                 ▼
        │                          ┌──────────┐
        │                          │  Create  │
        │                          │  or Find │
        │                          │   User   │
        │                          └──────────┘
        │                                 │
        │         ┌──────────┐           │
        │<────────│   JWT    │<──────────┘
        │         │  Token   │
        │         └──────────┘
        ▼
   Store in localStorage


3. AUTHENTICATED REQUEST
   ┌──────────┐     ┌──────────┐     ┌──────────┐
   │  Client  │────>│  Server  │────>│   JWT    │
   │ + Token  │     │ Middleware    │  Verify  │
   └──────────┘     └──────────┘     └──────────┘
                          │                │
                          │                ▼
                          │          ┌──────────┐
                          │          │  Decode  │
                          │          │  User ID │
                          │          └──────────┘
                          │                │
                          ▼                ▼
                    ┌──────────────────────────┐
                    │    Process Request       │
                    │    with User Context     │
                    └──────────────────────────┘
```

---

## AI Integration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      AI FEATURE FLOW                             │
└─────────────────────────────────────────────────────────────────┘

COVER LETTER GENERATION:

┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────>│  Server  │────>│ Get Job  │────>│Get Resume│
│          │     │          │     │ Details  │     │  Text    │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                      │                                  │
                      │           ┌──────────┐          │
                      └──────────>│  OpenAI  │<─────────┘
                                  │   API    │
                                  └──────────┘
                                       │
                                       │ Generated
                                       │ Cover Letter
                                       ▼
                                  ┌──────────┐
                                  │ Response │
                                  │ to Client│
                                  └──────────┘


JOB MATCH ANALYSIS:

┌──────────┐     ┌──────────┐     ┌──────────┐
│ Resume + │────>│  Server  │────>│  OpenAI  │
│Job Desc  │     │          │     │   API    │
└──────────┘     └──────────┘     └──────────┘
                                       │
                                       │ Analysis
                                       ▼
                                  ┌──────────┐
                                  │ Match    │
                                  │ Score    │
                                  │ Strengths│
                                  │ Gaps     │
                                  └──────────┘
```

---

## Security Architecture

### Security Measures

| Layer | Security Measure |
|-------|------------------|
| Transport | HTTPS/TLS encryption |
| Authentication | JWT tokens (7-day expiry) |
| Passwords | bcrypt hashing (10 rounds) |
| API | Rate limiting |
| Database | MongoDB Atlas encryption |
| Uploads | File type validation |
| CORS | Restricted origins |

### JWT Token Structure

```javascript
{
  header: {
    alg: "HS256",
    typ: "JWT"
  },
  payload: {
    id: "user_id",
    iat: 1234567890,
    exp: 1235172690
  },
  signature: "..."
}
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT ARCHITECTURE                       │
└─────────────────────────────────────────────────────────────────┘

                         ┌─────────────────┐
                         │   GitHub Repo   │
                         │                 │
                         └────────┬────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
           ┌─────────────────┐        ┌─────────────────┐
           │     VERCEL      │        │     RENDER      │
           │   (Frontend)    │        │    (Backend)    │
           │                 │        │                 │
           │ Auto-deploy on  │        │ Auto-deploy on  │
           │ git push        │        │ git push        │
           │                 │        │                 │
           │ CDN: Global     │        │ Region: Oregon  │
           └─────────────────┘        └─────────────────┘
                    │                           │
                    │                           │
                    ▼                           ▼
           ┌─────────────────┐        ┌─────────────────┐
           │ nexus-job-      │        │ nexus-job-      │
           │ platform.       │        │ platform-1.     │
           │ vercel.app      │        │ onrender.com    │
           └─────────────────┘        └─────────────────┘
```

---

## Performance Considerations

### Frontend Optimization
- Code splitting with React.lazy()
- Vite for fast builds
- CDN distribution via Vercel

### Backend Optimization
- MongoDB indexes on frequently queried fields
- Pagination for large data sets
- Efficient database queries with projections

### Caching Strategy
- Browser caching for static assets
- API response caching (future)

---

*Last Updated: December 2024*
