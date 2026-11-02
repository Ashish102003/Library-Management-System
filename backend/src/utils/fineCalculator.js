const FINE_PER_DAY = Number(process.env.FINE_PER_DAY || 10);

const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Parses "YYYY-MM-DD" strings as local dates so day math never shifts across timezones
const parseDate = (value) => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(value);
};

const getLateDays = (dueDate, returnDate) => {
  const diff = startOfDay(returnDate) - startOfDay(dueDate);
  return diff > 0 ? Math.floor(diff / DAY_MS) : 0;
};

const calculateFine = (dueDate, returnDate) => getLateDays(dueDate, returnDate) * FINE_PER_DAY;

const isOverdue = (transaction) =>
  !transaction.returnDate && startOfDay(new Date()) > startOfDay(transaction.dueDate);

const getCurrentFine = (transaction) => {
  if (transaction.returnDate) return transaction.fine || 0;
  return isOverdue(transaction) ? calculateFine(transaction.dueDate, new Date()) : 0;
};

const getDisplayStatus = (transaction) => {
  if (transaction.returnDate) return 'returned';
  return isOverdue(transaction) ? 'overdue' : 'issued';
};

const decorateTransaction = (transaction) => {
  const plain = typeof transaction.toObject === 'function' ? transaction.toObject() : { ...transaction };
  return {
    ...plain,
    displayStatus: getDisplayStatus(plain),
    currentFine: getCurrentFine(plain),
  };
};

module.exports = {
  FINE_PER_DAY,
  parseDate,
  getLateDays,
  calculateFine,
  isOverdue,
  getCurrentFine,
  getDisplayStatus,
  decorateTransaction,
};
