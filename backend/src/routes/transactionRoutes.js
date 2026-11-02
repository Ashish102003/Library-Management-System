const express = require('express');
const {
  getTransactions,
  getOverdue,
  issueBook,
  returnBook,
  payFine,
  getFineSummary,
} = require('../controllers/transactionController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getTransactions);
router.get('/overdue', getOverdue);
router.get('/fines/summary', authorize('admin'), getFineSummary);
router.post('/issue', authorize('admin'), issueBook);
router.put('/:id/return', returnBook);
router.put('/:id/pay-fine', payFine);

module.exports = router;
