import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MembersList from './pages/members/MembersList';
import MemberDetail from './pages/members/MemberDetail';
import TrainersList from './pages/trainers/TrainersList';
import TrainerDetail from './pages/trainers/TrainerDetail';
import MembershipsList from './pages/memberships/MembershipsList';
import MembershipDetail from './pages/memberships/MembershipDetail';
import Attendance from './pages/attendance/Attendance';
import Payments from './pages/payments/Payments';
import Classes from './pages/classes/Classes';
import StaffList from './pages/staff/StaffList';
import StaffDetail from './pages/staff/StaffDetail';
import Leads from './pages/leads/Leads';
import Reports from './pages/reports/Reports';
import Settings from './pages/settings/Settings';
import Notifications from './pages/notifications/Notifications';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/members" element={<MembersList />} />
          <Route path="/members/:id" element={<MemberDetail />} />

          <Route path="/trainers" element={<TrainersList />} />
          <Route path="/trainers/:id" element={<TrainerDetail />} />

          <Route path="/memberships" element={<MembershipsList />} />
          <Route path="/memberships/:id" element={<MembershipDetail />} />

          <Route path="/attendance" element={<Attendance />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/classes" element={<Classes />} />

          <Route path="/staff" element={<StaffList />} />
          <Route path="/staff/:id" element={<StaffDetail />} />

          <Route path="/leads" element={<Leads />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
