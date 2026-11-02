const express = require('express');
const {
  getStats,
  getRecentTransactions,
  getIssueStatistics,
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/stats', getStats);
router.get('/recent-transactions', getRecentTransactions);
router.get('/issue-statistics', authorize('admin'), getIssueStatistics);

module.exports = router;
