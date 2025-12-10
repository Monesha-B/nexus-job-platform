const express = require('express');
const router = express.Router();
const {
  createApplication,
  getMyApplications,
  getAllApplications,
  getApplication,
  updateApplicationStatus,
  deleteApplication,
  getApplicationStats,
} = require('../controllers/applicationController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);

router.post('/', createApplication);
router.get('/my-applications', getMyApplications);

router.get('/', adminOnly, getAllApplications);
router.get('/stats', adminOnly, getApplicationStats);

router.get('/:id', getApplication);
router.patch('/:id/status', adminOnly, updateApplicationStatus);
router.delete('/:id', deleteApplication);

module.exports = router;
