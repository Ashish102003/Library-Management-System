import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Eye, Pencil, Trash2, Users } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import useDebounce from '../hooks/useDebounce';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import StatusBadge from '../components/ui/StatusBadge';
import Pagination from '../components/ui/Pagination';
import Card, { PageHeader } from '../components/ui/Card';
import { Button, Field, Input } from '../components/ui/FormControls';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States';
import { formatDate, initials } from '../utils/format';

const emptyForm = { name: '', email: '', phone: '', membershipId: '', password: '' };

const MemberFormModal = ({ open, onClose, member, onSaved }) => {
  const toast = useToast();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        member
          ? { name: member.name, email: member.email, phone: member.phone, membershipId: member.membershipId, password: '' }
          : emptyForm
      );
      setErrors({});
    }
  }, [open, member]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (!/^[0-9+\-\s()]{7,15}$/.test(form.phone)) errs.phone = 'Enter a valid phone number (7-15 digits)';
    if (!member && !form.password) errs.password = 'Password is required for the member login';
    if (!member && form.password && form.password.length < 6) errs.password = 'Minimum 6 characters';
    if (form.membershipId && !/^LIB-\d{3,}$/i.test(form.membershipId.trim()))
      errs.membershipId = 'Format should be like LIB-007';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (member) {
        const { data } = await api.put(`/members/${member._id}`, form);
        toast.success(data.message);
      } else {
        const { data } = await api.post('/members', form);
        toast.success(`${data.data.name} added as ${data.data.membershipId}`);
      }
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
      title={member ? 'Edit Member' : 'Add New Member'}
      subtitle={
        member
          ? 'Update this member’s library profile.'
          : 'Register a new reader with their library membership.'
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Full Name" required error={errors.name}>
          <Input value={form.name} onChange={set('name')} error={errors.name} placeholder="e.g. Priya Nair" />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Email" required error={errors.email}>
            <Input type="email" value={form.email} onChange={set('email')} error={errors.email} placeholder="priya@example.com" />
          </Field>
          <Field label="Phone" required error={errors.phone}>
            <Input value={form.phone} onChange={set('phone')} error={errors.phone} placeholder="9876543210" />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Membership ID"
            error={errors.membershipId}
            hint={member ? 'Must be unique' : 'Leave blank to auto-generate (LIB-00X)'}
          >
            <Input
              value={form.membershipId}
              onChange={set('membershipId')}
              error={errors.membershipId}
              placeholder="LIB-007"
            />
          </Field>
          {!member && (
            <Field label="Login Password" required error={errors.password} hint="Used by the member to sign in">
              <Input
                type="password"
                value={form.password}
                onChange={set('password')}
                error={errors.password}
                placeholder="Min 6 characters"
              />
            </Field>
          )}
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {member ? 'Save Changes' : 'Add Member'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const Members = () => {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [members, setMembers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
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

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/members', { params: { page, search: debouncedSearch, limit: 10 } });
      setMembers(data.data);
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
  }, [page, debouncedSearch]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      const { data } = await api.delete(`/members/${deleting._id}`);
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

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Member Directory"
        title="Meet your readers."
        subtitle="Registered members, their loans and their reading history."
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" /> Add Member
          </Button>
        }
      />

      <Card>
        <div className="border-b border-line/70 p-4">
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, membership ID or phone"
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <LoadingState label="Loading members..." />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : members.length === 0 ? (
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            title="No members found"
            description={search ? 'Try a different search term.' : 'Add your first library member.'}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-line/70 text-sm">
                <thead className="bg-ivory/70">
                  <tr>
                    {['Membership ID', 'Member', 'Phone', 'Join Date', 'Issued Books', 'Status', 'Actions'].map((h) => (
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
                  {members.map((m) => (
                    <tr key={m._id} className="transition hover:bg-ivory/60">
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-md border border-dashed border-gold/50 bg-gold-soft/60 px-2 py-1 font-mono text-[11px] font-semibold text-[#8a6d3b]">
                          {m.membershipId}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[12px] font-bold text-accent">
                            {initials(m.name)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-navy">{m.name}</p>
                            <p className="truncate text-xs text-muted">{m.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted">{m.phone}</td>
                      <td className="px-4 py-3 text-muted">{formatDate(m.joinedDate)}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex min-w-7 justify-center rounded-full bg-accent-soft px-2 py-0.5 text-xs font-bold text-accent">
                          {m.issuedBooks}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={m.issuedBooks > 0 ? 'active' : 'inactive'}>
                          {m.issuedBooks > 0 ? 'Has Loans' : 'Clear'}
                        </StatusBadge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link
                            to={`/members/${m._id}`}
                            className="rounded-lg p-2 text-muted transition hover:bg-accent-soft hover:text-accent"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => {
                              setEditing(m);
                              setModalOpen(true);
                            }}
                            className="rounded-lg p-2 text-muted transition hover:bg-gold-soft hover:text-gold"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleting(m)}
                            className="rounded-lg p-2 text-muted transition hover:bg-rose-50 hover:text-rose-600"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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

      <MemberFormModal open={modalOpen} onClose={() => setModalOpen(false)} member={editing} onSaved={load} />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
        title="Delete member?"
        message={`${deleting?.name} and their login account will be removed. Members with active issued books cannot be deleted.`}
        confirmLabel="Delete Member"
      />
    </div>
  );
};

export default Members;
