import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/auth/Login'
import ForgotPassword from './pages/auth/ForgotPassword'
import VerifyOTP from './pages/auth/VerifyOTP'
import ResetPassword from './pages/auth/ResetPassword'
import ResetSuccess from './pages/auth/ResetSuccess'
import AdminLayout from './components/common/AdminLayout'
import DashboardOverview from './pages/dashboard/DashboardOverview'
import MarketplaceAdmin from './pages/marketplace/MarketplaceAdmin'
import FleetManagement from './pages/fleet/FleetManagement'
import CollectorsManagement from './pages/collectors/CollectorsManagement'
import UsersManagement from './pages/users/UsersManagement'
import ComplaintsManagement from './pages/complaints/ComplaintsManagement'
import IllegalDumpingManagement from './pages/illegal-dumping/IllegalDumpingManagement'
import ScheduleManagement from './pages/schedules/ScheduleManagement';
import PaymentsManagement from './pages/payments/PaymentsManagement';
import ReportsManagement from './pages/reports/ReportsManagement';
import SettingsManagement from './pages/settings/SettingsManagement';
import CommunityEvents from './pages/community/CommunityEvents';


function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/reset-success" element={<ResetSuccess />} />
      <Route element={<AdminLayout />}>
        <Route path="/dashboard" element={<DashboardOverview />} />
        <Route path="/marketplace" element={<MarketplaceAdmin />} />
        <Route path="/vehicles" element={<FleetManagement />} />
        <Route path="/collectors" element={<CollectorsManagement />} />
        <Route path="/users" element={<UsersManagement />} />
        <Route path="/complaints" element={<ComplaintsManagement />} />
        <Route path="/illegal-dumping" element={<IllegalDumpingManagement />} />
        <Route path="/schedules" element={<ScheduleManagement />} />
        <Route path="/payments" element={<PaymentsManagement />} />
        <Route path="/reports" element={<ReportsManagement />} />
        <Route path="/settings" element={<SettingsManagement />} />
        <Route path="/community" element={<CommunityEvents />} />
      </Route>
    </Routes>
  )
}

export default App