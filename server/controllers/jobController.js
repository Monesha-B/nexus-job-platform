const Job = require('../models/Job');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Admin only
const createJob = asyncHandler(async (req, res) => {
  const jobData = {
    ...req.body,
    recruiter: req.user._id,
  };

  // Parse skills, requirements, responsibilities, benefits if they're strings
  if (typeof jobData.skills === 'string') {
    jobData.skills = jobData.skills.split(',').map(s => s.trim()).filter(s => s);
  }
  if (typeof jobData.requirements === 'string') {
    jobData.requirements = jobData.requirements.split('\n').map(s => s.trim()).filter(s => s);
  }
  if (typeof jobData.responsibilities === 'string') {
    jobData.responsibilities = jobData.responsibilities.split('\n').map(s => s.trim()).filter(s => s);
  }
  if (typeof jobData.benefits === 'string') {
    jobData.benefits = jobData.benefits.split('\n').map(s => s.trim()).filter(s => s);
  }

  const job = await Job.create(jobData);

  res.status(201).json({
    success: true,
    message: 'Job created successfully',
    data: { job },
  });
});

// @desc    Get all jobs (with filters)
// @route   GET /api/jobs
// @access  Public
const getJobs = asyncHandler(async (req, res) => {
  const {
    search,
    location,
    type,
    experienceLevel,
    locationType,
    minSalary,
    maxSalary,
    skills,
    isActive = 'true',
    page = 1,
    limit = 10,
    sort = '-postedAt',
  } = req.query;

  const query = {};

  // Only show active jobs for non-admin users
  if (isActive === 'true') {
    query.isActive = true;
    query.$or = [
      { expiresAt: { $gt: new Date() } },
      { expiresAt: null },
    ];
  }

  // Search in title, company, description
  if (search) {
    query.$text = { $search: search };
  }

  // Filters
  if (location) query.location = { $regex: location, $options: 'i' };
  if (type) query.type = type;
  if (experienceLevel) query.experienceLevel = experienceLevel;
  if (locationType) query.locationType = locationType;
  if (skills) {
    const skillsArray = skills.split(',').map(s => s.trim().toLowerCase());
    query.skills = { $in: skillsArray };
  }
  if (minSalary) query['salary.min'] = { $gte: parseInt(minSalary) };
  if (maxSalary) query['salary.max'] = { $lte: parseInt(maxSalary) };

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [jobs, total] = await Promise.all([
    Job.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('recruiter', 'firstName lastName'),
    Job.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: {
      jobs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit),
      },
    },
  });
});

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
const getJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id)
    .populate('recruiter', 'firstName lastName email');

  if (!job) {
    throw new AppError('Job not found', 404);
  }

  // Increment view count
  await job.incrementViews();

  res.json({
    success: true,
    data: { job },
  });
});

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Admin only
const updateJob = asyncHandler(async (req, res) => {
  let job = await Job.findById(req.params.id);

  if (!job) {
    throw new AppError('Job not found', 404);
  }

  // Parse arrays if they're strings
  const updateData = { ...req.body };
  if (typeof updateData.skills === 'string') {
    updateData.skills = updateData.skills.split(',').map(s => s.trim()).filter(s => s);
  }
  if (typeof updateData.requirements === 'string') {
    updateData.requirements = updateData.requirements.split('\n').map(s => s.trim()).filter(s => s);
  }
  if (typeof updateData.responsibilities === 'string') {
    updateData.responsibilities = updateData.responsibilities.split('\n').map(s => s.trim()).filter(s => s);
  }
  if (typeof updateData.benefits === 'string') {
    updateData.benefits = updateData.benefits.split('\n').map(s => s.trim()).filter(s => s);
  }

  job = await Job.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  res.json({
    success: true,
    message: 'Job updated successfully',
    data: { job },
  });
});

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Admin only
const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    throw new AppError('Job not found', 404);
  }

  await Job.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Job deleted successfully',
  });
});

// @desc    Toggle job status (active/inactive)
// @route   PATCH /api/jobs/:id/toggle-status
// @access  Admin only
const toggleJobStatus = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    throw new AppError('Job not found', 404);
  }

  job.isActive = !job.isActive;
  if (!job.isActive) {
    job.closedAt = new Date();
  } else {
    job.closedAt = null;
  }
  await job.save();

  res.json({
    success: true,
    message: `Job ${job.isActive ? 'activated' : 'deactivated'} successfully`,
    data: { job },
  });
});

// @desc    Get admin's jobs
// @route   GET /api/jobs/my-jobs
// @access  Admin only
const getMyJobs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, isActive } = req.query;

  const query = { recruiter: req.user._id };
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [jobs, total] = await Promise.all([
    Job.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit)),
    Job.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: {
      jobs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
      },
    },
  });
});

// @desc    Get job statistics for admin
// @route   GET /api/jobs/stats
// @access  Admin only
const getJobStats = asyncHandler(async (req, res) => {
  const [
    totalJobs,
    activeJobs,
    totalApplications,
    jobsByType,
    jobsByExperience,
  ] = await Promise.all([
    Job.countDocuments({ recruiter: req.user._id }),
    Job.countDocuments({ recruiter: req.user._id, isActive: true }),
    Job.aggregate([
      { $match: { recruiter: req.user._id } },
      { $group: { _id: null, total: { $sum: '$applicationsCount' } } },
    ]),
    Job.aggregate([
      { $match: { recruiter: req.user._id } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]),
    Job.aggregate([
      { $match: { recruiter: req.user._id } },
      { $group: { _id: '$experienceLevel', count: { $sum: 1 } } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      totalJobs,
      activeJobs,
      inactiveJobs: totalJobs - activeJobs,
      totalApplications: totalApplications[0]?.total || 0,
      jobsByType,
      jobsByExperience,
    },
  });
});

module.exports = {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
  toggleJobStatus,
  getMyJobs,
  getJobStats,
};
