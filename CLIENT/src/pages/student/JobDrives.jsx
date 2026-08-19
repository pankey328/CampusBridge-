import React, { useState, useEffect } from 'react';
import { Building2, Calendar, MapPin, DollarSign, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const JobDrives = () => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    try {
      const { data } = await api.get('/student/drives', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDrives(data.data);
    } catch (error) {
      toast.error('Failed to load job drives');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (driveId) => {
    setIsApplying(true);
    try {
      await api.post('/student/drives/apply', { jobDriveId: driveId }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Successfully applied to the job drive!');
      setSelectedDrive(null);
      fetchDrives();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply');
    } finally {
      setIsApplying(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-[var(--color-text-secondary)]">Loading available job drives...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">Active Job Drives</h1>
        <p className="text-[var(--color-text-secondary)]">Browse and apply to the latest placement opportunities.</p>
      </div>

      {drives.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl">
          <Building2 size={48} className="mx-auto text-[var(--color-text-secondary)] mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">No Active Drives</h3>
          <p className="text-[var(--color-text-secondary)]">There are currently no job drives available to apply for.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drives.map((drive) => (
            <div key={drive._id} className="glass-panel p-6 rounded-2xl flex flex-col hover:-translate-y-1 transition-transform duration-300">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-[var(--color-text-primary)] truncate">{drive.companyId?.name}</h3>
                    <p className="text-[var(--color-brand-primary)] font-medium">{drive.jobRole}</p>
                  </div>
                  {drive.isApplied && (
                    <span className="bg-blue-500/10 text-blue-400 text-xs px-2 py-1 rounded border border-blue-500/20 font-medium flex items-center">
                      <CheckCircle2 size={12} className="mr-1" /> Applied
                    </span>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-[var(--color-text-secondary)] text-sm">
                    <DollarSign size={16} className="mr-2" />
                    <span>{drive.packageLPA} LPA</span>
                  </div>
                  <div className="flex items-center text-[var(--color-text-secondary)] text-sm">
                    <MapPin size={16} className="mr-2" />
                    <span>{drive.location}</span>
                  </div>
                  <div className="flex items-center text-[var(--color-text-secondary)] text-sm">
                    <Calendar size={16} className="mr-2" />
                    <span>Deadline: {new Date(drive.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {!drive.isEligible && !drive.isApplied && (
                <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded p-3 text-xs text-red-400 flex items-start">
                  <AlertCircle size={14} className="mr-1.5 shrink-0 mt-0.5" />
                  <span>Not Eligible: {drive.ineligibilityReason}</span>
                </div>
              )}

              <button
                onClick={() => setSelectedDrive(drive)}
                className="w-full py-2.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-primary)] transition-colors font-medium"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drive Details Modal */}
      {selectedDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-2xl rounded-2xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-[var(--color-border)]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">{selectedDrive.jobRole}</h2>
                  <p className="text-[var(--color-text-secondary)] text-lg">{selectedDrive.companyId?.name}</p>
                </div>
                {selectedDrive.isApplied && (
                  <span className="bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded border border-blue-500/20 font-semibold flex items-center">
                    <CheckCircle2 size={16} className="mr-1.5" /> Status: {selectedDrive.applicationStatus}
                  </span>
                )}
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[var(--color-bg-primary)] p-4 rounded-xl border border-[var(--color-border)]">
                  <p className="text-xs text-[var(--color-text-secondary)] mb-1">Role</p>
                  <p className="font-semibold text-[var(--color-text-primary)]">{selectedDrive.jobRole}</p>
                </div>
                <div className="bg-[var(--color-bg-primary)] p-4 rounded-xl border border-[var(--color-border)]">
                  <p className="text-xs text-[var(--color-text-secondary)] mb-1">Package</p>
                  <p className="font-semibold text-[var(--color-brand-primary)]">₹{selectedDrive.packageLPA} LPA</p>
                </div>
                <div className="bg-[var(--color-bg-primary)] p-4 rounded-xl border border-[var(--color-border)]">
                  <p className="text-xs text-[var(--color-text-secondary)] mb-1">Location</p>
                  <p className="font-semibold text-[var(--color-text-primary)]">{selectedDrive.location}</p>
                </div>
                <div className="bg-[var(--color-bg-primary)] p-4 rounded-xl border border-[var(--color-border)]">
                  <p className="text-xs text-[var(--color-text-secondary)] mb-1">Deadline</p>
                  <p className="font-semibold text-red-400">{new Date(selectedDrive.deadline).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-3 flex items-center border-b border-[var(--color-border)] pb-2">
                  <BookOpen size={18} className="mr-2 text-[var(--color-brand-primary)]" />
                  Description
                </h3>
                <div className="text-[var(--color-text-secondary)] text-sm leading-relaxed whitespace-pre-wrap bg-[var(--color-bg-primary)] p-4 rounded-xl border border-[var(--color-border)]">
                  {selectedDrive.description}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold text-[var(--color-text-primary)] mb-3 flex items-center border-b border-[var(--color-border)] pb-2">
                  <AlertCircle className="mr-2 text-blue-400" size={18} />
                  Eligibility Criteria
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-[var(--color-bg-primary)] p-3 rounded-lg border border-[var(--color-border)] flex justify-between">
                    <span className="text-[var(--color-text-secondary)] text-sm">Min CGPA</span>
                    <span className="text-[var(--color-text-primary)] font-bold">{selectedDrive.minCgpa}</span>
                  </div>
                  <div className="bg-[var(--color-bg-primary)] p-3 rounded-lg border border-[var(--color-border)] flex justify-between">
                    <span className="text-[var(--color-text-secondary)] text-sm">Max Backlogs</span>
                    <span className="text-[var(--color-text-primary)] font-bold">{selectedDrive.maxBacklogs}</span>
                  </div>
                  <div className="bg-[var(--color-bg-primary)] p-3 rounded-lg border border-[var(--color-border)] flex justify-between">
                    <span className="text-[var(--color-text-secondary)] text-sm">Passout Year</span>
                    <span className="text-[var(--color-text-primary)] font-bold">{selectedDrive.passoutYear}</span>
                  </div>
                </div>
                {selectedDrive.eligibleBranches && selectedDrive.eligibleBranches.length > 0 && (
                  <div className="mt-3 bg-[var(--color-bg-primary)] p-3 rounded-lg border border-[var(--color-border)]">
                    <span className="text-[var(--color-text-secondary)] text-sm block mb-2">Eligible Branches</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedDrive.eligibleBranches.map(b => (
                        <span key={b} className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs font-medium">{b}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {selectedDrive.rounds && selectedDrive.rounds.length > 0 && (
                <div>
                  <h4 className="text-lg font-bold text-[var(--color-text-primary)] mb-3 flex items-center border-b border-[var(--color-border)] pb-2">
                    <Calendar className="mr-2 text-purple-400" size={18} />
                    Selection Rounds
                  </h4>
                  <div className="space-y-3">
                    {selectedDrive.rounds.map((round, idx) => (
                      <div key={round._id || idx} className="bg-[var(--color-bg-primary)] p-4 rounded-xl border border-[var(--color-border)] flex flex-col md:flex-row md:items-center">
                        <div className="bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 mb-2 md:mb-0 shrink-0">
                          {round.order || idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-[var(--color-text-primary)]">{round.name}</p>
                          {round.description && <p className="text-sm text-[var(--color-text-secondary)] mt-1">{round.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-[var(--color-border)] flex items-center justify-end space-x-4 bg-[var(--color-bg-secondary)] rounded-b-2xl">
              <button
                onClick={() => setSelectedDrive(null)}
                className="px-6 py-2.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-primary)] transition-colors font-medium"
              >
                Close
              </button>
              
              {!selectedDrive.isApplied && (
                <button
                  onClick={() => handleApply(selectedDrive._id)}
                  disabled={!selectedDrive.isEligible || isApplying || new Date(selectedDrive.deadline) < new Date()}
                  className={`px-8 py-2.5 rounded-lg font-bold transition-colors shadow-sm ${
                    new Date(selectedDrive.deadline) < new Date()
                      ? 'bg-red-900/50 cursor-not-allowed text-red-400 opacity-80 border border-red-800/50'
                      : selectedDrive.isEligible
                        ? 'bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-hover)] text-[#001E2B]'
                        : 'bg-gray-600 cursor-not-allowed text-gray-300 opacity-50'
                  }`}
                >
                  {new Date(selectedDrive.deadline) < new Date() 
                    ? 'Deadline Passed' 
                    : isApplying 
                      ? 'Applying...' 
                      : selectedDrive.isEligible 
                        ? 'Apply Now' 
                        : 'Not Eligible to Apply'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDrives;
