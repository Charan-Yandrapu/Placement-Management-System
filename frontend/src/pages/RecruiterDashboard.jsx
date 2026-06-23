import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Briefcase, User as UserIcon, Plus, FileText, ChevronRight, CheckCircle2, AlertCircle, FileCheck, Trash2, ExternalLink, Calendar, MapPin, DollarSign } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const RecruiterDashboard = () => {
  const [activeTab, setActiveTab] = useState('listings'); // 'listings', 'post', 'applicants'
  
  // State variables
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  
  // Job Post Form State
  const [newJob, setNewJob] = useState({
    companyName: '',
    title: '',
    description: '',
    requirements: '',
    location: '',
    ctc: '',
  });

  // Applicant Status Update Form State
  const [updatingAppId, setUpdatingAppId] = useState('');
  const [updateForm, setUpdateForm] = useState({
    status: '',
    feedback: '',
  });

  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Detail Modal for Student Profile
  const [selectedStudentProfile, setSelectedStudentProfile] = useState(null);
  const [profileModalLoading, setProfileModalLoading] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, [activeTab]);

  useEffect(() => {
    if (selectedJobId) {
      fetchApplicants(selectedJobId);
    } else {
      setApplicants([]);
    }
  }, [selectedJobId]);

  const fetchJobs = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const res = await api.get('/jobs');
      setJobs(res.data.jobs);
      
      // Auto-select first job if we are in applicants tab and none selected
      if (res.data.jobs.length > 0 && !selectedJobId) {
        setSelectedJobId(res.data.jobs[0]._id);
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to fetch job postings', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicants = async (jobId) => {
    setLoading(true);
    try {
      const res = await api.get(`/applications/job/${jobId}`);
      setApplicants(res.data.applicants);
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to load applicants', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    const { companyName, title, description, requirements, location, ctc } = newJob;
    if (!companyName || !title || !description || !requirements || !location || !ctc) {
      setMessage({ text: 'Please fill in all job details', type: 'error' });
      return;
    }

    try {
      setBtnLoading(true);
      const res = await api.post('/jobs', newJob);
      if (res.data.success) {
        setMessage({ text: 'Job posting submitted successfully! It is pending admin approval.', type: 'success' });
        setNewJob({
          companyName: '',
          title: '',
          description: '',
          requirements: '',
          location: '',
          ctc: '',
        });
        setActiveTab('listings');
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to submit job posting', type: 'error' });
    } finally {
      setBtnLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job listing?')) return;
    try {
      const res = await api.delete(`/jobs/${jobId}`);
      if (res.data.success) {
        setMessage({ text: 'Job listing deleted successfully', type: 'success' });
        fetchJobs();
      }
    } catch (err) {
      setMessage({ text: 'Failed to delete job', type: 'error' });
    }
  };

  const handleStatusUpdateClick = (app) => {
    setUpdatingAppId(app._id);
    setUpdateForm({
      status: app.status,
      feedback: app.feedback || '',
    });
  };

  const handleStatusSubmit = async (e, appId) => {
    e.preventDefault();
    try {
      setBtnLoading(true);
      const res = await api.put(`/applications/${appId}`, updateForm);
      if (res.data.success) {
        setMessage({ text: 'Applicant status updated successfully!', type: 'success' });
        setUpdatingAppId('');
        fetchApplicants(selectedJobId);
      }
    } catch (err) {
      setMessage({ text: 'Failed to update applicant status', type: 'error' });
    } finally {
      setBtnLoading(false);
    }
  };

  const viewStudentProfile = async (userId) => {
    setProfileModalLoading(true);
    try {
      const res = await api.get(`/profile/user/${userId}`);
      setSelectedStudentProfile(res.data.profile);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to fetch student details. They may have not set up their profile.');
    } finally {
      setProfileModalLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'selected':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'shortlisted':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'interviewing':
        return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      case 'rejected':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
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
        <title>Recruiter Portal | CareerGate</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Recruiter Workspace</h1>
            <p className="text-slate-400 mt-1">Manage corporate job postings and hire top talent from the campus.</p>
          </div>

          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 shrink-0 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('listings')}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'listings' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Active Listings
            </button>
            <button
              onClick={() => setActiveTab('post')}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'post' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Plus className="w-4 h-4" />
              Post Job
            </button>
            <button
              onClick={() => setActiveTab('applicants')}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'applicants' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              Candidates
            </button>
          </div>
        </div>

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

        {loading && activeTab !== 'post' ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div>
            {/* ACTIVE LISTINGS */}
            {activeTab === 'listings' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
                {jobs.length === 0 ? (
                  <div className="col-span-full glass-card p-12 text-center rounded-2xl border border-slate-800">
                    <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-300">No Job Listings Posted</h3>
                    <p className="text-slate-500 text-sm mt-1">Post your corporate openings by clicking the "Post Job" tab.</p>
                  </div>
                ) : (
                  jobs.map((job) => (
                    <div key={job._id} className="glass-card rounded-2xl p-6 flex flex-col justify-between border border-slate-800">
                      <div>
                        <div className="flex justify-between items-start gap-3 mb-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${getStatusColor(job.status)}`}>
                            {job.status}
                          </span>
                          <span className="flex items-center gap-1 text-emerald-400 font-bold text-sm text-glow-emerald">
                            <DollarSign className="w-4 h-4" />
                            {job.ctc} LPA
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-bold text-slate-100">{job.title}</h3>
                        <div className="flex items-center gap-1 text-slate-400 text-xs mt-1.5 mb-4">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location}
                        </div>

                        <div className="border-t border-slate-800/80 pt-4 mb-4">
                          <p className="text-slate-300 text-sm line-clamp-3 leading-relaxed">{job.description}</p>
                        </div>
                      </div>

                      <div className="border-t border-slate-800/80 pt-4 flex gap-3">
                        <button
                          onClick={() => {
                            setSelectedJobId(job._id);
                            setActiveTab('applicants');
                          }}
                          className="flex-1 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-750 text-indigo-400 rounded-xl font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          View Candidates
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteJob(job._id)}
                          className="p-2.5 bg-slate-950 border border-slate-900 hover:bg-rose-500/10 hover:border-rose-500/20 text-slate-500 hover:text-rose-400 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* POST A JOB */}
            {activeTab === 'post' && (
              <div className="max-w-3xl mx-auto glass-card rounded-2xl p-6 border border-slate-800 animate-slide-up">
                <h3 className="text-lg font-bold text-white mb-6 border-b border-slate-850 pb-3">Create New Job Opening</h3>
                
                <form onSubmit={handleJobSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Company Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Google India"
                        value={newJob.companyName}
                        onChange={(e) => setNewJob({ ...newJob, companyName: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Job Title / Role</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Software Engineer (React)"
                        value={newJob.title}
                        onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Package (CTC in LPA)</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 15"
                        value={newJob.ctc}
                        onChange={(e) => setNewJob({ ...newJob, ctc: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Job Location</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Bangalore, India (Hybrid)"
                        value={newJob.location}
                        onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Job Description</label>
                    <textarea
                      required
                      rows="4"
                      placeholder="Outline the core responsibilities, team structures, and company mission..."
                      value={newJob.description}
                      onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Key Requirements</label>
                    <textarea
                      required
                      rows="3"
                      placeholder="Specify required tech stack, academic criteria (e.g. > 8.0 CGPA), or skills..."
                      value={newJob.requirements}
                      onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500 text-sm"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={btnLoading}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-600/10 active:scale-98 disabled:opacity-50"
                  >
                    Post Listing
                  </button>
                </form>
              </div>
            )}

            {/* REVIEW CANDIDATES */}
            {activeTab === 'applicants' && (
              <div className="space-y-6 animate-slide-up">
                {/* Filter Selector */}
                <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center gap-4">
                  <span className="text-slate-400 text-sm font-semibold shrink-0">Filter by Job Posting:</span>
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-slate-200 py-2.5 px-4 rounded-xl text-sm focus:outline-none focus:border-indigo-500 flex-1 md:max-w-md"
                  >
                    <option value="">-- Choose Posted Job --</option>
                    {jobs.map((job) => (
                      <option key={job._id} value={job._id}>
                        {job.title} at {job.companyName} ({job.status})
                      </option>
                    ))}
                  </select>
                </div>

                {!selectedJobId ? (
                  <div className="glass-card p-12 text-center rounded-2xl border border-slate-800">
                    <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-300">Select Job Listing</h3>
                    <p className="text-slate-500 text-sm mt-1">Please select one of your job listings from the filter dropdown above to view applicants.</p>
                  </div>
                ) : applicants.length === 0 ? (
                  <div className="glass-card p-12 text-center rounded-2xl border border-slate-800">
                    <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-300">No Applications Yet</h3>
                    <p className="text-slate-500 text-sm mt-1">Students have not applied to this listing yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {applicants.map((app) => (
                      <div key={app._id} className="glass-card rounded-2xl border border-slate-800 p-6 flex flex-col justify-between">
                        {/* Upper row: Student Info & Action buttons */}
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4 pb-4 border-b border-slate-800/80">
                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-bold text-slate-100">{app.student?.name}</h3>
                              {getStatusBadge(app.status)}
                            </div>
                            <p className="text-slate-500 text-xs mt-0.5">{app.student?.email}</p>
                          </div>
                          
                          <div className="flex items-center gap-3 shrink-0">
                            <button
                              onClick={() => viewStudentProfile(app.student._id)}
                              className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-indigo-500/30 text-indigo-400 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                            >
                              <UserIcon className="w-3.5 h-3.5" />
                              Inspect Resume / Profile
                            </button>
                            
                            {updatingAppId !== app._id && (
                              <button
                                onClick={() => handleStatusUpdateClick(app)}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
                              >
                                Update Status
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Lower section: status updating form */}
                        {updatingAppId === app._id && (
                          <form onSubmit={(e) => handleStatusSubmit(e, app._id)} className="bg-slate-900/60 border border-slate-850 rounded-xl p-4 mb-4 space-y-4 animate-fade-in">
                            <div className="flex flex-col md:flex-row gap-4 items-end">
                              <div className="flex-1 md:max-w-xs">
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Application State</label>
                                <select
                                  value={updateForm.status}
                                  onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 py-2 px-3 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                                >
                                  <option value="applied">Applied</option>
                                  <option value="shortlisted">Shortlist</option>
                                  <option value="interviewing">Interviewing</option>
                                  <option value="selected">Select (Hire)</option>
                                  <option value="rejected">Reject</option>
                                </select>
                              </div>
                              <div className="flex-1">
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Recruiter Feedback / Notes</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Shortlisted for Round 1 Technical Interview scheduled for next Monday."
                                  value={updateForm.feedback}
                                  onChange={(e) => setUpdateForm({ ...updateForm, feedback: e.target.value })}
                                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 py-2 px-3 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                              <button
                                type="button"
                                onClick={() => setUpdatingAppId('')}
                                className="px-3.5 py-1.5 border border-slate-800 hover:border-slate-750 text-slate-400 hover:text-slate-350 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={btnLoading}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all cursor-pointer"
                              >
                                {btnLoading ? 'Saving...' : 'Save Changes'}
                              </button>
                            </div>
                          </form>
                        )}

                        {/* Display feedback if present */}
                        {app.feedback && (
                          <div className="text-xs bg-slate-950/40 border border-slate-850 p-3 rounded-xl flex items-start gap-1.5 text-slate-400">
                            <span className="font-semibold text-slate-300">Feedback:</span>
                            <span className="italic">{app.feedback}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Selected Student Profile Modal */}
        {selectedStudentProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-2xl glass-card rounded-2xl p-6 border border-slate-800 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start border-b border-slate-850 pb-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedStudentProfile.user?.name}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedStudentProfile.user?.email}</p>
                </div>
                <button
                  onClick={() => setSelectedStudentProfile(null)}
                  className="px-3 py-1 bg-slate-900 border border-slate-850 hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-850">
                  <div className="text-center">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Department</div>
                    <div className="text-sm font-semibold text-slate-200 mt-1">{selectedStudentProfile.department}</div>
                  </div>
                  <div className="text-center border-x border-slate-850">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Roll Number</div>
                    <div className="text-sm font-semibold text-slate-200 mt-1">{selectedStudentProfile.rollNumber}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">CGPA</div>
                    <div className="text-sm font-bold text-emerald-400 mt-1">{selectedStudentProfile.cgpa}</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Contact Details</h4>
                  <p className="text-sm text-slate-300">{selectedStudentProfile.contactNumber || 'No phone number provided'}</p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Technical Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedStudentProfile.skills.map((skill, index) => (
                      <span key={index} className="px-2 py-0.5 text-xs font-semibold rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Experience / Project Summary</h4>
                  <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-950/40 border border-slate-850 p-4 rounded-xl">
                    {selectedStudentProfile.experience || 'No summary details provided.'}
                  </p>
                </div>

                {selectedStudentProfile.resumeUrl && (
                  <div className="pt-2 border-t border-slate-850">
                    <a
                      href={`http://localhost:5000${selectedStudentProfile.resumeUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-semibold text-sm transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Student Resume (PDF)
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default RecruiterDashboard;
