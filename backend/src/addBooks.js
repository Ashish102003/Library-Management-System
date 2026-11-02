require('dotenv').config();
const dns = require('dns');

// Some local DNS stubs (e.g. 127.0.0.1) refuse SRV lookups, which breaks
// mongodb+srv:// resolution. Fall back to public resolvers only in that case.
const currentServers = dns.getServers();
if (currentServers.length === 0 || currentServers.every((s) => s === '127.0.0.1' || s === '::1')) {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch {
    // Ignore — the default resolver will be used.
  }
}

const connectDB = require('./config/db');
const Book = require('./models/Book');

// Additive, idempotent catalogue expansion.
// Safe to run repeatedly: existing ISBNs are skipped, nothing is deleted or overwritten.
const newBooks = [
  // Programming
  {
    title: 'The Clean Coder',
    author: 'Robert C. Martin',
    isbn: '9780137081073',
    category: 'Programming',
    publisher: 'Prentice Hall',
    publicationYear: 2011,
    totalCopies: 5,
    description: 'A code of conduct for professional programmers, covering discipline, craft and ethics.',
  },
  {
    title: 'Refactoring: Improving the Design of Existing Code',
    author: 'Martin Fowler',
    isbn: '9780134757599',
    category: 'Programming',
    publisher: 'Addison-Wesley',
    publicationYear: 2018,
    totalCopies: 4,
    description: 'A catalog of refactorings and the principles behind safely improving legacy code.',
  },
  {
    title: 'Head First Design Patterns',
    author: 'Eric Freeman',
    isbn: '9781492078005',
    category: 'Programming',
    publisher: "O'Reilly Media",
    publicationYear: 2020,
    totalCopies: 6,
    description: 'A brain-friendly introduction to reusable object-oriented design patterns.',
  },

  // Database
  {
    title: 'SQL in 10 Minutes a Day',
    author: 'Ben Forta',
    isbn: '9780135182796',
    category: 'Database',
    publisher: 'Sams Publishing',
    publicationYear: 2019,
    totalCopies: 7,
    description: 'Short, focused lessons that teach practical SQL one day at a time.',
  },
  {
    title: 'Database System Concepts',
    author: 'Abraham Silberschatz',
    isbn: '9780078022159',
    category: 'Database',
    publisher: 'McGraw-Hill',
    publicationYear: 2019,
    totalCopies: 4,
    description: 'A comprehensive foundation in relational design, transactions and storage.',
  },
  {
    title: 'Seven Databases in Seven Weeks',
    author: 'Luc Perkins',
    isbn: '9781680502534',
    category: 'Database',
    publisher: 'Pragmatic Bookshelf',
    publicationYear: 2018,
    totalCopies: 3,
    description: 'A hands-on tour of modern relational, document and graph databases.',
  },

  // Computer Science
  {
    title: 'Computer Science Distilled',
    author: 'Wladston Ferreira Filho',
    isbn: '9780997316025',
    category: 'Computer Science',
    publisher: 'Code Energy',
    publicationYear: 2017,
    totalCopies: 5,
    description: 'A friendly, illustrated introduction to the fundamental ideas of computing.',
  },
  {
    title: 'Structure and Interpretation of Computer Programs',
    author: 'Harold Abelson',
    isbn: '9780262510875',
    category: 'Computer Science',
    publisher: 'MIT Press',
    publicationYear: 1996,
    totalCopies: 3,
    description: 'The classic exploration of abstraction, recursion and programming languages.',
  },
  {
    title: 'Code: The Hidden Language of Computer Hardware and Software',
    author: 'Charles Petzold',
    isbn: '9780735611313',
    category: 'Computer Science',
    publisher: 'Microsoft Press',
    publicationYear: 2000,
    totalCopies: 4,
    description: 'From Morse code to machine instructions, how computers truly work.',
  },

  // Fiction
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '9780743273565',
    category: 'Fiction',
    publisher: 'Scribner',
    publicationYear: 2004,
    totalCopies: 6,
    description: 'A glittering, tragic portrait of ambition and longing in the Jazz Age.',
  },
  {
    title: 'The Kite Runner',
    author: 'Khaled Hosseini',
    isbn: '9781594631931',
    category: 'Fiction',
    publisher: 'Riverhead Books',
    publicationYear: 2003,
    totalCopies: 7,
    description: 'A story of friendship, betrayal and redemption set across Afghanistan and America.',
  },
  {
    title: 'Things Fall Apart',
    author: 'Chinua Achebe',
    isbn: '9780385474542',
    category: 'Fiction',
    publisher: 'Anchor Books',
    publicationYear: 1994,
    totalCopies: 5,
    description: 'A landmark novel of Igbo life and the upheaval of colonialism.',
  },

  // Science
  {
    title: 'Cosmos',
    author: 'Carl Sagan',
    isbn: '9780345539434',
    category: 'Science',
    publisher: 'Ballantine Books',
    publicationYear: 1980,
    totalCopies: 5,
    description: 'A sweeping journey through the universe and humanity’s place within it.',
  },
  {
    title: 'On the Origin of Species',
    author: 'Charles Darwin',
    isbn: '9780451529060',
    category: 'Science',
    publisher: 'Signet Classics',
    publicationYear: 2003,
    totalCopies: 4,
    description: 'The foundational work on natural selection and the evolution of life.',
  },
  {
    title: 'The Double Helix',
    author: 'James D. Watson',
    isbn: '9780743216302',
    category: 'Science',
    publisher: 'Touchstone',
    publicationYear: 2001,
    totalCopies: 3,
    description: 'A candid personal account of the race to discover the structure of DNA.',
  },

  // History
  {
    title: 'The Silk Roads: A New History of the World',
    author: 'Peter Frankopan',
    isbn: '9781101912379',
    category: 'History',
    publisher: 'Vintage',
    publicationYear: 2016,
    totalCopies: 5,
    description: 'A reimagining of world history centred on the trade routes of the East.',
  },
  {
    title: 'SPQR: A History of Ancient Rome',
    author: 'Mary Beard',
    isbn: '9781631492228',
    category: 'History',
    publisher: 'Liveright',
    publicationYear: 2015,
    totalCopies: 4,
    description: 'A vivid, authoritative account of the rise and reach of Rome.',
  },
  {
    title: 'The Wright Brothers',
    author: 'David McCullough',
    isbn: '9781476728759',
    category: 'History',
    publisher: 'Simon & Schuster',
    publicationYear: 2015,
    totalCopies: 3,
    description: 'The dramatic story of the two men who taught the world to fly.',
  },

  // Self Help
  {
    title: 'How to Win Friends and Influence People',
    author: 'Dale Carnegie',
    isbn: '9780671027032',
    category: 'Self Help',
    publisher: 'Simon & Schuster',
    publicationYear: 2009,
    totalCopies: 8,
    description: 'Timeless principles for building relationships and communicating well.',
  },
  {
    title: 'The 7 Habits of Highly Effective People',
    author: 'Stephen R. Covey',
    isbn: '9780743269513',
    category: 'Self Help',
    publisher: 'Free Press',
    publicationYear: 2004,
    totalCopies: 6,
    description: 'A principle-centred approach to personal and professional effectiveness.',
  },
  {
    title: "Man's Search for Meaning",
    author: 'Viktor E. Frankl',
    isbn: '9780807014295',
    category: 'Self Help',
    publisher: 'Beacon Press',
    publicationYear: 2006,
    totalCopies: 5,
    description: 'A psychiatrist’s reflection on purpose and resilience amid suffering.',
  },

  // Business
  {
    title: 'Zero to One',
    author: 'Peter Thiel',
    isbn: '9780804139298',
    category: 'Business',
    publisher: 'Crown Business',
    publicationYear: 2014,
    totalCopies: 5,
    description: 'Notes on startups, monopoly and building the future through innovation.',
  },
  {
    title: 'Good to Great',
    author: 'Jim Collins',
    isbn: '9780066620992',
    category: 'Business',
    publisher: 'HarperBusiness',
    publicationYear: 2001,
    totalCopies: 4,
    description: 'Why some companies make the leap to enduring greatness and others do not.',
  },
  {
    title: 'The Lean Startup',
    author: 'Eric Ries',
    isbn: '9780307887894',
    category: 'Business',
    publisher: 'Crown Business',
    publicationYear: 2011,
    totalCopies: 6,
    description: 'How today’s entrepreneurs use continuous innovation to build businesses.',
  },

  // Mathematics
  {
    title: 'Concrete Mathematics',
    author: 'Ronald L. Graham',
    isbn: '9780201558029',
    category: 'Mathematics',
    publisher: 'Addison-Wesley',
    publicationYear: 1994,
    totalCopies: 3,
    description: 'A foundation for computer science built on sums, recurrences and proofs.',
  },
  {
    title: 'Linear Algebra Done Right',
    author: 'Sheldon Axler',
    isbn: '9783319110790',
    category: 'Mathematics',
    publisher: 'Springer',
    publicationYear: 2015,
    totalCopies: 4,
    description: 'A clean, determinant-free treatment of vector spaces and operators.',
  },
  {
    title: 'The Art of Statistics',
    author: 'David Spiegelhalter',
    isbn: '9780241258767',
    category: 'Mathematics',
    publisher: 'Pelican',
    publicationYear: 2019,
    totalCopies: 4,
    description: 'How to learn from data and reason clearly about uncertainty.',
  },

  // Artificial Intelligence
  {
    title: 'Artificial Intelligence: A Modern Approach',
    author: 'Stuart Russell',
    isbn: '9780134610993',
    category: 'Artificial Intelligence',
    publisher: 'Pearson',
    publicationYear: 2020,
    totalCopies: 5,
    description: 'The leading textbook on intelligent agents, search, learning and reasoning.',
  },
  {
    title: 'Deep Learning',
    author: 'Ian Goodfellow',
    isbn: '9780262035613',
    category: 'Artificial Intelligence',
    publisher: 'MIT Press',
    publicationYear: 2016,
    totalCopies: 4,
    description: 'A rigorous introduction to neural networks and representation learning.',
  },
  {
    title: 'Life 3.0',
    author: 'Max Tegmark',
    isbn: '9781101946596',
    category: 'Artificial Intelligence',
    publisher: 'Knopf',
    publicationYear: 2017,
    totalCopies: 4,
    description: 'Being human in the age of artificial intelligence, and where it may lead.',
  },
];

