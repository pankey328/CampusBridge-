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
        return { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: <Clock size={14} className="mr-1" />, label: 'Applied' };
      case 'SHORTLISTED':
        return { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: <ArrowRightCircle size={14} className="mr-1" />, label: 'Shortlisted' };
      case 'INTERVIEW_SCHEDULED':
        return { color: 'text-blue-400', bg: 'bg-blue-900/30', border: 'border-blue-800/40', icon: <Calendar size={14} className="mr-1" />, label: 'Interview' };
      case 'HIRED':
        return { color: 'text-[#00ED64]', bg: 'bg-[#00ED64]/10', border: 'border-[#00ED64]/20', icon: <CheckCircle2 size={14} className="mr-1" />, label: 'Hired' };
      case 'REJECTED':
        return { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: <XCircle size={14} className="mr-1" />, label: 'Rejected' };
      default:
        return { color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20', icon: <Clock size={14} className="mr-1" />, label: status };
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
        <h1 className="text-3xl font-bold text-white mb-2">My Applications</h1>
        <p className="text-gray-400">Track and review the real-time status of placement drives you have applied for.</p>
      </div>

      {applications.length === 0 ? (
        <div className="bg-[#0A192F] p-12 text-center rounded-2xl border border-gray-800">
          <Briefcase size={48} className="mx-auto text-gray-500 mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-white mb-2">No Applications Yet</h3>
          <p className="text-gray-400 mb-6">You have not applied to any job drives yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const drive = app.jobDriveId;
            const statusConfig = getStatusConfig(app.status);
            const slot = app.interviewSlot;
            
            let canJoin = false;
            let hasEnded = false;
            let timeString = '';
            
            if (slot) {
              const start = new Date(slot.startTime);
              const end = new Date(slot.endTime);
              const now = new Date();
              const fiveMinsBefore = new Date(start.getTime() - 5 * 60000);
              canJoin = now >= fiveMinsBefore && now <= end;
              hasEnded = now > end;
              timeString = start.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
            }

            return (
              <div key={app._id} className="bg-[#0A192F] p-6 rounded-2xl border border-gray-800 flex flex-col md:flex-row md:items-start justify-between gap-6 hover:border-gray-700 transition-colors shadow-xl">
                
                <div className="flex items-start space-x-4 flex-1">
                  {drive.companyId?.logoUrl ? (
                    <img src={drive.companyId.logoUrl} alt={drive.companyId.name} className="w-12 h-12 object-contain rounded bg-white p-1 shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#112240] border border-gray-800 flex items-center justify-center shrink-0 text-gray-455">
                      <Building2 size={24} />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-white">{drive.jobRole}</h3>
                    <p className="text-[#00ED64] text-xs font-semibold">{drive.companyId?.name}</p>
                    
                    <div className="flex flex-wrap gap-4 mt-3">
                      <div className="flex items-center text-gray-400 text-xs">
                        <DollarSign size={14} className="mr-1 text-yellow-450" />
                        <span>{drive.packageLPA} LPA</span>
                      </div>
                      <div className="flex items-center text-gray-400 text-xs">
                        <MapPin size={14} className="mr-1 text-gray-500" />
                        <span>{drive.location}</span>
                      </div>
                      <div className="flex items-center text-gray-400 text-xs">
                        <Calendar size={14} className="mr-1 text-gray-500" />
                        <span>Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0 w-full md:w-auto">
                  <span className={`px-3.5 py-1.5 rounded-full border text-xs font-bold flex items-center mb-4 ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                    {statusConfig.icon}
                    {statusConfig.label}
                  </span>

                  {app.status === 'INTERVIEW_SCHEDULED' && slot && (
                    <div className="w-full bg-[#112240] p-4 rounded-xl border border-gray-800 flex flex-col min-w-[220px]">
                      <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wider font-semibold">Assigned Slot</p>
                      <p className="text-[#00ED64] font-bold text-sm mb-3">{timeString}</p>
                      
                      {slot.mode === 'ONLINE' ? (
                        <>
                          {hasEnded ? (
                            <div className="flex items-center justify-center px-4 py-2.5 rounded-lg font-bold text-xs bg-gray-900 text-gray-500 border border-gray-800 cursor-not-allowed">
                              <Video size={14} className="mr-1.5 opacity-50" />
                              <span>Interview Ended</span>
                            </div>
                          ) : (
                            <>
                              <a 
                                href={canJoin ? slot.meetingLink : '#'}
                                target={canJoin ? "_blank" : "_self"}
                                rel="noreferrer"
                                className={`flex items-center justify-center px-4 py-2.5 rounded-lg font-bold text-xs transition-colors ${
                                  canJoin 
                                    ? 'bg-[#00ED64] text-[#0A192F] hover:bg-[#00c954]' 
                                    : 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'
                                }`}
                                onClick={(e) => {
                                  if (!canJoin) {
                                    e.preventDefault();
                                    toast('Meeting link will activate 5 minutes before the start time.', { icon: '⏳' });
                                  }
                                }}
                              >
                                <Video size={14} className="mr-1.5" />
                                {canJoin ? 'Join Interview' : 'Locked'}
                              </a>
                              {!canJoin && (
                                <p className="text-[10px] text-gray-500 mt-2 text-center">
                                  Unlocks 5 mins before start
                                </p>
                              )}
                            </>
                          )}
                        </>
                      ) : (
                        <div className="bg-[#0A192F] p-3 rounded-lg border border-gray-800 flex flex-col text-xs text-gray-300">
                          <span className="font-semibold text-gray-550 text-[10px] uppercase tracking-wider">Venue</span>
                          <span className="font-bold text-white mt-1">{slot.venueBuilding}, Room {slot.venueRoom}</span>
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
