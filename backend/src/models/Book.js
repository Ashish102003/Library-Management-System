const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    author: { type: String, required: [true, 'Author is required'], trim: true },
    isbn: {
      type: String,
      required: [true, 'ISBN is required'],
      unique: true,
      trim: true,
    },
    category: { type: String, required: [true, 'Category is required'], trim: true },
    publisher: { type: String, default: '', trim: true },
    publicationYear: {
      type: Number,
      required: [true, 'Publication year is required'],
      min: [1000, 'Invalid publication year'],
      max: [new Date().getFullYear(), 'Publication year cannot be in the future'],
    },
    totalCopies: {
      type: Number,
      required: [true, 'Total copies are required'],
      min: [1, 'Total copies must be at least 1'],
    },
    availableCopies: {
      type: Number,
      required: true,
      min: [0, 'Available copies cannot be negative'],
      default: 0,
    },
    description: { type: String, default: '', trim: true },
    coverImage: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

bookSchema.virtual('status').get(function () {
  return this.availableCopies > 0 ? 'available' : 'out_of_stock';
});

bookSchema.set('toJSON', { virtuals: true });
bookSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Book', bookSchema);
