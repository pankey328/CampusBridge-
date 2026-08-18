import React, { useState, useEffect } from 'react';
import { Briefcase, Building2, Calendar, MapPin, DollarSign, CheckCircle2, Clock, XCircle, ArrowRightCircle, Video } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data } = await api.get('/student/applications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setApplications(data.data);
    } catch (error) {
      toast.error('Failed to load your applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'APPLIED':
        return { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: <Clock size={16} className="mr-1.5" />, label: 'Applied' };
      case 'SHORTLISTED':
        return { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: <ArrowRightCircle size={16} className="mr-1.5" />, label: 'Shortlisted' };
      case 'INTERVIEW_SCHEDULED':
        return { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: <Calendar size={16} className="mr-1.5" />, label: 'Interview Scheduled' };
      case 'HIRED':
        return { color: 'text-[var(--color-brand-primary)]', bg: 'bg-[var(--color-brand-primary)]/10', border: 'border-[var(--color-brand-primary)]/20', icon: <CheckCircle2 size={16} className="mr-1.5" />, label: 'Hired / Placed' };
      case 'REJECTED':
        return { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: <XCircle size={16} className="mr-1.5" />, label: 'Not Selected' };
      default:
        return { color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20', icon: <Clock size={16} className="mr-1.5" />, label: status };
    }
  };

  if (loading) {
    return <div className="p-8 text-[var(--color-text-secondary)]">Loading your applications...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">My Applications</h1>
        <p className="text-[var(--color-text-secondary)]">Track the status of the job drives you have applied for.</p>
      </div>

      {applications.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl">
          <Briefcase size={48} className="mx-auto text-[var(--color-text-secondary)] mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">No Applications Yet</h3>
          <p className="text-[var(--color-text-secondary)] mb-6">You haven't applied to any job drives yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const drive = app.jobDriveId;
            const statusConfig = getStatusConfig(app.status);
            const slot = app.interviewSlot;
            
            let canJoin = false;
            let timeString = '';
            
            if (slot) {
              const start = new Date(slot.startTime);
              const now = new Date();
              const fiveMinsBefore = new Date(start.getTime() - 5 * 60000);
              canJoin = now >= fiveMinsBefore;
              timeString = start.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
            }

            return (
              <div key={app._id} className="glass-panel p-6 rounded-xl flex flex-col md:flex-row md:items-start justify-between gap-6 hover:border-gray-500/30 transition-colors">
                
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] flex items-center justify-center shrink-0">
                    <Building2 className="text-[var(--color-text-secondary)]" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--color-text-primary)]">{drive.jobRole}</h3>
                    <p className="text-[var(--color-text-secondary)] font-medium">{drive.companyId?.name}</p>
                    
                    <div className="flex flex-wrap gap-4 mt-3">
                      <div className="flex items-center text-[var(--color-text-secondary)] text-sm">
                        <DollarSign size={14} className="mr-1" />
                        <span>{drive.packageLPA} LPA</span>
                      </div>
                      <div className="flex items-center text-[var(--color-text-secondary)] text-sm">
                        <MapPin size={14} className="mr-1" />
                        <span>{drive.location}</span>
                      </div>
                      <div className="flex items-center text-[var(--color-text-secondary)] text-sm">
                        <Calendar size={14} className="mr-1" />
                        <span>Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0 w-full md:w-auto">
                  <span className={`px-4 py-2 rounded-lg border font-semibold flex items-center mb-4 ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                    {statusConfig.icon}
                    {statusConfig.label}
                  </span>

                  {app.status === 'INTERVIEW_SCHEDULED' && slot && (
                    <div className="w-full bg-[#0A192F] p-4 rounded-lg border border-[#00ED64]/30 flex flex-col">
                      <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider font-semibold">Assigned Slot</p>
                      <p className="text-[#00ED64] font-bold text-sm mb-3">{timeString}</p>
                      
                      {slot.mode === 'ONLINE' ? (
                        <a 
                          href={canJoin ? slot.meetingLink : '#'}
                          target={canJoin ? "_blank" : "_self"}
                          rel="noreferrer"
                          className={`flex items-center justify-center px-4 py-2 rounded font-bold text-xs transition-colors ${
                            canJoin 
                              ? 'bg-[#00ED64] text-[#0A192F] hover:bg-[#00c954]' 
                              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          }`}
                          onClick={(e) => {
                            if (!canJoin) {
                              e.preventDefault();
                              toast('Link will activate 5 minutes before the start time.', { icon: '⏳' });
                            }
                          }}
                        >
                          <Video size={14} className="mr-2" />
                          {canJoin ? 'Join Interview' : 'Locked'}
                        </a>
                      ) : (
                        <div className="bg-white/5 px-3 py-2 rounded text-sm text-gray-300 flex flex-col">
                          <span className="font-semibold text-gray-400 text-xs">Venue</span>
                          <span>{slot.venueBuilding}, {slot.venueRoom}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};



export default MyApplications;
