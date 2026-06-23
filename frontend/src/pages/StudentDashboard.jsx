import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Briefcase, FileText, User as UserIcon, Upload, Calendar, CheckCircle2, AlertCircle, MapPin, DollarSign, ExternalLink } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs', 'applications', 'profile'
  
  // State variables
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState({
    rollNumber: '',
    department: '',
    cgpa: '',
    skills: '',
    experience: '',
    contactNumber: '',
    resumeUrl: '',
    resumeOriginalName: '',
  });

  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      if (activeTab === 'jobs') {
        const [jobsRes, appsRes] = await Promise.all([
          api.get('/jobs'),
          api.get('/applications/my')
        ]);
        setJobs(jobsRes.data.jobs);
        setApplications(appsRes.data.applications);
      } else if (activeTab === 'applications') {
        const res = await api.get('/applications/my');
        setApplications(res.data.applications);
      } else if (activeTab === 'profile') {
        const res = await api.get('/profile/me');
        if (res.data.profile) {
          const p = res.data.profile;
          setProfile({
            rollNumber: p.rollNumber === 'NOT_SET' ? '' : p.rollNumber,
            department: p.department === 'NOT_SET' ? '' : p.department,
            cgpa: p.cgpa === 0 ? '' : p.cgpa,
            skills: p.skills ? p.skills.join(', ') : '',
            experience: p.experience || '',
            contactNumber: p.contactNumber || '',
            resumeUrl: p.resumeUrl || '',
            resumeOriginalName: p.resumeOriginalName || '',
          });
        }
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to fetch dashboard data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profile.rollNumber || !profile.department || !profile.cgpa) {
      setMessage({ text: 'Please fill in Roll Number, Department, and CGPA', type: 'error' });
      return;
    }

    try {
      setBtnLoading(true);
      const res = await api.put('/profile/me', profile);
      if (res.data.success) {
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to update profile', type: 'error' });
    } finally {
      setBtnLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setMessage({ text: 'Please choose a file first', type: 'error' });
      return;
    }

    const formData = new FormData();
    formData.append('resume', selectedFile);

    try {
      setBtnLoading(true);
      const res = await api.post('/profile/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (res.data.success) {
        setProfile((prev) => ({
          ...prev,
          resumeUrl: res.data.profile.resumeUrl,
          resumeOriginalName: res.data.profile.resumeOriginalName,
        }));
        setSelectedFile(null);
        setMessage({ text: 'Resume uploaded successfully!', type: 'success' });
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Resume upload failed. Must be a PDF under 5MB.', type: 'error' });
    } finally {
      setBtnLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    try {
      setBtnLoading(true);
      const res = await api.post(`/applications/apply/${jobId}`);
      if (res.data.success) {
        setMessage({ text: 'Application submitted successfully!', type: 'success' });
        fetchData();
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Application failed.', type: 'error' });
    } finally {
      setBtnLoading(false);
    }
  };

  const hasApplied = (jobId) => {
    return applications.some((app) => app.job?._id === jobId);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'selected':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Selected</span>;
      case 'shortlisted':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Shortlisted</span>;
      case 'interviewing':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Interviewing</span>;
      case 'rejected':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">Rejected</span>;
      default:
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">Applied</span>;
    }
  };

  return (
    <>
      <Helmet>
        <title>Student Portal | CareerGate</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Student Dashboard</h1>
            <p className="text-slate-400 mt-1">Hello, {user?.name}. Browse job openings and track applications.</p>
          </div>
          
          {/* Tabs header */}
          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 shrink-0 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'jobs' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Job Board
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'applications' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              Applications
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              My Profile
            </button>
          </div>
        </div>

        {/* Global Notifications inside view */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 animate-fade-in ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        {/* Tabs views */}
        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div>
            {/* JOB BOARD */}
            {activeTab === 'jobs' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
                {jobs.length === 0 ? (
                  <div className="col-span-full glass-card p-12 text-center rounded-2xl border border-slate-800">
                    <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-300">No Jobs Available</h3>
                    <p className="text-slate-500 text-sm mt-1">There are no approved job listings currently active. Please check back later.</p>
                  </div>
                ) : (
                  jobs.map((job) => {
                    const applied = hasApplied(job._id);
                    return (
                      <div key={job._id} className="glass-card glass-card-hover rounded-2xl p-6 flex flex-col justify-between h-full border border-slate-800">
                        <div>
                          <div className="flex justify-between items-start gap-3 mb-4">
                            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                              {job.companyName}
                            </span>
                            <span className="flex items-center gap-1 text-emerald-400 font-bold text-sm text-glow-emerald">
                              <DollarSign className="w-4 h-4 shrink-0" />
                              {job.ctc} LPA
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-100 mb-2">{job.title}</h3>
                          <div className="flex items-center gap-1 text-slate-400 text-xs mb-4">
                            <MapPin className="w-3.5 h-3.5" />
                            {job.location}
                          </div>
                          
                          <div className="border-t border-slate-800/80 pt-4 mb-4">
                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Requirements:</h4>
                            <p className="text-slate-300 text-sm line-clamp-3">{job.requirements}</p>
                          </div>
                        </div>

                        <div className="border-t border-slate-800/80 pt-4 flex gap-3">
                          <button
                            onClick={() => handleApply(job._id)}
                            disabled={applied || btnLoading}
                            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                              applied
                                ? 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/10 active:scale-98'
                            }`}
                          >
                            {applied ? 'Applied' : 'Apply Now'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* MY APPLICATIONS */}
            {activeTab === 'applications' && (
              <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden animate-slide-up">
                {applications.length === 0 ? (
                  <div className="p-12 text-center">
                    <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-300">No Applications Yet</h3>
                    <p className="text-slate-500 text-sm mt-1">You haven't applied to any job postings. Switch to the Job Board to get started.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/40 text-xs font-semibold uppercase tracking-wider text-slate-400">
                          <th className="p-4 pl-6">Company & Position</th>
                          <th className="p-4">Package</th>
                          <th className="p-4">Applied Date</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 pr-6">Feedback / Comments</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 text-sm">
                        {applications.map((app) => (
                          <tr key={app._id} className="hover:bg-slate-900/20 transition-colors">
                            <td className="p-4 pl-6">
                              <div className="font-semibold text-slate-200">{app.job?.title || 'Unknown Position'}</div>
                              <div className="text-slate-500 text-xs mt-0.5">{app.job?.companyName || 'Unknown Company'}</div>
                            </td>
                            <td className="p-4 text-emerald-400 font-medium">
                              {app.job ? `${app.job.ctc} LPA` : 'N/A'}
                            </td>
                            <td className="p-4 text-slate-400 flex items-center gap-1.5 mt-2">
                              <Calendar className="w-4 h-4 text-slate-500" />
                              {new Date(app.appliedAt).toLocaleDateString()}
                            </td>
                            <td className="p-4">
                              {getStatusBadge(app.status)}
                            </td>
                            <td className="p-4 pr-6 text-slate-400 italic max-w-xs truncate" title={app.feedback}>
                              {app.feedback || <span className="text-slate-600">Pending recruiter feedback...</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* MY PROFILE */}
            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up">
                {/* Profile Form */}
                <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-800">
                  <h3 className="text-lg font-bold text-white mb-6 border-b border-slate-850 pb-3">Academic & Contact Information</h3>
                  
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Roll Number / ID</label>
                        <input
                          type="text"
                          name="rollNumber"
                          required
                          placeholder="e.g. CSE2026115"
                          value={profile.rollNumber}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Department / Stream</label>
                        <input
                          type="text"
                          name="department"
                          required
                          placeholder="e.g. Computer Science Engineering"
                          value={profile.department}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">CGPA (0 - 10.0)</label>
                        <input
                          type="number"
                          name="cgpa"
                          required
                          min="0"
                          max="10"
                          step="0.01"
                          placeholder="e.g. 9.15"
                          value={profile.cgpa}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Contact Number</label>
                        <input
                          type="text"
                          name="contactNumber"
                          placeholder="e.g. +1 555-0123"
                          value={profile.contactNumber}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Key Skills (Comma separated)</label>
                      <input
                        type="text"
                        name="skills"
                        placeholder="e.g. React, Node.js, Express, MongoDB, Python"
                        value={profile.skills}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Experience / Project Summary</label>
                      <textarea
                        name="experience"
                        rows="4"
                        placeholder="Provide details of any prior internships, projects, or work history..."
                        value={profile.experience}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={btnLoading}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-600/10 active:scale-98 disabled:opacity-50"
                    >
                      Save Profile
                    </button>
                  </form>
                </div>

                {/* Resume Upload Column */}
                <div className="glass-card rounded-2xl p-6 border border-slate-800 h-fit">
                  <h3 className="text-lg font-bold text-white mb-6 border-b border-slate-850 pb-3">PDF Resume Attachment</h3>
                  
                  {profile.resumeUrl ? (
                    <div className="mb-6 p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-200 truncate">{profile.resumeOriginalName || 'Resume.pdf'}</div>
                          <div className="text-xs text-slate-500 mt-0.5">Uploaded PDF</div>
                        </div>
                      </div>
                      <a
                        href={`http://localhost:5000${profile.resumeUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs border border-slate-700 transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View / Download Resume
                      </a>
                    </div>
                  ) : (
                    <div className="mb-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-amber-500 text-xs leading-relaxed">
                      You haven't uploaded a resume yet. A PDF resume is required before you can apply to any job openings.
                    </div>
                  )}

                  <form onSubmit={handleResumeUpload} className="space-y-4">
                    <div className="border border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl p-6 transition-all text-center flex flex-col items-center justify-center bg-slate-900/20">
                      <Upload className="w-8 h-8 text-slate-500 mb-3" />
                      <span className="text-xs text-slate-400 mb-1 font-semibold">Choose PDF resume file</span>
                      <span className="text-[10px] text-slate-650 mb-3">(Must be PDF, Max 5MB)</span>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="resume-file-input"
                      />
                      <label
                        htmlFor="resume-file-input"
                        className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-750 text-slate-300 font-semibold text-xs cursor-pointer hover:bg-slate-800 transition-all active:scale-98"
                      >
                        Browse File
                      </label>
                      {selectedFile && (
                        <div className="mt-3 text-xs font-semibold text-slate-300 truncate w-full px-2">
                          Selected: {selectedFile.name}
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={!selectedFile || btnLoading}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white disabled:text-slate-500 font-semibold rounded-xl text-sm transition-all shadow-md shadow-indigo-600/10 active:scale-98 disabled:opacity-50 disabled:shadow-none cursor-pointer"
                    >
                      {btnLoading ? 'Uploading...' : 'Upload Resume'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default StudentDashboard;
