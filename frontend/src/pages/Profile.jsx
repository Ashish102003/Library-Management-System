import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  ShieldCheck,
  CalendarDays,
  KeyRound,
  Send,
  IndianRupee,
  Receipt,
  Library,
  ArrowRight,
  Lock,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusBadge from '../components/ui/StatusBadge';
import Card, { PageHeader, SectionTitle, GoldRule } from '../components/ui/Card';
import { Button, Field, Input } from '../components/ui/FormControls';
import { LoadingState, ErrorState } from '../components/ui/States';
import { formatDate, formatCurrency, initials } from '../utils/format';

const StatBox = ({ label, value, icon: Icon, tone }) => (
  <Card className="p-5">
    <div className="flex items-start justify-between gap-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">{label}</p>
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}>
        <Icon className="h-4 w-4" />
      </span>
    </div>
    <p className="mt-3 font-display text-[26px] font-semibold leading-none text-navy">{value}</p>
  </Card>
);

const QuickLink = ({ to, children }) => (
  <Link
    to={to}
    className="group inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-navy transition hover:border-accent/40 hover:bg-accent-soft hover:text-accent"
  >
    {children}
    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
  </Link>
);

const Profile = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/dashboard/stats');
      setStats(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Please fill in both password fields');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.put('/auth/change-password', { currentPassword, newPassword });
      toast.success(data.message);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading profile..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Your Account" title="Your profile." subtitle="Account information and security settings." />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5">
          <Card className="overflow-hidden">
            <div className="relative bg-navy px-6 pb-16 pt-7 text-center">
              <div className="absolute -left-12 -top-12 h-40 w-40 rounded-full bg-accent/30 blur-3xl" />
              <div className="absolute -bottom-16 -right-8 h-40 w-40 rounded-full bg-gold/15 blur-3xl" />
              <div className="relative">
                <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-gold/40 bg-white/10 text-2xl font-bold text-gold">
                  {initials(user?.name)}
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold text-white">{user?.name}</h3>
                <div className="mt-2 flex justify-center">
                  <StatusBadge status={user?.role} />
                </div>
              </div>
            </div>
            <div className="-mt-10 px-6 pb-6">
              <div className="rounded-2xl border border-line/70 bg-white p-4 shadow-soft">
                <div className="space-y-3 text-sm text-muted">
                  <p className="flex items-center gap-2.5 break-all">
                    <Mail className="h-4 w-4 shrink-0 text-faint" /> {user?.email}
                  </p>
                  <p className="flex items-center gap-2.5">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-faint" /> Password protected (bcrypt)
                  </p>
                  <p className="flex items-center gap-2.5">
                    <CalendarDays className="h-4 w-4 shrink-0 text-faint" /> Member since{' '}
                    {formatDate(user?.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <KeyRound className="h-4 w-4" />
              </span>
              <h3 className="font-display text-base font-semibold text-navy">Change Password</h3>
            </div>
            <form onSubmit={changePassword} className="space-y-3">
              <Field label="Current Password" required>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10"
                  />
                </div>
              </Field>
              <Field label="New Password" required hint="Minimum 6 characters">
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10"
                  />
                </div>
              </Field>
              <Button type="submit" loading={saving} className="w-full">
                Update Password
              </Button>
            </form>
          </Card>
        </div>

        <div className="space-y-5 lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {isAdmin ? (
              <>
                <StatBox label="Total Books" value={stats?.totalBooks ?? 0} icon={Library} tone="bg-navy/6 text-navy" />
                <StatBox
                  label="Total Members"
                  value={stats?.totalMembers ?? 0}
                  icon={Send}
                  tone="bg-accent-soft text-accent"
                />
                <StatBox
                  label="Outstanding Fines"
                  value={formatCurrency(stats?.outstandingFine || 0)}
                  icon={IndianRupee}
                  tone="bg-gold-soft text-gold"
                />
              </>
            ) : (
              <>
                <StatBox
                  label="Issued Books"
                  value={stats?.issuedBooks ?? 0}
                  icon={Send}
                  tone="bg-accent-soft text-accent"
                />
                <StatBox
                  label="Overdue"
                  value={stats?.overdueBooks ?? 0}
                  icon={Receipt}
                  tone="bg-rose-50 text-rose-500"
                />
                <StatBox
                  label="Outstanding Fine"
                  value={formatCurrency(stats?.outstandingFine || 0)}
                  icon={IndianRupee}
                  tone="bg-gold-soft text-gold"
                />
              </>
            )}
          </div>

          <Card className="p-6">
            <SectionTitle title="Quick Links" subtitle="Jump back into the library" />
            <div className="mt-4 flex flex-wrap gap-3">
              <QuickLink to="/books">
                <Send className="h-4 w-4" /> Browse Books
              </QuickLink>
              <QuickLink to="/transactions">
                <Receipt className="h-4 w-4" /> My Transactions
              </QuickLink>
              {isAdmin && (
                <QuickLink to="/issue">
                  <Library className="h-4 w-4" /> Issue a Book
                </QuickLink>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <SectionTitle
              icon={<ShieldCheck className="h-4 w-4" />}
              title="Account Security"
              subtitle="How your account is protected"
            />
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              {[
                'Passwords are hashed with bcrypt',
                'Sessions are secured with JWT tokens',
                'Role-based access controls admin operations',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 rounded-xl border border-line/70 bg-ivory/60 px-4 py-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-5">
              <GoldRule />
            </div>
            <div className="mt-4 flex items-center gap-2 text-[13px] text-faint">
              <Library className="h-4 w-4 text-gold" />
              LibraryMS — Where knowledge finds its reader.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
