import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, Users, Building2, BookOpen, Clock, Briefcase } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CreateJobDrive = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [hrs, setHrs] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    hrId: '',
    jobRole: '',
    description: '',
    packageLPA: '',
    location: '',
    deadline: '',
    status: 'DRAFT',
    minCgpa: 0,
    maxBacklogs: 0,
    eligibleBranches: '',
    rounds: [{ name: '', description: '', order: 1 }]
  });

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  useEffect(() => {
    const init = async () => {
      try {
        const hrRes = await api.get('/admin/hr?status=ACTIVE', getAuthHeader());
        setHrs(hrRes.data.data);

        if (isEditing) {
          const driveRes = await api.get(`/admin/job-drives/${id}`, getAuthHeader());
          const drive = driveRes.data.data;
          setFormData({
            title: drive.title || '',
            hrId: drive.postedByHR?._id || drive.postedByHR || '',
            jobRole: drive.jobRole || '',
            description: drive.description || '',
            packageLPA: drive.packageLPA || '',
            location: drive.location || '',
            deadline: drive.deadline ? new Date(drive.deadline).toISOString().split('T')[0] : '',
            status: drive.status || 'DRAFT',
            minCgpa: drive.minCgpa || 0,
            maxBacklogs: drive.maxBacklogs || 0,
            eligibleBranches: drive.eligibleBranches ? drive.eligibleBranches.join(', ') : '',
            rounds: drive.rounds && drive.rounds.length > 0 ? drive.rounds : [{ name: '', description: '', order: 1 }]
          });
        }
      } catch (error) {
        toast.error("Failed to load data");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedHr = hrs.find(hr => hr.id === formData.hrId);
      if (!selectedHr) {
        toast.error("Please select a Corporate Partner");
        setLoading(false);
        return;
      }

      const payload = {
        ...formData,
        companyId: selectedHr.companyId,
        companyName: selectedHr.companyName,
        postedByHR: selectedHr.id,
        eligibleBranches: formData.eligibleBranches.split(',').map(b => b.trim()).filter(Boolean),
        rounds: formData.rounds.filter(r => r.name.trim() !== '')
      };

      if (isEditing) {
        await api.put(`/admin/job-drives/${id}`, payload, getAuthHeader());
        toast.success("Job drive updated successfully");
      } else {
        await api.post('/admin/job-drives', payload, getAuthHeader());
        toast.success("Job drive created successfully");
      }
      navigate('/admin/job-drives');
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-8 flex justify-center text-white">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen">
      <button
        onClick={() => navigate('/admin/job-drives')}
        className="inline-flex items-center text-[var(--color-text-secondary)] hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Job Drives
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          {isEditing ? 'Edit Job Drive' : 'Create Job Drive'}
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-2">
          Configure the job details, eligibility criteria, and hiring rounds.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Details */}
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex items-center space-x-2 border-b border-gray-800 pb-4">
            <Briefcase className="text-[#00ED64]" />
            <h2 className="text-xl font-semibold text-white">Basic Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-400">Job Title <span className="text-red-500">*</span></label>
              <input type="text" name="title" required value={formData.title} onChange={handleChange} className="w-full bg-[#0A192F] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00ED64]" placeholder="e.g. Software Development Engineer" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Corporate Partner (HR) <span className="text-red-500">*</span></label>
              <select name="hrId" required value={formData.hrId} onChange={handleChange} className="w-full bg-[#0A192F] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00ED64]">
                <option value="">Select HR Partner</option>
                {hrs.map(hr => (
                  <option key={hr.id} value={hr.id}>{hr.companyName} - {hr.email}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Job Role <span className="text-red-500">*</span></label>
              <input type="text" name="jobRole" required value={formData.jobRole} onChange={handleChange} className="w-full bg-[#0A192F] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00ED64]" placeholder="e.g. Frontend Developer" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-400">Description <span className="text-red-500">*</span></label>
              <textarea name="description" required value={formData.description} onChange={handleChange} rows="4" className="w-full bg-[#0A192F] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00ED64] resize-none" placeholder="Job description and responsibilities..."></textarea>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Package (LPA) <span className="text-red-500">*</span></label>
              <input type="number" step="0.1" name="packageLPA" required value={formData.packageLPA} onChange={handleChange} className="w-full bg-[#0A192F] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00ED64]" placeholder="e.g. 12.5" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Location <span className="text-red-500">*</span></label>
              <input type="text" name="location" required value={formData.location} onChange={handleChange} className="w-full bg-[#0A192F] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00ED64]" placeholder="e.g. Bangalore, India" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Application Deadline <span className="text-red-500">*</span></label>
              <input type="date" name="deadline" required value={formData.deadline} onChange={handleChange} className="w-full bg-[#0A192F] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00ED64]" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-[#0A192F] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00ED64]">
                <option value="DRAFT">Draft</option>
                <option value="PENDING_APPROVAL">Pending Approval</option>
                <option value="ACTIVE">Active (Published)</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Eligibility Criteria */}
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex items-center space-x-2 border-b border-gray-800 pb-4">
            <BookOpen className="text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Eligibility Criteria</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Minimum CGPA</label>
              <input type="number" step="0.01" min="0" max="10" name="minCgpa" value={formData.minCgpa} onChange={handleChange} className="w-full bg-[#0A192F] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Max Active Backlogs Allowed</label>
              <input type="number" min="0" name="maxBacklogs" value={formData.maxBacklogs} onChange={handleChange} className="w-full bg-[#0A192F] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-400">Eligible Branches (Comma separated)</label>
              <input type="text" name="eligibleBranches" value={formData.eligibleBranches} onChange={handleChange} className="w-full bg-[#0A192F] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500" placeholder="e.g. CSE, IT, ECE (Leave empty for all)" />
            </div>
          </div>
        </div>

        {/* Rounds */}
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div className="flex items-center space-x-2">
              <Clock className="text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Hiring Rounds</h2>
            </div>
            <button type="button" onClick={addRound} className="text-sm flex items-center text-blue-400 hover:text-blue-300">
              <Plus size={16} className="mr-1" /> Add Round
            </button>
          </div>

          <div className="space-y-4">
            {formData.rounds.map((round, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-4 items-start bg-[#0A192F]/50 p-4 rounded-lg border border-gray-800">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-900/50 text-blue-400 font-bold shrink-0">
                  {round.order}
                </div>
                <div className="flex-1 space-y-4 w-full">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Round Name <span className="text-red-500">*</span></label>
                    <input type="text" required value={round.name} onChange={(e) => handleRoundChange(index, 'name', e.target.value)} className="w-full bg-[#112240] border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm" placeholder="e.g. Online Aptitude Test" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Description</label>
                    <input type="text" value={round.description} onChange={(e) => handleRoundChange(index, 'description', e.target.value)} className="w-full bg-[#112240] border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm" placeholder="e.g. 60 mins test on HackerRank" />
                  </div>
                </div>
                {formData.rounds.length > 1 && (
                  <button type="button" onClick={() => removeRound(index)} className="p-2 text-red-500 hover:bg-red-500/10 rounded shrink-0 self-center md:self-start">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-6">
          <button type="submit" disabled={loading} className="flex items-center space-x-2 bg-[#00ED64] hover:bg-[#00c954] text-[#0A192F] font-bold py-3 px-8 rounded-lg transition-colors disabled:opacity-50">
            <Save size={20} />
            <span>{isEditing ? 'Save Changes' : 'Publish Job Drive'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};

export default CreateJobDrive;
