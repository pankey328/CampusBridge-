import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import RegisterHR from "./pages/RegisterHR";
import ForgotPassword from "./pages/ForgotPassword";
import SetupPassword from "./pages/SetupPassword";
import ForcePasswordChange from "./pages/ForcePasswordChange";
import BulkImportStudents from "./pages/admin/BulkImportStudents";
import AdminLayout from "./components/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import StudentManagement from "./components/admin/StudentManagement";
import HRManagement from "./components/admin/HRManagement";
import Settings from "./pages/admin/Settings";
import JobDrives from "./pages/admin/JobDrives";
import CreateJobDrive from "./pages/admin/CreateJobDrive";
import DriveApplications from "./pages/admin/DriveApplications";
import TPOManagement from "./components/admin/TPOManagement";
import NotificationLogs from "./pages/admin/NotificationLogs";

import HRLayout from "./components/hr/HRLayout";
import HRDashboard from "./pages/hr/HRDashboard";
import HRJobDrives from "./pages/hr/HRJobDrives";
import StudentLayout from "./components/student/StudentLayout";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentJobDrives from "./pages/student/JobDrives";
import MyApplications from "./pages/student/MyApplications";
import StudentProfile from "./pages/student/StudentProfile";

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register-hr" element={<RegisterHR />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/setup-password" element={<SetupPassword />} />
          <Route path="/force-password-change" element={<ForcePasswordChange />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminOverview />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="students/bulk-import" element={<BulkImportStudents />} />
            <Route path="hr" element={<HRManagement />} />
            <Route path="job-drives" element={<JobDrives />} />
            <Route path="job-drives/create" element={<CreateJobDrive />} />
            <Route path="job-drives/edit/:id" element={<CreateJobDrive />} />
            <Route path="job-drives/:id/applications" element={<DriveApplications />} />
            <Route path="tpos" element={<TPOManagement />} />
            <Route path="notifications" element={<NotificationLogs />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="drives" element={<StudentJobDrives />} />
            <Route path="applications" element={<MyApplications />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="/hr" element={<HRLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<HRDashboard />} />
            <Route path="job-drives" element={<HRJobDrives />} />
            <Route path="job-drives/create" element={<CreateJobDrive />} />
            <Route path="job-drives/edit/:id" element={<CreateJobDrive />} />
            <Route path="job-drives/:id/applications" element={<DriveApplications />} />
            <Route path="settings" element={<Settings />} />
          </Route>

        </Routes>
      </div>
    </Router>
  );
}

export default App;
