import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Library, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Field } from '../components/ui/FormControls';
import { GoldRule } from '../components/ui/Card';
import BookIllustration from '../components/login/BookIllustration';

const Login = () => {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to={location.state?.from || '/'} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid login credentials');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="relative flex min-h-[440px] flex-1 flex-col overflow-hidden bg-accent px-8 py-10 lg:min-h-screen lg:w-[46%] lg:px-12 lg:py-14">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(125%_95%_at_12%_8%,#f2622f_0%,transparent_58%)] opacity-90" />
          <div className="absolute inset-0 bg-[radial-gradient(85%_65%_at_72%_66%,rgba(239,177,29,0.35)_0%,transparent_62%)]" />
          <div className="blob-drift absolute -right-28 -top-24 h-96 w-96 rounded-full bg-blush/30 blur-3xl" />
          <div className="blob-drift absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-gold/25 blur-3xl" style={{ animationDelay: '3s' }} />
          <svg
            className="ring-drift absolute -right-24 top-6 h-[420px] w-[420px] text-white/[0.09]"
            viewBox="0 0 200 200"
            fill="none"
          >
            <circle cx="100" cy="100" r="96" stroke="currentColor" />
            <circle cx="100" cy="100" r="72" stroke="currentColor" />
            <circle cx="100" cy="100" r="48" stroke="currentColor" />
          </svg>
          <div className="absolute inset-0 bg-[radial-gradient(105%_105%_at_50%_32%,transparent_45%,rgba(122,36,16,0.45)_100%)]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-accent shadow-[0_8px_20px_rgba(122,36,16,0.25)]">
              <Library className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-xl font-bold leading-none text-white">LibraryMS</p>
              <p className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.26em] text-white/75">
                Digital Library
              </p>
            </div>
          </div>

          <div className="mt-12 max-w-md">
            <GoldRule />
            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.12] text-white lg:text-[44px]">
              Where knowledge
              <br />
              finds its reader.
            </h1>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/75">
              A modern library management experience — catalogue, circulation and fines, elegantly organised.
            </p>
            <p className="mt-7 max-w-sm border-l border-white/50 pl-4 font-display text-[15px] italic leading-relaxed text-white/70">
              “A library is not a luxury but one of the necessities of life.”
            </p>
          </div>
        </div>

        <div className="relative z-10 my-9 flex flex-1 items-center justify-center lg:my-6">
          <BookIllustration className="h-auto w-full max-w-[330px] drop-shadow-[0_26px_60px_rgba(122,36,16,0.4)] sm:max-w-[410px] lg:max-w-[510px]" />
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center bg-white px-5 py-12 sm:px-10 lg:w-[54%] lg:py-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_45%_at_82%_0%,#fff3ec_0%,transparent_62%)]" />
        <div className="relative w-full max-w-md animate-fade-up">
          <p className="mb-3 flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
            <span className="h-px w-7 bg-accent/70" />
            Welcome back
          </p>
          <h2 className="font-display text-3xl font-bold text-navy">Sign in to your library</h2>
          <p className="mt-2.5 text-sm leading-relaxed text-muted">
            Enter your credentials to continue to the circulation desk.
          </p>

          <form onSubmit={submit} className="mt-9 space-y-5">
            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <Field label="Email address" required>
              <div className="group relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint transition-colors duration-200 group-focus-within:text-accent" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="py-3 pl-10 hover:border-accent/40 focus:ring-accent/15"
                  autoComplete="email"
                />
              </div>
            </Field>

            <Field label="Password" required>
              <div className="group relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint transition-colors duration-200 group-focus-within:text-accent" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="py-3 pl-10 hover:border-accent/40 focus:ring-accent/15"
                  autoComplete="current-password"
                />
              </div>
            </Field>

            <Button
              type="submit"
              loading={submitting}
              size="lg"
              className="w-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(228,61,18,0.35)] active:translate-y-0"
            >
              Sign In <ArrowRight className="h-4 w-4" />
            </Button>

            <div className="rounded-2xl border border-line bg-gradient-to-b from-white to-ivory/70 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
              <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-faint">
                Demo credentials
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => fillDemo('admin@library.com', 'Admin@123')}
                  className="flex-1 rounded-xl border border-line bg-white px-3 py-2.5 text-[13px] font-semibold text-navy shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:bg-accent-soft hover:text-accent hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/15"
                >
                  Librarian / Admin
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('aarav@example.com', 'Member@123')}
                  className="flex-1 rounded-xl border border-line bg-white px-3 py-2.5 text-[13px] font-semibold text-navy shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:bg-accent-soft hover:text-accent hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/15"
                >
                  Member
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
