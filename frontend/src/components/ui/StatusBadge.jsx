import { classNames } from '../../utils/format';

const styles = {
  issued: 'bg-gold-soft text-[#8a6a12]',
  returned: 'bg-emerald-50 text-emerald-700',
  overdue: 'bg-rose-soft text-[#a23b52]',
  available: 'bg-emerald-50 text-emerald-700',
  out_of_stock: 'bg-blush-soft text-[#a23b52]',
  active: 'bg-accent-soft text-accent',
  inactive: 'bg-surface text-muted',
  paid: 'bg-emerald-50 text-emerald-700',
  unpaid: 'bg-rose-soft text-[#a23b52]',
  admin: 'bg-gold-soft text-[#8a6a12]',
  member: 'bg-surface text-muted',
};

const dots = {
  issued: 'bg-gold',
  returned: 'bg-emerald-500',
  overdue: 'bg-rose',
  available: 'bg-emerald-500',
  out_of_stock: 'bg-blush',
  active: 'bg-accent',
  inactive: 'bg-faint',
  paid: 'bg-emerald-500',
  unpaid: 'bg-rose',
  admin: 'bg-gold',
  member: 'bg-faint',
};

const labels = {
  issued: 'Issued',
  returned: 'Returned',
  overdue: 'Overdue',
  available: 'Available',
  out_of_stock: 'Out of Stock',
  active: 'Active',
  inactive: 'Inactive',
  paid: 'Paid',
  unpaid: 'Unpaid',
  admin: 'Administrator',
  member: 'Member',
};

const StatusBadge = ({ status, children }) => {
  const key = String(status || '').toLowerCase();
  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide',
        styles[key] || styles.inactive
      )}
    >
      <span className={classNames('h-1.5 w-1.5 rounded-full', dots[key] || 'bg-faint')} />
      {children || labels[key] || status}
    </span>
  );
};

export default StatusBadge;
