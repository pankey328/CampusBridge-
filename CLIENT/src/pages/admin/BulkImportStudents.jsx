import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, ArrowRight, Loader2, ArrowLeft, RefreshCw, Trash2, Edit2, Save } from 'lucide-react';

const BulkImportStudents = () => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [importMode, setImportMode] = useState("file"); // file/sheet
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

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto">
      <button
        onClick={() => navigate("/admin/dashboard")}
        className="inline-flex items-center text-[var(--color-text-secondary)] hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Bulk Import Students</h1>
        <p className="text-[var(--color-text-secondary)] mt-2">
          Upload a CSV file or link a public Google Sheet. If there are errors
          (like missing emails), you can fix them right here before importing!
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Upload Column */}
        <div className="xl:col-span-1 space-y-6">
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-4">
              1. Select Data Source
            </h3>

            <div className="flex bg-[#112240] p-1 rounded-lg mb-6">
              <button
                onClick={() => setImportMode("file")}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${importMode === "file"
                    ? "bg-[#00ED64] text-[#0A192F]"
                    : "text-gray-400 hover:text-white"
                  }`}
              >
                CSV File
              </button>
              <button
                onClick={() => setImportMode("sheet")}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${importMode === "sheet"
                    ? "bg-[#00ED64] text-[#0A192F]"
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
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragging
                    ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)]/10"
                    : file
                      ? "border-[var(--color-brand-primary)] bg-[var(--color-bg-input)]"
                      : "border-[var(--color-text-secondary)]/30 hover:border-[var(--color-brand-primary)] hover:bg-[var(--color-bg-input)]/50"
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
                    <FileSpreadsheet className="w-12 h-12 text-[var(--color-brand-primary)] mb-3" />
                    <p className="text-white font-medium truncate max-w-[200px]">
                      {file.name}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <UploadCloud className="w-12 h-12 text-[var(--color-text-secondary)] mb-3" />
                    <p className="text-sm text-white font-medium">
                      Drag & Drop your CSV
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Public Google Sheet Link
                  </label>
                  <input
                    type="url"
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="w-full bg-[#112240] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00ED64]"
                  />
                </div>
                <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-900/50 flex items-start space-x-3">
                  <AlertCircle className="text-blue-400 w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-300 leading-relaxed">
                    Ensure the sheet's sharing settings are set to{" "}
                    <strong className="text-white">
                      "Anyone with the link"
                    </strong>{" "}
                    can view. The sheet must follow the standard CSV template.
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
                  className="w-full mt-6 flex justify-center items-center py-3 px-4 rounded-lg font-bold text-[var(--color-bg-dark)] bg-white hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  {isDryRunning ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Analyze File"
                  )}
                </button>
              )}
          </div>
        </div>

        {/* Preview & Edit Column */}
        <div className="xl:col-span-2 space-y-6">
          <div
            className={`glass-panel p-6 rounded-2xl h-full transition-opacity duration-300 ${previewData ? "opacity-100" : "opacity-30"}`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-white">
                2. Review & Fix Errors
              </h3>
              {previewData &&
                (editableErrors.length > 0 || needsRevalidation) && (
                  <button
                    onClick={handleRevalidate}
                    disabled={isDryRunning}
                    className={`flex items-center px-4 py-2 bg-[var(--color-bg-input)] text-white rounded-lg text-sm font-medium transition-colors border ${needsRevalidation ? "border-orange-500 hover:bg-orange-900/30" : "border-[var(--color-brand-primary)]/50 hover:bg-gray-700"}`}
                  >
                    <RefreshCw
                      className={`w-4 h-4 mr-2 ${isDryRunning ? "animate-spin" : ""}`}
                    />
                    Re-Validate Changes
                  </button>
                )}
            </div>

            {!previewData ? (
              <div className="flex flex-col items-center justify-center h-64 text-[var(--color-text-secondary)]">
                <FileSpreadsheet className="w-16 h-16 mb-4 opacity-50" />
                <p>Upload and analyze a file to see the interactive preview.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[var(--color-bg-input)] p-4 rounded-xl">
                    <p className="text-xs text-[var(--color-text-secondary)] uppercase mb-1">
                      Total Uploaded
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {editableValidStudents.length + editableErrors.length}
                    </p>
                  </div>
                  <div className="bg-emerald-900/20 p-4 rounded-xl border border-emerald-500/30">
                    <p className="text-xs text-emerald-400 uppercase mb-1">
                      Valid (Ready)
                    </p>
                    <p className="text-2xl font-bold text-emerald-400">
                      {editableValidStudents.length}
                    </p>
                  </div>
                  <div
                    className={`p-4 rounded-xl border ${editableErrors.length > 0 ? "bg-red-900/20 border-red-500/30" : "bg-[var(--color-bg-input)] border-transparent"}`}
                  >
                    <p
                      className={`text-xs uppercase mb-1 ${editableErrors.length > 0 ? "text-red-400" : "text-[var(--color-text-secondary)]"}`}
                    >
                      Issues
                    </p>
                    <p
                      className={`text-2xl font-bold ${editableErrors.length > 0 ? "text-red-400" : "text-white"}`}
                    >
                      {editableErrors.length}
                    </p>
                  </div>
                </div>

                {/* Editable Error Table */}
                {editableErrors.length > 0 && (
                  <div className="border border-red-500/30 rounded-xl overflow-hidden">
                    <div className="bg-red-900/40 p-3 border-b border-red-500/30">
                      <h4 className="text-sm font-semibold text-red-400 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2" /> Fix Issues to
                        Import
                      </h4>
                    </div>
                    <div className="overflow-x-auto max-h-96">
                      <table className="w-full text-left text-sm relative">
                        <thead className="bg-red-900/20 text-xs uppercase text-red-200 sticky top-0 z-10 backdrop-blur-md">
                          <tr>
                            <th className="px-4 py-3">Error Message</th>
                            <th className="px-4 py-3">Enrollment</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-red-900/30 bg-[var(--color-bg-dark)]/50">
                          {editableErrors.map((err, idx) => (
                            <tr key={idx}>
                              <td
                                className="px-4 py-3 text-xs text-red-400 max-w-[200px] truncate"
                                title={err.message}
                              >
                                {err.message}
                              </td>
                              <td className="px-2 py-2">
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
                                  className="w-24 px-2 py-1 bg-[var(--color-bg-input)] border border-red-500/50 rounded focus:outline-none focus:border-[var(--color-brand-primary)] text-white text-xs"
                                  placeholder="Missing..."
                                />
                              </td>
                              <td className="px-2 py-2">
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
                                  className="w-32 px-2 py-1 bg-[var(--color-bg-input)] border border-red-500/50 rounded focus:outline-none focus:border-[var(--color-brand-primary)] text-white text-xs"
                                  placeholder="Missing..."
                                />
                              </td>
                              <td className="px-2 py-2 flex space-x-2">
                                <input
                                  type="text"
                                  value={err.data.firstName || ""}
                                  onChange={(e) =>
                                    handleEditErrorRow(
                                      idx,
                                      "firstName",
                                      e.target.value,
                                    )
                                  }
                                  className="w-20 px-2 py-1 bg-[var(--color-bg-input)] border border-transparent rounded focus:outline-none focus:border-[var(--color-brand-primary)] text-white text-xs"
                                />
                                <input
                                  type="text"
                                  value={err.data.lastName || ""}
                                  onChange={(e) =>
                                    handleEditErrorRow(
                                      idx,
                                      "lastName",
                                      e.target.value,
                                    )
                                  }
                                  className="w-20 px-2 py-1 bg-[var(--color-bg-input)] border border-transparent rounded focus:outline-none focus:border-[var(--color-brand-primary)] text-white text-xs"
                                />
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
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-3 flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" />{" "}
                      Valid Records
                    </h4>
                    <div className="overflow-x-auto max-h-96 rounded-xl border border-[var(--color-bg-input)]">
                      <table className="w-full text-left text-sm text-[var(--color-text-secondary)] relative">
                        <thead className="bg-[var(--color-bg-input)] text-xs uppercase text-white sticky top-0 z-10 backdrop-blur-md">
                          <tr>
                            <th className="px-4 py-3">Enrollment</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">First Name</th>
                            <th className="px-4 py-3">Last Name</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-bg-input)]">
                          {editableValidStudents.map((student, idx) => (
                            <tr
                              key={idx}
                              className="bg-[var(--color-bg-dark)]/50 hover:bg-[var(--color-bg-input)]/30 transition-colors"
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
                                      className="w-24 px-2 py-1 bg-[var(--color-bg-dark)] border border-[var(--color-brand-primary)] rounded focus:outline-none text-white text-xs"
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
                                      className="w-32 px-2 py-1 bg-[var(--color-bg-dark)] border border-[var(--color-brand-primary)] rounded focus:outline-none text-white text-xs"
                                    />
                                  </td>
                                  <td className="px-2 py-2">
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
                                      className="w-20 px-2 py-1 bg-[var(--color-bg-dark)] border border-[var(--color-brand-primary)] rounded focus:outline-none text-white text-xs"
                                    />
                                  </td>
                                  <td className="px-2 py-2">
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
                                      className="w-20 px-2 py-1 bg-[var(--color-bg-dark)] border border-[var(--color-brand-primary)] rounded focus:outline-none text-white text-xs"
                                    />
                                  </td>
                                  <td className="px-4 py-2 text-center flex justify-center space-x-3">
                                    <button
                                      onClick={() => setEditingValidRow(null)}
                                      className="text-emerald-400 hover:text-emerald-300 transition-colors p-1"
                                      title="Save Row"
                                    >
                                      <Save className="w-4 h-4" />
                                    </button>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="px-4 py-3 font-mono">
                                    {student.enrollmentNumber}
                                  </td>
                                  <td className="px-4 py-3">{student.email}</td>
                                  <td className="px-4 py-3 text-white">
                                    {student.firstName}
                                  </td>
                                  <td className="px-4 py-3 text-white">
                                    {student.lastName}
                                  </td>
                                  <td className="px-4 py-3 text-center flex justify-center space-x-3">
                                    <button
                                      onClick={() => setEditingValidRow(idx)}
                                      className="text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)] transition-colors p-1"
                                      title="Edit Row"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteValid(idx)}
                                      className="text-[var(--color-text-secondary)] hover:text-red-400 transition-colors p-1"
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

                <button
                  onClick={handleCommit}
                  disabled={
                    isUploading ||
                    editableValidStudents.length === 0 ||
                    needsRevalidation
                  }
                  className={`w-full flex justify-center items-center py-4 px-4 rounded-xl font-bold transition-all disabled:opacity-50 ${needsRevalidation ? "bg-orange-500 hover:bg-orange-600 text-white" : "text-[var(--color-bg-dark)] bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)]"}`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />{" "}
                      Committing Database...
                    </>
                  ) : needsRevalidation ? (
                    <>
                      Pending Edits! Click 'Re-Validate Changes' Before
                      Committing
                    </>
                  ) : (
                    <>
                      Commit & Email {editableValidStudents.length} Valid
                      Students <ArrowRight className="w-5 h-5 ml-2" />
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

export default BulkImportStudents
