import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Library,
  Users,
  Send,
  AlertTriangle,
  IndianRupee,
  Plus,
  UserPlus,
  ArrowLeftRight,
  CalendarClock,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/ui/StatusBadge';
import BookCover from '../components/ui/BookCover';
import Card, { PageHeader, SectionTitle, GoldRule, Eyebrow } from '../components/ui/Card';
import { SkeletonCard, SkeletonRows, ErrorState, EmptyState } from '../components/ui/States';
import { formatDate, formatCurrency } from '../utils/format';

const StatCard = ({ icon: Icon, label, value, sub, tint }) => (
  <Card hover className="p-5 sm:p-6">
    <div className="flex items-start justify-between gap-3">
      <p className="pt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">{label}</p>
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tint}`}>
        <Icon className="h-[18px] w-[18px]" />
      </span>
    </div>
    <p className="mt-4 font-display text-[34px] font-bold leading-none text-navy">{value}</p>
    <p className="mt-2.5 text-[13px] text-muted">{sub}</p>
  </Card>
);

const ActivityRow = ({ t, showMember }) => (
  <div className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-ivory/60">
    <BookCover src={t.book?.coverImage} title={t.book?.title} className="h-12 w-9" />
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold text-navy">{t.book?.title || 'Deleted book'}</p>
      <p className="truncate text-xs text-muted">{t.book?.author || '—'}</p>
    </div>
    {showMember && (
      <div className="hidden min-w-0 flex-1 sm:block">
        <p className="truncate text-sm font-medium text-ink/80">{t.member?.name || 'Deleted member'}</p>
        <p className="truncate text-xs text-faint">{t.member?.membershipId}</p>
      </div>
    )}
    <div className={`hidden w-24 text-[13px] text-muted md:block ${showMember ? '' : 'flex-1'}`}>
      {formatDate(t.issueDate)}
    </div>
    <StatusBadge status={t.displayStatus} />
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [chart, setChart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, recentRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/recent-transactions?limit=8'),
      ]);
      setStats(statsRes.data.data);
      setRecent(recentRes.data.data);
      if (statsRes.data.data.role === 'admin') {
        const chartRes = await api.get('/dashboard/issue-statistics');
        setChart(chartRes.data.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isAdmin = user?.role === 'admin';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-[20px] border border-line/70 bg-white p-7 shadow-soft">
          <SkeletonCard />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="rounded-[18px] border border-line/70 bg-white shadow-soft">
          <SkeletonRows rows={5} />
        </div>
      </div>
    );
  }
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[20px] border border-line/70 bg-white p-6 shadow-soft sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-accent-soft blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-40 h-56 w-56 rounded-full bg-gold-soft blur-3xl" />
        <div className="pointer-events-none absolute right-6 top-6 h-16 w-16 rounded-2xl border border-accent/15 bg-accent/[0.06] sm:right-10 sm:top-10" />
        <div className="pointer-events-none absolute right-[5.5rem] top-16 hidden h-3 w-3 rounded-full bg-gold sm:block" />

        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="min-w-0">
            <Eyebrow>{today}</Eyebrow>
            <h2 className="font-display text-[28px] font-bold leading-tight text-navy sm:text-[34px]">
              {greeting}, {user?.name?.split(' ')[0]}.
            </h2>
            <div className="mt-3">
              <GoldRule />
            </div>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
              {isAdmin
                ? "Your library is thriving. Here's today's overview of your collection and circulation."
                : 'Welcome back to your reading desk. Here is an overview of your loans and dues.'}
            </p>
          </div>

          {isAdmin && (
            <div className="flex shrink-0 flex-wrap gap-2.5">
              <Link
                to="/books?add=1"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-[0_2px_10px_rgba(228,61,18,0.28)] transition duration-200 hover:-translate-y-0.5 hover:bg-accent-hover"
              >
                <Plus className="h-4 w-4" /> Add Book
              </Link>
              <Link
                to="/issue"
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-navy transition duration-200 hover:bg-surface"
              >
                <Send className="h-4 w-4" /> Issue Book
              </Link>
              <Link
                to="/members?add=1"
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-navy transition duration-200 hover:bg-surface"
              >
                <UserPlus className="h-4 w-4" /> Add Member
              </Link>
            </div>
          )}
        </div>
      </section>

      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {isAdmin ? (
            <>
              <StatCard
                icon={Library}
                label="Total Collection"
                value={stats.totalBooks}
                sub={`${stats.totalCopies} copies across the catalogue`}
                tint="bg-navy/6 text-navy"
              />
              <StatCard
                icon={BookOpen}
                label="Available Now"
                value={stats.availableBooks}
                sub="Copies ready on the shelves"
                tint="bg-emerald-50 text-emerald-600"
              />
              <StatCard
                icon={Send}
                label="Currently Issued"
                value={stats.issuedBooks}
                sub="Books out with members"
                tint="bg-accent-soft text-accent"
              />
              <StatCard
                icon={Users}
                label="Members"
                value={stats.totalMembers}
                sub="Registered library members"
                tint="bg-rose-soft text-rose"
              />
              <StatCard
                icon={AlertTriangle}
                label="Overdue"
                value={stats.overdueBooks}
                sub="Past their due date"
                tint="bg-blush-soft text-[#a23b52]"
              />
              <StatCard
                icon={IndianRupee}
                label="Outstanding Fines"
                value={formatCurrency(stats.outstandingFine)}
                sub="Unpaid and active overdue dues"
                tint="bg-gold-soft text-gold"
              />
            </>
          ) : (
            <>
              <StatCard
                icon={Send}
                label="My Books"
                value={stats.issuedBooks}
                sub="Currently borrowed"
                tint="bg-accent-soft text-accent"
              />
              <StatCard
                icon={AlertTriangle}
                label="Overdue"
                value={stats.overdueBooks}
                sub="Please return as soon as possible"
                tint="bg-blush-soft text-[#a23b52]"
              />
              <StatCard
                icon={IndianRupee}
                label="Outstanding Fine"
                value={formatCurrency(stats.outstandingFine)}
                sub="Payable at the library desk"
                tint="bg-gold-soft text-gold"
              />
              <StatCard
                icon={BookOpen}
                label="Available Books"
                value={stats.availableBooks}
                sub="Ready to borrow today"
                tint="bg-emerald-50 text-emerald-600"
              />
            </>
          )}
        </div>
      )}

      {isAdmin && chart.length > 0 && (
        <Card className="p-5 sm:p-6">
          <SectionTitle
            title="Circulation Overview"
            subtitle="Books issued over the last 12 months"
            action={
              <span className="hidden rounded-full bg-accent-soft px-3 py-1 text-[11px] font-semibold text-accent sm:inline">
                Live from Atlas
              </span>
            }
          />
          <div className="mt-5 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="issueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E43D12" stopOpacity={0.26} />
                    <stop offset="100%" stopColor="#E43D12" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#DED9D0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#A8A199' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#A8A199' }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ stroke: '#E43D12', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{
                    borderRadius: 14,
                    border: '1px solid #DED9D0',
                    boxShadow: '0 8px 24px rgba(41,37,34,0.10)',
                    fontSize: 13,
                  }}
                  labelStyle={{ fontWeight: 600, color: '#292522' }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Books issued"
                  stroke="#E43D12"
                  strokeWidth={2.5}
                  fill="url(#issueFill)"
                  activeDot={{ r: 5, fill: '#E43D12', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between border-b border-line/70 px-5 py-4 sm:px-6">
          <SectionTitle title="Recent Activity" subtitle="Latest issue and return movements" />
          <Link
            to="/transactions"
            className="group inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent transition hover:text-accent-hover"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
        {recent.length === 0 ? (
          <EmptyState
            title="No activity yet"
            description="Issue a book from the circulation desk and it will appear here."
          />
        ) : (
          <div className="divide-y divide-line/70">
            {recent.map((t) => (
              <ActivityRow key={t._id} t={t} showMember={isAdmin} />
            ))}
          </div>
        )}
      </Card>

      {user?.role === 'member' && stats?.nextDueDate && (
        <div className="flex items-start gap-3.5 rounded-[18px] border border-gold/30 bg-gold-soft/70 p-5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-gold shadow-sm">
            <CalendarClock className="h-[18px] w-[18px]" />
          </span>
          <div className="text-sm text-[#7a6134]">
            <p className="font-semibold text-[#5c4a2a]">Upcoming due date</p>
            <p className="mt-0.5">
              Your next book is due on <strong>{formatDate(stats.nextDueDate)}</strong>. Return on time to avoid a
              fine.
            </p>
          </div>
        </div>
      )}

      {user?.role === 'member' && stats?.issuedBooks === 0 && (
        <div className="flex items-start gap-3.5 rounded-[18px] border border-emerald-200/70 bg-emerald-50/70 p-5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
            <BookOpen className="h-[18px] w-[18px]" />
          </span>
          <div className="text-sm text-emerald-900/80">
            <p className="font-semibold text-emerald-900">Nothing borrowed right now</p>
            <p className="mt-0.5">Browse the catalogue and borrow something new today.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
