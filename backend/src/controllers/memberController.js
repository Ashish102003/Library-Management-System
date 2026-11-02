const Member = require('../models/Member');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { asyncHandler, apiError } = require('../middleware/errorMiddleware');
const { decorateTransaction } = require('../utils/fineCalculator');

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const generateMembershipId = async () => {
  const last = await Member.findOne({ membershipId: /^LIB-/ })
    .sort({ membershipId: -1 })
    .select('membershipId');
  const lastNum = last ? parseInt(last.membershipId.split('-')[1], 10) : 0;
  return `LIB-${String(lastNum + 1).padStart(3, '0')}`;
};

const activeCountByMember = async (memberIds) => {
  if (!memberIds.length) return new Map();
  const rows = await Transaction.aggregate([
    { $match: { member: { $in: memberIds }, returnDate: null } },
    { $group: { _id: '$member', count: { $sum: 1 } } },
  ]);
  return new Map(rows.map((r) => [r._id.toString(), r.count]));
};

const outstandingFineByMember = async (memberIds, today) => {
  if (!memberIds.length) return new Map();
  const returnedUnpaid = await Transaction.aggregate([
    { $match: { member: { $in: memberIds }, returnDate: { $ne: null }, finePaid: false, fine: { $gt: 0 } } },
    { $group: { _id: '$member', total: { $sum: '$fine' } } },
  ]);
  const overdueActive = await Transaction.aggregate([
    { $match: { member: { $in: memberIds }, returnDate: null, dueDate: { $lt: today } } },
    {
      $group: {
        _id: '$member',
        rows: { $push: { dueDate: '$dueDate' } },
      },
    },
  ]);
  const map = new Map(returnedUnpaid.map((r) => [r._id.toString(), r.total]));
  overdueActive.forEach((r) => {
    const extra = r.rows.reduce((sum, row) => {
      const lateDays = Math.floor((today - new Date(row.dueDate)) / 86400000);
      return sum + (lateDays > 0 ? lateDays * Number(process.env.FINE_PER_DAY || 10) : 0);
    }, 0);
    const key = r._id.toString();
    map.set(key, (map.get(key) || 0) + extra);
  });
  return map;
};

// @route GET /api/members
const getMembers = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
  const { search } = req.query;

  const query = {};
  if (search) {
    const rx = new RegExp(escapeRegex(search.trim()), 'i');
    query.$or = [{ name: rx }, { email: rx }, { membershipId: rx }, { phone: rx }];
  }

  const total = await Member.countDocuments(query);
  const members = await Member.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const ids = members.map((m) => m._id);
  const activeCounts = await activeCountByMember(ids);

  const data = members.map((m) => ({
    ...m.toObject(),
    issuedBooks: activeCounts.get(m._id.toString()) || 0,
  }));

  res.json({
    success: true,
    data,
    pagination: { page, pages: Math.ceil(total / limit), total, limit },
  });
});

// @route GET /api/members/:id
const getMemberById = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id);
  if (!member) throw apiError(404, 'Member not found');

  const [active, history] = await Promise.all([
    Transaction.find({ member: member._id, returnDate: null })
      .populate('book', 'title author isbn coverImage')
      .sort({ issueDate: -1 }),
    Transaction.find({ member: member._id, returnDate: { $ne: null } })
      .populate('book', 'title author isbn coverImage')
      .sort({ returnDate: -1 }),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const outstanding = await outstandingFineByMember([member._id], today);

  res.json({
    success: true,
    data: {
      ...member.toObject(),
      activeTransactions: active.map(decorateTransaction),
      history: history.map(decorateTransaction),
      outstandingFine: outstanding.get(member._id.toString()) || 0,
    },
  });
});

// @route POST /api/members
const createMember = asyncHandler(async (req, res) => {
  const { name, email, phone, membershipId, password } = req.body;

  if (!name || !email || !phone) throw apiError(400, 'Name, email and phone are required');
  if (!/^[0-9+\-\s()]{7,15}$/.test(phone)) throw apiError(400, 'Please provide a valid phone number');
  if (!/^\S+@\S+\.\S+$/.test(email)) throw apiError(400, 'Please provide a valid email');

  const finalMembershipId = (membershipId || '').trim() || (await generateMembershipId());

  const dupMember = await Member.findOne({
    $or: [{ email: email.toLowerCase() }, { membershipId: finalMembershipId }],
  });
  if (dupMember) {
    throw apiError(400, dupMember.email === email.toLowerCase() ? 'A member with this email already exists' : 'This membership ID is already taken');
  }

  const dupUser = await User.findOne({ email: email.toLowerCase() });
  if (dupUser) throw apiError(400, 'A user account with this email already exists');

  const userPassword = password || 'Member@123';
  if (userPassword.length < 6) throw apiError(400, 'Password must be at least 6 characters');

  const user = await User.create({ name, email, password: userPassword, role: 'member' });
  const member = await Member.create({
    name,
    email,
    phone,
    membershipId: finalMembershipId,
    user: user._id,
    joinedDate: req.body.joinedDate || Date.now(),
  });

  res.status(201).json({ success: true, data: member, message: 'Member created successfully' });
});

// @route PUT /api/members/:id
const updateMember = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id);
  if (!member) throw apiError(404, 'Member not found');

  const { name, email, phone, membershipId } = req.body;

  if (email && email.toLowerCase() !== member.email) {
    const dup = await Member.findOne({ email: email.toLowerCase(), _id: { $ne: member._id } });
    if (dup) throw apiError(400, 'A member with this email already exists');
    const dupUser = await User.findOne({ email: email.toLowerCase(), _id: { $ne: member.user } });
    if (dupUser) throw apiError(400, 'A user account with this email already exists');
  }
  if (membershipId && membershipId !== member.membershipId) {
    const dup = await Member.findOne({ membershipId, _id: { $ne: member._id } });
    if (dup) throw apiError(400, 'This membership ID is already taken');
  }
  if (phone && !/^[0-9+\-\s()]{7,15}$/.test(phone)) throw apiError(400, 'Please provide a valid phone number');

  if (name !== undefined) member.name = name;
  if (email !== undefined) member.email = email;
  if (phone !== undefined) member.phone = phone;
  if (membershipId !== undefined) member.membershipId = membershipId;

  const updated = await member.save();

  if (member.user) {
    await User.findByIdAndUpdate(member.user, { name: updated.name, email: updated.email });
  }

  res.json({ success: true, data: updated, message: 'Member updated successfully' });
});

// @route DELETE /api/members/:id
const deleteMember = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id);
  if (!member) throw apiError(404, 'Member not found');

  const activeIssues = await Transaction.countDocuments({ member: member._id, returnDate: null });
  if (activeIssues > 0) {
    throw apiError(400, `Cannot delete: this member has ${activeIssues} book(s) currently issued`);
  }

  if (member.user) await User.findByIdAndDelete(member.user);
  await member.deleteOne();

  res.json({ success: true, message: 'Member deleted successfully' });
});

module.exports = { getMembers, getMemberById, createMember, updateMember, deleteMember };
