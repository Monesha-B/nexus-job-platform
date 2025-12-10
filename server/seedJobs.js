const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Job = require('./models/Job');
  const User = require('./models/User');
  
  // Get admin user
  const admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    console.log('No admin user found!');
    process.exit(1);
  }
  
  console.log('Adding jobs as:', admin.email);
  
  const sampleJobs = [
    {
      recruiter: admin._id,
      title: 'Senior Full Stack Developer',
      company: 'TechCorp Solutions',
      location: 'San Francisco, CA',
      locationType: 'hybrid',
      type: 'full-time',
      experienceLevel: 'senior',
      salary: { min: 150000, max: 200000, currency: 'USD', period: 'yearly', isVisible: true },
      description: 'We are looking for a Senior Full Stack Developer to join our growing team. You will be responsible for developing and maintaining web applications using modern technologies.',
      requirements: [
        '5+ years of experience in full stack development',
        'Proficiency in React, Node.js, and MongoDB',
        'Experience with cloud services (AWS/GCP/Azure)',
        'Strong problem-solving skills'
      ],
      responsibilities: [
        'Design and implement scalable web applications',
        'Collaborate with cross-functional teams',
        'Mentor junior developers',
        'Participate in code reviews'
      ],
      skills: ['javascript', 'react', 'node.js', 'mongodb', 'aws', 'typescript'],
      benefits: ['Health insurance', '401(k) match', 'Unlimited PTO', 'Remote flexibility'],
      isActive: true,
      isFeatured: true
    },
    {
      recruiter: admin._id,
      title: 'Frontend React Developer',
      company: 'StartupXYZ',
      location: 'New York, NY',
      locationType: 'remote',
      type: 'full-time',
      experienceLevel: 'mid',
      salary: { min: 100000, max: 140000, currency: 'USD', period: 'yearly', isVisible: true },
      description: 'Join our innovative startup as a Frontend React Developer. We are building the next generation of fintech products.',
      requirements: [
        '3+ years of experience with React',
        'Strong knowledge of JavaScript/TypeScript',
        'Experience with state management (Redux)',
        'Understanding of RESTful APIs'
      ],
      responsibilities: [
        'Build responsive web applications',
        'Implement pixel-perfect designs',
        'Optimize application performance',
        'Write unit and integration tests'
      ],
      skills: ['react', 'typescript', 'redux', 'css', 'tailwind', 'jest'],
      benefits: ['Fully remote', 'Stock options', 'Health insurance', 'Home office stipend'],
      isActive: true
    },
    {
      recruiter: admin._id,
      title: 'Backend Engineer (Node.js)',
      company: 'DataFlow Inc',
      location: 'Austin, TX',
      locationType: 'onsite',
      type: 'full-time',
      experienceLevel: 'mid',
      salary: { min: 120000, max: 160000, currency: 'USD', period: 'yearly', isVisible: true },
      description: 'DataFlow Inc is seeking a Backend Engineer to help build our data processing platform.',
      requirements: [
        '3-5 years of backend development experience',
        'Strong Node.js and Express.js skills',
        'Experience with PostgreSQL and Redis',
        'Knowledge of message queues'
      ],
      responsibilities: [
        'Design and build RESTful APIs',
        'Optimize database queries',
        'Implement caching strategies',
        'Monitor system performance'
      ],
      skills: ['node.js', 'express', 'postgresql', 'redis', 'docker', 'kubernetes'],
      benefits: ['Competitive pay', 'Annual bonus', 'Health benefits', 'Free lunch'],
      isActive: true
    },
    {
      recruiter: admin._id,
      title: 'DevOps Engineer',
      company: 'CloudNine Systems',
      location: 'Seattle, WA',
      locationType: 'hybrid',
      type: 'full-time',
      experienceLevel: 'senior',
      salary: { min: 140000, max: 180000, currency: 'USD', period: 'yearly', isVisible: true },
      description: 'CloudNine Systems is looking for a DevOps Engineer to help us scale our infrastructure.',
      requirements: [
        '5+ years of DevOps experience',
        'Expert knowledge of AWS services',
        'Experience with Terraform',
        'Strong scripting skills (Python, Bash)'
      ],
      responsibilities: [
        'Manage AWS infrastructure',
        'Build CI/CD pipelines',
        'Implement security best practices',
        'Automate deployment processes'
      ],
      skills: ['aws', 'terraform', 'docker', 'kubernetes', 'jenkins', 'python'],
      benefits: ['Top-tier salary', 'RSUs', 'Premium health coverage', 'Conference budget'],
      isActive: true,
      isFeatured: true
    },
    {
      recruiter: admin._id,
      title: 'Junior Software Developer',
      company: 'GrowthLabs',
      location: 'Boston, MA',
      locationType: 'onsite',
      type: 'full-time',
      experienceLevel: 'entry',
      salary: { min: 70000, max: 90000, currency: 'USD', period: 'yearly', isVisible: true },
      description: 'Great opportunity for recent graduates. We provide mentorship and training.',
      requirements: [
        'Bachelor degree in CS or related field',
        'Knowledge of at least one programming language',
        'Understanding of data structures',
        'Eagerness to learn'
      ],
      responsibilities: [
        'Learn our tech stack',
        'Fix bugs and implement features',
        'Write unit tests',
        'Participate in code reviews'
      ],
      skills: ['javascript', 'python', 'git', 'sql', 'html', 'css'],
      benefits: ['Mentorship program', 'Learning budget', 'Health insurance', 'Team events'],
      isActive: true
    },
    {
      recruiter: admin._id,
      title: 'Data Scientist',
      company: 'AI Innovations',
      location: 'San Jose, CA',
      locationType: 'remote',
      type: 'full-time',
      experienceLevel: 'mid',
      salary: { min: 130000, max: 170000, currency: 'USD', period: 'yearly', isVisible: true },
      description: 'AI Innovations is seeking a Data Scientist to join our ML team.',
      requirements: [
        'MS or PhD in Data Science or Statistics',
        '3+ years of experience in data science',
        'Proficiency in Python and SQL',
        'Experience with ML frameworks'
      ],
      responsibilities: [
        'Build machine learning models',
        'Analyze large datasets',
        'Create data visualizations',
        'Present findings to stakeholders'
      ],
      skills: ['python', 'tensorflow', 'pytorch', 'sql', 'pandas', 'scikit-learn'],
      benefits: ['Competitive salary', 'Research opportunities', 'Conference attendance', 'Flexible schedule'],
      isActive: true
    },
    {
      recruiter: admin._id,
      title: 'Mobile Developer (React Native)',
      company: 'AppWorks Studio',
      location: 'Los Angeles, CA',
      locationType: 'hybrid',
      type: 'full-time',
      experienceLevel: 'mid',
      salary: { min: 110000, max: 150000, currency: 'USD', period: 'yearly', isVisible: true },
      description: 'AppWorks Studio is looking for a Mobile Developer to build cross-platform apps.',
      requirements: [
        '3+ years of mobile development',
        'Strong React Native skills',
        'Experience with iOS and Android',
        'Knowledge of app store deployment'
      ],
      responsibilities: [
        'Develop cross-platform mobile apps',
        'Implement native modules',
        'Optimize app performance',
        'Handle app store submissions'
      ],
      skills: ['react native', 'javascript', 'ios', 'android', 'redux', 'firebase'],
      benefits: ['Latest devices', 'Health benefits', 'Gym membership', 'Team outings'],
      isActive: true
    },
    {
      recruiter: admin._id,
      title: 'UI/UX Designer',
      company: 'DesignFirst Agency',
      location: 'Chicago, IL',
      locationType: 'remote',
      type: 'full-time',
      experienceLevel: 'mid',
      salary: { min: 90000, max: 120000, currency: 'USD', period: 'yearly', isVisible: true },
      description: 'DesignFirst Agency is looking for a talented UI/UX Designer.',
      requirements: [
        '3+ years of UI/UX design experience',
        'Proficiency in Figma',
        'Strong portfolio',
        'Understanding of user research'
      ],
      responsibilities: [
        'Create wireframes and prototypes',
        'Conduct user research',
        'Design responsive interfaces',
        'Maintain design systems'
      ],
      skills: ['figma', 'sketch', 'adobe xd', 'prototyping', 'user research'],
      benefits: ['Creative environment', 'Remote work', 'Design tool subscriptions', 'Flexible hours'],
      isActive: true
    },
    {
      recruiter: admin._id,
      title: 'Software Engineering Intern',
      company: 'TechStart',
      location: 'Denver, CO',
      locationType: 'onsite',
      type: 'internship',
      experienceLevel: 'entry',
      salary: { min: 50000, max: 60000, currency: 'USD', period: 'yearly', isVisible: true },
      description: 'TechStart is offering a summer internship for aspiring software engineers.',
      requirements: [
        'Currently pursuing CS degree',
        'Basic programming knowledge',
        'Familiarity with Git',
        'Available for 3 months'
      ],
      responsibilities: [
        'Work on real projects',
        'Learn from senior engineers',
        'Participate in team meetings',
        'Present work at end of internship'
      ],
      skills: ['javascript', 'python', 'git', 'html', 'css'],
      benefits: ['Paid internship', 'Mentorship', 'Potential full-time offer', 'Free lunch'],
      isActive: true
    },
    {
      recruiter: admin._id,
      title: 'Product Manager',
      company: 'ProductHub',
      location: 'Miami, FL',
      locationType: 'hybrid',
      type: 'full-time',
      experienceLevel: 'senior',
      salary: { min: 140000, max: 180000, currency: 'USD', period: 'yearly', isVisible: true },
      description: 'ProductHub is seeking an experienced Product Manager to lead our flagship product.',
      requirements: [
        '5+ years of product management',
        'Experience with agile methodologies',
        'Strong analytical skills',
        'Excellent communication'
      ],
      responsibilities: [
        'Define product vision and roadmap',
        'Gather and prioritize requirements',
        'Work with engineering on delivery',
        'Analyze metrics and user feedback'
      ],
      skills: ['product management', 'agile', 'jira', 'analytics', 'sql'],
      benefits: ['Leadership role', 'Equity package', 'Health benefits', 'Travel opportunities'],
      isActive: true,
      isFeatured: true
    }
  ];
  
  // Clear existing jobs
  await Job.deleteMany({});
  console.log('Cleared existing jobs');
  
  // Insert new jobs
  const result = await Job.insertMany(sampleJobs);
  console.log('Added', result.length, 'sample jobs!');
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
