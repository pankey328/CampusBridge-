import React, { useState, useEffect } from 'react';
import { Building2, Calendar, MapPin, DollarSign, BookOpen, AlertCircle, CheckCircle2, X, ArrowUpRight } from 'lucide-react';
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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00ED64]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn w-full pb-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Active Job Drives</h1>
        <p className="text-gray-400">Browse open placement opportunities, check eligibility, and apply.</p>
      </div>

      {drives.length === 0 ? (
        <div className="bg-[#0A192F] p-12 text-center rounded-2xl border border-gray-800">
          <Building2 size={48} className="mx-auto text-gray-500 mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-white mb-2">No Active Drives</h3>
          <p className="text-gray-400">There are currently no job drives available to apply for.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drives.map((drive) => (
            <div key={drive._id} className="bg-[#0A192F] p-6 rounded-2xl border border-gray-800 flex flex-col hover:border-gray-700 transition-all duration-300 shadow-xl">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {drive.companyId?.logoUrl ? (
                      <img src={drive.companyId.logoUrl} alt={drive.companyId.name} className="w-10 h-10 object-contain rounded bg-white p-1" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-[#112240] border border-gray-800 flex items-center justify-center text-gray-400">
                        <Building2 size={20} />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-white truncate max-w-[150px]" title={drive.companyId?.name}>{drive.companyId?.name}</h3>
                      <p className="text-[#00ED64] text-xs font-semibold">{drive.jobRole}</p>
                    </div>
                  </div>
                  {drive.isApplied && (
                    <span className="bg-[#00ED64]/10 text-[#00ED64] text-[10px] px-2 py-0.5 rounded border border-[#00ED64]/20 font-bold flex items-center">
                      <CheckCircle2 size={10} className="mr-1" /> Applied
                    </span>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-300 text-sm">
                    <DollarSign size={16} className="mr-2 text-yellow-400" />
                    <span>{drive.packageLPA} LPA</span>
                  </div>
                  <div className="flex items-center text-gray-300 text-sm">
                    <MapPin size={16} className="mr-2 text-gray-500" />
                    <span>{drive.location}</span>
                  </div>
                  <div className="flex items-center text-gray-300 text-sm">
                    <Calendar size={16} className="mr-2 text-gray-500" />
                    <span>Deadline: {new Date(drive.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {!drive.isEligible && !drive.isApplied && (
                <div className="mb-4 bg-red-950/40 border border-red-800/50 rounded-xl p-3 text-xs text-red-400 flex items-start">
                  <AlertCircle size={14} className="mr-1.5 shrink-0 mt-0.5" />
                  <span>Not Eligible: {drive.ineligibilityReason}</span>
                </div>
              )}

              <button
                onClick={() => setSelectedDrive(drive)}
                className="w-full py-2.5 bg-[#112240] hover:bg-[#1e345e] text-white border border-gray-800 rounded-xl transition-colors text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <span>View Details</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drive Details Modal */}
      {selectedDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0A192F] w-full max-w-2xl rounded-2xl border border-gray-800 max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-800 bg-[#112240]/40 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                {selectedDrive.companyId?.logoUrl ? (
                  <img src={selectedDrive.companyId.logoUrl} alt={selectedDrive.companyId.name} className="w-12 h-12 object-contain rounded bg-white p-1" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-[#112240] flex items-center justify-center text-gray-400 border border-gray-800">
                    <Building2 size={24} />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedDrive.jobRole}</h2>
                  <p className="text-gray-400 text-sm">{selectedDrive.companyId?.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDrive(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#112240] p-4 rounded-xl border border-gray-800">
                  <p className="text-xs text-gray-500 mb-1 uppercase font-semibold">Role</p>
                  <p className="font-bold text-white text-sm">{selectedDrive.jobRole}</p>
                </div>
                <div className="bg-[#112240] p-4 rounded-xl border border-gray-800">
                  <p className="text-xs text-gray-500 mb-1 uppercase font-semibold">Package</p>
                  <p className="font-bold text-[#00ED64] text-sm">₹{selectedDrive.packageLPA} LPA</p>
                </div>
                <div className="bg-[#112240] p-4 rounded-xl border border-gray-800">
                  <p className="text-xs text-gray-500 mb-1 uppercase font-semibold">Location</p>
                  <p className="font-bold text-white text-sm">{selectedDrive.location}</p>
                </div>
                <div className="bg-[#112240] p-4 rounded-xl border border-gray-800">
                  <p className="text-xs text-gray-500 mb-1 uppercase font-semibold">Deadline</p>
                  <p className="font-bold text-red-400 text-sm">{new Date(selectedDrive.deadline).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-3 flex items-center border-b border-gray-850 pb-2">
                  <BookOpen size={16} className="mr-2 text-[#00ED64]" />
                  Job Description
                </h3>
                <div className="text-gray-300 text-xs leading-relaxed whitespace-pre-wrap bg-[#112240] p-4 rounded-xl border border-gray-800 font-mono">
                  {selectedDrive.description}
                </div>
                {selectedDrive.jdFileUrl && (
                  <div className="mt-3">
                    <a
                      href={selectedDrive.jdFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#00ED64]/10 hover:bg-[#00ED64]/20 border border-[#00ED64]/30 rounded-lg text-xs font-bold text-[#00ED64] transition-all"
                    >
                      <BookOpen size={14} />
                      <span>View Official JD Document (PDF)</span>
                    </a>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-base font-bold text-white mb-3 flex items-center border-b border-gray-850 pb-2">
                  <AlertCircle className="mr-2 text-blue-400" size={16} />
                  Eligibility Criteria
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-[#112240] p-3 rounded-lg border border-gray-800 flex justify-between text-xs">
                    <span className="text-gray-400">Min CGPA</span>
                    <span className="text-white font-bold">{selectedDrive.minCgpa}</span>
                  </div>
                  <div className="bg-[#112240] p-3 rounded-lg border border-gray-800 flex justify-between text-xs">
                    <span className="text-gray-400">Max Backlogs</span>
                    <span className="text-white font-bold">{selectedDrive.maxBacklogs}</span>
                  </div>
                  <div className="bg-[#112240] p-3 rounded-lg border border-gray-800 flex justify-between text-xs">
                    <span className="text-gray-400">Passout Year</span>
                    <span className="text-white font-bold">{selectedDrive.passoutYear}</span>
                  </div>
                </div>
                {selectedDrive.eligibleBranches && selectedDrive.eligibleBranches.length > 0 && (
                  <div className="mt-3 bg-[#112240] p-3 rounded-lg border border-gray-800">
                    <span className="text-gray-450 text-xs block mb-2 font-semibold uppercase tracking-wider">Eligible Branches</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedDrive.eligibleBranches.map(b => (
                        <span key={b} className="bg-blue-900/30 text-blue-300 px-2.5 py-1 rounded text-xs font-semibold border border-blue-800/40">{b}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {selectedDrive.rounds && selectedDrive.rounds.length > 0 && (
                <div>
                  <h4 className="text-base font-bold text-white mb-3 flex items-center border-b border-gray-850 pb-2">
                    <Calendar className="mr-2 text-purple-400" size={16} />
                    Selection Rounds
                  </h4>
                  <div className="space-y-2">
                    {selectedDrive.rounds.map((round, idx) => (
                      <div key={round._id || idx} className="bg-[#112240] p-4 rounded-xl border border-gray-800 flex flex-col md:flex-row md:items-center">
                        <div className="bg-[#00ED64]/10 text-[#00ED64] w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 mb-2 md:mb-0 shrink-0 border border-[#00ED64]/20">
                          {round.order || idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{round.name}</p>
                          {round.description && <p className="text-xs text-gray-400 mt-1">{round.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-800 flex items-center justify-end space-x-4 bg-[#112240]/25 rounded-b-2xl">
              <button
                onClick={() => setSelectedDrive(null)}
                className="px-6 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white transition-colors font-semibold text-xs"
              >
                Close
              </button>
              
              {!selectedDrive.isApplied && (
                <button
                  onClick={() => handleApply(selectedDrive._id)}
                  disabled={!selectedDrive.isEligible || isApplying || new Date(selectedDrive.deadline) < new Date()}
                  className={`px-8 py-2.5 rounded-xl font-bold transition-colors shadow-sm text-xs ${
                    new Date(selectedDrive.deadline) < new Date()
                      ? 'bg-red-900/40 cursor-not-allowed text-red-400 opacity-80 border border-red-800/50'
                      : selectedDrive.isEligible
                        ? 'bg-[#00ED64] hover:bg-[#00c954] text-[#0A192F]'
                        : 'bg-gray-800 border border-gray-700 cursor-not-allowed text-gray-500 opacity-50'
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
