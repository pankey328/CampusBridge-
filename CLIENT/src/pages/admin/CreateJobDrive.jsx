import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  BookOpen,
  Clock,
  Briefcase,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

const CreateJobDrive = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const userRole = localStorage.getItem("role");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [hrs, setHrs] = useState([]);
  const [uploadingJd, setUploadingJd] = useState(false);
  const [jdFile, setJdFile] = useState(null);
  const submitStatusRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    hrId: "",
    jobRole: "",
    description: "",
    jdFileUrl: "",
    packageLPA: "",
    location: "",
    deadline: "",
    status: "DRAFT",
    minCgpa: 0,
    maxBacklogs: 0,
    passoutYear: new Date().getFullYear(),
    eligibleBranches: "",
    rounds: [{ name: "", description: "", order: 1 }],
  });

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  useEffect(() => {
    const init = async () => {
      try {
        if (userRole !== "HR") {
          const hrRes = await api.get(
            "/admin/hr?status=ACTIVE",
            getAuthHeader(),
          );
          setHrs(hrRes.data.data);
        }

        if (isEditing) {
          const apiBasePath = userRole === "HR" ? "/hr" : "/admin";
          const driveRes = await api.get(
            `${apiBasePath}/job-drives/${id}`,
            getAuthHeader(),
          );
          const drive = driveRes.data.data;
          setFormData({
            title: drive.title || "",
            hrId: drive.postedByHR?._id || drive.postedByHR || "",
            jobRole: drive.jobRole || "",
            description: drive.description || "",
            packageLPA: drive.packageLPA || "",
            location: drive.location || "",
            deadline: drive.deadline ? drive.deadline.split("T")[0] : "",
            minCgpa: drive.minCgpa || 0,
            maxBacklogs: drive.maxBacklogs || 0,
            passoutYear: drive.passoutYear || new Date().getFullYear(),
            eligibleBranches: drive.eligibleBranches
              ? drive.eligibleBranches.join(", ")
              : "",
            jdFileUrl: drive.jdFileUrl || "",
            rounds:
              drive.rounds && drive.rounds.length > 0
                ? drive.rounds
                : [{ name: "", description: "", order: 1 }],
            status: drive.status || "DRAFT",
          });
        }
      } catch (error) {
        toast.error("Failed to load drive data");
      } finally {
        setFetching(false);
      }
    };
    init();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRoundChange = (index, field, value) => {
    const newRounds = [...formData.rounds];
    newRounds[index][field] = value;
    setFormData((prev) => ({ ...prev, rounds: newRounds }));
  };

  const addRound = () => {
    setFormData((prev) => ({
      ...prev,
      rounds: [
        ...prev.rounds,
        { name: "", description: "", order: prev.rounds.length + 1 },
      ],
    }));
  };

  const removeRound = (index) => {
    const newRounds = formData.rounds.filter((_, i) => i !== index);
    newRounds.forEach((r, i) => (r.order = i + 1));
    setFormData((prev) => ({ ...prev, rounds: newRounds }));
  };

  const handleJdSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please select a PDF document for the Job Description");
      return;
    }

    setJdFile(file);
    toast.success(
      "Job Description PDF attached! It will be saved when you submit the form.",
    );
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      let finalJdUrl = formData.jdFileUrl;
      const statusOverride = submitStatusRef.current;

      if (jdFile) {
        setUploadingJd(true);
        const data = new FormData();
        data.append("jd", jdFile);
        const res = await api.post("/upload/jd", data, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        });
        finalJdUrl = res.data.url;
        setUploadingJd(false);
      }

      let payload = {
        ...formData,
        jdFileUrl: finalJdUrl,
        status: statusOverride || formData.status,
        eligibleBranches: formData.eligibleBranches
          .split(",")
          .map((b) => b.trim())
          .filter(Boolean),
        rounds: formData.rounds.filter((r) => r.name.trim() !== ""),
      };

      if (userRole !== "HR") {
        const selectedHr = hrs.find((hr) => hr.id === formData.hrId);
        if (!selectedHr) {
          toast.error("Please select a Corporate Partner");
          setLoading(false);
          return;
        }
        payload.companyId = selectedHr.companyId;
        payload.companyName = selectedHr.companyName;
        payload.postedByHR = selectedHr.id;
      }

      const apiBasePath = userRole === "HR" ? "/hr" : "/admin";
      const uiBasePath =
        userRole === "HR"
          ? "/hr"
          : userRole === "SUPERADMIN"
            ? "/superadmin"
            : "/admin";

      if (isEditing) {
        await api.put(`${apiBasePath}/job-drives/${id}`, payload, getAuthHeader());
        toast.success("Job drive updated successfully");
      } else {
        await api.post(`${apiBasePath}/job-drives`, payload, getAuthHeader());
        toast.success("Job drive created successfully");
      }

      navigate(`${uiBasePath}/job-drives`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#034D35] dark:border-[#B6F596]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn w-full max-w-5xl mx-auto pb-10">
      {/* Header Actions */}
      <button
        onClick={() =>
          navigate(
            userRole === "HR"
              ? "/hr/job-drives"
              : userRole === "SUPERADMIN"
                ? "/superadmin/job-drives"
                : "/admin/job-drives",
          )
        }
        className="inline-flex items-center text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[#121212] dark:hover:text-white transition-colors bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-gray-200 dark:border-slate-700 shadow-sm uppercase tracking-wider"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Job Drives
      </button>

      {/* Main Header */}
      <div className="border-b border-gray-200 dark:border-slate-700 pb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#121212] dark:text-white tracking-tight mb-2">
          {isEditing ? "Edit Job Drive" : "Create New Job Drive"}
        </h1>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Configure job details, requirements, eligibility criteria, and hiring
          rounds.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Details Section */}
        <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-gray-200 dark:border-slate-700 p-8 md:p-10 shadow-sm transition-colors duration-300">
          <div className="flex items-center space-x-3 mb-8 border-b border-gray-100 dark:border-slate-700 pb-4">
            <div className="bg-[#F9F7F1] dark:bg-slate-900 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700">
              <Briefcase
                className="text-[#034D35] dark:text-[#B6F596]"
                size={20}
              />
            </div>
            <h2 className="text-xl font-extrabold text-[#121212] dark:text-white">
              Basic Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 uppercase tracking-wider">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all text-sm font-medium shadow-sm"
                placeholder="e.g. Software Development Engineer"
              />
            </div>

            {userRole !== "HR" && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 uppercase tracking-wider">
                  Corporate Partner (HR) <span className="text-red-500">*</span>
                </label>
                <select
                  name="hrId"
                  required
                  value={formData.hrId}
                  onChange={handleChange}
                  className="w-full bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all text-sm font-medium shadow-sm cursor-pointer"
                >
                  <option value="">Select HR Partner</option>
                  {hrs.map((hr) => (
                    <option key={hr.id} value={hr.id}>
                      {hr.companyName} - {hr.email}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 uppercase tracking-wider">
                Job Role <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="jobRole"
                required
                value={formData.jobRole}
                onChange={handleChange}
                className="w-full bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all text-sm font-medium shadow-sm"
                placeholder="e.g. Frontend Developer"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 uppercase tracking-wider">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows="5"
                className="w-full bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all resize-none text-sm font-medium shadow-sm"
                placeholder="Job description and responsibilities..."
              ></textarea>
            </div>

            {/* JD Document Upload */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 uppercase tracking-wider mb-2">
                Job Description (JD) Document (Optional PDF)
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-[#F9F7F1] dark:bg-slate-900 p-4 rounded-[20px] border border-gray-200 dark:border-slate-700">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleJdSelect}
                  disabled={uploadingJd || loading}
                  id="jdFileInput"
                  className="hidden"
                />

                <label
                  htmlFor="jdFileInput"
                  className="cursor-pointer w-full sm:w-auto px-5 py-3 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-full text-xs font-bold text-[#121212] dark:text-white transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <BookOpen
                    size={16}
                    className="text-[#034D35] dark:text-[#B6F596]"
                  />
                  <span>
                    {jdFile
                      ? `Selected: ${jdFile.name.substring(0, 20)}...`
                      : formData.jdFileUrl
                        ? "Change Uploaded JD PDF"
                        : "Attach JD PDF Document"}
                  </span>
                </label>

                {jdFile && (
                  <div className="flex items-center justify-between gap-2 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800/50 px-4 py-2.5 rounded-full text-xs font-bold text-indigo-700 dark:text-indigo-400">
                    <span>Ready to upload</span>
                    <button
                      type="button"
                      onClick={() => setJdFile(null)}
                      className="text-indigo-400 hover:text-red-500 transition-colors"
                      title="Clear selected file"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}

                {!jdFile && formData.jdFileUrl && (
                  <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-4 py-2.5 rounded-full shadow-sm">
                    <a
                      href={formData.jdFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-[#034D35] dark:text-[#B6F596] hover:underline flex items-center gap-1.5"
                    >
                      View Current JD PDF
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, jdFileUrl: "" }))
                      }
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove JD file"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 uppercase tracking-wider">
                Package (LPA) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                name="packageLPA"
                required
                value={formData.packageLPA}
                onChange={handleChange}
                className="w-full bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all text-sm font-medium shadow-sm"
                placeholder="e.g. 12.5"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 uppercase tracking-wider">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                className="w-full bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all text-sm font-medium shadow-sm"
                placeholder="e.g. Bangalore, India"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 uppercase tracking-wider">
                Application Deadline <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="deadline"
                required
                value={formData.deadline}
                onChange={handleChange}
                className="w-full bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all text-sm font-medium shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Eligibility Criteria */}
        <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-gray-200 dark:border-slate-700 p-8 md:p-10 shadow-sm transition-colors duration-300">
          <div className="flex items-center space-x-3 mb-8 border-b border-gray-100 dark:border-slate-700 pb-4">
            <div className="bg-[#F9F7F1] dark:bg-slate-900 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700">
              <BookOpen className="text-blue-500" size={20} />
            </div>
            <h2 className="text-xl font-extrabold text-[#121212] dark:text-white">
              Eligibility Criteria
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 uppercase tracking-wider">
                Minimum CGPA
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                name="minCgpa"
                value={formData.minCgpa}
                onChange={handleChange}
                className="w-full bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all text-sm font-medium shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 uppercase tracking-wider">
                Max Active Backlogs
              </label>
              <input
                type="number"
                min="0"
                name="maxBacklogs"
                value={formData.maxBacklogs}
                onChange={handleChange}
                className="w-full bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all text-sm font-medium shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 uppercase tracking-wider">
                Target Passout Year <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="passoutYear"
                required
                value={formData.passoutYear}
                onChange={handleChange}
                className="w-full bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all text-sm font-medium shadow-sm"
                placeholder="e.g. 2024"
              />
            </div>

            <div className="space-y-2 md:col-span-3">
              <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 uppercase tracking-wider">
                Eligible Branches (Comma separated)
              </label>
              <input
                type="text"
                name="eligibleBranches"
                value={formData.eligibleBranches}
                onChange={handleChange}
                className="w-full bg-[#F9F7F1] dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl px-5 py-3.5 text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] transition-all text-sm font-medium shadow-sm"
                placeholder="e.g. CSE, IT, ECE (Leave empty for all)"
              />
            </div>
          </div>
        </div>

        {/* Rounds */}
        <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-gray-200 dark:border-slate-700 p-8 md:p-10 space-y-6 shadow-sm transition-colors duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-700 pb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-[#F9F7F1] dark:bg-slate-900 p-2.5 rounded-xl border border-gray-200 dark:border-slate-700">
                <Clock className="text-purple-500" size={20} />
              </div>
              <h2 className="text-xl font-extrabold text-[#121212] dark:text-white">
                Hiring Rounds
              </h2>
            </div>
            <button
              type="button"
              onClick={addRound}
              className="text-xs font-bold uppercase tracking-wider flex items-center justify-center text-[#034D35] dark:text-[#B6F596] bg-[#B6F596]/30 dark:bg-[#034D35]/50 px-4 py-2 rounded-full transition-all self-start sm:self-auto"
            >
              <Plus size={16} className="mr-1" /> Add Round
            </button>
          </div>

          <div className="space-y-4">
            {formData.rounds.map((round, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row gap-4 items-start bg-[#F9F7F1] dark:bg-slate-900 p-6 rounded-[24px] border border-gray-200 dark:border-slate-700 shadow-sm transition-colors duration-300"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-[14px] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-[#121212] dark:text-white font-extrabold shrink-0 shadow-sm">
                  {round.order}
                </div>

                <div className="flex-1 space-y-4 w-full">
                  <div>
                    <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 uppercase tracking-wider mb-2">
                      Round Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={round.name}
                      onChange={(e) =>
                        handleRoundChange(index, "name", e.target.value)
                      }
                      className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] text-sm font-medium shadow-sm"
                      placeholder="e.g. Online Aptitude Test"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#121212] dark:text-gray-200 uppercase tracking-wider mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={round.description}
                      onChange={(e) =>
                        handleRoundChange(index, "description", e.target.value)
                      }
                      className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-[#121212] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#034D35] dark:focus:ring-[#B6F596] text-sm font-medium shadow-sm"
                      placeholder="e.g. 60 mins test on HackerRank"
                    />
                  </div>
                </div>

                {formData.rounds.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRound(index)}
                    className="p-3 text-red-500 hover:text-white hover:bg-red-500 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full shrink-0 self-start md:self-center transition-colors shadow-sm"
                    title="Remove Round"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
          <button
            type="submit"
            onClick={() => (submitStatusRef.current = "DRAFT")}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-[#121212] dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700 font-bold transition-all text-sm shadow-sm"
          >
            Save as Draft
          </button>

          {userRole === "HR" ? (
            <button
              type="submit"
              onClick={() => (submitStatusRef.current = "PENDING_APPROVAL")}
              disabled={loading}
              className="w-full sm:w-auto flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-full transition-all shadow-md text-sm disabled:opacity-50"
            >
              <Save size={18} />
              <span>Submit for Approval</span>
            </button>
          ) : (
            <button
              type="submit"
              onClick={() => (submitStatusRef.current = "ACTIVE")}
              disabled={loading}
              className="w-full sm:w-auto flex justify-center items-center gap-2 bg-[#121212] hover:bg-black !text-white dark:bg-[#B6F596] dark:hover:bg-[#9ad97a] dark:!text-[#034D35] font-bold py-3.5 px-8 rounded-full transition-all shadow-md text-sm disabled:opacity-50"
            >
              <Save size={18} />
              <span>{isEditing ? "Save Changes" : "Publish Job Drive"}</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateJobDrive;
