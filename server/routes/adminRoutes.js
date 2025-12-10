const express = require('express');
const router = express.Router();
const {
  getPlatformStats,
  getRecentUsers,
  getRecentApplications,
  getPopularJobs,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// All routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

router.get('/stats', getPlatformStats);
router.get('/recent-users', getRecentUsers);
router.get('/recent-applications', getRecentApplications);
router.get('/popular-jobs', getPopularJobs);

module.exports = router;
