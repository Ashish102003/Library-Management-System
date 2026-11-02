import { useEffect, useMemo, useState } from 'react';
import { RotateCcw, AlertTriangle, IndianRupee, CalendarClock, ShieldAlert } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import BookCover from '../components/ui/BookCover';
import Card, { PageHeader, SectionTitle } from '../components/ui/Card';
import { Button, Field, Input } from '../components/ui/FormControls';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States';
import { formatDate, formatCurrency, toInputDate, daysBetween } from '../utils/format';
import { FINE_PER_DAY } from '../utils/constants';

const Th = ({ children }) => (
  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
    {children}
  </th>
);

const Returns = () => {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [returnDate, setReturnDate] = useState(toInputDate(new Date()));
  const [submitting, setSubmitting] = useState(false);
  const [finePerDay, setFinePerDay] = useState(FINE_PER_DAY);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [txRes, fineRes] = await Promise.all([
        api.get('/transactions', { params: { status: 'issued', limit: 50 } }),
        api.get('/transactions/fines/summary'),
      ]);
      setRows(txRes.data.data);
      setFinePerDay(fineRes.data.data.perDay);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openReturn = (t) => {
    setSelected(t);
    setReturnDate(toInputDate(new Date()));
  };

  const lateDays = useMemo(() => {
    if (!selected || !returnDate) return 0;
    return Math.max(daysBetween(selected.dueDate, returnDate), 0);
  }, [selected, returnDate]);

  const fine = lateDays * finePerDay;

  const submit = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      const { data } = await api.put(`/transactions/${selected._id}/return`, { returnDate });
      toast.success(data.message);
      setSelected(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState label="Loading issued books..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const overdueRows = rows.filter((r) => r.displayStatus === 'overdue');
  const overdueCount = overdueRows.length;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Returns Desk"
        title="Bring books home."
        subtitle={`${rows.length} book(s) currently issued · ${overdueCount} overdue`}
        actions={
          overdueCount > 0 ? (
            <div className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm font-semibold text-rose-700">
              <AlertTriangle className="h-4 w-4" /> {overdueCount} overdue item{overdueCount > 1 ? 's' : ''}
            </div>
          ) : null
        }
      />

      {overdueCount > 0 && (
        <div className="overflow-hidden rounded-[18px] border border-rose-200/80 bg-rose-50/60 shadow-soft">
          <div className="flex items-center gap-3 border-b border-rose-200/70 px-5 py-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-rose-500 shadow-sm">
              <ShieldAlert className="h-[18px] w-[18px]" />
            </span>
            <div>
              <h2 className="font-display text-base font-semibold text-rose-800">Attention Required</h2>
              <p className="text-[13px] text-rose-700/80">
                These loans are past their due date — collect them first.
              </p>
            </div>
          </div>
          <div className="divide-y divide-rose-200/60">
            {overdueRows.map((t) => (
              <div key={t._id} className="flex flex-wrap items-center gap-4 px-5 py-3.5">
                <BookCover src={t.book?.coverImage} title={t.book?.title} className="h-11 w-8" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-navy">{t.book?.title || 'Deleted book'}</p>
                  <p className="truncate text-xs text-muted">
                    {t.member?.name} · {t.member?.membershipId}
                  </p>
                </div>
                <p className="text-[13px] text-muted">
                  Due{' '}
                  <span className="font-semibold text-rose-600">{formatDate(t.dueDate)}</span>
                </p>
                <StatusBadge status={t.displayStatus} />
                <Button size="sm" variant="danger" onClick={() => openReturn(t)}>
                  <RotateCcw className="h-3.5 w-3.5" /> Return
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Card>
        <div className="border-b border-line/70 px-5 py-4">
          <SectionTitle
            icon={<RotateCcw className="h-4 w-4" />}
            title="Active Loans"
            subtitle="All books currently out with members"
          />
        </div>
        {rows.length === 0 ? (
          <EmptyState
            icon={<RotateCcw className="h-6 w-6" />}
            title="No active transactions"
            description="All issued books have been returned."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-line/70 text-sm">
              <thead className="bg-ivory/70">
                <tr>
                  <Th>Transaction ID</Th>
                  <Th>Book</Th>
                  <Th>Member</Th>
                  <Th>Issue Date</Th>
                  <Th>Due Date</Th>
                  <Th>Status</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {rows.map((t) => (
                  <tr
                    key={t._id}
                    className={`transition ${
                      t.displayStatus === 'overdue' ? 'bg-rose-50/50 hover:bg-rose-50' : 'hover:bg-ivory/60'
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
                          <p className="truncate text-xs text-muted">{t.book?.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink/80">{t.member?.name}</p>
                      <p className="text-xs text-muted">{t.member?.membershipId}</p>
                    </td>
                    <td className="px-4 py-3 text-muted">{formatDate(t.issueDate)}</td>
                    <td className="px-4 py-3">
                      <span className={t.displayStatus === 'overdue' ? 'font-semibold text-rose-600' : 'text-muted'}>
                        {formatDate(t.dueDate)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={t.displayStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant={t.displayStatus === 'overdue' ? 'danger' : 'primary'}
                        onClick={() => openReturn(t)}
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Return
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Return Book"
        subtitle="Confirm the return date — any fine is calculated automatically."
        size="sm"
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl border border-line/70 bg-ivory/60 p-3">
              <BookCover src={selected.book?.coverImage} title={selected.book?.title} className="h-14 w-10" />
              <div className="min-w-0">
                <p className="truncate font-semibold text-navy">{selected.book?.title}</p>
                <p className="truncate text-sm text-muted">
                  {selected.member?.name} · {selected.member?.membershipId}
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-line/70 bg-ivory/60 p-3">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">Issue Date</dt>
                <dd className="mt-1 font-semibold text-navy">{formatDate(selected.issueDate)}</dd>
              </div>
              <div className="rounded-xl border border-line/70 bg-ivory/60 p-3">
                <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-faint">Due Date</dt>
                <dd className="mt-1 font-semibold text-navy">{formatDate(selected.dueDate)}</dd>
              </div>
            </dl>

            <Field label="Return Date" required>
              <Input
                type="date"
                value={returnDate}
                max={toInputDate(new Date())}
                onChange={(e) => setReturnDate(e.target.value)}
              />
            </Field>

            <div
              className={`rounded-xl border p-4 ${
                lateDays > 0 ? 'border-rose-200 bg-rose-50/80' : 'border-emerald-200 bg-emerald-50/80'
              }`}
            >
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted">
                  <CalendarClock className="h-4 w-4" /> Late Days
                </span>
                <span className={`font-semibold ${lateDays > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {lateDays} day{lateDays === 1 ? '' : 's'}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted">
                  <IndianRupee className="h-4 w-4" /> Fine (₹{finePerDay}/day)
                </span>
                <span className={`font-display text-xl font-semibold ${fine > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {formatCurrency(fine)}
                </span>
              </div>
              <p className="mt-2 text-xs text-faint">
                The fine is calculated automatically — no manual entry required.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setSelected(null)}>
                Cancel
              </Button>
              <Button variant={fine > 0 ? 'danger' : 'success'} loading={submitting} onClick={submit}>
                <RotateCcw className="h-4 w-4" /> Confirm Return
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Returns;
