import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import PrivateRoute from '@components/Auth/PrivateRoute'
import RoleRoute from '@components/Auth/RoleRoute'
import MainLayout from '@components/Layout/MainLayout'

// Auth pages
import Login from '@pages/auth/Login'

// Dashboard pages
import SuperadminDashboard from '@pages/dashboard/SuperadminDashboard'
import AdminDashboard from '@pages/dashboard/AdminDashboard'

// Terminal pages
import Terminals from '@pages/terminals/Terminals'
import TerminalDetails from '@pages/terminals/TerminalDetails'
import CreateTerminal from '@pages/terminals/CreateTerminal'

// Driver pages
import Drivers from '@pages/drivers/Drivers'
import DriverDetails from '@pages/drivers/DriverDetails'
import CreateDriver from '@pages/drivers/CreateDriver'

// Vehicle pages
import Vehicles from '@pages/vehicles/Vehicles'
import VehicleDetails from '@pages/vehicles/VehicleDetails'
import CreateVehicle from '@pages/vehicles/CreateVehicle'
import VehicleHistory from '@pages/vehicles/VehicleHistory'

// User pages
import ManageAdmins from '@pages/users/ManageAdmins'

// Report pages
import ActivityReports from '@pages/reports/ActivityReports'
import TerminalReport from '@pages/reports/TerminalReport'

// Profile pages
import Profile from '@pages/profile/Profile'
import Settings from '@pages/settings/Settings'

function App() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<Login />} />

      {/* Protected routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<MainLayout />}>
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={
              user?.role === 'Superadmin' ? (
                <SuperadminDashboard />
              ) : (
                <AdminDashboard />
              )
            }
          />

          {/* Terminals */}
          <Route path="/terminals">
            <Route index element={<Terminals />} />
            <Route path=":id" element={<TerminalDetails />} />
            <Route
              path="create"
              element={
                <RoleRoute allowedRoles={['Superadmin', 'Admin']}>
                  <CreateTerminal />
                </RoleRoute>
              }
            />
          </Route>

          {/* Drivers */}
          <Route path="/drivers">
            <Route index element={<Drivers />} />
            <Route path=":id" element={<DriverDetails />} />
            <Route path="create" element={<CreateDriver />} />
          </Route>

          {/* Vehicles */}
          <Route path="/vehicles">
            <Route index element={<Vehicles />} />
            <Route path=":id" element={<VehicleDetails />} />
            <Route path="create" element={<CreateVehicle />} />
            <Route path=":id/history" element={<VehicleHistory />} />
          </Route>

          {/* Admin management (Superadmin only) */}
          <Route
            path="/admins"
            element={
              <RoleRoute allowedRoles={['Superadmin']}>
                <ManageAdmins />
              </RoleRoute>
            }
          />

          {/* Reports */}
          <Route path="/reports">
            <Route index element={<ActivityReports />} />
            <Route path="terminal/:id" element={<TerminalReport />} />
          </Route>

          {/* User routes */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* 404 - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App