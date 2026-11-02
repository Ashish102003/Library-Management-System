import { useEffect, useMemo, useState } from 'react';
import { Send, CalendarDays, AlertCircle, CheckCircle2, User, ClipboardList, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button, Field, Select, Input } from '../components/ui/FormControls';
import { LoadingState, ErrorState } from '../components/ui/States';
import StatusBadge from '../components/ui/StatusBadge';
import BookCover from '../components/ui/BookCover';
import Card, { PageHeader } from '../components/ui/Card';
import { toInputDate, addDays, formatDate, formatCurrency, initials } from '../utils/format';
import { DEFAULT_LOAN_DAYS, FINE_PER_DAY } from '../utils/constants';

const StepHeader = ({ step, title, icon: Icon }) => (
  <div className="mb-5 flex items-center gap-3">
    <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold/40 bg-gold-soft/60 font-display text-sm font-semibold text-[#8a6d3b]">
      {step}
    </span>
    <div className="flex items-center gap-2.5">
      <Icon className="h-4 w-4 text-accent" />
      <h3 className="font-display text-lg font-semibold text-navy">{title}</h3>
    </div>
  </div>
);

const SummaryRow = ({ label, value, strong }) => (
  <div className="flex items-start justify-between gap-3 py-2 text-sm">
    <span className="text-muted">{label}</span>
    <span className={`text-right ${strong ? 'font-semibold text-navy' : 'text-ink/80'}`}>{value}</span>
  </div>
);

const IssueBook = () => {
  const toast = useToast();
  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  const [memberId, setMemberId] = useState('');
  const [bookId, setBookId] = useState('');
  const [issueDate, setIssueDate] = useState(toInputDate(new Date()));
  const [dueDate, setDueDate] = useState(toInputDate(addDays(new Date(), DEFAULT_LOAN_DAYS)));
  const [formError, setFormError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [membersRes, booksRes] = await Promise.all([
        api.get('/members', { params: { limit: 50 } }),
        api.get('/books', { params: { limit: 50 } }),
      ]);
      setMembers(membersRes.data.data);
      setBooks(booksRes.data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const selectedMember = useMemo(() => members.find((m) => m._id === memberId), [members, memberId]);
  const selectedBook = useMemo(() => books.find((b) => b._id === bookId), [books, bookId]);

  const loanDays = useMemo(() => {
    if (!issueDate || !dueDate) return null;
    const diff = Math.round((new Date(dueDate) - new Date(issueDate)) / 86400000);
    return Number.isNaN(diff) ? null : diff;
  }, [issueDate, dueDate]);

  const onIssueDateChange = (e) => {
    setIssueDate(e.target.value);
    if (dueDate && e.target.value && dueDate < e.target.value) {
      setDueDate(toInputDate(addDays(new Date(e.target.value), DEFAULT_LOAN_DAYS)));
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSuccess(null);

    if (!memberId) return setFormError('Please select a member');
    if (!bookId) return setFormError('Please select a book');
    if (!issueDate || !dueDate) return setFormError('Please select issue and due dates');
    if (dueDate < issueDate) return setFormError('Due date cannot be before the issue date');

    setSubmitting(true);
    try {
      const { data } = await api.post('/transactions/issue', { memberId, bookId, issueDate, dueDate });
      setSuccess(data);
      toast.success(data.message);
      setBookId('');
      await load();
    } catch (err) {
      setFormError(err.message);
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState label="Loading issue desk..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Circulation Desk"
        title="Issue a book."
        subtitle={
          <>
            Lend a book to a member. Availability is updated automatically and fines are charged at{' '}
            {formatCurrency(FINE_PER_DAY)} per late day.
          </>
        }
      />

      {success && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/80 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div className="text-sm text-emerald-900/90">
            <p className="font-semibold">{success.message}</p>
            <p className="mt-0.5">
              Transaction ID {success.data?._id} · Due {formatDate(success.data?.dueDate)}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={submit} className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card className="p-6">
            <StepHeader step="01" title="Select Member & Book" icon={User} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Member" required>
                <Select value={memberId} onChange={(e) => setMemberId(e.target.value)}>
                  <option value="">— Select member —</option>
                  {members.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.membershipId} · {m.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Book" required>
                <Select value={bookId} onChange={(e) => setBookId(e.target.value)}>
                  <option value="">— Select book —</option>
                  {books.map((b) => (
                    <option key={b._id} value={b._id} disabled={b.availableCopies <= 0}>
                      {b.title} ({b.availableCopies > 0 ? `${b.availableCopies} available` : 'out of stock'})
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </Card>

          <Card className="p-6">
            <StepHeader step="02" title="Issue & Due Dates" icon={CalendarDays} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Issue Date" required>
                <Input type="date" value={issueDate} onChange={onIssueDateChange} />
              </Field>
              <Field label="Due Date" required hint={`Default: issue date + ${DEFAULT_LOAN_DAYS} days`}>
                <Input type="date" value={dueDate} min={issueDate} onChange={(e) => setDueDate(e.target.value)} />
              </Field>
            </div>
            <p className="mt-3 flex items-center gap-2 text-xs text-muted">
              <CalendarDays className="h-4 w-4" /> Loans are {DEFAULT_LOAN_DAYS} days by default. Overdue returns are
              fined {formatCurrency(FINE_PER_DAY)} per day.
            </p>
          </Card>

          {formError && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {formError}
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" loading={submitting} disabled={!memberId || !bookId} size="lg">
              <Send className="h-4 w-4" /> Issue Book
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="border-b border-line/70 bg-ivory/70 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <ClipboardList className="h-4 w-4 text-accent" />
                <h3 className="font-display text-base font-semibold text-navy">Issue Summary</h3>
              </div>
            </div>
            <div className="px-5 py-4">
              <div className="flex items-center gap-3 rounded-xl border border-line/70 bg-ivory/60 p-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[13px] font-bold text-accent">
                  {selectedMember ? initials(selectedMember.name) : '—'}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-navy">
                    {selectedMember ? selectedMember.name : 'No member selected'}
                  </p>
                  <p className="truncate text-xs text-muted">{selectedMember?.membershipId || 'Choose a member in step 01'}</p>
                </div>
              </div>

              <div className="my-3 border-t border-dashed border-line" />

              <div className="flex items-start gap-3">
                <BookCover
                  src={selectedBook?.coverImage}
                  title={selectedBook?.title}
                  className="h-16 w-12"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-navy">
                    {selectedBook ? selectedBook.title : 'No book selected'}
                  </p>
                  <p className="truncate text-xs text-muted">{selectedBook?.author || 'Choose a book in step 01'}</p>
                  {selectedBook && (
                    <div className="mt-2">
                      <StatusBadge status={selectedBook.availableCopies > 0 ? 'available' : 'out_of_stock'}>
                        {selectedBook.availableCopies} / {selectedBook.totalCopies} available
                      </StatusBadge>
                    </div>
                  )}
                </div>
              </div>

              <div className="my-3 border-t border-dashed border-line" />

              <div className="divide-y divide-line/60">
                <SummaryRow label="Issue date" value={issueDate ? formatDate(issueDate) : '—'} />
                <SummaryRow label="Due date" value={dueDate ? formatDate(dueDate) : '—'} />
                <SummaryRow label="Loan length" value={loanDays !== null ? `${loanDays} days` : '—'} />
                <SummaryRow label="Fine per late day" value={formatCurrency(FINE_PER_DAY)} />
                <SummaryRow label="Status on issue" value="Issued" strong />
              </div>

              <div className="mt-4 rounded-xl bg-accent-soft/70 px-4 py-3 text-xs leading-relaxed text-accent">
                <p className="font-semibold">Rules applied automatically</p>
                <ul className="mt-1.5 list-inside list-disc space-y-1">
                  <li>Available copies must be greater than 0</li>
                  <li>Duplicate active issues are blocked</li>
                  <li>Due date cannot precede issue date</li>
                </ul>
              </div>
            </div>
          </Card>

          <div className="flex items-center gap-2.5 px-1 text-xs text-faint">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
            Availability syncs with MongoDB Atlas the moment you issue.
          </div>
        </div>
      </form>
    </div>
  );
};

export default IssueBook;
