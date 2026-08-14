import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import RegisterHR from "./pages/RegisterHR";
import ForgotPassword from "./pages/ForgotPassword";
import BulkImportStudents from "./pages/admin/BulkImportStudents";
import AdminLayout from "./components/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import StudentManagement from "./components/admin/StudentManagement";
import HRManagement from "./components/admin/HRManagement";

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register-hr" element={<RegisterHR />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminOverview />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="students/bulk-import" element={<BulkImportStudents />} />
            <Route path="hr" element={<HRManagement />} />
          </Route>
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;
