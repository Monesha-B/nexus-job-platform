const Resume = require('../models/Resume');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const path = require('path');
const fs = require('fs');

// Get file type from mimetype
const getFileType = (mimetype) => {
  if (mimetype === 'application/pdf') return 'pdf';
  if (mimetype === 'application/msword') return 'doc';
  if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx';
  return 'pdf';
};

// Upload resume
const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('Please upload a file', 400);
  }

  const resumeCount = await Resume.countDocuments({ user: req.user._id });
  if (resumeCount >= 5) {
    fs.unlinkSync(req.file.path);
    throw new AppError('Maximum 5 resumes allowed. Please delete one first.', 400);
  }

  const isFirst = resumeCount === 0;

  const resume = await Resume.create({
    user: req.user._id,
    fileName: req.file.originalname,
    originalName: req.file.originalname,
    filePath: req.file.path,
    fileUrl: `/uploads/${req.file.filename}`,
    fileSize: req.file.size,
    fileType: getFileType(req.file.mimetype),
    isPrimary: isFirst,
    isActive: true,
  });

  res.status(201).json({
    success: true,
    message: 'Resume uploaded successfully',
    data: { resume },
  });
});

// Get all resumes for user
const getResumes = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({ user: req.user._id, isActive: true }).sort({ isPrimary: -1, createdAt: -1 });
  res.json({ success: true, data: { resumes } });
});

// Get single resume
const getResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
  if (!resume) throw new AppError('Resume not found', 404);
  res.json({ success: true, data: { resume } });
});

// Get primary resume
const getPrimaryResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ user: req.user._id, isPrimary: true, isActive: true });
  res.json({ success: true, data: { resume } });
});

// Delete resume
const deleteResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
  if (!resume) throw new AppError('Resume not found', 404);

  if (resume.filePath && fs.existsSync(resume.filePath)) {
    fs.unlinkSync(resume.filePath);
  }

  if (resume.isPrimary) {
    const nextResume = await Resume.findOne({ user: req.user._id, _id: { $ne: resume._id }, isActive: true });
    if (nextResume) {
      nextResume.isPrimary = true;
      await nextResume.save();
    }
  }

  await resume.deleteOne();
  res.json({ success: true, message: 'Resume deleted successfully' });
});

// Set primary resume
const setPrimaryResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
  if (!resume) throw new AppError('Resume not found', 404);

  await Resume.updateMany({ user: req.user._id }, { isPrimary: false });
  resume.isPrimary = true;
  await resume.save();

  res.json({ success: true, message: 'Primary resume updated', data: { resume } });
});

// Parse resume (placeholder)
const parseResumeController = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
  if (!resume) throw new AppError('Resume not found', 404);
  
  // Placeholder - would integrate with a parsing service
  res.json({ success: true, message: 'Resume parsing not implemented yet', data: { resume } });
});

module.exports = {
  uploadResume,
  getResumes,
  getResume,
  getPrimaryResume,
  deleteResume,
  setPrimaryResume,
  parseResumeController,
};