const run = async () => {
  await connectDB();

  const before = await Book.countDocuments();
  console.log(`Books before: ${before}`);

  const isbns = newBooks.map((b) => b.isbn);
  const existing = await Book.find({ isbn: { $in: isbns } }).select('isbn');
  const existingSet = new Set(existing.map((b) => b.isbn));

  const toInsert = newBooks
    .filter((b) => !existingSet.has(b.isbn))
    .map((b) => ({
      ...b,
      availableCopies: b.totalCopies,
      coverImage: `https://covers.openlibrary.org/b/isbn/${b.isbn}-M.jpg`,
    }));

  const skipped = newBooks.length - toInsert.length;

  let inserted = 0;
  for (const doc of toInsert) {
    try {
      await Book.create(doc);
      inserted += 1;
    } catch (err) {
      if (err && err.code === 11000) {
        console.log(`Skipped duplicate ISBN ${doc.isbn}`);
      } else {
        throw err;
      }
    }
  }

  const after = await Book.countDocuments();
  console.log(`Inserted: ${inserted}`);
  console.log(`Skipped (already present): ${skipped}`);
  console.log(`Books after: ${after}`);
  console.log(`Net change: ${after - before}`);

  process.exit(0);
};

run().catch((err) => {
  console.error('Add books failed:', err);
  process.exit(1);
});
