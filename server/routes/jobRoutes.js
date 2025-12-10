const express = require('express');
const router = express.Router();
const {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
  toggleJobStatus,
  getMyJobs,
  getJobStats,
} = require('../controllers/jobController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.get('/', getJobs);
router.get('/:id', getJob);

// Admin only routes
router.post('/', protect, adminOnly, createJob);
router.put('/:id', protect, adminOnly, updateJob);
router.delete('/:id', protect, adminOnly, deleteJob);
router.patch('/:id/toggle-status', protect, adminOnly, toggleJobStatus);
router.get('/admin/my-jobs', protect, adminOnly, getMyJobs);
router.get('/admin/stats', protect, adminOnly, getJobStats);

module.exports = router;
