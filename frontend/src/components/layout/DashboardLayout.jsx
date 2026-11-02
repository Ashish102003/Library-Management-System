import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const titles = {
  '/': 'Dashboard',
  '/books': 'Books',
  '/members': 'Members',
  '/issue': 'Issue Book',
  '/returns': 'Returns',
  '/transactions': 'Transactions',
  '/profile': 'Profile',
};

const subtitles = {
  '/': 'Your library at a glance',
  '/books': 'Catalogue & availability',
  '/members': 'Library directory',
  '/issue': 'Circulation desk',
  '/returns': 'Returns & fines',
  '/transactions': 'Activity ledger',
  '/profile': 'Your account',
};

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  let title = titles[pathname];
  let subtitle = subtitles[pathname];
  if (!title && pathname.startsWith('/books/')) {
    title = 'Book Details';
    subtitle = 'Catalogue record';
  }
  if (!title && pathname.startsWith('/members/')) {
    title = 'Member Details';
    subtitle = 'Library directory';
  }
  if (!title) {
    title = 'LibraryMS';
    subtitle = '';
  }

  return (
    <div className="min-h-screen">
      <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="lg:pl-[264px]">
        <Topbar title={title} subtitle={subtitle} onMenuClick={() => setMobileOpen(true)} />
        <main className="mx-auto max-w-[1600px] px-4 py-7 sm:px-6 lg:px-8">
          <div key={pathname} className="animate-fade-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
