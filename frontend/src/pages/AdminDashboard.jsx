import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Shield, Check, X, TrendingUp, Users, Briefcase, FileText, Percent, BadgeAlert } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'approvals'
  
  // State variables
  const [stats, setStats] = useState(null);
  const [pendingJobs, setPendingJobs] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      if (activeTab === 'analytics') {
        const res = await api.get('/applications/stats');
        setStats(res.data.stats);
      } else if (activeTab === 'approvals') {
        const res = await api.get('/jobs?status=pending');
        setPendingJobs(res.data.jobs);
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to retrieve administrative data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (jobId, status) => {
    try {
      setBtnLoading(true);
      const res = await api.put(`/jobs/${jobId}/status`, { status });
      if (res.data.success) {
        setMessage({ text: `Job listing successfully ${status}!`, type: 'success' });
        fetchData();
      }
    } catch (err) {
      setMessage({ text: 'Failed to update job status', type: 'error' });
    } finally {
      setBtnLoading(false);
    }
  };

  // Recharts Data Formatters
  const getPieChartData = () => {
    if (!stats || !stats.statusStats) return [];
    return [
      { name: 'Applied Only', value: stats.statusStats.applied, color: '#6366f1' },
      { name: 'Shortlisted', value: stats.statusStats.shortlisted, color: '#f59e0b' },
      { name: 'Interviewing', value: stats.statusStats.interviewing, color: '#3b82f6' },
      { name: 'Selected (Hired)', value: stats.statusStats.selected, color: '#10b981' },
      { name: 'Rejected', value: stats.statusStats.rejected, color: '#f43f5e' },
    ].filter(item => item.value > 0);
  };

  const getDeptChartData = () => {
    if (!stats || !stats.departmentStats) return [];
    return stats.departmentStats;
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | CareerGate</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Admin Dashboard</h1>
            <p className="text-slate-400 mt-1">Placement analytics and listing approval moderation panels.</p>
          </div>

          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 shrink-0 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Overview Stats
            </button>
            <button
              onClick={() => setActiveTab('approvals')}
              className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'approvals' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BadgeAlert className="w-4 h-4" />
              Approve Jobs
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

        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div>
            {/* OVERVIEW STATS / ANALYTICS */}
            {activeTab === 'analytics' && stats && (
              <div className="space-y-8 animate-slide-up">
                {/* Stats Widgets */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center gap-4">
                    <div className="p-3.5 rounded-xl bg-indigo-600/10 text-indigo-400 shrink-0">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Students</div>
                      <div className="text-2xl font-black text-slate-100 mt-1">{stats.totalStudents}</div>
                    </div>
                  </div>

                  <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center gap-4">
                    <div className="p-3.5 rounded-xl bg-teal-500/10 text-teal-400 shrink-0">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Job Openings</div>
                      <div className="text-2xl font-black text-slate-100 mt-1">{stats.totalJobs}</div>
                    </div>
                  </div>

                  <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center gap-4">
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                      <Percent className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Placement Rate</div>
                      <div className="text-2xl font-black text-emerald-400 mt-1 text-glow-emerald">{stats.placementRate}%</div>
                    </div>
                  </div>

                  <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center gap-4">
                    <div className="p-3.5 rounded-xl bg-indigo-600/10 text-indigo-400 shrink-0">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Average Salary</div>
                      <div className="text-2xl font-black text-slate-100 mt-1">{stats.avgCtc || '0'} LPA</div>
                    </div>
                  </div>
                </div>

                {/* Charts Container */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Department wise chart */}
                  <div className="glass-card rounded-2xl p-6 border border-slate-800">
                    <h3 className="text-base font-bold text-slate-350 mb-6">Department-wise Selections</h3>
                    
                    {getDeptChartData().length === 0 ? (
                      <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
                        No department-wise metrics compiled yet.
                      </div>
                    ) : (
                      <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={getDeptChartData()} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
                            <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: 8, color: '#f1f5f9' }} />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            <Bar dataKey="enrolled" name="Enrolled Profiles" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="placed" name="Placed Students" fill="#10b981" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>

                  {/* Status distribution chart */}
                  <div className="glass-card rounded-2xl p-6 border border-slate-800">
                    <h3 className="text-base font-bold text-slate-350 mb-6">Selection Funnel Distribution</h3>
                    
                    {getPieChartData().length === 0 ? (
                      <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
                        No applications submitted to populate funnel.
                      </div>
                    ) : (
                      <div className="h-72 w-full flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="h-64 w-full md:w-1/2">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={getPieChartData()}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {getPieChartData().map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: 8, color: '#f1f5f9' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        
                        <div className="w-full md:w-1/2 flex flex-col gap-3 font-medium">
                          {getPieChartData().map((item, index) => (
                            <div key={index} className="flex items-center justify-between text-xs py-1 border-b border-slate-900">
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                                <span className="text-slate-400">{item.name}</span>
                              </div>
                              <span className="font-bold text-slate-200">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* APPROVE JOB LISTINGS */}
            {activeTab === 'approvals' && (
              <div className="grid grid-cols-1 gap-6 animate-slide-up">
                {pendingJobs.length === 0 ? (
                  <div className="glass-card p-12 text-center rounded-2xl border border-slate-800">
                    <Shield className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-300">Approval Queue Clear</h3>
                    <p className="text-slate-500 text-sm mt-1">There are no pending job listings requesting review.</p>
                  </div>
                ) : (
                  pendingJobs.map((job) => (
                    <div key={job._id} className="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                              {job.companyName}
                            </span>
                            <h3 className="text-lg font-bold text-slate-100 mt-2">{job.title}</h3>
                          </div>
                          
                          <span className="flex items-center gap-1 text-emerald-400 font-bold text-sm text-glow-emerald shrink-0">
                            {job.ctc} LPA
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400 bg-slate-950/40 p-4 rounded-xl border border-slate-850">
                          <div>
                            <span className="font-bold text-slate-350 block mb-1">Description:</span>
                            <p className="leading-relaxed">{job.description}</p>
                          </div>
                          <div>
                            <span className="font-bold text-slate-350 block mb-1">Key Requirements:</span>
                            <p className="leading-relaxed">{job.requirements}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {job.location}
                          </span>
                          <span>Posted by: {job.createdBy?.name || 'Recruiter'}</span>
                        </div>
                      </div>

                      {/* Approval buttons */}
                      <div className="flex md:flex-col justify-end gap-3 shrink-0 self-end md:self-center w-full md:w-auto border-t md:border-t-0 border-slate-850 pt-4 md:pt-0">
                        <button
                          onClick={() => handleApprove(job._id, 'approved')}
                          disabled={btnLoading}
                          className="flex-1 md:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-98 disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleApprove(job._id, 'rejected')}
                          disabled={btnLoading}
                          className="flex-1 md:flex-initial px-4 py-2.5 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-98 disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default AdminDashboard;
