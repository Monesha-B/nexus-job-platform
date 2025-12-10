const express = require('express');
const router = express.Router();
const { 
  getMyStats, 
  getMatchTrend,
  getSkillsAnalysis,
  getRecentActivity, 
  getMyApplications, 
  getMyMatches 
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/my-stats', getMyStats);
router.get('/match-trend', getMatchTrend);
router.get('/skills-analysis', getSkillsAnalysis);
router.get('/recent-activity', getRecentActivity);
router.get('/my-applications', getMyApplications);
router.get('/my-matches', getMyMatches);

module.exports = router;
