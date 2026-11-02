require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Book = require('./models/Book');
const Member = require('./models/Member');
const Transaction = require('./models/Transaction');
const { calculateFine } = require('./utils/fineCalculator');

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n) => new Date(Date.now() - n * DAY);
const daysFromNow = (n) => new Date(Date.now() + n * DAY);

const books = [
  { title: 'Eloquent JavaScript', author: 'Marijn Haverbeke', isbn: '9781593279509', category: 'Programming', publisher: 'No Starch Press', publicationYear: 2018, totalCopies: 6, description: 'A modern introduction to computational thinking through JavaScript.' },
  { title: 'Clean Code', author: 'Robert C. Martin', isbn: '9780132350884', category: 'Programming', publisher: 'Prentice Hall', publicationYear: 2008, totalCopies: 5, description: 'A handbook of agile software craftsmanship.' },
  { title: 'The Pragmatic Programmer', author: 'Andrew Hunt', isbn: '9780135957059', category: 'Programming', publisher: 'Addison-Wesley', publicationYear: 2019, totalCopies: 4, description: 'Your journey to mastery, 20th anniversary edition.' },
  { title: "You Don't Know JS Yet", author: 'Kyle Simpson', isbn: '9781491904244', category: 'Programming', publisher: "O'Reilly Media", publicationYear: 2019, totalCopies: 3, description: 'Deep dive into the core mechanisms of the JavaScript language.' },
  { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', isbn: '9781449373320', category: 'Database', publisher: "O'Reilly Media", publicationYear: 2017, totalCopies: 4, description: 'The big ideas behind reliable, scalable and maintainable systems.' },
  { title: 'Learning SQL', author: 'Alan Beaulieu', isbn: '9781492057611', category: 'Database', publisher: "O'Reilly Media", publicationYear: 2020, totalCopies: 5, description: 'A practical guide to mastering SQL queries step by step.' },
  { title: 'MongoDB: The Definitive Guide', author: 'Kristina Chodorow', isbn: '9781449344689', category: 'Database', publisher: "O'Reilly Media", publicationYear: 2019, totalCopies: 4, description: 'Managing and evolving your document-oriented database.' },
  { title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '9780061120084', category: 'Fiction', publisher: 'HarperCollins', publicationYear: 1960, totalCopies: 7, description: 'A classic American novel about justice and compassion.' },
  { title: 'The Alchemist', author: 'Paulo Coelho', isbn: '9780062315007', category: 'Fiction', publisher: 'HarperOne', publicationYear: 1988, totalCopies: 8, description: 'A fable about following your personal legend.' },
  { title: '1984', author: 'George Orwell', isbn: '9780451524935', category: 'Fiction', publisher: 'Signet Classics', publicationYear: 1949, totalCopies: 6, description: 'A dystopian social science fiction novel.' },
  { title: 'A Brief History of Time', author: 'Stephen Hawking', isbn: '9780553380163', category: 'Science', publisher: 'Bantam Books', publicationYear: 1998, totalCopies: 4, description: 'From the big bang to black holes, explained for the curious reader.' },
  { title: 'The Selfish Gene', author: 'Richard Dawkins', isbn: '9780198788607', category: 'Science', publisher: 'Oxford University Press', publicationYear: 1976, totalCopies: 3, description: 'A landmark book on evolutionary biology.' },
  { title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', isbn: '9780062316097', category: 'History', publisher: 'Harper', publicationYear: 2015, totalCopies: 6, description: 'A narrative of humanity from the stone age to the modern era.' },
  { title: 'Guns, Germs, and Steel', author: 'Jared Diamond', isbn: '9780393317558', category: 'History', publisher: 'W. W. Norton', publicationYear: 1997, totalCopies: 4, description: 'The fates of human societies and how geography shaped them.' },
  { title: 'Atomic Habits', author: 'James Clear', isbn: '9780735211292', category: 'Self Help', publisher: 'Avery', publicationYear: 2018, totalCopies: 8, description: 'An easy and proven way to build good habits and break bad ones.' },
  { title: 'Deep Work', author: 'Cal Newport', isbn: '9781455586691', category: 'Self Help', publisher: 'Grand Central Publishing', publicationYear: 2016, totalCopies: 5, description: 'Rules for focused success in a distracted world.' },
];

const members = [
  { name: 'Aarav Sharma', email: 'aarav@example.com', phone: '9876543210', membershipId: 'LIB-001' },
  { name: 'Diya Patel', email: 'diya@example.com', phone: '9876543211', membershipId: 'LIB-002' },
  { name: 'Rohan Gupta', email: 'rohan@example.com', phone: '9876543212', membershipId: 'LIB-003' },
  { name: 'Ananya Singh', email: 'ananya@example.com', phone: '9876543213', membershipId: 'LIB-004' },
  { name: 'Kabir Verma', email: 'kabir@example.com', phone: '9876543214', membershipId: 'LIB-005' },
  { name: 'Meera Iyer', email: 'meera@example.com', phone: '9876543215', membershipId: 'LIB-006' },
];

const issueSpecs = [
  { b: 0, m: 0, issue: daysAgo(150), due: daysAgo(136), ret: daysAgo(134), paid: true },
  { b: 1, m: 1, issue: daysAgo(131), due: daysAgo(117), ret: daysAgo(116), paid: false },
  { b: 2, m: 2, issue: daysAgo(112), due: daysAgo(98), ret: daysAgo(95), paid: true },
  { b: 3, m: 3, issue: daysAgo(96), due: daysAgo(82), ret: daysAgo(80), paid: false },
  { b: 4, m: 4, issue: daysAgo(78), due: daysAgo(64), ret: daysAgo(66), paid: true },
  { b: 5, m: 5, issue: daysAgo(66), due: daysAgo(52), ret: daysAgo(50), paid: true },
  { b: 6, m: 0, issue: daysAgo(55), due: daysAgo(41), ret: daysAgo(40), paid: false },
  { b: 7, m: 1, issue: daysAgo(41), due: daysAgo(27), ret: daysAgo(25), paid: true },
  { b: 8, m: 2, issue: daysAgo(31), due: daysAgo(17), ret: daysAgo(14), paid: false },
  { b: 9, m: 3, issue: daysAgo(25), due: daysAgo(11), ret: daysAgo(9), paid: true },
  { b: 10, m: 4, issue: daysAgo(12), due: daysFromNow(2), ret: null },
  { b: 11, m: 5, issue: daysAgo(22), due: daysAgo(8), ret: null },
  { b: 12, m: 0, issue: daysAgo(6), due: daysFromNow(8), ret: null },
  { b: 13, m: 1, issue: daysAgo(19), due: daysAgo(5), ret: null },
  { b: 14, m: 2, issue: daysAgo(3), due: daysFromNow(11), ret: null },
  { b: 15, m: 3, issue: daysAgo(1), due: daysFromNow(13), ret: null },
  { b: 0, m: 4, issue: daysAgo(2), due: daysFromNow(12), ret: null },
  { b: 8, m: 5, issue: daysAgo(9), due: daysFromNow(5), ret: null },
];

const seed = async () => {
  await connectDB();

  console.log('Clearing existing data...');
  await Promise.all([
    Transaction.deleteMany({}),
    Member.deleteMany({}),
    Book.deleteMany({}),
    User.deleteMany({}),
  ]);

  console.log('Creating admin user...');
  await User.create({ name: 'Library Admin', email: 'admin@library.com', password: 'Admin@123', role: 'admin' });

  console.log('Creating members...');
  const createdMembers = [];
  for (const m of members) {
    const user = await User.create({ name: m.name, email: m.email, password: 'Member@123', role: 'member' });
    const member = await Member.create({ ...m, user: user._id, joinedDate: daysAgo(200) });
    createdMembers.push(member);
  }

  console.log('Creating books...');
  const createdBooks = [];
  for (const b of books) {
    const created = await Book.create({
      ...b,
      coverImage: `https://covers.openlibrary.org/b/isbn/${b.isbn}-M.jpg`,
      availableCopies: b.totalCopies,
    });
    createdBooks.push(created);
  }

  console.log('Creating transactions...');
  const activeCounts = new Map();
  for (const spec of issueSpecs) {
    const fine = spec.ret ? calculateFine(spec.due, spec.ret) : 0;
    await Transaction.create({
      book: createdBooks[spec.b]._id,
      member: createdMembers[spec.m]._id,
      issueDate: spec.issue,
      dueDate: spec.due,
      returnDate: spec.ret,
      status: spec.ret ? 'returned' : 'issued',
      fine,
      finePaid: spec.ret ? (spec.paid ?? fine === 0) : false,
    });
    if (!spec.ret) {
      activeCounts.set(spec.b, (activeCounts.get(spec.b) || 0) + 1);
    }
  }

  for (let i = 0; i < createdBooks.length; i += 1) {
    const book = createdBooks[i];
    const active = activeCounts.get(i) || 0;
    book.availableCopies = book.totalCopies - active;
    await book.save();
  }

  console.log('Seed completed successfully.');
  console.log('Admin login -> admin@library.com / Admin@123');
  console.log('Member login -> aarav@example.com / Member@123');
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
