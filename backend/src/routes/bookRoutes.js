const express = require('express');
const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} = require('../controllers/bookController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getBooks);
router.get('/:id', getBookById);
router.post('/', authorize('admin'), createBook);
router.put('/:id', authorize('admin'), updateBook);
router.delete('/:id', authorize('admin'), deleteBook);

module.exports = router;
