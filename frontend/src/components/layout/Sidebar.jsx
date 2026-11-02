import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Users, Send, RotateCcw, Receipt, User, LogOut, X, Library } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { classNames, initials } from '../../utils/format';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/books', label: 'Books', icon: BookOpen },
  { to: '/members', label: 'Members', icon: Users, adminOnly: true },
  { to: '/issue', label: 'Issue Book', icon: Send, adminOnly: true },
  { to: '/returns', label: 'Returns', icon: RotateCcw, adminOnly: true },
  { to: '/transactions', label: 'Transactions', icon: Receipt },
  { to: '/profile', label: 'Profile', icon: User },
];

const Sidebar = ({ open, onClose }) => {
  const { user, logout } = useAuth();
  const items = navItems.filter((item) => !item.adminOnly || user?.role === 'admin');

  const content = (
    <div className="flex h-full flex-col border-r border-line bg-white">
      <div className="flex h-[76px] items-center justify-between border-b border-line px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white shadow-[0_6px_16px_rgba(228,61,18,0.32)]">
            <Library className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-[17px] font-bold leading-none text-navy">LibraryMS</p>
            <p className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.24em] text-accent">
              Digital Library
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-muted transition hover:bg-surface hover:text-navy lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto px-3.5 py-5">
        <p className="mb-2.5 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-faint">Navigation</p>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) =>
              classNames(
                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition duration-200',
                isActive
                  ? 'bg-accent text-white shadow-[0_8px_20px_rgba(228,61,18,0.26)]'
                  : 'text-muted hover:bg-accent-soft hover:text-accent'
              )
            }
          >
            <item.icon className="h-[18px] w-[18px]" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-line p-3.5">
        <div className="flex items-center gap-3 rounded-xl bg-surface px-3 py-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold-soft text-[12px] font-bold text-[#8a6a12]">
            {initials(user?.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-navy">{user?.name}</p>
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
              {user?.role === 'admin' ? 'Librarian' : 'Member'}
            </p>
          </div>
          <button
            onClick={logout}
            className="rounded-lg p-2 text-muted transition hover:bg-accent-soft hover:text-accent"
            aria-label="Logout"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] lg:block">{content}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 animate-backdrop-in bg-navy/40 backdrop-blur-[2px]" onClick={onClose} />
          <aside className="absolute inset-y-0 left-0 w-[272px] max-w-[85vw] shadow-[8px_0_40px_rgba(41,37,34,0.28)]">
            {content}
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
