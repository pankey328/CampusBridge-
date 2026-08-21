import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
  ArrowLeft,
  RefreshCw,
  Trash2,
  Edit2,
  Save,
  Download,
  HelpCircle,
  FileText,
} from "lucide-react";

const BulkImportStudents = () => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [importMode, setImportMode] = useState("file"); // file, sheet
  const [sheetUrl, setSheetUrl] = useState("");

  const [previewData, setPreviewData] = useState(null);
  const [isDryRunning, setIsDryRunning] = useState(false);

  const [editableErrors, setEditableErrors] = useState([]);
  const [editableValidStudents, setEditableValidStudents] = useState([]);
  const [editingValidRow, setEditingValidRow] = useState(null);
  const [needsRevalidation, setNeedsRevalidation] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;
    if (
      selectedFile.type !== "text/csv" &&
      !selectedFile.name.endsWith(".csv")
    ) {
      toast.error("Please upload a valid CSV file.");
      return;
    }
    setFile(selectedFile);
    setPreviewData(null);
    setEditableErrors([]);
    setEditableValidStudents([]);
    setNeedsRevalidation(false);
  };

  const handleDryRun = async (dataToValidate = null) => {
    setIsDryRunning(true);
    try {
      const token = localStorage.getItem("token");
      let response;

      if (dataToValidate) {
        response = await api.post(
          "/admin/students/bulk-import-dryrun",
          { students: dataToValidate },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      } else if (importMode === "sheet") {
        if (!sheetUrl.trim()) {
          toast.error("Please enter a valid Google Sheet URL.");
          setIsDryRunning(false);
          return;
        }
        response = await api.post(
          "/admin/students/bulk-import-dryrun",
          { sheetUrl: sheetUrl.trim() },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      } else {
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);
        response = await api.post(
          "/admin/students/bulk-import-dryrun",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          },
        );
      }

      setPreviewData(response.data);
      setEditableErrors(response.data.errors);
      setEditableValidStudents(response.data.validStudents);
      setEditingValidRow(null);
      setNeedsRevalidation(false);

      if (response.data.errorCount === 0) {
        toast.success(
          `Perfect! All ${response.data.validCount} records are ready.`,
        );
      } else {
        toast.error(
          `Found ${response.data.errorCount} issues. Please fix them below.`,
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to analyze data.");
      if (!dataToValidate) setFile(null);
    } finally {
      setIsDryRunning(false);
    }
  };

  const handleRevalidate = () => {
    // Combine valid students
    const allStudents = [
      ...editableValidStudents,
      ...editableErrors.map((e) => e.data),
    ];
    handleDryRun(allStudents);
  };

  const handleCommit = async () => {
    if (!previewData || editableValidStudents.length === 0) return;
    if (needsRevalidation) {
      toast.error("Please click 'Re-Validate Changes' before committing.");
      return;
    }

    setIsUploading(true);
    try {
      const token = localStorage.getItem("token");

      const payload = { students: editableValidStudents };

      const response = await api.post(
        "/admin/students/bulk-import-commit",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      toast.success(response.data.message, { duration: 5000 });
      setFile(null);
      setPreviewData(null);
      setEditableErrors([]);
      setEditableValidStudents([]);
      setNeedsRevalidation(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to import students.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  // for Errors
  const handleEditErrorRow = (index, field, value) => {
    const updatedErrors = [...editableErrors];
    updatedErrors[index].data[field] = value;
    setEditableErrors(updatedErrors);
    setNeedsRevalidation(true);
  };
  const handleDeleteError = (index) => {
    const updatedErrors = editableErrors.filter((_, i) => i !== index);
    setEditableErrors(updatedErrors);
    setNeedsRevalidation(true);
  };

  // for Valid Students
  const handleEditValidRow = (index, field, value) => {
    const updatedValid = [...editableValidStudents];
    updatedValid[index][field] = value;
    setEditableValidStudents(updatedValid);
    setNeedsRevalidation(true);
  };
  const handleDeleteValid = (index) => {
    const updatedValid = editableValidStudents.filter((_, i) => i !== index);
    setEditableValidStudents(updatedValid);
    setNeedsRevalidation(true);
    if (editingValidRow === index) setEditingValidRow(null);
  };

  const downloadSampleCSV = () => {
    const headers = "enrollmentNumber,email,firstName,lastName,branch,cgpa,activeBacklogs,passoutYear,phone";
    const row1 = "EN2024001,aarav.sharma@example.com,Aarav,Sharma,CSE,8.75,0,2025,9876543210";
    const row2 = "EN2024002,priya.patel@example.com,Priya,Patel,IT,9.10,0,2025,9876543211";
    const row3 = "EN2024003,rohit.verma@example.com,Rohit,Verma,ECE,8.20,0,2025,9876543212";
    const row4 = "EN2024004,ananya.gupta@example.com,Ananya,Gupta,ME,7.95,0,2025,9876543213";
    const csvContent = "data:text/csv;charset=utf-8," + [headers, row1, row2, row3, row4].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "students_bulk_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn w-full pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/admin/students")}
            className="p-2 bg-[#0A192F] border border-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
            title="Back to Students"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Bulk Import Students</h1>
            <p className="text-gray-400 mt-1 text-sm">
              Upload a CSV file or link a Google Sheet. Review and correct any data errors inline before committing.
            </p>
          </div>
        </div>
        <button
          onClick={downloadSampleCSV}
          className="flex items-center space-x-2 bg-[#0A192F] hover:bg-[#112240] text-gray-300 hover:text-white border border-gray-700 font-medium py-2.5 px-4 rounded-lg transition-colors text-sm whitespace-nowrap self-start md:self-auto"
        >
          <Download size={16} className="text-[#00ED64]" />
          <span>Download Sample CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#0A192F] border border-gray-800 rounded-xl p-6">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-[#00ED64]/10 text-[#00ED64] text-xs font-bold flex items-center justify-center border border-[#00ED64]/20">1</span>
              <span>Select Data Source</span>
            </h3>

            <div className="flex bg-[#112240] p-1 rounded-lg border border-gray-700 mb-6">
              <button
                onClick={() => setImportMode("file")}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  importMode === "file"
                    ? "bg-[#00ED64] text-[#0A192F] font-bold shadow"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                CSV File
              </button>
              <button
                onClick={() => setImportMode("sheet")}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  importMode === "sheet"
                    ? "bg-[#00ED64] text-[#0A192F] font-bold shadow"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Google Sheet
              </button>
            </div>

            {importMode === "file" ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-[#00ED64] bg-[#00ED64]/10"
                    : file
                      ? "border-[#00ED64]/60 bg-[#112240]"
                      : "border-gray-700 hover:border-[#00ED64] hover:bg-[#112240]/50"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".csv"
                  className="hidden"
                />

                {file ? (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-[#00ED64]/10 flex items-center justify-center text-[#00ED64] mb-3 border border-[#00ED64]/20">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <p className="text-white font-semibold truncate max-w-[220px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {(file.size / 1024).toFixed(1)} KB &bull; Click or drag to replace
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 mb-3">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-sm text-white font-medium">
                      Drag & Drop your CSV here
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      or click to browse from computer
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">
                    Public Google Sheet URL
                  </label>
                  <input
                    type="url"
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="w-full bg-[#112240] border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#00ED64]"
                  />
                </div>
                <div className="bg-blue-900/20 p-3.5 rounded-lg border border-blue-900/40 flex items-start space-x-3">
                  <AlertCircle className="text-blue-400 w-4 h-4 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-300 leading-relaxed">
                    Ensure the sheet sharing is set to <strong className="text-white">"Anyone with the link can view"</strong> and uses the template column format.
                  </p>
                </div>
              </div>
            )}

            {((importMode === "file" && file) ||
              (importMode === "sheet" && sheetUrl)) &&
              !previewData && (
                <button
                  onClick={() => handleDryRun()}
                  disabled={isDryRunning}
                  className="w-full mt-6 flex justify-center items-center py-3 px-4 rounded-lg font-bold text-[#0A192F] bg-[#00ED64] hover:bg-[#00c954] transition-all disabled:opacity-50 shadow-lg shadow-[#00ED64]/10"
                >
                  {isDryRunning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing Records...
                    </>
                  ) : (
                    "Analyze & Preview Data"
                  )}
                </button>
              )}
          </div>

          {/* Expected Template Format Info Card */}
          <div className="bg-[#0A192F] border border-gray-800 rounded-xl p-5">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3 flex items-center space-x-2">
              <FileText size={14} className="text-[#00ED64]" />
              <span>Required CSV Headers</span>
            </h4>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {["enrollmentNumber", "email", "firstName", "lastName", "branch", "cgpa", "activeBacklogs", "passoutYear", "phone"].map(h => (
                <span key={h} className="bg-[#112240] border border-gray-700 text-gray-300 px-2 py-0.5 rounded font-mono">
                  {h}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Preview & Edit Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0A192F] border border-gray-800 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-gray-800 gap-3 mb-6">
              <h3 className="text-base font-semibold text-white flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-[#00ED64]/10 text-[#00ED64] text-xs font-bold flex items-center justify-center border border-[#00ED64]/20">2</span>
                <span>Review & Correct Data</span>
              </h3>
              {previewData && (editableErrors.length > 0 || needsRevalidation) && (
                <button
                  onClick={handleRevalidate}
                  disabled={isDryRunning}
                  className={`flex items-center px-4 py-2 text-xs font-semibold rounded-lg transition-all border ${
                    needsRevalidation
                      ? "bg-orange-500/20 text-orange-400 border-orange-500 hover:bg-orange-500/30"
                      : "bg-[#112240] text-gray-300 border-gray-700 hover:border-[#00ED64] hover:text-white"
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-2 ${isDryRunning ? "animate-spin" : ""}`} />
                  Re-Validate Changes
                </button>
              )}
            </div>

            {!previewData ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <div className="w-16 h-16 rounded-full bg-[#112240] flex items-center justify-center text-gray-500 mb-4 border border-gray-800">
                  <FileSpreadsheet className="w-8 h-8" />
                </div>
                <h4 className="text-white font-medium mb-1">No Data Analyzed Yet</h4>
                <p className="text-sm text-gray-400 text-center max-w-sm">
                  Select a CSV file or paste a Google Sheet link on the left and click "Analyze & Preview Data" to review.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div className="bg-[#112240] p-4 rounded-xl border border-gray-800">
                    <p className="text-xs text-gray-400 uppercase font-semibold mb-1">
                      Total Rows
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {editableValidStudents.length + editableErrors.length}
                    </p>
                  </div>
                  <div className="bg-[#00ED64]/10 p-4 rounded-xl border border-[#00ED64]/20">
                    <p className="text-xs text-[#00ED64] uppercase font-semibold mb-1">
                      Ready to Import
                    </p>
                    <p className="text-2xl font-bold text-[#00ED64]">
                      {editableValidStudents.length}
                    </p>
                  </div>
                  <div
                    className={`p-4 rounded-xl border ${
                      editableErrors.length > 0
                        ? "bg-red-500/10 border-red-500/30"
                        : "bg-[#112240] border-gray-800"
                    }`}
                  >
                    <p
                      className={`text-xs uppercase font-semibold mb-1 ${
                        editableErrors.length > 0 ? "text-red-400" : "text-gray-400"
                      }`}
                    >
                      Issues Found
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        editableErrors.length > 0 ? "text-red-400" : "text-white"
                      }`}
                    >
                      {editableErrors.length}
                    </p>
                  </div>
                </div>

                {/* Editable Error Table */}
                {editableErrors.length > 0 && (
                  <div className="border border-red-500/30 rounded-xl overflow-hidden bg-red-950/10">
                    <div className="bg-red-900/30 px-4 py-3 border-b border-red-500/20 flex items-center justify-between">
                      <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2" /> Issues Requiring Correction ({editableErrors.length})
                      </h4>
                      <span className="text-[11px] text-red-300">Edit fields directly below</span>
                    </div>
                    <div className="overflow-x-auto max-h-72">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-[#0A192F] text-xs uppercase text-gray-400 sticky top-0 z-10 border-b border-red-500/20">
                          <tr>
                            <th className="px-4 py-3">Error Reason</th>
                            <th className="px-4 py-3">Enrollment</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">First & Last Name</th>
                            <th className="px-4 py-3 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800 text-xs">
                          {editableErrors.map((err, idx) => (
                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                              <td
                                className="px-4 py-3 text-red-400 max-w-[180px] font-medium"
                                title={err.message}
                              >
                                {err.message}
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="text"
                                  value={err.data.enrollmentNumber || ""}
                                  onChange={(e) =>
                                    handleEditErrorRow(
                                      idx,
                                      "enrollmentNumber",
                                      e.target.value,
                                    )
                                  }
                                  className="w-28 px-2.5 py-1.5 bg-[#0A192F] border border-red-500/50 rounded focus:outline-none focus:border-[#00ED64] text-white text-xs"
                                  placeholder="Missing..."
                                />
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="text"
                                  value={err.data.email || ""}
                                  onChange={(e) =>
                                    handleEditErrorRow(
                                      idx,
                                      "email",
                                      e.target.value,
                                    )
                                  }
                                  className="w-36 px-2.5 py-1.5 bg-[#0A192F] border border-red-500/50 rounded focus:outline-none focus:border-[#00ED64] text-white text-xs"
                                  placeholder="Missing..."
                                />
                              </td>
                              <td className="px-3 py-2">
                                <div className="flex space-x-1.5">
                                  <input
                                    type="text"
                                    value={err.data.firstName || ""}
                                    placeholder="First"
                                    onChange={(e) =>
                                      handleEditErrorRow(
                                        idx,
                                        "firstName",
                                        e.target.value,
                                      )
                                    }
                                    className="w-20 px-2 py-1.5 bg-[#0A192F] border border-gray-700 rounded focus:outline-none focus:border-[#00ED64] text-white text-xs"
                                  />
                                  <input
                                    type="text"
                                    value={err.data.lastName || ""}
                                    placeholder="Last"
                                    onChange={(e) =>
                                      handleEditErrorRow(
                                        idx,
                                        "lastName",
                                        e.target.value,
                                      )
                                    }
                                    className="w-20 px-2 py-1.5 bg-[#0A192F] border border-gray-700 rounded focus:outline-none focus:border-[#00ED64] text-white text-xs"
                                  />
                                </div>
                              </td>
                              <td className="px-4 py-2 text-center">
                                <button
                                  onClick={() => handleDeleteError(idx)}
                                  className="text-red-400 hover:text-red-300 transition-colors p-1"
                                  title="Delete Row"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Editable Valid Preview */}
                {editableValidStudents.length > 0 && (
                  <div className="border border-gray-800 rounded-xl overflow-hidden">
                    <div className="bg-[#112240] px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center">
                        <CheckCircle2 className="w-4 h-4 mr-2 text-[#00ED64]" />
                        Valid Students Ready to Import ({editableValidStudents.length})
                      </h4>
                    </div>
                    <div className="overflow-x-auto max-h-72">
                      <table className="w-full text-left text-sm text-gray-300">
                        <thead className="bg-[#0A192F] text-xs uppercase text-gray-400 sticky top-0 z-10 border-b border-gray-800">
                          <tr>
                            <th className="px-4 py-3">Enrollment</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">CGPA</th>
                            <th className="px-4 py-3">Backlogs</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800 text-xs">
                          {editableValidStudents.map((student, idx) => (
                            <tr
                              key={idx}
                              className="hover:bg-white/5 transition-colors"
                            >
                              {editingValidRow === idx ? (
                                <>
                                  <td className="px-2 py-2">
                                    <input
                                      type="text"
                                      value={student.enrollmentNumber}
                                      onChange={(e) =>
                                        handleEditValidRow(
                                          idx,
                                          "enrollmentNumber",
                                          e.target.value,
                                        )
                                      }
                                      className="w-24 px-2 py-1 bg-[#0A192F] border border-[#00ED64] rounded focus:outline-none text-white text-xs"
                                    />
                                  </td>
                                  <td className="px-2 py-2">
                                    <input
                                      type="text"
                                      value={student.email}
                                      onChange={(e) =>
                                        handleEditValidRow(
                                          idx,
                                          "email",
                                          e.target.value,
                                        )
                                      }
                                      className="w-32 px-2 py-1 bg-[#0A192F] border border-[#00ED64] rounded focus:outline-none text-white text-xs"
                                    />
                                  </td>
                                  <td className="px-2 py-2">
                                    <div className="flex space-x-1">
                                      <input
                                        type="text"
                                        value={student.firstName}
                                        onChange={(e) =>
                                          handleEditValidRow(
                                            idx,
                                            "firstName",
                                            e.target.value,
                                          )
                                        }
                                        className="w-16 px-2 py-1 bg-[#0A192F] border border-[#00ED64] rounded focus:outline-none text-white text-xs"
                                      />
                                      <input
                                        type="text"
                                        value={student.lastName}
                                        onChange={(e) =>
                                          handleEditValidRow(
                                            idx,
                                            "lastName",
                                            e.target.value,
                                          )
                                        }
                                        className="w-16 px-2 py-1 bg-[#0A192F] border border-[#00ED64] rounded focus:outline-none text-white text-xs"
                                      />
                                    </div>
                                  </td>
                                  <td className="px-2 py-2">
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={student.cgpa || ""}
                                      onChange={(e) =>
                                        handleEditValidRow(
                                          idx,
                                          "cgpa",
                                          e.target.value,
                                        )
                                      }
                                      className="w-14 px-2 py-1 bg-[#0A192F] border border-[#00ED64] rounded focus:outline-none text-white text-xs"
                                    />
                                  </td>
                                  <td className="px-2 py-2">
                                    <input
                                      type="number"
                                      value={student.activeBacklogs || ""}
                                      onChange={(e) =>
                                        handleEditValidRow(
                                          idx,
                                          "activeBacklogs",
                                          e.target.value,
                                        )
                                      }
                                      className="w-14 px-2 py-1 bg-[#0A192F] border border-[#00ED64] rounded focus:outline-none text-white text-xs"
                                    />
                                  </td>
                                  <td className="px-4 py-2 text-center">
                                    <button
                                      onClick={() => setEditingValidRow(null)}
                                      className="text-[#00ED64] hover:text-[#00c954] transition-colors p-1"
                                      title="Save Row"
                                    >
                                      <Save className="w-4 h-4" />
                                    </button>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="px-4 py-3 font-mono text-gray-300">
                                    {student.enrollmentNumber}
                                  </td>
                                  <td className="px-4 py-3 text-gray-300">{student.email}</td>
                                  <td className="px-4 py-3 text-white font-medium">
                                    {student.firstName} {student.lastName}
                                  </td>
                                  <td className="px-4 py-3 text-white">
                                    {student.cgpa || 0}
                                  </td>
                                  <td className="px-4 py-3 text-white">
                                    {student.activeBacklogs || 0}
                                  </td>
                                  <td className="px-4 py-3 text-center flex justify-center space-x-2">
                                    <button
                                      onClick={() => setEditingValidRow(idx)}
                                      className="text-gray-400 hover:text-[#00ED64] transition-colors p-1"
                                      title="Edit Row"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteValid(idx)}
                                      className="text-gray-400 hover:text-red-400 transition-colors p-1"
                                      title="Delete Row"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Commit Action Button */}
                <button
                  onClick={handleCommit}
                  disabled={
                    isUploading ||
                    editableValidStudents.length === 0 ||
                    needsRevalidation
                  }
                  className={`w-full flex justify-center items-center py-3.5 px-4 rounded-xl font-bold transition-all disabled:opacity-50 text-sm shadow-lg ${
                    needsRevalidation
                      ? "bg-orange-500 hover:bg-orange-600 text-white"
                      : "text-[#0A192F] bg-[#00ED64] hover:bg-[#00c954] shadow-[#00ED64]/20"
                  }`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Committing Students to Database...
                    </>
                  ) : needsRevalidation ? (
                    <>
                      Pending Edits! Click 'Re-Validate Changes' Above Before Committing
                    </>
                  ) : (
                    <>
                      Commit &amp; Email {editableValidStudents.length} Valid Students
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkImportStudents;
