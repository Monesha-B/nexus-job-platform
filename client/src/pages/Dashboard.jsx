import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    applications: 0,
    savedJobs: 0,
    profileViews: 0,
    matchScore: 0,
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [appsRes, jobsRes] = await Promise.all([
        api.get('/applications/my-applications'),
        api.get('/jobs?limit=5'),
      ]);
      
      const applications = appsRes.data.data.applications || [];
      setRecentApplications(applications.slice(0, 5));
      setStats(prev => ({ ...prev, applications: applications.length }));
      setRecentJobs(jobsRes.data.data.jobs || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      reviewed: '#d97757',
      shortlisted: '#8b5cf6',
      interview: '#d97757',
      offered: '#10b981',
      rejected: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const Icon = ({ type }) => {
    const icons = {
      file: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
      briefcase: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
      zap: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
      search: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
      arrow: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
      building: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/></svg>,
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
    <div style={{ background: '#f8f9fa', minHeight: 'calc(100vh - 76px)', padding: '40px 0' }}>
      <Container>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ color: '#111827', fontWeight: '700', marginBottom: '8px' }}>
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p style={{ color: '#6b7280' }}>Here's what's happening with your job search.</p>
        </div>

        {/* Stats Cards - Clickable */}
        <Row className="mb-4">
          {[
            { label: 'My Applications', value: stats.applications, icon: 'file', color: '#d97757', link: '/applications' },
            { label: 'Browse Jobs', value: 'Explore', icon: 'briefcase', color: '#d97757', link: '/jobs' },
            { label: 'AI Job Match', value: 'Try Now', icon: 'zap', color: '#10b981', link: '/match' },
            { label: 'My Profile', value: 'View', icon: 'search', color: '#f59e0b', link: '/profile' },
          ].map((stat, i) => (
            <Col md={3} sm={6} key={i} className="mb-3">
              <Card 
                onClick={() => navigate(stat.link)}
                style={{ 
                  border: 'none', 
                  borderRadius: '16px', 
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
                <Card.Body style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '4px' }}>{stat.label}</p>
                      <h3 style={{ color: '#111827', fontWeight: '700', marginBottom: '0', fontSize: '1.5rem' }}>{stat.value}</h3>
                    </div>
                    <div style={{ 
                      width: '52px', height: '52px', borderRadius: '14px', 
                      background: `${stat.color}15`, display: 'flex', alignItems: 'center', 
                      justifyContent: 'center', color: stat.color 
                    }}>
                      <Icon type={stat.icon} />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <Row>
          {/* Recent Applications */}
          <Col lg={6} className="mb-4">
            <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}>
              <Card.Header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '20px 24px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h5 style={{ margin: 0, fontWeight: '600', color: '#111827' }}>Recent Applications</h5>
                <Button 
                  variant="link" 
                  onClick={() => navigate('/applications')}
                  style={{ color: '#d97757', textDecoration: 'none', fontWeight: '500', padding: 0 }}
                >
                  View All <Icon type="arrow" />
                </Button>
              </Card.Header>
              <Card.Body style={{ padding: '0' }}>
                {recentApplications.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📄</div>
                    <p style={{ color: '#6b7280', marginBottom: '16px' }}>No applications yet</p>
                    <Button 
                      onClick={() => navigate('/jobs')}
                      style={{ background: '#d97757', border: 'none', borderRadius: '10px' }}
                    >
                      Browse Jobs
                    </Button>
                  </div>
                ) : (
                  <div>
                    {recentApplications.map((app, i) => (
                      <div 
                        key={app._id}
                        onClick={() => navigate(`/jobs/${app.job?._id}`)}
                        style={{ 
                          padding: '16px 24px', 
                          borderBottom: i < recentApplications.length - 1 ? '1px solid #f3f4f6' : 'none',
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#fef7f5'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ 
                              width: '42px', height: '42px', borderRadius: '10px', 
                              background: '#fef7f5', display: 'flex', alignItems: 'center', 
                              justifyContent: 'center', color: '#d97757', fontWeight: '700' 
                            }}>
                              {app.job?.company?.charAt(0) || 'J'}
                            </div>
                            <div>
                              <p style={{ margin: 0, fontWeight: '600', color: '#111827' }}>{app.job?.title}</p>
                              <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>{app.job?.company}</p>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ 
                              display: 'inline-block',
                              padding: '4px 10px', 
                              borderRadius: '6px', 
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              background: `${getStatusColor(app.status)}15`,
                              color: getStatusColor(app.status),
                              textTransform: 'capitalize'
                            }}>
                              {app.status}
                            </span>
                            <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#9ca3af' }}>{formatDate(app.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Recommended Jobs */}
          <Col lg={6} className="mb-4">
            <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}>
              <Card.Header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '20px 24px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h5 style={{ margin: 0, fontWeight: '600', color: '#111827' }}>Recommended Jobs</h5>
                <Button 
                  variant="link" 
                  onClick={() => navigate('/jobs')}
                  style={{ color: '#d97757', textDecoration: 'none', fontWeight: '500', padding: 0 }}
                >
                  View All <Icon type="arrow" />
                </Button>
              </Card.Header>
              <Card.Body style={{ padding: '0' }}>
                {recentJobs.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '12px' }}>💼</div>
                    <p style={{ color: '#6b7280' }}>No jobs available</p>
                  </div>
                ) : (
                  <div>
                    {recentJobs.map((job, i) => (
                      <div 
                        key={job._id}
                        onClick={() => navigate(`/jobs/${job._id}`)}
                        style={{ 
                          padding: '16px 24px', 
                          borderBottom: i < recentJobs.length - 1 ? '1px solid #f3f4f6' : 'none',
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#fef7f5'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ 
                              width: '42px', height: '42px', borderRadius: '10px', 
                              background: '#fef7f5', display: 'flex', alignItems: 'center', 
                              justifyContent: 'center', color: '#d97757', fontWeight: '700' 
                            }}>
                              {job.company?.charAt(0)}
                            </div>
                            <div>
                              <p style={{ margin: 0, fontWeight: '600', color: '#111827' }}>{job.title}</p>
                              <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>{job.company} • {job.location}</p>
                            </div>
                          </div>
                          <div style={{ color: '#d97757' }}>
                            <Icon type="arrow" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <Card.Body style={{ padding: '24px' }}>
            <h5 style={{ fontWeight: '600', color: '#111827', marginBottom: '20px' }}>Quick Actions</h5>
            <Row>
              {[
                { title: 'AI Job Match', desc: 'Find jobs matching your skills', icon: '🎯', link: '/match', color: '#d97757' },
                { title: 'Browse Jobs', desc: 'Explore available positions', icon: '🔍', link: '/jobs', color: '#d97757' },
                { title: 'Update Profile', desc: 'Keep your info up to date', icon: '👤', link: '/profile', color: '#10b981' },
                { title: 'My Applications', desc: 'Track your applications', icon: '📄', link: '/applications', color: '#f59e0b' },
              ].map((action, i) => (
                <Col md={3} sm={6} key={i} className="mb-3">
                  <div 
                    onClick={() => navigate(action.link)}
                    style={{ 
                      padding: '20px', 
                      borderRadius: '12px', 
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      height: '100%'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = action.color;
                      e.currentTarget.style.background = `${action.color}08`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{action.icon}</div>
                    <h6 style={{ fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{action.title}</h6>
                    <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: 0 }}>{action.desc}</p>
                  </div>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default Dashboard;
