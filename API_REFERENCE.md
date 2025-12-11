# API Reference

## NEXUS - AI-Powered Job Matching Platform

Complete API documentation for the NEXUS backend.

---

## Base URL

- **Development:** `http://localhost:5001/api`
- **Production:** `https://nexus-job-platform-1.onrender.com/api`

---

## Authentication

Most endpoints require authentication via JWT token.

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

---

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "Password123",
  "role": "jobseeker"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "data": {
    "user": {
      "_id": "6939b3cd718992a2db26cebc",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "jobseeker",
      "createdAt": "2024-12-10T17:54:21.996Z"
    }
  }
}
```

---

#### Login User
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "data": {
    "user": {
      "_id": "6939b3cd718992a2db26cebc",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "jobseeker"
    }
  }
}
```

---

#### Google OAuth Login
```http
POST /auth/google
```

**Request Body:**
```json
{
  "credential": "eyJhbGciOiJSUzI1NiIs...",
  "clientId": "your-client-id.apps.googleusercontent.com",
  "profile": {
    "googleId": "123456789",
    "email": "john@gmail.com",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "https://..."
  }
}
```

---

#### Get Current User
```http
GET /auth/me
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "6939b3cd718992a2db26cebc",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "jobseeker"
    }
  }
}
```

---

#### Logout
```http
POST /auth/logout
```

**Headers:** `Authorization: Bearer <token>`

---

### Jobs

#### Get All Jobs
```http
GET /jobs
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 10) |
| search | string | Search in title/company |
| type | string | Job type filter |
| location | string | Location filter |
| experienceLevel | string | Experience level filter |

**Response:**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "_id": "...",
        "title": "Software Engineer",
        "company": "Tech Corp",
        "location": "San Francisco, CA",
        "type": "full-time",
        "description": "...",
        "requirements": ["..."],
        "skills": ["JavaScript", "React"],
        "salary": {
          "min": 100000,
          "max": 150000,
          "currency": "USD"
        },
        "isActive": true,
        "createdAt": "2024-12-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 5,
      "total": 50
    }
  }
}
```

---

#### Get Job by ID
```http
GET /jobs/:id
```

---

#### Create Job (Admin)
```http
POST /jobs
```

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "title": "Software Engineer",
  "company": "Tech Corp",
  "location": "San Francisco, CA",
  "locationType": "hybrid",
  "type": "full-time",
  "experienceLevel": "mid",
  "description": "We are looking for...",
  "requirements": "3+ years experience\nReact knowledge",
  "responsibilities": "Build features\nCode review",
  "skills": "JavaScript, React, Node.js",
  "benefits": "Health insurance\n401k",
  "salary": {
    "min": 100000,
    "max": 150000,
    "currency": "USD",
    "isVisible": true
  }
}
```

---

#### Update Job (Admin)
```http
PUT /jobs/:id
```

**Headers:** `Authorization: Bearer <admin_token>`

---

#### Delete Job (Admin)
```http
DELETE /jobs/:id
```

**Headers:** `Authorization: Bearer <admin_token>`

---

#### Toggle Job Status (Admin)
```http
PATCH /jobs/:id/toggle-status
```

**Headers:** `Authorization: Bearer <admin_token>`

---

### Applications

#### Get User Applications
```http
GET /applications
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "_id": "...",
        "job": {
          "_id": "...",
          "title": "Software Engineer",
          "company": "Tech Corp"
        },
        "status": "pending",
        "coverLetter": "...",
        "createdAt": "2024-12-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

#### Submit Application
```http
POST /applications
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "jobId": "job_id_here",
  "resumeId": "resume_id_here",
  "coverLetter": "Dear Hiring Manager..."
}
```

---

#### Update Application Status (Admin)
```http
PATCH /applications/:id/status
```

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "status": "reviewed"
}
```

**Valid Statuses:**
- `pending`
- `reviewed`
- `shortlisted`
- `interview`
- `offered`
- `rejected`
- `withdrawn`

---

### Resumes

#### Upload Resume
```http
POST /resumes/upload
```

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data:**
- `resume`: File (PDF, DOC, DOCX)

**Response:**
```json
{
  "success": true,
  "data": {
    "resume": {
      "_id": "...",
      "fileName": "resume.pdf",
      "fileUrl": "/uploads/...",
      "isPrimary": true
    }
  }
}
```

---

#### Get User Resumes
```http
GET /resumes
```

**Headers:** `Authorization: Bearer <token>`

---

#### Delete Resume
```http
DELETE /resumes/:id
```

**Headers:** `Authorization: Bearer <token>`

---

#### Set Primary Resume
```http
PUT /resumes/:id/primary
```

**Headers:** `Authorization: Bearer <token>`

---

### AI Features

#### Generate Cover Letter
```http
POST /ai/cover-letter
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "jobId": "job_id_here",
  "resumeId": "resume_id_here"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "coverLetter": "Dear Hiring Manager,\n\nI am writing to express..."
  }
}
```

---

#### AI Job Match
```http
POST /ai/job-match
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "resumeText": "Your resume content...",
  "jobDescription": "Job description...",
  "jobTitle": "Software Engineer",
  "company": "Tech Corp"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "matchScore": 85,
    "strengths": ["Strong React experience", "..."],
    "gaps": ["No Python experience"],
    "recommendations": ["Consider learning Python", "..."]
  }
}
```

---

#### AI Chat
```http
POST /ai/chat
```

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "message": "How do I prepare for a software engineering interview?",
  "context": []
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reply": "Here are some tips for preparing..."
  }
}
```

---

### Admin

#### Get Dashboard Stats
```http
GET /admin/stats
```

**Headers:** `Authorization: Bearer <admin_token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 150,
      "jobseekers": 140,
      "admins": 10
    },
    "jobs": {
      "total": 50,
      "active": 45
    },
    "applications": {
      "total": 300,
      "pending": 100,
      "reviewed": 80
    },
    "topSkills": [
      { "_id": "JavaScript", "count": 45 },
      { "_id": "React", "count": 40 }
    ]
  }
}
```

---

#### Get Recent Users
```http
GET /admin/recent-users?limit=10
```

**Headers:** `Authorization: Bearer <admin_token>`

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common Error Codes

| Status | Description |
|--------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid/missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error - Internal error |

---

## Rate Limiting

- **AI Endpoints:** 10 requests/minute
- **Other Endpoints:** 100 requests/minute

---

*For more details, visit the Swagger documentation at `/api-docs`*
