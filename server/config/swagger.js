const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NEXUS API Documentation',
      version: '1.0.0',
      description: `
# NEXUS - AI-Powered Job Matching Platform API

This API provides endpoints for the NEXUS job matching platform, including:
- **Authentication**: User registration, login, and Google OAuth
- **User Management**: Profile management and admin controls
- **Resume Management**: Upload, parse, and analyze resumes
- **Job Management**: CRUD operations for job postings
- **AI Features**: Job matching, cover letter generation, and chatbot

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`

## Roles
- **jobseeker**: Can upload resumes, search jobs, apply
- **recruiter**: Can post jobs, view applicants
- **admin**: Full access to all features
      `,
      contact: {
        name: 'NEXUS Support',
        email: 'support@nexus.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: 'https://nexus-api.onrender.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            role: { type: 'string', enum: ['jobseeker', 'recruiter', 'admin'], example: 'jobseeker' },
            avatar: { type: 'string', example: 'https://example.com/avatar.jpg' },
            phone: { type: 'string', example: '+1234567890' },
            location: { type: 'string', example: 'Boston, MA' },
            linkedIn: { type: 'string', example: 'https://linkedin.com/in/johndoe' },
            company: { type: 'string', example: 'Tech Corp' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Job: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string', example: 'Software Engineer' },
            company: { type: 'string', example: 'Tech Corp' },
            location: { type: 'string', example: 'Boston, MA' },
            type: { type: 'string', enum: ['full-time', 'part-time', 'contract', 'internship'] },
            salary: {
              type: 'object',
              properties: {
                min: { type: 'number', example: 80000 },
                max: { type: 'number', example: 120000 },
                currency: { type: 'string', example: 'USD' },
              },
            },
            description: { type: 'string' },
            requirements: { type: 'array', items: { type: 'string' } },
            skills: { type: 'array', items: { type: 'string' } },
            isActive: { type: 'boolean' },
            postedAt: { type: 'string', format: 'date-time' },
          },
        },
        Resume: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            user: { type: 'string' },
            fileName: { type: 'string', example: 'resume.pdf' },
            fileUrl: { type: 'string' },
            parsedData: {
              type: 'object',
              properties: {
                summary: { type: 'string' },
                skills: { type: 'array', items: { type: 'string' } },
                experience: { type: 'array', items: { type: 'object' } },
                education: { type: 'array', items: { type: 'object' } },
              },
            },
            uploadedAt: { type: 'string', format: 'date-time' },
          },
        },
        MatchResult: {
          type: 'object',
          properties: {
            matchScore: { type: 'number', example: 85 },
            summary: { type: 'string' },
            strengths: { type: 'array', items: { type: 'string' } },
            gaps: { type: 'array', items: { type: 'string' } },
            interviewQuestions: { type: 'array', items: { type: 'string' } },
            coverLetter: { type: 'string' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },
    tags: [
      { name: 'Authentication', description: 'User authentication endpoints' },
      { name: 'Users', description: 'User management endpoints' },
      { name: 'Jobs', description: 'Job posting and search endpoints' },
      { name: 'Resumes', description: 'Resume upload and parsing endpoints' },
      { name: 'Applications', description: 'Job application endpoints' },
      { name: 'AI', description: 'AI-powered features (matching, chatbot, etc.)' },
      { name: 'Admin', description: 'Admin-only endpoints' },
    ],
  },
  apis: ['./routes/*.js', './controllers/*.js'],
};

const specs = swaggerJsdoc(options);

const setupSwagger = (app) => {
  // Swagger UI options
  const swaggerUiOptions = {
    explorer: true,
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #2563eb }
    `,
    customSiteTitle: 'NEXUS API Documentation',
  };

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));
  
  // JSON endpoint for API specs
  app.get('/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};

module.exports = setupSwagger;
