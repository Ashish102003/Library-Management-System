import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, Eye, Pencil, Trash2, BookOpen, LayoutGrid, List, Filter } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import useDebounce from '../hooks/useDebounce';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import StatusBadge from '../components/ui/StatusBadge';
import Pagination from '../components/ui/Pagination';
import BookCover from '../components/ui/BookCover';
import Card, { PageHeader } from '../components/ui/Card';
import { Button, Field, Input, Select, Textarea } from '../components/ui/FormControls';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States';
import { CATEGORIES } from '../utils/constants';

const emptyForm = {
  title: '',
  author: '',
  isbn: '',
  category: 'Programming',
  publisher: '',
  publicationYear: '',
  totalCopies: '',
  description: '',
  coverImage: '',
};

const BookFormModal = ({ open, onClose, book, onSaved }) => {
  const toast = useToast();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        book
          ? {
              title: book.title || '',
              author: book.author || '',
              isbn: book.isbn || '',
              category: book.category || 'Programming',
              publisher: book.publisher || '',
              publicationYear: book.publicationYear || '',
              totalCopies: book.totalCopies ?? '',
              description: book.description || '',
              coverImage: book.coverImage || '',
            }
          : emptyForm
      );
      setErrors({});
    }
  }, [open, book]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.author.trim()) errs.author = 'Author is required';
    if (!form.isbn.trim()) errs.isbn = 'ISBN is required';
    if (!form.category) errs.category = 'Category is required';
    const year = Number(form.publicationYear);
    if (!form.publicationYear) errs.publicationYear = 'Publication year is required';
    else if (Number.isNaN(year) || year < 1000 || year > new Date().getFullYear())
      errs.publicationYear = 'Enter a valid publication year';
    if (!form.totalCopies) errs.totalCopies = 'Total copies are required';
    else if (Number(form.totalCopies) <= 0) errs.totalCopies = 'Must be greater than 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        publicationYear: Number(form.publicationYear),
        totalCopies: Number(form.totalCopies),
      };
      if (book) await api.put(`/books/${book._id}`, payload);
      else await api.post('/books', payload);
      toast.success(book ? 'Book updated successfully' : 'Book added successfully');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={book ? 'Edit Book' : 'Add New Book'}
      subtitle={book ? 'Update the catalogue record below.' : 'Create a new entry in the library catalogue.'}
      size="lg"
    >
      <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Title" required error={errors.title}>
            <Input value={form.title} onChange={set('title')} error={errors.title} placeholder="e.g. Clean Code" />
          </Field>
        </div>
        <Field label="Author" required error={errors.author}>
          <Input value={form.author} onChange={set('author')} error={errors.author} placeholder="e.g. Robert C. Martin" />
        </Field>
        <Field label="ISBN" required error={errors.isbn}>
          <Input value={form.isbn} onChange={set('isbn')} error={errors.isbn} placeholder="e.g. 9780132350884" />
        </Field>
        <Field label="Category" required error={errors.category}>
          <Select value={form.category} onChange={set('category')} error={errors.category}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Publisher">
          <Input value={form.publisher} onChange={set('publisher')} placeholder="e.g. Prentice Hall" />
        </Field>
        <Field label="Publication Year" required error={errors.publicationYear}>
          <Input
            type="number"
            value={form.publicationYear}
            onChange={set('publicationYear')}
            error={errors.publicationYear}
            placeholder="e.g. 2008"
          />
        </Field>
        <Field
          label="Total Copies"
          required
          error={errors.totalCopies}
          hint={book ? 'Available copies are adjusted automatically' : 'Available copies will equal total copies'}
        >
          <Input
            type="number"
            min="1"
            value={form.totalCopies}
            onChange={set('totalCopies')}
            error={errors.totalCopies}
            placeholder="e.g. 5"
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Cover Image URL">
            <Input value={form.coverImage} onChange={set('coverImage')} placeholder="https://..." />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Description">
            <Textarea value={form.description} onChange={set('description')} placeholder="Short summary of the book" />
          </Field>
        </div>
        <div className="flex justify-end gap-3 sm:col-span-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {book ? 'Save Changes' : 'Add Book'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const coverTones = ['bg-surface', 'bg-blush-soft', 'bg-gold-soft', 'bg-rose-soft'];

