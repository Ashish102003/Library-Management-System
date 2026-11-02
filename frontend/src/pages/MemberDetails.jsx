import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, IdCard, CalendarDays, IndianRupee, Send, History, BookMarked } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/ui/StatusBadge';
import BookCover from '../components/ui/BookCover';
import Card, { SectionTitle, GoldRule } from '../components/ui/Card';
import { Button } from '../components/ui/FormControls';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States';
import { formatDate, formatCurrency, initials } from '../utils/format';

const InfoTile = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 rounded-xl border border-line/70 bg-ivory/60 px-4 py-3">
    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">{label}</p>
      <p className="mt-0.5 truncate text-sm font-semibold text-navy">{value || '—'}</p>
    </div>
  </div>
);

const Th = ({ children }) => (
  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
    {children}
  </th>
);

const MemberDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/members/${id}`);
      setMember(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <LoadingState label="Loading member..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!member) return <ErrorState message="Member not found" />;

  const hasFine = member.outstandingFine > 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-3.5 py-2 text-sm font-semibold text-navy transition hover:bg-surface"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <Link to="/issue">
          <Button>
            <Send className="h-4 w-4" /> Issue Book to Member
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5">
          <Card className="overflow-hidden">
            <div className="relative bg-navy px-6 pb-14 pt-6">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/30 blur-3xl" />
              <div className="relative flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/40 bg-white/10 text-lg font-bold text-gold">
                  {initials(member.name)}
                </span>
                <div className="min-w-0">
                  <h2 className="truncate font-display text-xl font-semibold text-white">{member.name}</h2>
                  <p className="mt-1 inline-flex items-center rounded-md border border-dashed border-gold/60 bg-white/10 px-2 py-0.5 font-mono text-xs font-semibold text-gold">
                    {member.membershipId}
                  </p>
                </div>
              </div>
            </div>
            <div className="-mt-8 px-6 pb-6">
              <div className="rounded-2xl border border-line/70 bg-white p-4 shadow-soft">
                <div className="space-y-3 text-sm text-muted">
                  <p className="flex items-center gap-2.5 break-all">
                    <Mail className="h-4 w-4 shrink-0 text-faint" /> {member.email}
                  </p>
                  <p className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 shrink-0 text-faint" /> {member.phone}
                  </p>
                  <p className="flex items-center gap-2.5">
                    <CalendarDays className="h-4 w-4 shrink-0 text-faint" /> Joined {formatDate(member.joinedDate)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">Outstanding Fine</p>
                <p className={`mt-2 font-display text-3xl font-semibold ${hasFine ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {formatCurrency(member.outstandingFine)}
                </p>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                  hasFine ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                <IndianRupee className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <GoldRule />
            </div>
            <p className="mt-3 text-xs text-muted">
              {hasFine ? 'Pending dues, payable at the library desk' : 'No pending dues'}
            </p>
          </Card>
        </div>

        <div className="space-y-5 lg:col-span-2">
          <Card>
            <div className="border-b border-line/70 px-5 py-4">
              <SectionTitle
                icon={<BookMarked className="h-4 w-4" />}
                title="Currently Issued Books"
                subtitle={`${member.activeTransactions.length} active loan(s)`}
              />
            </div>
            {member.activeTransactions.length === 0 ? (
              <EmptyState icon={<Send className="h-6 w-6" />} title="No books currently issued" />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-line/70 text-sm">
                  <thead className="bg-ivory/70">
                    <tr>
                      <Th>Book</Th>
                      <Th>Issue Date</Th>
                      <Th>Due Date</Th>
                      <Th>Status</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60">
                    {member.activeTransactions.map((t) => (
                      <tr key={t._id} className="transition hover:bg-ivory/60">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <BookCover src={t.book?.coverImage} title={t.book?.title} className="h-11 w-8" />
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-navy">{t.book?.title || 'Deleted book'}</p>
                              <p className="truncate text-xs text-muted">{t.book?.author}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted">{formatDate(t.issueDate)}</td>
                        <td className="px-4 py-3 text-muted">{formatDate(t.dueDate)}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={t.displayStatus} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card>
            <div className="border-b border-line/70 px-5 py-4">
              <SectionTitle
                icon={<History className="h-4 w-4" />}
                title="Transaction History"
                subtitle={`${member.history.length} completed loan(s)`}
              />
            </div>
            {member.history.length === 0 ? (
              <EmptyState icon={<IdCard className="h-6 w-6" />} title="No past transactions" />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-line/70 text-sm">
                  <thead className="bg-ivory/70">
                    <tr>
                      <Th>Book</Th>
                      <Th>Issue Date</Th>
                      <Th>Return Date</Th>
                      <Th>Fine</Th>
                      <Th>Status</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60">
                    {member.history.map((t) => (
                      <tr key={t._id} className="transition hover:bg-ivory/60">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-navy">{t.book?.title || 'Deleted book'}</p>
                        </td>
                        <td className="px-4 py-3 text-muted">{formatDate(t.issueDate)}</td>
                        <td className="px-4 py-3 text-muted">{formatDate(t.returnDate)}</td>
                        <td className="px-4 py-3">
                          {t.fine > 0 ? (
                            <span className={`font-semibold ${t.finePaid ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {formatCurrency(t.fine)}
                            </span>
                          ) : (
                            <span className="text-faint">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={t.displayStatus} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MemberDetails;
