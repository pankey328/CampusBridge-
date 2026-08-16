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
import TPOManagement from "./components/admin/TPOManagement";

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
            <Route path="tpos" element={<TPOManagement />} />
            <Route path="settings" element={<Settings />} />
          </Route>

        </Routes>
      </div>
    </Router>
  );
}

export default App;
