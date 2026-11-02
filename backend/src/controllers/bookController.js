const Book = require('../models/Book');
const Transaction = require('../models/Transaction');
const { asyncHandler, apiError } = require('../middleware/errorMiddleware');

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @route GET /api/books
const getBooks = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
  const { search, category, availability } = req.query;

  const query = {};
  if (search) {
    const rx = new RegExp(escapeRegex(search.trim()), 'i');
    query.$or = [{ title: rx }, { author: rx }, { isbn: rx }];
  }
  if (category && category !== 'all') query.category = category;
  if (availability === 'available') query.availableCopies = { $gt: 0 };
  if (availability === 'unavailable') query.availableCopies = 0;

  const total = await Book.countDocuments(query);
  const books = await Book.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    success: true,
    data: books,
    pagination: { page, pages: Math.ceil(total / limit), total, limit },
  });
});

// @route GET /api/books/:id
const getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) throw apiError(404, 'Book not found');

  const activeIssues = await Transaction.countDocuments({ book: book._id, returnDate: null });

  res.json({ success: true, data: { ...book.toObject(), activeIssues } });
});

// @route POST /api/books
const createBook = asyncHandler(async (req, res) => {
  const { title, author, isbn, category, publisher, publicationYear, totalCopies, description, coverImage } = req.body;

  if (!title || !author || !isbn || !category || !publicationYear || totalCopies === undefined) {
    throw apiError(400, 'Title, author, ISBN, category, publication year and total copies are required');
  }
  if (Number(totalCopies) <= 0) throw apiError(400, 'Total copies must be greater than 0');

  const year = Number(publicationYear);
  if (Number.isNaN(year) || year < 1000 || year > new Date().getFullYear()) {
    throw apiError(400, 'Please provide a valid publication year');
  }

  const duplicate = await Book.findOne({ isbn: String(isbn).trim() });
  if (duplicate) throw apiError(400, 'A book with this ISBN already exists');

  const book = await Book.create({
    title,
    author,
    isbn,
    category,
    publisher,
    publicationYear: year,
    totalCopies: Number(totalCopies),
    availableCopies: Number(totalCopies),
    description,
    coverImage,
  });

  res.status(201).json({ success: true, data: book, message: 'Book added successfully' });
});

// @route PUT /api/books/:id
const updateBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) throw apiError(404, 'Book not found');

  const { title, author, isbn, category, publisher, publicationYear, totalCopies, description, coverImage } = req.body;

  if (isbn) {
    const duplicate = await Book.findOne({ isbn: String(isbn).trim(), _id: { $ne: book._id } });
    if (duplicate) throw apiError(400, 'A book with this ISBN already exists');
  }

  const issuedCopies = book.totalCopies - book.availableCopies;

  if (totalCopies !== undefined) {
    const newTotal = Number(totalCopies);
    if (Number.isNaN(newTotal) || newTotal <= 0) throw apiError(400, 'Total copies must be greater than 0');
    if (newTotal < issuedCopies) {
      throw apiError(400, `Cannot reduce total copies below the ${issuedCopies} currently issued copies`);
    }
    book.totalCopies = newTotal;
    book.availableCopies = newTotal - issuedCopies;
  }

  if (title !== undefined) book.title = title;
  if (author !== undefined) book.author = author;
  if (isbn !== undefined) book.isbn = isbn;
  if (category !== undefined) book.category = category;
  if (publisher !== undefined) book.publisher = publisher;
  if (description !== undefined) book.description = description;
  if (coverImage !== undefined) book.coverImage = coverImage;
  if (publicationYear !== undefined) {
    const year = Number(publicationYear);
    if (Number.isNaN(year) || year < 1000 || year > new Date().getFullYear()) {
      throw apiError(400, 'Please provide a valid publication year');
    }
    book.publicationYear = year;
  }

  const updated = await book.save();
  res.json({ success: true, data: updated, message: 'Book updated successfully' });
});

// @route DELETE /api/books/:id
const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) throw apiError(404, 'Book not found');

  const activeIssues = await Transaction.countDocuments({ book: book._id, returnDate: null });
  if (activeIssues > 0) {
    throw apiError(400, `Cannot delete: this book has ${activeIssues} active issue(s). Collect the returns first.`);
  }

  await book.deleteOne();
  res.json({ success: true, message: 'Book deleted successfully' });
});

module.exports = { getBooks, getBookById, createBook, updateBook, deleteBook };
