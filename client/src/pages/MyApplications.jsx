import { useState, useEffect } from 'react';
import { Container, Card, Badge, Spinner, Alert, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const MyApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/applications/my-applications');
      setApplications(res.data.data.applications || []);
    } catch (err) {
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (id) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;
    try {
      await api.delete(`/applications/${id}`);
      setApplications(applications.filter(app => app._id !== id));
    } catch (err) {
      setError('Failed to withdraw application');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      reviewed: '#d97757',
      shortlisted: '#8b5cf6',
      interview: '#d97757',
      offered: '#10b981',
      rejected: '#ef4444',
      withdrawn: '#6b7280',
    };
    return colors[status] || '#6b7280';
  };

  const Icon = ({ type }) => {
    const icons = {
      briefcase: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
      location: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
      calendar: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
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
        <h1 style={{ color: '#111827', fontWeight: '700', marginBottom: '8px' }}>My Applications</h1>
        <p style={{ color: '#6b7280', marginBottom: '30px' }}>Track the status of your job applications</p>

        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

        {applications.length === 0 ? (
          <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}></div>
            <h4 style={{ color: '#111827', marginBottom: '8px' }}>No applications yet</h4>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>Start applying to jobs to see them here.</p>
            <Button 
              onClick={() => navigate('/jobs')}
              style={{ background: '#d97757', border: 'none', borderRadius: '10px', padding: '10px 24px' }}
            >
              Browse Jobs
            </Button>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {applications.map((app) => (
              <Card 
                key={app._id}
                style={{ border: '1px solid #e5e7eb', borderRadius: '16px', overflow: 'hidden' }}
              >
                <Card.Body style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ 
                          width: '50px', height: '50px', borderRadius: '12px', 
                          background: '#fef7f5', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#d97757', fontWeight: '700', fontSize: '1.2rem'
                        }}>
                          {app.job?.company?.charAt(0) || 'J'}
                        </div>
                        <div>
                          <h5 
                            style={{ color: '#111827', fontWeight: '600', marginBottom: '4px', cursor: 'pointer' }}
                            onClick={() => navigate(`/jobs/${app.job?._id}`)}
                          >
                            {app.job?.title || 'Job Title'}
                          </h5>
                          <p style={{ color: '#6b7280', marginBottom: '0', fontSize: '0.9rem' }}>
                            {app.job?.company || 'Company'}
                          </p>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', color: '#6b7280', fontSize: '0.85rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Icon type="location" /> {app.job?.location || 'Location'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Icon type="calendar" /> Applied {formatDate(app.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                      <Badge style={{ 
                        background: `${getStatusColor(app.status)}20`, 
                        color: getStatusColor(app.status),
                        fontWeight: '600',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        textTransform: 'capitalize'
                      }}>
                        {app.status}
                      </Badge>
                      
                      {app.status === 'pending' && (
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleWithdraw(app._id)}
                          style={{ borderRadius: '8px' }}
                        >
                          Withdraw
                        </Button>
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
};

export default MyApplications;
