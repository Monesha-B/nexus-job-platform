const Application = require('../models/Application');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const createApplication = asyncHandler(async (req, res) => {
  const { job, coverLetter } = req.body;

  // Check if job exists
  const jobExists = await Job.findById(job);
  if (!jobExists) {
    throw new AppError('Job not found', 404);
  }

  // Check if already applied
  const existingApplication = await Application.findOne({
    applicant: req.user._id,
    job: job,
  });

  if (existingApplication) {
    throw new AppError('You have already applied to this job', 400);
  }

  // Find user's resume
  const resume = await Resume.findOne({ user: req.user._id }).sort('-createdAt');
  if (!resume) {
    throw new AppError('Please upload a resume before applying', 400);
  }

  const application = await Application.create({
    applicant: req.user._id,
    job: job,
    resume: resume._id,
    coverLetter: coverLetter || '',
    status: 'pending',
  });

  // Increment application count on job
  await Job.findByIdAndUpdate(job, { $inc: { applicationsCount: 1 } });

  res.status(201).json({
    success: true,
    message: 'Application submitted successfully',
    data: { application },
  });
});

const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ applicant: req.user._id })
    .populate('job', 'title company location type salary isActive')
    .sort('-createdAt');

  res.json({
    success: true,
    data: { applications, count: applications.length },
  });
});

const getAllApplications = asyncHandler(async (req, res) => {
  const { status, job, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status) query.status = status;
  if (job) query.job = job;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [applications, total] = await Promise.all([
    Application.find(query)
      .populate('applicant', 'firstName lastName email phone')
      .populate('job', 'title company location')
      .populate('resume', 'fileName fileUrl originalName')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit)),
    Application.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: {
      applications,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
      },
    },
  });
});

const getApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate('applicant', 'firstName lastName email phone')
    .populate('job', 'title company location type salary description')
    .populate('resume', 'fileName fileUrl originalName');

  if (!application) {
    throw new AppError('Application not found', 404);
  }

  if (req.user.role !== 'admin' && application.applicant._id.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to view this application', 403);
  }

  res.json({
    success: true,
    data: { application },
  });
});

const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const validStatuses = ['pending', 'reviewed', 'shortlisted', 'interview', 'offered', 'rejected', 'withdrawn'];
  if (!validStatuses.includes(status)) {
    throw new AppError('Invalid status', 400);
  }

  const application = await Application.findByIdAndUpdate(
    req.params.id,
    { status, reviewedAt: status !== 'pending' ? new Date() : undefined },
    { new: true }
  )
    .populate('applicant', 'firstName lastName email')
    .populate('job', 'title company');

  if (!application) {
    throw new AppError('Application not found', 404);
  }

  res.json({
    success: true,
    message: `Application status updated to ${status}`,
    data: { application },
  });
});

const deleteApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);

  if (!application) {
    throw new AppError('Application not found', 404);
  }

  if (req.user.role !== 'admin' && application.applicant.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to delete this application', 403);
  }

  await Job.findByIdAndUpdate(application.job, { $inc: { applicationsCount: -1 } });
  await Application.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Application withdrawn successfully',
  });
});

const getApplicationStats = asyncHandler(async (req, res) => {
  const stats = await Application.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const totalApplications = await Application.countDocuments();

  res.json({
    success: true,
    data: { total: totalApplications, byStatus: stats },
  });
});

module.exports = {
  createApplication,
  getMyApplications,
  getAllApplications,
  getApplication,
  updateApplicationStatus,
  deleteApplication,
  getApplicationStats,
};
