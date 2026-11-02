const Book = require('../models/Book');
const Member = require('../models/Member');
const Transaction = require('../models/Transaction');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { getCurrentFine, isOverdue, decorateTransaction } = require('../utils/fineCalculator');

const startOfDay = (d) => {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  return date;
};

// @route GET /api/dashboard/stats
const getStats = asyncHandler(async (req, res) => {
  if (req.user.role === 'member') {
    const member = await Member.findOne({ user: req.user.id });
    if (!member) {
      return res.json({ success: true, data: { role: 'member', message: 'No member profile linked' } });
    }

    const today = startOfDay(new Date());
    const active = await Transaction.find({ member: member._id, returnDate: null });
    const overdue = active.filter((t) => isOverdue(t));
    const outstanding = active.reduce((sum, t) => sum + getCurrentFine(t), 0);

    const [bookAgg] = await Promise.all([
      Book.aggregate([{ $group: { _id: null, available: { $sum: '$availableCopies' } } }]),
    ]);

    return res.json({
      success: true,
      data: {
        role: 'member',
        issuedBooks: active.length,
        overdueBooks: overdue.length,
        outstandingFine: outstanding,
        availableBooks: bookAgg[0]?.available || 0,
        nextDueDate: active.length
          ? active.map((t) => t.dueDate).sort((a, b) => a - b)[0]
          : null,
        today,
      },
    });
  }

  const today = startOfDay(new Date());

  const [bookAgg, totalMembers, activeCount, overdueRows, unpaidFineAgg, activeTransactions] =
    await Promise.all([
      Book.aggregate([
        {
          $group: {
            _id: null,
            totalBooks: { $sum: 1 },
            totalCopies: { $sum: '$totalCopies' },
            availableCopies: { $sum: '$availableCopies' },
          },
        },
      ]),
      Member.countDocuments(),
      Transaction.countDocuments({ returnDate: null }),
      Transaction.find({ returnDate: null, dueDate: { $lt: today } }).select('dueDate'),
      Transaction.aggregate([
        { $match: { returnDate: { $ne: null }, finePaid: false, fine: { $gt: 0 } } },
        { $group: { _id: null, total: { $sum: '$fine' } } },
      ]),
      Transaction.find({ returnDate: null }).select('dueDate'),
    ]);

  const dynamicOverdueFine = activeTransactions.reduce((sum, t) => sum + getCurrentFine(t), 0);
  const books = bookAgg[0] || { totalBooks: 0, totalCopies: 0, availableCopies: 0 };

  res.json({
    success: true,
    data: {
      role: 'admin',
      totalBooks: books.totalBooks,
      totalCopies: books.totalCopies,
      availableBooks: books.availableCopies,
      issuedBooks: activeCount,
      totalMembers,
      overdueBooks: overdueRows.length,
      outstandingFine: (unpaidFineAgg[0]?.total || 0) + dynamicOverdueFine,
    },
  });
});

// @route GET /api/dashboard/recent-transactions
const getRecentTransactions = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 8, 20);
  const query = {};

  if (req.user.role === 'member') {
    const member = await Member.findOne({ user: req.user.id });
    query.member = member ? member._id : null;
  }

  const transactions = await Transaction.find(query)
    .populate('book', 'title author isbn coverImage')
    .populate('member', 'name membershipId email')
    .sort({ createdAt: -1 })
    .limit(limit);

  res.json({ success: true, data: transactions.map(decorateTransaction) });
});

// @route GET /api/dashboard/issue-statistics
const getIssueStatistics = asyncHandler(async (req, res) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const rows = await Transaction.aggregate([
    { $match: { issueDate: { $gte: start } } },
    {
      $group: {
        _id: { year: { $year: '$issueDate' }, month: { $month: '$issueDate' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const lookup = new Map(rows.map((r) => [`${r._id.year}-${r._id.month}`, r.count]));
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const stats = [];
  for (let i = 11; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    stats.push({
      month: monthNames[d.getMonth()],
      count: lookup.get(`${d.getFullYear()}-${d.getMonth() + 1}`) || 0,
    });
  }

  res.json({ success: true, data: stats });
});

module.exports = { getStats, getRecentTransactions, getIssueStatistics };