const BookCard = ({ book, index = 0, canEdit, onEdit, onDelete }) => (
  <Card hover className="group flex flex-col overflow-hidden">
    <div className={`relative h-44 overflow-hidden ${coverTones[index % coverTones.length]}`}>
      <div className="h-full w-full p-4 transition duration-300 group-hover:scale-[1.04]">
        <BookCover src={book.coverImage} title={book.title} className="h-full w-full" fit="contain" showLabel />
      </div>
      <span className="absolute left-3 top-3">
        <StatusBadge status={book.availableCopies > 0 ? 'available' : 'out_of_stock'} />
      </span>
      <span className="absolute right-3 top-3 rounded-lg bg-white/90 px-2 py-1 text-[11px] font-semibold text-navy shadow-sm backdrop-blur">
        {book.category}
      </span>
    </div>
    <div className="flex flex-1 flex-col p-4">
      <h3 className="line-clamp-1 font-display text-[17px] font-bold text-navy">{book.title}</h3>
      <p className="mt-1 text-[13px] text-muted">
        {book.author} · {book.publicationYear}
      </p>

      <div className="mt-auto pt-4">
        <div className="flex items-center justify-between border-t border-line/70 pt-3.5 text-[13px]">
          <p className="text-muted">
            <span className="font-semibold text-navy">{book.availableCopies}</span> / {book.totalCopies} copies
          </p>
          <div className="flex items-center gap-1 opacity-70 transition group-hover:opacity-100">
            <Link
              to={`/books/${book._id}`}
              className="rounded-lg p-2 text-muted transition hover:bg-accent-soft hover:text-accent"
              title="View"
            >
              <Eye className="h-4 w-4" />
            </Link>
            {canEdit && (
              <>
                <button
                  onClick={() => onEdit(book)}
                  className="rounded-lg p-2 text-muted transition hover:bg-gold-soft hover:text-gold"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(book)}
                  className="rounded-lg p-2 text-muted transition hover:bg-rose-50 hover:text-rose-600"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  </Card>
);

const Books = () => {
  const toast = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [availability, setAvailability] = useState('all');
  const [view, setView] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    if (searchParams.get('add') === '1') {
      setEditing(null);
      setModalOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (location.state?.edit) {
      setEditing(location.state.edit);
      setModalOpen(true);
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/books', {
        params: { page, search: debouncedSearch, category, availability, limit: 10 },
      });
      setBooks(data.data);
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
  }, [page, debouncedSearch, category, availability]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, availability]);

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      const { data } = await api.delete(`/books/${deleting._id}`);
      toast.success(data.message);
      setDeleting(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const hasFilters = search || category !== 'all' || availability !== 'all';

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Book Collection"
        title="Discover your collection."
        subtitle="Browse, organize, and manage every book in your library."
        actions={
          isAdmin && (
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4" /> Add Book
            </Button>
          )
        }
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-line/70 p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, author or ISBN"
              className="pl-10"
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-faint sm:block" />
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="sm:w-44 sm:pl-9"
              >
                <option value="all">All categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <Select value={availability} onChange={(e) => setAvailability(e.target.value)} className="sm:w-44">
              <option value="all">All availability</option>
              <option value="available">Available</option>
              <option value="unavailable">Out of stock</option>
            </Select>
            <div className="flex rounded-xl border border-line bg-ivory p-1">
              <button
                onClick={() => setView('grid')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition ${
                  view === 'grid' ? 'bg-white text-accent shadow-sm' : 'text-muted hover:text-navy'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setView('list')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition ${
                  view === 'list' ? 'bg-white text-accent shadow-sm' : 'text-muted hover:text-navy'
                }`}
                title="List view"
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <LoadingState label="Loading books..." />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : books.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="h-6 w-6" />}
            title="No books found"
            description={
              hasFilters ? 'Try adjusting your search or filters.' : 'Add your first book to get started.'
            }
          />
        ) : (
          <>
            {view === 'grid' ? (
              <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {books.map((book, i) => (
                  <BookCard
                    key={book._id}
                    book={book}
                    index={i}
                    canEdit={isAdmin}
                    onEdit={(b) => {
                      setEditing(b);
                      setModalOpen(true);
                    }}
                    onDelete={setDeleting}
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-line/70 text-sm">
                  <thead className="bg-ivory/70">
                    <tr>
                      {['Book', 'ISBN', 'Category', 'Copies', 'Status', 'Actions'].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-faint"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60">
                    {books.map((book) => (
                      <tr key={book._id} className="transition hover:bg-ivory/60">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <BookCover src={book.coverImage} title={book.title} />
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-navy">{book.title}</p>
                              <p className="truncate text-xs text-muted">
                                {book.author} · {book.publicationYear}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted">{book.isbn}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-semibold text-muted">
                            {book.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted">
                          <span className="font-semibold text-navy">{book.availableCopies}</span> / {book.totalCopies}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={book.availableCopies > 0 ? 'available' : 'out_of_stock'} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Link
                              to={`/books/${book._id}`}
                              className="rounded-lg p-2 text-muted transition hover:bg-accent-soft hover:text-accent"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditing(book);
                                    setModalOpen(true);
                                  }}
                                  className="rounded-lg p-2 text-muted transition hover:bg-gold-soft hover:text-gold"
                                  title="Edit"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setDeleting(book)}
                                  className="rounded-lg p-2 text-muted transition hover:bg-rose-50 hover:text-rose-600"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Pagination
              page={pagination.page}
              pages={pagination.pages}
              total={pagination.total}
              onPageChange={setPage}
            />
          </>
        )}
      </Card>

      <BookFormModal open={modalOpen} onClose={() => setModalOpen(false)} book={editing} onSaved={load} />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
        title="Delete book?"
        message={`"${deleting?.title}" will be permanently removed from the catalogue. Books with active issues cannot be deleted.`}
        confirmLabel="Delete Book"
      />
    </div>
  );
};

export default Books;
