import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import BookDetails from './pages/BookDetails';
import Members from './pages/Members';
import MemberDetails from './pages/MemberDetails';
import IssueBook from './pages/IssueBook';
import Returns from './pages/Returns';
import Transactions from './pages/Transactions';
import Profile from './pages/Profile';

const App = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route
      element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route path="/" element={<Dashboard />} />
      <Route path="/books" element={<Books />} />
      <Route path="/books/:id" element={<BookDetails />} />
      <Route
        path="/members"
        element={
          <AdminRoute>
            <Members />
          </AdminRoute>
        }
      />
      <Route
        path="/members/:id"
        element={
          <AdminRoute>
            <MemberDetails />
          </AdminRoute>
        }
      />
      <Route
        path="/issue"
        element={
          <AdminRoute>
            <IssueBook />
          </AdminRoute>
        }
      />
      <Route
        path="/returns"
        element={
          <AdminRoute>
            <Returns />
          </AdminRoute>
        }
      />
      <Route path="/transactions" element={<Transactions />} />
      <Route path="/profile" element={<Profile />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
