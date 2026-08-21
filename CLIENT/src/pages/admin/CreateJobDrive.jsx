import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, Users, Building2, BookOpen, Clock, Briefcase } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CreateJobDrive = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const userRole = localStorage.getItem('role');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [hrs, setHrs] = useState([]);
  const [uploadingJd, setUploadingJd] = useState(false);
  const [jdFile, setJdFile] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    hrId: '',
    jobRole: '',
    description: '',
    jdFileUrl: '',
    packageLPA: '',
    location: '',
    deadline: '',
    status: 'DRAFT',
    minCgpa: 0,
    maxBacklogs: 0,
    passoutYear: new Date().getFullYear(),
    eligibleBranches: '',
    rounds: [{ name: '', description: '', order: 1 }]
  });

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  useEffect(() => {
    const init = async () => {
      try {
        if (userRole !== 'HR') {
          const hrRes = await api.get('/admin/hr?status=ACTIVE', getAuthHeader());
          setHrs(hrRes.data.data);
        }

        if (isEditing) {
          const basePath = userRole === 'HR' ? '/hr' : (userRole === 'SUPERADMIN' ? '/superadmin' : '/admin');
          const driveRes = await api.get(`${basePath}/job-drives/${id}`, getAuthHeader());
          const drive = driveRes.data.data;
          setFormData({
            title: drive.title || '',
            hrId: drive.postedByHR?._id || drive.postedByHR || '',
            jobRole: drive.jobRole || '',
            description: drive.description || '',
            packageLPA: drive.packageLPA || '',
            location: drive.location || '',
            deadline: drive.deadline ? drive.deadline.split('T')[0] : '',
            minCgpa: drive.minCgpa || 0,
            maxBacklogs: drive.maxBacklogs || 0,
            passoutYear: drive.passoutYear || new Date().getFullYear(),
            eligibleBranches: drive.eligibleBranches ? drive.eligibleBranches.join(', ') : '',
            jdFileUrl: drive.jdFileUrl || '',
            rounds: drive.rounds && drive.rounds.length > 0 ? drive.rounds : [{ name: '', description: '', order: 1 }],
            status: drive.status || 'DRAFT'
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
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleRoundChange = (index, field, value) => {
    const newRounds = [...formData.rounds];
    newRounds[index][field] = value;
    setFormData(prev => ({ ...prev, rounds: newRounds }));
  };

  const addRound = () => {
    setFormData(prev => ({
      ...prev,
      rounds: [...prev.rounds, { name: '', description: '', order: prev.rounds.length + 1 }]
    }));
  };

  const removeRound = (index) => {
    const newRounds = formData.rounds.filter((_, i) => i !== index);

    newRounds.forEach((r, i) => r.order = i + 1);
    setFormData(prev => ({ ...prev, rounds: newRounds }));
  };

  const handleJdSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error("Please select a PDF document for the Job Description");
      return;
    }

    setJdFile(file);
    toast.success("Job Description PDF attached! It will be saved when you submit the form.");
  };

  const handleSubmit = async (e, statusOverride = null) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      let finalJdUrl = formData.jdFileUrl;

      if (jdFile) {
        setUploadingJd(true);
        const data = new FormData();
        data.append('jd', jdFile);
        const res = await api.post('/upload/jd', data, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        finalJdUrl = res.data.url;
        setUploadingJd(false);
      }

      let payload = {
        ...formData,
        jdFileUrl: finalJdUrl,
        status: statusOverride || formData.status,
        eligibleBranches: formData.eligibleBranches.split(',').map(b => b.trim()).filter(Boolean),
        rounds: formData.rounds.filter(r => r.name.trim() !== '')
      };

      if (userRole !== 'HR') {
        const selectedHr = hrs.find(hr => hr.id === formData.hrId);
        if (!selectedHr) {
          toast.error("Please select a Corporate Partner");
          setLoading(false);
          return;
        }
        payload.companyId = selectedHr.companyId;
        payload.companyName = selectedHr.companyName;
        payload.postedByHR = selectedHr.id;
      }

      const basePath = userRole === 'HR' ? '/hr' : (userRole === 'SUPERADMIN' ? '/superadmin' : '/admin');

      if (isEditing) {
        await api.put(`${basePath}/job-drives/${id}`, payload, getAuthHeader());
        toast.success("Job drive updated successfully");
      } else {
        await api.post(`${basePath}/job-drives`, payload, getAuthHeader());
        toast.success("Job drive created successfully");
      }
      
      navigate(`${basePath}/job-drives`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-brand-primary)]"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto min-h-screen animate-fade-in space-y-6">
      <button
        onClick={() => navigate(userRole === 'HR' ? '/hr/job-drives' : (userRole === 'SUPERADMIN' ? '/superadmin/job-drives' : '/admin/job-drives'))}
        className="inline-flex items-center text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors mb-2 bg-[var(--color-bg-secondary)] px-3 py-1.5 rounded-lg border border-[var(--color-border)]"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Job Drives
      </button>

      <div className="glass-panel p-6 rounded-2xl border border-[var(--color-border)]">
        <h1 className="text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
          {isEditing ? 'Edit Job Drive' : 'Create New Job Drive'}
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Configure job details, requirements, eligibility criteria, and hiring rounds.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Details */}
        <div className="glass-panel p-6 rounded-2xl border border-[var(--color-border)] space-y-6">
          <div className="flex items-center space-x-2 border-b border-[var(--color-border)] pb-4">
            <Briefcase className="text-[var(--color-brand-primary)]" size={20} />
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Basic Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Job Title <span className="text-red-500">*</span></label>
              <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand-primary)] transition-all text-sm" placeholder="e.g. Software Development Engineer" />
            </div>

            {userRole !== 'HR' && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Corporate Partner (HR) <span className="text-red-500">*</span></label>
                <select name="hrId" required value={formData.hrId} onChange={handleChange} className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand-primary)] transition-all text-sm">
                  <option value="">Select HR Partner</option>
                  {hrs.map(hr => (
                    <option key={hr.id} value={hr.id}>{hr.companyName} - {hr.email}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Job Role <span className="text-red-500">*</span></label>
              <input type="text" name="jobRole" required value={formData.jobRole} onChange={handleChange} className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand-primary)] transition-all text-sm" placeholder="e.g. Frontend Developer" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Description <span className="text-red-500">*</span></label>
              <textarea name="description" required value={formData.description} onChange={handleChange} rows="4" className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand-primary)] transition-all resize-none text-sm" placeholder="Job description and responsibilities..."></textarea>
            </div>

            {/* JD Document Upload */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Job Description (JD) Document (Optional PDF)</label>
              <div className="flex items-center gap-4">
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
                  className="cursor-pointer px-4 py-2.5 bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-primary)] border border-[var(--color-border)] hover:border-[var(--color-brand-primary)] rounded-xl text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all flex items-center gap-2"
                >
                  <BookOpen size={15} className="text-[var(--color-brand-primary)]" />
                  <span>{jdFile ? `Selected: ${jdFile.name}` : (formData.jdFileUrl ? "Change Uploaded JD PDF" : "Attach JD PDF Document")}</span>
                </label>

                {jdFile && (
                  <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-2 rounded-lg text-xs font-semibold text-blue-400">
                    <span>📄 Ready to upload on save ({jdFile.name})</span>
                    <button
                      type="button"
                      onClick={() => setJdFile(null)}
                      className="text-gray-400 hover:text-red-400 p-1 ml-1"
                      title="Clear selected file"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}

                {!jdFile && formData.jdFileUrl && (
                  <div className="flex items-center gap-2 bg-[var(--color-brand-primary)]/10 border border-[var(--color-brand-primary)]/20 px-3 py-2 rounded-lg">
                    <a
                      href={formData.jdFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-[var(--color-brand-primary)] hover:underline flex items-center gap-1"
                    >
                      View Current JD PDF
                    </a>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, jdFileUrl: '' }))}
                      className="text-gray-400 hover:text-red-400 p-1"
                      title="Remove JD file"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Package (LPA) <span className="text-red-500">*</span></label>
              <input type="number" step="0.1" name="packageLPA" required value={formData.packageLPA} onChange={handleChange} className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand-primary)] transition-all text-sm" placeholder="e.g. 12.5" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Location <span className="text-red-500">*</span></label>
              <input type="text" name="location" required value={formData.location} onChange={handleChange} className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand-primary)] transition-all text-sm" placeholder="e.g. Bangalore, India" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Application Deadline <span className="text-red-500">*</span></label>
              <input type="date" name="deadline" required value={formData.deadline} onChange={handleChange} className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-brand-primary)] transition-all text-sm" />
            </div>
          </div>
        </div>

        {/* Eligibility Criteria */}
        <div className="glass-panel p-6 rounded-2xl border border-[var(--color-border)] space-y-6">
          <div className="flex items-center space-x-2 border-b border-[var(--color-border)] pb-4">
            <BookOpen className="text-purple-400" size={20} />
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Eligibility Criteria</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Minimum CGPA</label>
              <input type="number" step="0.01" min="0" max="10" name="minCgpa" value={formData.minCgpa} onChange={handleChange} className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text-primary)] focus:outline-none focus:border-purple-500 transition-all text-sm" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Max Active Backlogs</label>
              <input type="number" min="0" name="maxBacklogs" value={formData.maxBacklogs} onChange={handleChange} className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text-primary)] focus:outline-none focus:border-purple-500 transition-all text-sm" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Target Passout Year <span className="text-red-500">*</span></label>
              <input type="number" name="passoutYear" required value={formData.passoutYear} onChange={handleChange} className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text-primary)] focus:outline-none focus:border-purple-500 transition-all text-sm" placeholder="e.g. 2024" />
            </div>

            <div className="space-y-2 md:col-span-3">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Eligible Branches (Comma separated)</label>
              <input type="text" name="eligibleBranches" value={formData.eligibleBranches} onChange={handleChange} className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-[var(--color-text-primary)] focus:outline-none focus:border-purple-500 transition-all text-sm" placeholder="e.g. CSE, IT, ECE (Leave empty for all)" />
            </div>
          </div>
        </div>

        {/* Rounds */}
        <div className="glass-panel p-6 rounded-2xl border border-[var(--color-border)] space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
            <div className="flex items-center space-x-2">
              <Clock className="text-blue-400" size={20} />
              <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Hiring Rounds</h2>
            </div>
            <button type="button" onClick={addRound} className="text-xs font-bold uppercase tracking-wider flex items-center text-blue-400 hover:text-blue-300 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20 transition-all">
              <Plus size={14} className="mr-1" /> Add Round
            </button>
          </div>

          <div className="space-y-4">
            {formData.rounds.map((round, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-4 items-start bg-[var(--color-bg-primary)]/60 p-4 rounded-xl border border-[var(--color-border)]">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-bold shrink-0 text-sm border border-blue-500/30">
                  {round.order}
                </div>
                <div className="flex-1 space-y-4 w-full">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">Round Name <span className="text-red-500">*</span></label>
                    <input type="text" required value={round.name} onChange={(e) => handleRoundChange(index, 'name', e.target.value)} className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[var(--color-text-primary)] focus:outline-none focus:border-blue-500 text-sm" placeholder="e.g. Online Aptitude Test" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">Description</label>
                    <input type="text" value={round.description} onChange={(e) => handleRoundChange(index, 'description', e.target.value)} className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-[var(--color-text-primary)] focus:outline-none focus:border-blue-500 text-sm" placeholder="e.g. 60 mins test on HackerRank" />
                  </div>
                </div>
                {formData.rounds.length > 1 && (
                  <button type="button" onClick={() => removeRound(index)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg shrink-0 self-center md:self-start transition-colors" title="Remove Round">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4 pt-4">
          <button type="button" onClick={(e) => handleSubmit(e, 'DRAFT')} disabled={loading} className="px-6 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-bold transition-all text-sm">
            Save as Draft
          </button>
          
          {userRole === 'HR' ? (
            <button type="button" onClick={(e) => handleSubmit(e, 'PENDING_APPROVAL')} disabled={loading} className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg text-sm disabled:opacity-50">
              <Save size={18} />
              <span>Submit for Approval</span>
            </button>
          ) : (
            <button type="button" onClick={(e) => handleSubmit(e, 'ACTIVE')} disabled={loading} className="flex items-center space-x-2 bg-[var(--color-brand-primary)] hover:bg-[#00c954] text-[var(--color-bg-primary)] font-bold py-3 px-8 rounded-xl transition-all shadow-lg text-sm disabled:opacity-50">
              <Save size={18} />
              <span>{isEditing ? 'Save Changes' : 'Publish Job Drive'}</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateJobDrive;
