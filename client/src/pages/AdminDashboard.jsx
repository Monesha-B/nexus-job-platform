import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Spinner, Alert, Button, Modal, Form, Tab, Tabs } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobForm, setJobForm] = useState({
    title: '', company: '', location: '', locationType: 'onsite',
    type: 'full-time', experienceLevel: 'mid', description: '',
    requirements: '', responsibilities: '', skills: '', benefits: '',
    salaryMin: '', salaryMax: '', salaryVisible: true,
  });
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingJob, setDeletingJob] = useState(null);

  // New state for applicant detail modal
  const [showApplicantModal, setShowApplicantModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    if (!isAdmin) { navigate('/dashboard'); return; }
    fetchDashboardData();
    fetchJobs();
    fetchApplications();
  }, [isAdmin, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/recent-users?limit=10')
      ]);
      setStats(statsRes.data.data);
      setRecentUsers(usersRes.data.data.users || []);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      setJobsLoading(true);
      const res = await api.get('/jobs?limit=50&isActive=all');
      setJobs(res.data.data.jobs || []);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setJobsLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      setApplicationsLoading(true);
      const res = await api.get('/applications');
      setApplications(res.data.data.applications || []);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setApplicationsLoading(false);
    }
  };

  const resetJobForm = () => {
    setJobForm({
      title: '', company: '', location: '', locationType: 'onsite',
      type: 'full-time', experienceLevel: 'mid', description: '',
      requirements: '', responsibilities: '', skills: '', benefits: '',
      salaryMin: '', salaryMax: '', salaryVisible: true,
    });
    setEditingJob(null);
  };

  const handleOpenJobModal = (job = null) => {
    if (job) {
      setEditingJob(job);
      setJobForm({
        title: job.title || '', company: job.company || '', location: job.location || '',
        locationType: job.locationType || 'onsite', type: job.type || 'full-time',
        experienceLevel: job.experienceLevel || 'mid', description: job.description || '',
        requirements: (job.requirements || []).join('\n'),
        responsibilities: (job.responsibilities || []).join('\n'),
        skills: (job.skills || []).join(', '),
        benefits: (job.benefits || []).join('\n'),
        salaryMin: job.salary?.min || '', salaryMax: job.salary?.max || '',
        salaryVisible: job.salary?.isVisible !== false,
      });
    } else {
      resetJobForm();
    }
    setShowJobModal(true);
  };

  const handleSaveJob = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const jobData = {
        title: jobForm.title, company: jobForm.company, location: jobForm.location,
        locationType: jobForm.locationType, type: jobForm.type,
        experienceLevel: jobForm.experienceLevel, description: jobForm.description,
        requirements: jobForm.requirements, responsibilities: jobForm.responsibilities,
        skills: jobForm.skills, benefits: jobForm.benefits,
        salary: {
          min: jobForm.salaryMin ? parseInt(jobForm.salaryMin) : undefined,
          max: jobForm.salaryMax ? parseInt(jobForm.salaryMax) : undefined,
          currency: 'USD', period: 'yearly', isVisible: jobForm.salaryVisible,
        },
      };
      if (editingJob) {
        await api.put(`/jobs/${editingJob._id}`, jobData);
        setSuccess('Job updated successfully!');
      } else {
        await api.post('/jobs', jobData);
        setSuccess('Job created successfully!');
      }
      setShowJobModal(false);
      resetJobForm();
      fetchJobs();
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save job');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleJobStatus = async (job) => {
    try {
      await api.patch(`/jobs/${job._id}/toggle-status`);
      setSuccess(`Job ${job.isActive ? 'deactivated' : 'activated'} successfully!`);
      fetchJobs();
    } catch (err) {
      setError('Failed to update job status');
    }
  };

  const handleDeleteJob = async () => {
    if (!deletingJob) return;
    try {
      await api.delete(`/jobs/${deletingJob._id}`);
      setSuccess('Job deleted successfully!');
      setShowDeleteModal(false);
      setDeletingJob(null);
      fetchJobs();
      fetchDashboardData();
    } catch (err) {
      setError('Failed to delete job');
    }
  };

  const handleUpdateApplicationStatus = async (appId, newStatus) => {
    try {
      await api.patch(`/applications/${appId}/status`, { status: newStatus });
      setSuccess(`Application status updated to ${newStatus}`);
      fetchApplications();
      fetchDashboardData();
    } catch (err) {
      setError('Failed to update application status');
    }
  };

  const handleViewApplicant = (app) => {
    setSelectedApplication(app);
    setShowApplicantModal(true);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b', reviewed: '#d97757', shortlisted: '#8b5cf6',
      interview: '#d97757', offered: '#10b981', rejected: '#ef4444', withdrawn: '#6b7280',
    };
    return colors[status] || '#6b7280';
  };

  const getResumeUrl = (resumeUrl) => {
    if (!resumeUrl) return null;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    // If it already starts with http, return as-is
    if (resumeUrl.startsWith('http')) return resumeUrl;
    // If it starts with /uploads, prepend API URL
    if (resumeUrl.startsWith('/uploads')) return `${apiUrl}${resumeUrl}`;
    // If it starts with /, prepend API URL
    if (resumeUrl.startsWith('/')) return `${apiUrl}${resumeUrl}`;
    // Otherwise add /uploads/
    return `${apiUrl}/uploads/${resumeUrl}`;
  };

  const Icon = ({ type }) => {
    const icons = {
      users: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
      briefcase: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
      file: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
      zap: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
      plus: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
      edit: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
      trash: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
      arrow: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
      eye: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
      download: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
      mail: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
      phone: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
      user: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    };
    return icons[type] || null;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner animation="border" style={{ color: '#d97757' }} />
      </div>
    );
  }

  return (
    <div style={{ background: '#f8f9fa', minHeight: 'calc(100vh - 76px)', padding: '30px 0' }}>
      <Container>
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ color: '#111827', fontWeight: '700', marginBottom: '8px' }}>Admin Dashboard</h1>
          <p style={{ color: '#6b7280' }}>Welcome back, {user?.firstName}! Manage your platform here.</p>
        </div>

        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
          <Tab eventKey="dashboard" title="📊 Dashboard">
            {/* Clickable Stats Cards */}
            <Row className="mb-4 mt-4">
              {[
                { label: 'Total Users', value: stats?.users?.total || 0, icon: 'users', color: '#d97757', tab: 'users' },
                { label: 'Job Seekers', value: stats?.users?.jobseekers || 0, icon: 'users', color: '#10b981', tab: 'users' },
                { label: 'Total Jobs', value: stats?.jobs?.total || 0, icon: 'briefcase', color: '#d97757', tab: 'jobs' },
                { label: 'Applications', value: stats?.applications?.total || 0, icon: 'file', color: '#f59e0b', tab: 'applications' },
              ].map((stat, i) => (
                <Col md={3} sm={6} key={i} className="mb-3">
                  <Card 
                    onClick={() => setActiveTab(stat.tab)}
                    style={{ 
                      border: 'none', 
                      borderRadius: '12px', 
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                    }}
                  >
                    <Card.Body style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '4px' }}>{stat.label}</p>
                          <h3 style={{ color: '#111827', fontWeight: '700', marginBottom: '0' }}>{stat.value}</h3>
                        </div>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                          <Icon type={stat.icon} />
                        </div>
                      </div>
                      <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '4px', color: stat.color, fontSize: '0.85rem', fontWeight: '500' }}>
                        View Details <Icon type="arrow" />
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            <Row>
              {/* Recent Applications - Clickable */}
              <Col lg={6} className="mb-4">
                <Card style={{ border: 'none', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <Card.Header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h5 style={{ margin: 0, fontWeight: '600', color: '#111827' }}>Recent Applications</h5>
                    <Button variant="link" onClick={() => setActiveTab('applications')} style={{ color: '#d97757', textDecoration: 'none', padding: 0, fontWeight: '500' }}>
                      View All <Icon type="arrow" />
                    </Button>
                  </Card.Header>
                  <Card.Body style={{ padding: '0' }}>
                    {applications.length === 0 ? (
                      <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>No applications yet</div>
                    ) : (
                      applications.slice(0, 5).map((app, i) => (
                        <div 
                          key={app._id}
                          onClick={() => handleViewApplicant(app)}
                          style={{ 
                            padding: '14px 20px', 
                            borderBottom: i < 4 ? '1px solid #f3f4f6' : 'none',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#fef7f5'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#d97757', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '0.8rem' }}>
                                {app.applicant?.firstName?.charAt(0)}{app.applicant?.lastName?.charAt(0)}
                              </div>
                              <div>
                                <p style={{ margin: 0, fontWeight: '500', color: '#111827', fontSize: '0.9rem' }}>{app.applicant?.firstName} {app.applicant?.lastName}</p>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>{app.job?.title}</p>
                              </div>
                            </div>
                            <Badge style={{ background: `${getStatusColor(app.status)}20`, color: getStatusColor(app.status), fontWeight: '500', padding: '4px 10px', borderRadius: '6px', textTransform: 'capitalize' }}>
                              {app.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </Card.Body>
                </Card>
              </Col>

              {/* Recent Jobs - Clickable */}
              <Col lg={6} className="mb-4">
                <Card style={{ border: 'none', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <Card.Header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h5 style={{ margin: 0, fontWeight: '600', color: '#111827' }}>Recent Jobs</h5>
                    <Button variant="link" onClick={() => setActiveTab('jobs')} style={{ color: '#d97757', textDecoration: 'none', padding: 0, fontWeight: '500' }}>
                      View All <Icon type="arrow" />
                    </Button>
                  </Card.Header>
                  <Card.Body style={{ padding: '0' }}>
                    {jobs.length === 0 ? (
                      <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>No jobs yet</div>
                    ) : (
                      jobs.slice(0, 5).map((job, i) => (
                        <div 
                          key={job._id}
                          onClick={() => { setActiveTab('jobs'); }}
                          style={{ 
                            padding: '14px 20px', 
                            borderBottom: i < 4 ? '1px solid #f3f4f6' : 'none',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#fef7f5'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <p style={{ margin: 0, fontWeight: '500', color: '#111827', fontSize: '0.9rem' }}>{job.title}</p>
                              <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>{job.company} • {job.applicationsCount || 0} applicants</p>
                            </div>
                            <Badge bg={job.isActive ? 'success' : 'secondary'} style={{ fontSize: '0.75rem' }}>
                              {job.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Top Skills */}
            <Card style={{ border: 'none', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <Card.Header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 20px' }}>
                <h5 style={{ margin: 0, fontWeight: '600', color: '#111827' }}>Top Skills in Demand</h5>
              </Card.Header>
              <Card.Body>
                {stats?.topSkills?.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {stats.topSkills.map((skill, i) => (
                      <Badge key={i} bg="" style={{ background: '#fef7f5', color: '#d97757', fontWeight: '500', padding: '8px 14px', borderRadius: '8px', fontSize: '0.85rem' }}>
                        {skill._id} ({skill.count})
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#6b7280', textAlign: 'center' }}>No skills data yet</p>
                )}
              </Card.Body>
            </Card>
          </Tab>

          <Tab eventKey="jobs" title="💼 Manage Jobs">
            <div className="mt-4">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h5 style={{ margin: 0, fontWeight: '600', color: '#111827' }}>All Jobs ({jobs.length})</h5>
                <Button onClick={() => handleOpenJobModal()} style={{ background: '#d97757', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', fontWeight: '600' }}>
                  <Icon type="plus" /> Post New Job
                </Button>
              </div>

              <Card style={{ border: 'none', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <Card.Body style={{ padding: '0' }}>
                  {jobsLoading ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}><Spinner animation="border" style={{ color: '#d97757' }} /></div>
                  ) : jobs.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💼</div>
                      <h5 style={{ color: '#111827', marginBottom: '8px' }}>No jobs posted yet</h5>
                      <Button onClick={() => handleOpenJobModal()} style={{ background: '#d97757', border: 'none', borderRadius: '10px' }}>Post Your First Job</Button>
                    </div>
                  ) : (
                    <Table responsive hover style={{ marginBottom: '0' }}>
                      <thead style={{ background: '#f9fafb' }}>
                        <tr>
                          <th style={{ padding: '12px 20px', fontWeight: '600', color: '#6b7280', fontSize: '0.85rem' }}>Job</th>
                          <th style={{ padding: '12px 20px', fontWeight: '600', color: '#6b7280', fontSize: '0.85rem' }}>Type</th>
                          <th style={{ padding: '12px 20px', fontWeight: '600', color: '#6b7280', fontSize: '0.85rem' }}>Applications</th>
                          <th style={{ padding: '12px 20px', fontWeight: '600', color: '#6b7280', fontSize: '0.85rem' }}>Status</th>
                          <th style={{ padding: '12px 20px', fontWeight: '600', color: '#6b7280', fontSize: '0.85rem' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobs.map((job) => (
                          <tr key={job._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/jobs/${job._id}`)}>
                            <td style={{ padding: '12px 20px', verticalAlign: 'middle' }}>
                              <p style={{ margin: 0, fontWeight: '600', color: '#111827' }}>{job.title}</p>
                              <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>{job.company}</p>
                            </td>
                            <td style={{ padding: '12px 20px', verticalAlign: 'middle' }}>
                              <Badge bg="" style={{ background: '#fef7f5', color: '#d97757', textTransform: 'capitalize' }}>{job.type}</Badge>
                            </td>
                            <td style={{ padding: '12px 20px', verticalAlign: 'middle' }}>
                              <Badge bg="" style={{ background: '#d97757' }}>{job.applicationsCount || 0}</Badge>
                            </td>
                            <td style={{ padding: '12px 20px', verticalAlign: 'middle' }}>
                              <Badge bg={job.isActive ? 'success' : 'secondary'}>{job.isActive ? 'Active' : 'Inactive'}</Badge>
                            </td>
                            <td style={{ padding: '12px 20px', verticalAlign: 'middle' }} onClick={(e) => e.stopPropagation()}>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <Button style={{ borderColor: '#d97757', color: '#d97757' }} size="sm" onClick={() => handleOpenJobModal(job)} style={{ borderRadius: '6px' }}><Icon type="edit" /></Button>
                                <Button variant={job.isActive ? "outline-warning" : "outline-success"} size="sm" onClick={() => handleToggleJobStatus(job)} style={{ borderRadius: '6px', fontSize: '0.75rem' }}>{job.isActive ? 'Deactivate' : 'Activate'}</Button>
                                <Button variant="outline-danger" size="sm" onClick={() => { setDeletingJob(job); setShowDeleteModal(true); }} style={{ borderRadius: '6px' }}><Icon type="trash" /></Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </div>
          </Tab>

          <Tab eventKey="applications" title="📄 Applications">
            <div className="mt-4">
              <h5 style={{ margin: 0, fontWeight: '600', color: '#111827', marginBottom: '20px' }}>All Applications ({applications.length})</h5>
              
              <Card style={{ border: 'none', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <Card.Body style={{ padding: '0' }}>
                  {applicationsLoading ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}><Spinner animation="border" style={{ color: '#d97757' }} /></div>
                  ) : applications.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📄</div>
                      <h5 style={{ color: '#111827', marginBottom: '8px' }}>No applications yet</h5>
                      <p style={{ color: '#6b7280' }}>Applications will appear here when job seekers apply.</p>
                    </div>
                  ) : (
                    <Table responsive hover style={{ marginBottom: '0' }}>
                      <thead style={{ background: '#f9fafb' }}>
                        <tr>
                          <th style={{ padding: '12px 20px', fontWeight: '600', color: '#6b7280', fontSize: '0.85rem' }}>Applicant</th>
                          <th style={{ padding: '12px 20px', fontWeight: '600', color: '#6b7280', fontSize: '0.85rem' }}>Job</th>
                          <th style={{ padding: '12px 20px', fontWeight: '600', color: '#6b7280', fontSize: '0.85rem' }}>Applied</th>
                          <th style={{ padding: '12px 20px', fontWeight: '600', color: '#6b7280', fontSize: '0.85rem' }}>Status</th>
                          <th style={{ padding: '12px 20px', fontWeight: '600', color: '#6b7280', fontSize: '0.85rem' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applications.map((app) => (
                          <tr key={app._id}>
                            <td style={{ padding: '12px 20px', verticalAlign: 'middle' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#d97757', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '0.8rem' }}>
                                  {app.applicant?.firstName?.charAt(0)}{app.applicant?.lastName?.charAt(0)}
                                </div>
                                <div>
                                  <p style={{ margin: 0, fontWeight: '500', color: '#111827' }}>{app.applicant?.firstName} {app.applicant?.lastName}</p>
                                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>{app.applicant?.email}</p>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '12px 20px', verticalAlign: 'middle', cursor: 'pointer' }} onClick={() => navigate(`/jobs/${app.job?._id}`)}>
                              <p style={{ margin: 0, fontWeight: '500', color: '#d97757' }}>{app.job?.title}</p>
                              <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>{app.job?.company}</p>
                            </td>
                            <td style={{ padding: '12px 20px', verticalAlign: 'middle', color: '#6b7280' }}>{formatDate(app.createdAt)}</td>
                            <td style={{ padding: '12px 20px', verticalAlign: 'middle' }}>
                              <Badge style={{ background: `${getStatusColor(app.status)}20`, color: getStatusColor(app.status), fontWeight: '600', padding: '6px 12px', borderRadius: '6px', textTransform: 'capitalize' }}>
                                {app.status}
                              </Badge>
                            </td>
                            <td style={{ padding: '12px 20px', verticalAlign: 'middle' }}>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <Button 
                                  style={{ borderColor: '#d97757', color: '#d97757' }} 
                                  size="sm" 
                                  onClick={() => handleViewApplicant(app)}
                                  style={{ borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <Icon type="eye" /> View
                                </Button>
                                <Form.Select 
                                  size="sm" 
                                  value={app.status}
                                  onChange={(e) => handleUpdateApplicationStatus(app._id, e.target.value)}
                                  style={{ borderRadius: '6px', width: 'auto' }}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="reviewed">Reviewed</option>
                                  <option value="shortlisted">Shortlisted</option>
                                  <option value="interview">Interview</option>
                                  <option value="offered">Offered</option>
                                  <option value="rejected">Rejected</option>
                                </Form.Select>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </div>
          </Tab>

          <Tab eventKey="users" title="👥 Users">
            <div className="mt-4">
              <Card style={{ border: 'none', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <Card.Header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 20px' }}>
                  <h5 style={{ margin: 0, fontWeight: '600', color: '#111827' }}>All Users ({recentUsers.length})</h5>
                </Card.Header>
                <Card.Body style={{ padding: '0' }}>
                  <Table responsive hover style={{ marginBottom: '0' }}>
                    <thead style={{ background: '#f9fafb' }}>
                      <tr>
                        <th style={{ padding: '12px 20px', fontWeight: '600', color: '#6b7280', fontSize: '0.85rem' }}>User</th>
                        <th style={{ padding: '12px 20px', fontWeight: '600', color: '#6b7280', fontSize: '0.85rem' }}>Email</th>
                        <th style={{ padding: '12px 20px', fontWeight: '600', color: '#6b7280', fontSize: '0.85rem' }}>Role</th>
                        <th style={{ padding: '12px 20px', fontWeight: '600', color: '#6b7280', fontSize: '0.85rem' }}>Joined</th>
                        <th style={{ padding: '12px 20px', fontWeight: '600', color: '#6b7280', fontSize: '0.85rem' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUsers.map((u) => (
                        <tr key={u._id}>
                          <td style={{ padding: '12px 20px', verticalAlign: 'middle' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: u.role === 'admin' ? '#dc2626' : '#d97757', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '0.85rem' }}>
                                {u.firstName?.charAt(0)}{u.lastName?.charAt(0)}
                              </div>
                              <span style={{ fontWeight: '500', color: '#111827' }}>{u.firstName} {u.lastName}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 20px', verticalAlign: 'middle', color: '#6b7280' }}>{u.email}</td>
                          <td style={{ padding: '12px 20px', verticalAlign: 'middle' }}>
                            <Badge bg={u.role === 'admin' ? 'danger' : 'primary'} style={{ textTransform: 'capitalize' }}>{u.role}</Badge>
                          </td>
                          <td style={{ padding: '12px 20px', verticalAlign: 'middle', color: '#6b7280' }}>{formatDate(u.createdAt)}</td>
                          <td style={{ padding: '12px 20px', verticalAlign: 'middle' }}>
                            <Badge bg={u.isActive ? 'success' : 'secondary'}>{u.isActive ? 'Active' : 'Inactive'}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </div>
          </Tab>
        </Tabs>

        {/* Job Modal */}
        <Modal show={showJobModal} onHide={() => setShowJobModal(false)} size="lg">
          <Modal.Header closeButton><Modal.Title style={{ fontWeight: '600' }}>{editingJob ? 'Edit Job' : 'Post New Job'}</Modal.Title></Modal.Header>
          <Form onSubmit={handleSaveJob}>
            <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: '500' }}>Job Title *</Form.Label>
                    <Form.Control type="text" value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} required style={{ borderRadius: '8px' }} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: '500' }}>Company *</Form.Label>
                    <Form.Control type="text" value={jobForm.company} onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })} required style={{ borderRadius: '8px' }} />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: '500' }}>Location *</Form.Label>
                    <Form.Control type="text" value={jobForm.location} onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })} required style={{ borderRadius: '8px' }} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: '500' }}>Location Type</Form.Label>
                    <Form.Select value={jobForm.locationType} onChange={(e) => setJobForm({ ...jobForm, locationType: e.target.value })} style={{ borderRadius: '8px' }}>
                      <option value="onsite">On-site</option>
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: '500' }}>Job Type</Form.Label>
                    <Form.Select value={jobForm.type} onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })} style={{ borderRadius: '8px' }}>
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: '500' }}>Experience Level</Form.Label>
                    <Form.Select value={jobForm.experienceLevel} onChange={(e) => setJobForm({ ...jobForm, experienceLevel: e.target.value })} style={{ borderRadius: '8px' }}>
                      <option value="entry">Entry Level</option>
                      <option value="mid">Mid Level</option>
                      <option value="senior">Senior Level</option>
                      <option value="lead">Lead</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: '500' }}>Min Salary</Form.Label>
                    <Form.Control type="number" value={jobForm.salaryMin} onChange={(e) => setJobForm({ ...jobForm, salaryMin: e.target.value })} style={{ borderRadius: '8px' }} />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: '500' }}>Max Salary</Form.Label>
                    <Form.Control type="number" value={jobForm.salaryMax} onChange={(e) => setJobForm({ ...jobForm, salaryMax: e.target.value })} style={{ borderRadius: '8px' }} />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: '500' }}>&nbsp;</Form.Label>
                    <Form.Check type="checkbox" label="Show salary" checked={jobForm.salaryVisible} onChange={(e) => setJobForm({ ...jobForm, salaryVisible: e.target.checked })} style={{ marginTop: '10px' }} />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontWeight: '500' }}>Description *</Form.Label>
                <Form.Control as="textarea" rows={3} value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })} required style={{ borderRadius: '8px' }} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontWeight: '500' }}>Requirements (one per line)</Form.Label>
                <Form.Control as="textarea" rows={3} value={jobForm.requirements} onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })} style={{ borderRadius: '8px' }} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontWeight: '500' }}>Responsibilities (one per line)</Form.Label>
                <Form.Control as="textarea" rows={3} value={jobForm.responsibilities} onChange={(e) => setJobForm({ ...jobForm, responsibilities: e.target.value })} style={{ borderRadius: '8px' }} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontWeight: '500' }}>Skills (comma separated)</Form.Label>
                <Form.Control type="text" value={jobForm.skills} onChange={(e) => setJobForm({ ...jobForm, skills: e.target.value })} style={{ borderRadius: '8px' }} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontWeight: '500' }}>Benefits (one per line)</Form.Label>
                <Form.Control as="textarea" rows={2} value={jobForm.benefits} onChange={(e) => setJobForm({ ...jobForm, benefits: e.target.value })} style={{ borderRadius: '8px' }} />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="light" onClick={() => setShowJobModal(false)} style={{ borderRadius: '8px' }}>Cancel</Button>
              <Button type="submit" disabled={saving} style={{ background: '#d97757', border: 'none', borderRadius: '8px', padding: '10px 24px', fontWeight: '600' }}>
                {saving ? <Spinner animation="border" size="sm" /> : (editingJob ? 'Update Job' : 'Post Job')}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Delete Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton><Modal.Title style={{ fontWeight: '600', color: '#dc2626' }}>Delete Job</Modal.Title></Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to delete <strong>{deletingJob?.title}</strong>?</p>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>This action cannot be undone.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={() => setShowDeleteModal(false)} style={{ borderRadius: '8px' }}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteJob} style={{ borderRadius: '8px' }}>Delete Job</Button>
          </Modal.Footer>
        </Modal>

        {/* Applicant Detail Modal */}
        <Modal show={showApplicantModal} onHide={() => setShowApplicantModal(false)} size="lg">
          <Modal.Header closeButton style={{ background: '#fef7f5', borderBottom: '1px solid #fed7c5' }}>
            <Modal.Title style={{ fontWeight: '600', color: '#d97757' }}>
              📋 Application Details
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ padding: '0' }}>
            {selectedApplication && (
              <>
                {/* Applicant Profile Section */}
                <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                  <h6 style={{ color: '#6b7280', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '16px', fontWeight: '600' }}>
                    👤 Applicant Profile
                  </h6>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                    <div style={{ 
                      width: '80px', 
                      height: '80px', 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #d97757, #e09a7d)', 
                      color: '#fff', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontWeight: '700', 
                      fontSize: '1.5rem',
                      flexShrink: 0
                    }}>
                      {selectedApplication.applicant?.firstName?.charAt(0)}{selectedApplication.applicant?.lastName?.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 8px 0', fontWeight: '700', color: '#111827' }}>
                        {selectedApplication.applicant?.firstName} {selectedApplication.applicant?.lastName}
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', color: '#6b7280', fontSize: '0.9rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Icon type="mail" /> {selectedApplication.applicant?.email}
                        </span>
                        {selectedApplication.applicant?.phone && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Icon type="phone" /> {selectedApplication.applicant?.phone}
                          </span>
                        )}
                      </div>
                      {selectedApplication.applicant?.bio && (
                        <p style={{ marginTop: '12px', color: '#374151', fontSize: '0.9rem', lineHeight: '1.6' }}>
                          {selectedApplication.applicant?.bio}
                        </p>
                      )}
                      {selectedApplication.applicant?.skills?.length > 0 && (
                        <div style={{ marginTop: '12px' }}>
                          <span style={{ fontWeight: '500', fontSize: '0.85rem', color: '#6b7280' }}>Skills: </span>
                          {selectedApplication.applicant?.skills?.map((skill, i) => (
                            <Badge key={i} bg="" style={{ background: '#e0e7ff', color: '#4338ca', marginRight: '6px', marginBottom: '4px', fontWeight: '500' }}>
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Job Applied For */}
                <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                  <h6 style={{ color: '#6b7280', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '16px', fontWeight: '600' }}>
                    💼 Job Applied For
                  </h6>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h5 style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#111827' }}>
                        {selectedApplication.job?.title}
                      </h5>
                      <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>
                        {selectedApplication.job?.company} • {selectedApplication.job?.location}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <Badge style={{ 
                        background: `${getStatusColor(selectedApplication.status)}20`, 
                        color: getStatusColor(selectedApplication.status), 
                        fontWeight: '600', 
                        padding: '8px 16px', 
                        borderRadius: '8px', 
                        textTransform: 'capitalize',
                        fontSize: '0.9rem'
                      }}>
                        {selectedApplication.status}
                      </Badge>
                      <p style={{ margin: '8px 0 0 0', color: '#6b7280', fontSize: '0.8rem' }}>
                        Applied {formatDate(selectedApplication.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Resume Section */}
                <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                  <h6 style={{ color: '#6b7280', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '16px', fontWeight: '600' }}>
                    📄 Resume
                  </h6>
                  {selectedApplication.resume || selectedApplication.applicant?.resume ? (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px', 
                      padding: '16px', 
                      background: '#f0fdf4', 
                      borderRadius: '10px',
                      border: '1px solid #bbf7d0'
                    }}>
                      <div style={{ 
                        width: '48px', 
                        height: '48px', 
                        borderRadius: '10px', 
                        background: '#dcfce7', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: '#16a34a'
                      }}>
                        <Icon type="file" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: '600', color: '#111827' }}>Resume Attached</p>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>
                          {selectedApplication.resume?.originalName || selectedApplication.applicant?.resume?.originalName || 'resume.pdf'}
                        </p>
                      </div>
                      <Button 
                        variant="success"
                        size="sm"
                        href={getResumeUrl(selectedApplication.resume?.fileUrl || selectedApplication.applicant?.resume?.fileUrl)}
                        target="_blank"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px' }}
                      >
                        <Icon type="download" /> Download
                      </Button>
                    </div>
                  ) : (
                    <div style={{ 
                      padding: '20px', 
                      background: '#fef2f2', 
                      borderRadius: '10px', 
                      textAlign: 'center',
                      color: '#dc2626',
                      border: '1px solid #fecaca'
                    }}>
                      No resume attached
                    </div>
                  )}
                </div>

                {/* Cover Letter Section */}
                <div style={{ padding: '24px' }}>
                  <h6 style={{ color: '#6b7280', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '16px', fontWeight: '600' }}>
                    ✉️ Cover Letter
                  </h6>
                  {selectedApplication.coverLetter ? (
                    <div style={{ 
                      padding: '20px', 
                      background: '#fffbeb', 
                      borderRadius: '10px',
                      border: '1px solid #fde68a',
                      maxHeight: '300px',
                      overflowY: 'auto'
                    }}>
                      <p style={{ 
                        margin: 0, 
                        color: '#374151', 
                        fontSize: '0.95rem', 
                        lineHeight: '1.8',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {selectedApplication.coverLetter}
                      </p>
                    </div>
                  ) : (
                    <div style={{ 
                      padding: '20px', 
                      background: '#f3f4f6', 
                      borderRadius: '10px', 
                      textAlign: 'center',
                      color: '#6b7280'
                    }}>
                      No cover letter provided
                    </div>
                  )}
                </div>
              </>
            )}
          </Modal.Body>
          <Modal.Footer style={{ background: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', gap: '12px', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
              <Form.Select 
                size="sm" 
                value={selectedApplication?.status || 'pending'}
                onChange={(e) => {
                  handleUpdateApplicationStatus(selectedApplication._id, e.target.value);
                  setSelectedApplication({ ...selectedApplication, status: e.target.value });
                }}
                style={{ borderRadius: '8px', width: 'auto' }}
              >
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interview">Interview</option>
                <option value="offered">Offered</option>
                <option value="rejected">Rejected</option>
              </Form.Select>
              <Button variant="light" onClick={() => setShowApplicantModal(false)} style={{ borderRadius: '8px' }}>
                Close
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default AdminDashboard;
