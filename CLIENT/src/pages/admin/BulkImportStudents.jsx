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

  // Errors Handlers
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

  // Valid Students Handlers
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
    const headers =
      "enrollmentNumber,email,firstName,lastName,branch,cgpa,activeBacklogs,passoutYear,phone";
    const row1 =
      "EN2024001,aarav.sharma@example.com,Aarav,Sharma,CSE,8.75,0,2025,9876543210";
    const row2 =
      "EN2024002,priya.patel@example.com,Priya,Patel,IT,9.10,0,2025,9876543211";
    const row3 =
      "EN2024003,rohit.verma@example.com,Rohit,Verma,ECE,8.20,0,2025,9876543212";
    const row4 =
      "EN2024004,ananya.gupta@example.com,Ananya,Gupta,ME,7.95,0,2025,9876543213";
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, row1, row2, row3, row4].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "students_bulk_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fadeIn w-full pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 dark:border-slate-700 pb-6 transition-colors duration-300">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/admin/students")}
            className="p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-full text-[#121212] dark:text-white transition-all shadow-sm shrink-0"
            title="Back to Students"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#121212] dark:text-white tracking-tight mb-2">
              Bulk Import Students
            </h1>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Upload a CSV file or link a Google Sheet. Review and correct any
              data errors inline before committing.
            </p>
          </div>
        </div>
        <button
          onClick={downloadSampleCSV}
          className="flex items-center justify-center space-x-2 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-[#121212] dark:text-white border border-gray-200 dark:border-slate-700 font-bold py-3 px-6 rounded-full transition-colors text-sm shadow-sm whitespace-nowrap shrink-0"
        >
          <Download size={18} className="text-[#034D35] dark:text-[#B6F596]" />
          <span>Sample CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Upload Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-[32px] p-8 shadow-sm transition-colors duration-300">
            <h3 className="text-lg font-extrabold text-[#121212] dark:text-white mb-6 flex items-center space-x-3">
              <span className="w-8 h-8 rounded-full bg-[#B6F596]/40 dark:bg-[#034D35]/50 text-[#034D35] dark:text-[#B6F596] text-sm font-black flex items-center justify-center border border-[#034D35]/20 dark:border-[#B6F596]/20">
                1
              </span>
              <span>Select Data Source</span>
            </h3>

            <div className="flex bg-[#F9F7F1] dark:bg-slate-900 p-1.5 rounded-full border border-gray-200 dark:border-slate-700 mb-6 shadow-inner">
              <button
                onClick={() => setImportMode("file")}
                className={`flex-1 py-2.5 text-xs font-bold rounded-full transition-all ${
                  importMode === "file"
                    ? "bg-[#034D35] text-[#B6F596] dark:bg-[#B6F596] dark:text-[#034D35] shadow-sm"
                    : "text-gray-500 hover:text-[#121212] dark:hover:text-white"
                }`}
              >
                CSV File
              </button>
              <button
                onClick={() => setImportMode("sheet")}
                className={`flex-1 py-2.5 text-xs font-bold rounded-full transition-all ${
                  importMode === "sheet"
                    ? "bg-[#034D35] text-[#B6F596] dark:bg-[#B6F596] dark:text-[#034D35] shadow-sm"
                    : "text-gray-500 hover:text-[#121212] dark:hover:text-white"
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
                className={`border-2 border-dashed rounded-[24px] p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-[#034D35] dark:border-[#B6F596] bg-[#034D35]/5 dark:bg-[#B6F596]/10"
                    : file
                      ? "border-[#034D35]/50 dark:border-[#B6F596]/50 bg-gray-50 dark:bg-slate-700/50"
                      : "border-gray-300 dark:border-slate-600 hover:border-[#034D35] dark:hover:border-[#B6F596] hover:bg-gray-50 dark:hover:bg-slate-700/50"
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
                    <div className="w-14 h-14 rounded-full bg-[#B6F596]/40 dark:bg-[#034D35]/50 flex items-center justify-center text-[#034D35] dark:text-[#B6F596] mb-4 border border-[#034D35]/20 dark:border-[#B6F596]/20">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <p className="text-[#121212] dark:text-white font-extrabold truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">
                      {(file.size / 1024).toFixed(1)} KB &bull; Click or drag to
                      replace
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-[#F9F7F1] dark:bg-slate-900 flex items-center justify-center text-gray-400 dark:text-gray-500 mb-4 border border-gray-200 dark:border-slate-700">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-sm text-[#121212] dark:text-white font-extrabold">
                      Drag & Drop your CSV here
                    </p>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
                      or click to browse from computer
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 uppercase tracking-wider mb-2">
                    Public Google Sheet URL
                  </label>
                  <input
                    type="url"
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="w-full bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-[#121212] dark:text-white text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all shadow-sm"
                  />
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-[20px] border border-blue-100 dark:border-blue-800/50 flex items-start space-x-3">
                  <AlertCircle className="text-blue-600 dark:text-blue-400 w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-blue-800 dark:text-blue-300 leading-relaxed">
                    Ensure the sheet sharing is set to{" "}
                    <strong className="text-blue-900 dark:text-white font-extrabold">
                      "Anyone with the link can view"
                    </strong>{" "}
                    and uses the template column format.
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
                  className="w-full mt-6 flex justify-center items-center py-3.5 px-6 rounded-full font-bold text-white bg-[#121212] hover:bg-black dark:bg-[#B6F596] dark:hover:bg-[#9ad97a] dark:text-[#034D35] transition-all disabled:opacity-50 shadow-md text-sm"
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
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-[24px] p-6 shadow-sm transition-colors duration-300">
            <h4 className="text-xs font-bold text-[#121212] dark:text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
              <FileText
                size={16}
                className="text-[#034D35] dark:text-[#B6F596]"
              />
              <span>Required CSV Headers</span>
            </h4>
            <div className="flex flex-wrap gap-2 text-[11px]">
              {[
                "enrollmentNumber",
                "email",
                "firstName",
                "lastName",
                "branch",
                "cgpa",
                "activeBacklogs",
                "passoutYear",
                "phone",
              ].map((h) => (
                <span
                  key={h}
                  className="bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-[#121212] dark:text-gray-300 px-3 py-1.5 rounded-lg font-mono font-bold shadow-sm"
                >
                  {h}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Preview & Edit */}
        <div className="lg:col-span-2 space-y-6 min-w-0">
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-[32px] p-6 md:p-8 shadow-sm transition-colors duration-300 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 dark:border-slate-700 gap-4 mb-6">
              <h3 className="text-lg font-extrabold text-[#121212] dark:text-white flex items-center space-x-3">
                <span className="w-8 h-8 rounded-full bg-[#B6F596]/40 dark:bg-[#034D35]/50 text-[#034D35] dark:text-[#B6F596] text-sm font-black flex items-center justify-center border border-[#034D35]/20 dark:border-[#B6F596]/20">
                  2
                </span>
                <span>Review & Correct Data</span>
              </h3>

              {previewData &&
                (editableErrors.length > 0 || needsRevalidation) && (
                  <button
                    onClick={handleRevalidate}
                    disabled={isDryRunning}
                    className={`flex items-center justify-center px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-full transition-all shadow-sm border ${
                      needsRevalidation
                        ? "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50 dark:hover:bg-amber-900/50"
                        : "bg-[#F9F7F1] dark:bg-slate-900 text-[#121212] dark:text-white border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    <RefreshCw
                      className={`w-4 h-4 mr-2 ${isDryRunning ? "animate-spin" : ""}`}
                    />
                    Re-Validate Changes
                  </button>
                )}
            </div>

            {!previewData ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 rounded-full bg-[#F9F7F1] dark:bg-slate-900 flex items-center justify-center text-gray-300 dark:text-gray-600 mb-5 border border-gray-200 dark:border-slate-700">
                  <FileSpreadsheet className="w-10 h-10" />
                </div>
                <h4 className="text-xl text-[#121212] dark:text-white font-extrabold mb-2">
                  No Data Analyzed Yet
                </h4>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 max-w-sm">
                  Select a CSV file or paste a Google Sheet link on the left and
                  click "Analyze & Preview Data" to review.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#F9F7F1] dark:bg-slate-900 p-5 rounded-[24px] border border-gray-100 dark:border-slate-700/50 shadow-sm text-center">
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-1.5">
                      Total Rows
                    </p>
                    <p className="text-3xl font-extrabold text-[#121212] dark:text-white">
                      {editableValidStudents.length + editableErrors.length}
                    </p>
                  </div>
                  <div className="bg-[#B6F596]/20 dark:bg-[#034D35]/30 p-5 rounded-[24px] border border-[#034D35]/10 dark:border-[#B6F596]/20 shadow-sm text-center">
                    <p className="text-[11px] text-[#034D35] dark:text-[#B6F596] uppercase font-bold tracking-wider mb-1.5">
                      Ready to Import
                    </p>
                    <p className="text-3xl font-extrabold text-[#034D35] dark:text-[#B6F596]">
                      {editableValidStudents.length}
                    </p>
                  </div>
                  <div
                    className={`p-5 rounded-[24px] shadow-sm text-center transition-colors border ${
                      editableErrors.length > 0
                        ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50"
                        : "bg-[#F9F7F1] dark:bg-slate-900 border-gray-100 dark:border-slate-700/50"
                    }`}
                  >
                    <p
                      className={`text-[11px] uppercase font-bold tracking-wider mb-1.5 ${
                        editableErrors.length > 0
                          ? "text-red-600 dark:text-red-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      Issues Found
                    </p>
                    <p
                      className={`text-3xl font-extrabold ${
                        editableErrors.length > 0
                          ? "text-red-600 dark:text-red-400"
                          : "text-[#121212] dark:text-white"
                      }`}
                    >
                      {editableErrors.length}
                    </p>
                  </div>
                </div>

                {/* Editable Error Table */}
                {editableErrors.length > 0 && (
                  <div className="border border-red-200 dark:border-red-800/50 rounded-[24px] overflow-hidden bg-red-50/50 dark:bg-red-950/10 shadow-sm">
                    <div className="bg-red-50 dark:bg-red-900/30 px-6 py-4 border-b border-red-200 dark:border-red-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="text-sm font-extrabold text-red-600 dark:text-red-400 flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" /> Issues
                        Requiring Correction ({editableErrors.length})
                      </h4>
                      <span className="text-xs font-bold text-red-500 dark:text-red-300">
                        Edit fields directly below
                      </span>
                    </div>
                    <div className="overflow-x-auto max-h-80 custom-scrollbar w-full">
                      <table className="w-full min-w-max text-left text-sm whitespace-nowrap">
                        <thead className="bg-white/50 dark:bg-slate-900/50 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 sticky top-0 z-10 border-b border-red-200 dark:border-red-800/50 backdrop-blur-md">
                          <tr>
                            <th className="px-5 py-4">Error Reason</th>
                            <th className="px-4 py-4">Enrollment</th>
                            <th className="px-4 py-4">Email</th>
                            <th className="px-4 py-4">First & Last Name</th>
                            <th className="px-4 py-4 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-red-100 dark:divide-red-900/30 text-xs font-medium text-[#121212] dark:text-gray-200">
                          {editableErrors.map((err, idx) => (
                            <tr
                              key={idx}
                              className="hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <td
                                className="px-5 py-3 text-red-600 dark:text-red-400 max-w-[200px] whitespace-normal font-bold leading-relaxed"
                                title={err.message}
                              >
                                {err.message}
                              </td>
                              <td className="px-3 py-3">
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
                                  className="w-32 px-3 py-2 bg-white dark:bg-slate-800 border border-red-300 dark:border-red-800/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] shadow-sm text-xs font-bold"
                                  placeholder="Missing..."
                                />
                              </td>
                              <td className="px-3 py-3">
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
                                  className="w-48 px-3 py-2 bg-white dark:bg-slate-800 border border-red-300 dark:border-red-800/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] shadow-sm text-xs font-bold"
                                  placeholder="Missing..."
                                />
                              </td>
                              <td className="px-3 py-3">
                                <div className="flex space-x-2">
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
                                    className="w-28 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] shadow-sm text-xs font-bold"
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
                                    className="w-28 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] shadow-sm text-xs font-bold"
                                  />
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  onClick={() => handleDeleteError(idx)}
                                  className="text-red-500 hover:text-white hover:bg-red-500 transition-colors p-2 rounded-lg"
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
                  <div className="border border-gray-200 dark:border-slate-700 rounded-[24px] overflow-hidden bg-white dark:bg-slate-800 shadow-sm">
                    <div className="bg-[#F9F7F1] dark:bg-slate-900 px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                      <h4 className="text-sm font-extrabold text-[#121212] dark:text-white uppercase tracking-wider flex items-center">
                        <CheckCircle2 className="w-5 h-5 mr-2 text-[#034D35] dark:text-[#B6F596]" />
                        Valid Students Ready to Import (
                        {editableValidStudents.length})
                      </h4>
                    </div>
                    <div className="overflow-x-auto max-h-80 custom-scrollbar w-full">
                      <table className="w-full min-w-max text-left text-sm text-[#121212] dark:text-gray-300 whitespace-nowrap">
                        <thead className="bg-[#F9F7F1] dark:bg-slate-900/80 text-xs uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 sticky top-0 z-10 border-b border-gray-200 dark:border-slate-700 backdrop-blur-md">
                          <tr>
                            <th className="px-5 py-4">Enrollment</th>
                            <th className="px-4 py-4">Email</th>
                            <th className="px-4 py-4">Name</th>
                            <th className="px-4 py-4">CGPA</th>
                            <th className="px-4 py-4">Backlogs</th>
                            <th className="px-4 py-4 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50 text-xs font-medium">
                          {editableValidStudents.map((student, idx) => (
                            <tr
                              key={idx}
                              className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                            >
                              {editingValidRow === idx ? (
                                <>
                                  <td className="px-3 py-3">
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
                                      className="w-32 px-3 py-2 bg-white dark:bg-slate-800 border border-[#034D35]/30 dark:border-[#B6F596]/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] shadow-sm font-bold text-[#121212] dark:text-white"
                                    />
                                  </td>
                                  <td className="px-3 py-3">
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
                                      className="w-48 px-3 py-2 bg-white dark:bg-slate-800 border border-[#034D35]/30 dark:border-[#B6F596]/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] shadow-sm font-bold text-[#121212] dark:text-white"
                                    />
                                  </td>
                                  <td className="px-3 py-3">
                                    <div className="flex space-x-2">
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
                                        className="w-24 px-3 py-2 bg-white dark:bg-slate-800 border border-[#034D35]/30 dark:border-[#B6F596]/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] shadow-sm font-bold text-[#121212] dark:text-white"
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
                                        className="w-24 px-3 py-2 bg-white dark:bg-slate-800 border border-[#034D35]/30 dark:border-[#B6F596]/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] shadow-sm font-bold text-[#121212] dark:text-white"
                                      />
                                    </div>
                                  </td>
                                  <td className="px-3 py-3">
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
                                      className="w-20 px-3 py-2 bg-white dark:bg-slate-800 border border-[#034D35]/30 dark:border-[#B6F596]/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] shadow-sm font-bold text-[#121212] dark:text-white"
                                    />
                                  </td>
                                  <td className="px-3 py-3">
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
                                      className="w-20 px-3 py-2 bg-white dark:bg-slate-800 border border-[#034D35]/30 dark:border-[#B6F596]/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] shadow-sm font-bold text-[#121212] dark:text-white"
                                    />
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <button
                                      onClick={() => setEditingValidRow(null)}
                                      className="text-white bg-[#034D35] hover:bg-[#023b28] dark:bg-[#B6F596] dark:hover:bg-[#9ad97a] dark:text-[#034D35] transition-colors p-2 rounded-lg shadow-sm"
                                      title="Save Row"
                                    >
                                      <Save className="w-4 h-4" />
                                    </button>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="px-5 py-4 font-mono font-bold text-[#121212] dark:text-gray-200">
                                    {student.enrollmentNumber}
                                  </td>
                                  <td className="px-4 py-4">{student.email}</td>
                                  <td className="px-4 py-4 font-extrabold text-[#121212] dark:text-white">
                                    {student.firstName} {student.lastName}
                                  </td>
                                  <td className="px-4 py-4 font-bold">
                                    {student.cgpa || 0}
                                  </td>
                                  <td className="px-4 py-4 font-bold text-red-500 dark:text-red-400">
                                    {student.activeBacklogs || 0}
                                  </td>
                                  <td className="px-4 py-4 text-center flex justify-center space-x-2">
                                    <button
                                      onClick={() => setEditingValidRow(idx)}
                                      className="text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors p-2 rounded-lg"
                                      title="Edit Row"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteValid(idx)}
                                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors p-2 rounded-lg"
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
                  className={`w-full flex justify-center items-center py-4 px-6 rounded-full font-bold transition-all disabled:opacity-50 text-sm shadow-md ${
                    needsRevalidation
                      ? "bg-amber-500 hover:bg-amber-600 text-white"
                      : "text-white bg-[#121212] hover:bg-black dark:bg-[#B6F596] dark:hover:bg-[#9ad97a] dark:text-[#034D35]"
                  }`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Committing Students to Database...
                    </>
                  ) : needsRevalidation ? (
                    <>
                      Pending Edits! Click 'Re-Validate Changes' Above Before
                      Committing
                    </>
                  ) : (
                    <>
                      Commit &amp; Email {editableValidStudents.length} Valid
                      Students
                      <ArrowRight className="w-5 h-5 ml-2" />
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
