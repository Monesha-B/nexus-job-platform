const express = require('express');
const router = express.Router();
const {
  uploadResume,
  getResumes,
  getResume,
  deleteResume,
  parseResumeController,
  setPrimaryResume,
  getPrimaryResume,
} = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');
const { uploadResume: upload, handleUploadError } = require('../middleware/upload');

// All routes require authentication
router.use(protect);

// Resume routes
router.post('/upload', upload.single('resume'), handleUploadError, uploadResume);
router.get('/', getResumes);
router.get('/primary', getPrimaryResume);
router.get('/:id', getResume);
router.delete('/:id', deleteResume);
router.post('/:id/parse', parseResumeController);
router.put('/:id/primary', setPrimaryResume);

module.exports = router;
