import { Menu, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../ui/StatusBadge';
import { initials } from '../../utils/format';

const Topbar = ({ title, subtitle, onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex min-h-[72px] items-center justify-between gap-4 border-b border-line bg-white/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-xl border border-line bg-white p-2 text-navy transition hover:bg-surface lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <h1 className="truncate font-display text-lg font-bold text-navy sm:text-xl">{title}</h1>
          {subtitle && <p className="hidden truncate text-xs text-muted sm:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          className="relative rounded-xl border border-line bg-white p-2.5 text-muted transition hover:bg-surface hover:text-navy"
          aria-label="Notifications"
          title="No new notifications"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-gold" />
        </button>

        <div className="hidden items-center gap-3 border-l border-line pl-3 sm:flex">
          <div className="text-right leading-tight">
            <p className="text-[13px] font-semibold text-navy">{user?.name}</p>
            <div className="mt-0.5 flex justify-end">
              <StatusBadge status={user?.role} />
            </div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-[13px] font-bold text-white">
            {initials(user?.name)}
          </div>
        </div>

        <button
          onClick={logout}
          className="rounded-xl border border-line bg-white p-2.5 text-muted transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 sm:hidden"
          aria-label="Logout"
        >
          <LogOut className="h-[18px] w-[18px]" />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
