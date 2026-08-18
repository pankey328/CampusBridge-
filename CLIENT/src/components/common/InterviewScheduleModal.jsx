import React, { useState } from 'react';
import { X, Calendar, Clock, Video, MapPin, Users } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const InterviewScheduleModal = ({ isOpen, onClose, selectedStudents, jobDriveId, basePath, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    mode: 'ONLINE',
    slotDate: '',
    startTime: '',
    durationMinutes: 20,
    meetingLink: '',
    venueBuilding: '',
    venueRoom: ''
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        studentIds: selectedStudents.map(app => app.studentId._id || app.studentId),
        ...formData,
        durationMinutes: Number(formData.durationMinutes)
      };

      await api.post(`/interviews/job-drives/${jobDriveId}/schedule`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      toast.success(`Successfully scheduled interviews for ${selectedStudents.length} students!`);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to schedule interviews');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#112240] w-full max-w-2xl rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-white">Schedule Interviews</h2>
            <p className="text-sm text-gray-400 mt-1 flex items-center">
              <Users size={14} className="mr-1" />
              Scheduling for {selectedStudents.length} selected students
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            
            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className="text-sm font-medium text-gray-400">Date <span className="text-red-500">*</span></label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="date" 
                  name="slotDate"
                  required
                  value={formData.slotDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-[#0A192F] border border-gray-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-[#00ED64]"
                />
              </div>
            </div>

            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className="text-sm font-medium text-gray-400">Start Time <span className="text-red-500">*</span></label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="time" 
                  name="startTime"
                  required
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full bg-[#0A192F] border border-gray-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-[#00ED64]"
                />
              </div>
            </div>

            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className="text-sm font-medium text-gray-400">Mode <span className="text-red-500">*</span></label>
              <select 
                name="mode" 
                value={formData.mode} 
                onChange={handleChange}
                className="w-full bg-[#0A192F] border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#00ED64]"
              >
                <option value="ONLINE">Online (Virtual)</option>
                <option value="ON_CAMPUS">Offline (On-Campus)</option>
              </select>
            </div>

            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className="text-sm font-medium text-gray-400">Duration (Mins per Student) <span className="text-red-500">*</span></label>
              <input 
                type="number" 
                name="durationMinutes"
                required
                min="5"
                value={formData.durationMinutes}
                onChange={handleChange}
                className="w-full bg-[#0A192F] border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#00ED64]"
              />
              <p className="text-xs text-gray-500 mt-1">A 5-min buffer is added automatically</p>
            </div>

            {formData.mode === 'ONLINE' ? (
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium text-gray-400">Meeting Link (GMeet / Zoom) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Video className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="url" 
                    name="meetingLink"
                    required
                    placeholder="https://meet.google.com/..."
                    value={formData.meetingLink}
                    onChange={handleChange}
                    className="w-full bg-[#0A192F] border border-gray-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-[#00ED64]"
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <label className="text-sm font-medium text-gray-400">Building <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="text" 
                      name="venueBuilding"
                      required
                      placeholder="e.g. Main Block"
                      value={formData.venueBuilding}
                      onChange={handleChange}
                      className="w-full bg-[#0A192F] border border-gray-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-[#00ED64]"
                    />
                  </div>
                </div>
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <label className="text-sm font-medium text-gray-400">Room Number <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="venueRoom"
                    required
                    placeholder="e.g. Room 402"
                    value={formData.venueRoom}
                    onChange={handleChange}
                    className="w-full bg-[#0A192F] border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#00ED64]"
                  />
                </div>
              </>
            )}

          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-800">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-2 rounded-lg font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2 rounded-lg font-bold text-[#001E2B] bg-[#00ED64] hover:bg-[#00c954] transition-colors disabled:opacity-50 flex items-center"
            >
              {loading ? 'Scheduling...' : 'Confirm Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InterviewScheduleModal;
