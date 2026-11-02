const Transaction = require('../models/Transaction');
const Book = require('../models/Book');
const Member = require('../models/Member');
const { asyncHandler, apiError } = require('../middleware/errorMiddleware');
const { calculateFine, isOverdue, decorateTransaction, parseDate } = require('../utils/fineCalculator');

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const startOfDay = (d) => {
  const date = parseDate(d);
  date.setHours(0, 0, 0, 0);
  return date;
};

// Resolves the member record that belongs to a logged-in member user
const resolveMemberId = async (req) => {
  if (req.user.role !== 'member') return null;
  const member = await Member.findOne({ user: req.user.id });
  if (!member) throw apiError(404, 'No member profile is linked to this account');
  return member._id;
};

// @route GET /api/transactions
const getTransactions = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
  const { status, search, memberId, bookId, dateFrom, dateTo } = req.query;

  const query = {};
  const forcedMemberId = await resolveMemberId(req);
  if (forcedMemberId) query.member = forcedMemberId;

  if (!forcedMemberId && memberId && memberId !== 'all') query.member = memberId;
  if (bookId && bookId !== 'all') query.book = bookId;

  if (status === 'returned') {
    query.returnDate = { $ne: null };
  } else if (status === 'issued') {
    query.returnDate = null;
  } else if (status === 'overdue') {
    query.returnDate = null;
    query.dueDate = { $lt: startOfDay(new Date()) };
  }

  if (dateFrom || dateTo) {
    query.issueDate = {};
    if (dateFrom) query.issueDate.$gte = new Date(dateFrom);
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      query.issueDate.$lte = end;
    }
  }

  if (search && search.trim()) {
    const rx = new RegExp(escapeRegex(search.trim()), 'i');
    const [members, books] = await Promise.all([
      Member.find({ $or: [{ name: rx }, { membershipId: rx }, { email: rx }] }).select('_id'),
      Book.find({ $or: [{ title: rx }, { isbn: rx }, { author: rx }] }).select('_id'),
    ]);
    query.$or = [
      { member: { $in: members.map((m) => m._id) } },
      { book: { $in: books.map((b) => b._id) } },
    ];
  }

  const total = await Transaction.countDocuments(query);
  const transactions = await Transaction.find(query)
    .populate('book', 'title author isbn coverImage')
    .populate('member', 'name membershipId email')
    .sort({ createdAt: -1, issueDate: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    success: true,
    data: transactions.map(decorateTransaction),
    pagination: { page, pages: Math.ceil(total / limit), total, limit },
  });
});

// @route GET /api/transactions/overdue
const getOverdue = asyncHandler(async (req, res) => {
  const query = { returnDate: null, dueDate: { $lt: startOfDay(new Date()) } };
  const forcedMemberId = await resolveMemberId(req);
  if (forcedMemberId) query.member = forcedMemberId;

  const transactions = await Transaction.find(query)
    .populate('book', 'title author isbn coverImage')
    .populate('member', 'name membershipId email')
    .sort({ dueDate: 1 });

  res.json({ success: true, data: transactions.map(decorateTransaction) });
});

// @route POST /api/transactions/issue
const issueBook = asyncHandler(async (req, res) => {
  const { memberId, bookId, issueDate, dueDate } = req.body;

  if (!memberId || !bookId || !issueDate || !dueDate) {
    throw apiError(400, 'Member, book, issue date and due date are required');
  }

  const member = await Member.findById(memberId);
  if (!member) throw apiError(404, 'Member not found');

  const book = await Book.findById(bookId);
  if (!book) throw apiError(404, 'Book not found');

  const issue = startOfDay(issueDate);
  const due = startOfDay(dueDate);
  if (Number.isNaN(issue.getTime()) || Number.isNaN(due.getTime())) {
    throw apiError(400, 'Please provide valid dates');
  }
  if (due < issue) throw apiError(400, 'Due date cannot be before the issue date');

  if (book.availableCopies <= 0) {
    throw apiError(400, `"${book.title}" is currently unavailable (0 copies left)`);
  }

  const duplicate = await Transaction.findOne({
    book: book._id,
    member: member._id,
    returnDate: null,
  });
  if (duplicate) {
    throw apiError(400, `${member.name} already has an active issue for "${book.title}"`);
  }

  const transaction = await Transaction.create({
    book: book._id,
    member: member._id,
    issueDate: issue,
    dueDate: due,
    status: 'issued',
  });

  book.availableCopies -= 1;
  await book.save();

  const populated = await transaction.populate([
    { path: 'book', select: 'title author isbn coverImage' },
    { path: 'member', select: 'name membershipId email' },
  ]);

  res.status(201).json({
    success: true,
    data: decorateTransaction(populated),
    message: `"${book.title}" issued to ${member.name} successfully`,
  });
});

// @route PUT /api/transactions/:id/return
const returnBook = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);
  if (!transaction) throw apiError(404, 'Transaction not found');

  if (transaction.returnDate) throw apiError(400, 'This book has already been returned');

  const member = await Member.findOne({ user: req.user.id });
  if (req.user.role === 'member' && (!member || !member._id.equals(transaction.member))) {
    throw apiError(403, 'You can only return your own books');
  }

  const returnDate = req.body.returnDate ? startOfDay(req.body.returnDate) : startOfDay(new Date());
  if (Number.isNaN(returnDate.getTime())) throw apiError(400, 'Please provide a valid return date');
  if (returnDate < startOfDay(transaction.issueDate)) throw apiError(400, 'Return date cannot be before the issue date');

  const book = await Book.findById(transaction.book);

  transaction.returnDate = returnDate;
  transaction.status = 'returned';
  transaction.fine = calculateFine(transaction.dueDate, returnDate);
  transaction.finePaid = transaction.fine === 0;
  await transaction.save();

  if (book) {
    book.availableCopies = Math.min(book.availableCopies + 1, book.totalCopies);
    await book.save();
  }

  const populated = await transaction.populate([
    { path: 'book', select: 'title author isbn coverImage' },
    { path: 'member', select: 'name membershipId email' },
  ]);

  const fineMessage = transaction.fine > 0 ? ` Fine collected: ₹${transaction.fine}` : '';
  res.json({
    success: true,
    data: decorateTransaction(populated),
    message: `Book returned successfully.${fineMessage}`,
  });
});

// @route PUT /api/transactions/:id/pay-fine
const payFine = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);
  if (!transaction) throw apiError(404, 'Transaction not found');
  if (!transaction.returnDate) throw apiError(400, 'Fine can only be settled after the book is returned');
  if (transaction.fine <= 0) throw apiError(400, 'No fine is due on this transaction');

  transaction.finePaid = true;
  await transaction.save();

  res.json({ success: true, data: decorateTransaction(transaction), message: 'Fine marked as paid' });
});

// @route GET /api/transactions/stats/fines  (admin)
const getFineSummary = asyncHandler(async (req, res) => {
  const [paidAgg, unpaidAgg] = await Promise.all([
    Transaction.aggregate([
      { $match: { finePaid: true, fine: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$fine' } } },
    ]),
    Transaction.aggregate([
      { $match: { returnDate: { $ne: null }, finePaid: false, fine: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$fine' }, count: { $sum: 1 } } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      collected: paidAgg[0]?.total || 0,
      outstanding: unpaidAgg[0]?.total || 0,
      unpaidCount: unpaidAgg[0]?.count || 0,
      perDay: Number(process.env.FINE_PER_DAY || 10),
    },
  });
});

module.exports = { getTransactions, getOverdue, issueBook, returnBook, payFine, getFineSummary };
