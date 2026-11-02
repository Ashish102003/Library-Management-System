import { useEffect, useState } from 'react';
import { Search, Receipt, Eye, Filter, IndianRupee, X, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import useDebounce from '../hooks/useDebounce';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import Pagination from '../components/ui/Pagination';
import BookCover from '../components/ui/BookCover';
import Card, { PageHeader } from '../components/ui/Card';
import { Button, Input, Select } from '../components/ui/FormControls';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States';
import { formatDate, formatCurrency } from '../utils/format';

const statusTabs = [
  { value: 'all', label: 'All' },
  { value: 'issued', label: 'Issued' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'returned', label: 'Returned' },
];

const Th = ({ children }) => (
  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
    {children}
  </th>
);

const Transactions = () => {
  const toast = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState(null);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [memberId, setMemberId] = useState('all');
  const [bookId, setBookId] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);

  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    if (!isAdmin) return;
    Promise.all([
      api.get('/members', { params: { limit: 50 } }),
      api.get('/books', { params: { limit: 50 } }),
    ])
      .then(([m, b]) => {
        setMembers(m.data.data);
        setBooks(b.data.data);
      })
      .catch(() => {});
  }, [isAdmin]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 10, search: debouncedSearch };
      if (status !== 'all') params.status = status;
      if (isAdmin && memberId !== 'all') params.memberId = memberId;
      if (isAdmin && bookId !== 'all') params.bookId = bookId;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const { data } = await api.get('/transactions', { params });
      setRows(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, status, memberId, bookId, dateFrom, dateTo]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, memberId, bookId, dateFrom, dateTo]);

  const resetFilters = () => {
    setSearch('');
    setStatus('all');
    setMemberId('all');
    setBookId('all');
    setDateFrom('');
    setDateTo('');
  };

  const markPaid = async (t) => {
    try {
      const { data } = await api.put(`/transactions/${t._id}/pay-fine`);
      toast.success(data.message);
      setDetail(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const hasFilters =
    search || status !== 'all' || memberId !== 'all' || bookId !== 'all' || dateFrom || dateTo;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Activity Ledger"
        title="Every movement, logged."
        subtitle={`${pagination.total} issue / return records`}
        actions={
          <Button variant="secondary" onClick={resetFilters} disabled={!hasFilters}>
            <X className="h-4 w-4" /> Clear filters
          </Button>
        }
      />

      <Card>
        <div className="space-y-3 border-b border-line/70 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by book, member, ISBN or membership ID"
                className="pl-10"
              />
            </div>
            <div className="flex shrink-0 rounded-xl border border-line bg-ivory p-1">
              {statusTabs.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setStatus(o.value)}
                  className={`rounded-lg px-3.5 py-1.5 text-[13px] font-semibold transition ${
                    status === o.value
                      ? 'bg-white text-accent shadow-sm'
                      : 'text-muted hover:text-navy'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {isAdmin && (
              <>
                <Select value={memberId} onChange={(e) => setMemberId(e.target.value)} className="sm:w-48">
                  <option value="all">All members</option>
                  {members.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.membershipId} · {m.name}
                    </option>
                  ))}
                </Select>
                <Select value={bookId} onChange={(e) => setBookId(e.target.value)} className="sm:w-48">
                  <option value="all">All books</option>
                  {books.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.title}
                    </option>
                  ))}
                </Select>
              </>
            )}
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-faint">
                <Filter className="h-3.5 w-3.5" /> Issued between
              </span>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-40" />
              <span className="text-faint">→</span>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-40" />
            </div>
          </div>
        </div>

        {loading ? (
          <LoadingState label="Loading transactions..." />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<Receipt className="h-6 w-6" />}
            title="No transactions found"
            description={hasFilters ? 'Try adjusting your filters.' : 'Issue a book to create the first transaction.'}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-line/70 text-sm">
                <thead className="bg-ivory/70">
                  <tr>
                    <Th>Transaction ID</Th>
                    <Th>Book</Th>
                    <Th>Member</Th>
                    <Th>Issue Date</Th>
                    <Th>Due Date</Th>
                    <Th>Return Date</Th>
                    <Th>Fine</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {rows.map((t) => (
                    <tr
                      key={t._id}
                      className={`transition ${
                        t.displayStatus === 'overdue' ? 'bg-rose-50/40 hover:bg-rose-50/70' : 'hover:bg-ivory/60'
                      }`}
                    >
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-muted">
                        {t._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <BookCover src={t.book?.coverImage} title={t.book?.title} />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-navy">{t.book?.title || 'Deleted book'}</p>
                            <p className="truncate text-xs text-muted">{t.book?.isbn}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-ink/80">{t.member?.name || 'Deleted member'}</p>
                        <p className="text-xs text-muted">{t.member?.membershipId}</p>
                      </td>
                      <td className="px-4 py-3 text-muted">{formatDate(t.issueDate)}</td>
                      <td className="px-4 py-3 text-muted">{formatDate(t.dueDate)}</td>
                      <td className="px-4 py-3 text-muted">{formatDate(t.returnDate)}</td>
                      <td className="px-4 py-3">
                        {t.currentFine > 0 ? (
                          <span className="font-semibold text-rose-600">{formatCurrency(t.currentFine)}</span>
                        ) : (
                          <span className="text-faint">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <StatusBadge status={t.displayStatus} />
                          {t.displayStatus === 'returned' && t.fine > 0 && (
                            <StatusBadge status={t.finePaid ? 'paid' : 'unpaid'}>
                              {t.finePaid ? 'Fine Paid' : 'Fine Due'}
                            </StatusBadge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setDetail(t)}
                            className="rounded-lg p-2 text-muted transition hover:bg-accent-soft hover:text-accent"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {isAdmin && t.displayStatus === 'returned' && t.fine > 0 && !t.finePaid && (
                            <button
                              onClick={() => markPaid(t)}
                              className="rounded-lg p-2 text-muted transition hover:bg-emerald-50 hover:text-emerald-600"
                              title="Mark fine as paid"
                            >
                              <IndianRupee className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onPageChange={setPage} />
          </>
        )}
      </Card>

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title="Transaction Details"
        subtitle="Full record of this circulation entry."
        size="sm"
      >
        {detail && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl border border-line/70 bg-ivory/60 p-3">
              <BookCover src={detail.book?.coverImage} title={detail.book?.title} className="h-14 w-10" />
              <div className="min-w-0">
                <p className="truncate font-semibold text-navy">{detail.book?.title || 'Deleted book'}</p>
                <p className="truncate text-sm text-muted">
                  {detail.member?.name} · {detail.member?.membershipId}
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Transaction ID', detail._id.slice(-10).toUpperCase()],
                ['Status', null],
                ['Issue Date', formatDate(detail.issueDate)],
                ['Due Date', formatDate(detail.dueDate)],
                ['Return Date', formatDate(detail.returnDate)],
                ['Fine', formatCurrency(detail.currentFine)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-line/70 bg-ivory/60 p-3">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">{label}</dt>
                  <dd className="mt-1 font-semibold text-navy">
                    {value === null ? <StatusBadge status={detail.displayStatus} /> : value}
                  </dd>
                </div>
              ))}
            </dl>

            {detail.displayStatus === 'returned' && detail.fine > 0 && (
              <div
                className={`rounded-xl border p-3.5 text-sm ${
                  detail.finePaid
                    ? 'border-emerald-200 bg-emerald-50/80 text-emerald-800'
                    : 'border-rose-200 bg-rose-50/80 text-rose-800'
                }`}
              >
                Fine of {formatCurrency(detail.fine)} is {detail.finePaid ? 'settled' : 'still due'}.
                {isAdmin && !detail.finePaid && (
                  <button onClick={() => markPaid(detail)} className="ml-2 inline-flex items-center gap-1 font-semibold underline">
                    Mark as paid <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}

            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setDetail(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Transactions;
