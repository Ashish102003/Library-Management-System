import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, CalendarDays, Building2, Hash, Users, Send, BookOpen, Sparkles } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/ui/StatusBadge';
import BookCover from '../components/ui/BookCover';
import Card, { GoldRule, SectionTitle, Eyebrow } from '../components/ui/Card';
import { Button } from '../components/ui/FormControls';
import { LoadingState, ErrorState } from '../components/ui/States';
import { formatDate } from '../utils/format';
import { useAuth } from '../context/AuthContext';

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 rounded-xl border border-line/70 bg-ivory/60 px-4 py-3">
    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">{label}</p>
      <p className="mt-0.5 truncate text-sm font-semibold text-navy">{value || '—'}</p>
    </div>
  </div>
);

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/books/${id}`);
      setBook(data.data);
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

  if (loading) return <LoadingState label="Loading book..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!book) return <ErrorState message="Book not found" />;

  const available = book.availableCopies > 0;
  const percent = book.totalCopies ? Math.round((book.availableCopies / book.totalCopies) * 100) : 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-3.5 py-2 text-sm font-semibold text-navy transition hover:bg-surface"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        {user?.role === 'admin' && (
          <div className="flex flex-wrap gap-2.5">
            <Link to="/books" state={{ edit: book }}>
              <Button variant="secondary">
                <Pencil className="h-4 w-4" /> Edit from list
              </Button>
            </Link>
            <Link to="/issue">
              <Button>
                <Send className="h-4 w-4" /> Issue Book
              </Button>
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="overflow-hidden">
          <div className="relative flex justify-center bg-surface px-6 pb-5 pt-6">
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-navy/5 to-transparent" />
            <div className="relative">
              <BookCover src={book.coverImage} title={book.title} className="h-64 w-44" showLabel />
              <span className="absolute -right-3 -top-3">
                <StatusBadge status={available ? 'available' : 'out_of_stock'}>
                  {available ? 'AVAILABLE' : 'OUT OF STOCK'}
                </StatusBadge>
              </span>
            </div>
          </div>
          <div className="px-6 pb-6 pt-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">{book.category}</p>
            <h2 className="mt-2 font-display text-xl font-semibold leading-snug text-navy">{book.title}</h2>
            <p className="mt-1 text-sm text-muted">by {book.author}</p>
            <div className="mt-4 flex justify-center">
              <GoldRule />
            </div>
            <p className="mt-4 text-xs text-faint">Added on {formatDate(book.createdAt)}</p>
          </div>
        </Card>

        <div className="space-y-5 lg:col-span-2">
          <Card className="p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <SectionTitle
                title="Book Information"
                subtitle="Catalogue metadata for this record"
                icon={<Sparkles className="h-4 w-4" />}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoRow icon={Hash} label="ISBN" value={book.isbn} />
              <InfoRow icon={Building2} label="Publisher" value={book.publisher} />
              <InfoRow icon={CalendarDays} label="Publication Year" value={String(book.publicationYear)} />
              <InfoRow icon={Users} label="Active Issues" value={String(book.activeIssues ?? 0)} />
            </div>

            <div className="mt-5">
              <Eyebrow>Description</Eyebrow>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {book.description || 'No description available.'}
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <SectionTitle
              title="Copies"
              subtitle="Availability across the collection"
              icon={<BookOpen className="h-4 w-4" />}
            />
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-line/70 bg-ivory/70 p-5 text-center">
                <p className="font-display text-3xl font-semibold text-navy">{book.totalCopies}</p>
                <p className="mt-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-faint">Total Copies</p>
              </div>
              <div
                className={`rounded-2xl border p-5 text-center ${
                  available ? 'border-emerald-200/70 bg-emerald-50/70' : 'border-rose-200/70 bg-rose-50/70'
                }`}
              >
                <p className={`font-display text-3xl font-semibold ${available ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {book.availableCopies}
                </p>
                <p className={`mt-1.5 text-xs font-semibold uppercase tracking-[0.14em] ${available ? 'text-emerald-600' : 'text-rose-600'}`}>
                  Available Now
                </p>
              </div>
            </div>
            <div className="mt-5">
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
                <div
                  className={`h-full rounded-full ${available ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-muted">
                <span>
                  {book.availableCopies} of {book.totalCopies} copies available for issue
                </span>
                <span className="font-semibold text-navy">{percent}%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
