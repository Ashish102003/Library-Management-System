const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    issueDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date, default: null },
    status: { type: String, enum: ['issued', 'returned'], default: 'issued' },
    fine: { type: Number, default: 0, min: 0 },
    finePaid: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
