import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const JobSearch = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    type: '',
    experienceLevel: '',
    locationType: '',
  });
  
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 12);
      
      if (filters.search) params.append('search', filters.search);
      if (filters.location) params.append('location', filters.location);
      if (filters.type) params.append('type', filters.type);
      if (filters.experienceLevel) params.append('experienceLevel', filters.experienceLevel);
      if (filters.locationType) params.append('locationType', filters.locationType);

      const res = await api.get(`/jobs?${params.toString()}`);
      setJobs(res.data.data.jobs || []);
      setPagination(res.data.data.pagination || { current: 1, pages: 1, total: 0 });
    } catch (err) {
      setError('Failed to load jobs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs(1);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      location: '',
      type: '',
      experienceLevel: '',
      locationType: '',
    });
    setTimeout(() => fetchJobs(1), 100);
  };

  const formatDate = (date) => {
    const now = new Date();
    const posted = new Date(date);
    const diffTime = Math.abs(now - posted);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return posted.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatSalary = (salary) => {
    if (!salary || !salary.isVisible) return null;
    if (salary.min && salary.max) {
      return `$${(salary.min / 1000).toFixed(0)}k - $${(salary.max / 1000).toFixed(0)}k`;
    }
    if (salary.min) return `$${(salary.min / 1000).toFixed(0)}k+`;
    return null;
  };

  const Icon = ({ type }) => {
    const icons = {
      search: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
      location: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
      briefcase: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
      clock: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
      dollar: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
      building: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/></svg>,
      users: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
      arrow: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    };
    return icons[type] || null;
  };

  return (
    <div style={{ background: '#f8f9fa', minHeight: 'calc(100vh - 76px)' }}>
      {/* Search Header */}
      <div style={{ background: 'linear-gradient(135deg, #fef7f5 0%, #fff 100%)', padding: '40px 0', borderBottom: '1px solid #e5e7eb' }}>
        <Container>
          <h1 style={{ color: '#111827', fontWeight: '700', marginBottom: '8px', fontSize: '2rem' }}>
            Browse Jobs
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            Find your perfect role from {pagination.total} available positions
          </p>

          <Form onSubmit={handleSearch}>
            <Row className="g-3">
              <Col lg={4} md={6}>
                <div style={{ position: 'relative' }}>
                  <Form.Control
                    type="text"
                    placeholder="Job title, keywords, or company"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    style={{ 
                      padding: '12px 16px 12px 44px', 
                      borderRadius: '10px',
                      border: '1px solid #e5e7eb',
                      fontSize: '0.95rem'
                    }}
                  />
                  <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
                    <Icon type="search" />
                  </div>
                </div>
              </Col>
              <Col lg={2} md={6}>
                <Form.Control
                  type="text"
                  placeholder="Location"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e5e7eb' }}
                />
              </Col>
              <Col lg={2} md={4}>
                <Form.Select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e5e7eb' }}
                >
                  <option value="">All Types</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </Form.Select>
              </Col>
              <Col lg={2} md={4}>
                <Form.Select
                  value={filters.experienceLevel}
                  onChange={(e) => setFilters({ ...filters, experienceLevel: e.target.value })}
                  style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #e5e7eb' }}
                >
                  <option value="">All Levels</option>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="lead">Lead</option>
                </Form.Select>
              </Col>
              <Col lg={2} md={4}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button 
                    type="submit"
                    style={{ 
                      flex: 1,
                      background: '#d97757', 
                      border: 'none', 
                      padding: '12px 20px', 
                      borderRadius: '10px',
                      fontWeight: '600'
                    }}
                  >
                    Search
                  </Button>
                  <Button 
                    type="button"
                    variant="outline-secondary"
                    onClick={handleClearFilters}
                    style={{ borderRadius: '10px', padding: '12px 16px' }}
                  >
                    Clear
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>

      {/* Jobs List */}
      <Container style={{ padding: '40px 0' }}>
        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <Spinner animation="border" style={{ color: '#d97757' }} />
            <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🔍</div>
            <h4 style={{ color: '#111827', marginBottom: '8px' }}>No jobs found</h4>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>
              Try adjusting your search filters or check back later.
            </p>
            <Button 
              onClick={handleClearFilters}
              style={{ background: '#d97757', border: 'none', borderRadius: '10px', padding: '10px 24px' }}
            >
              Clear Filters
            </Button>
          </Card>
        ) : (
          <>
            <Row>
              {jobs.map((job) => (
                <Col lg={6} key={job._id} className="mb-4">
                  <Card 
                    style={{ 
                      border: '1px solid #e5e7eb',
                      borderRadius: '16px',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      height: '100%'
                    }}
                    onClick={() => navigate(`/jobs/${job._id}`)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#d97757';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(217, 119, 87, 0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <Card.Body style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div style={{ flex: 1 }}>
                          <h5 style={{ color: '#111827', fontWeight: '600', marginBottom: '6px', fontSize: '1.1rem' }}>
                            {job.title}
                          </h5>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280' }}>
                            <Icon type="building" />
                            <span>{job.company}</span>
                          </div>
                        </div>
                        <div style={{ 
                          width: '50px', 
                          height: '50px', 
                          borderRadius: '12px', 
                          background: '#fef7f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#d97757',
                          fontWeight: '700',
                          fontSize: '1.1rem'
                        }}>
                          {job.company?.charAt(0)}
                        </div>
                      </div>

                      {/* Job Type Badges - Now Coral */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                        <Badge bg="" style={{ background: '#fef7f5', color: '#d97757', fontWeight: '500', padding: '6px 12px', borderRadius: '6px', textTransform: 'capitalize' }}>
                          {job.type}
                        </Badge>
                        <Badge bg="" style={{ background: '#fef7f5', color: '#d97757', fontWeight: '500', padding: '6px 12px', borderRadius: '6px', textTransform: 'capitalize' }}>
                          {job.locationType}
                        </Badge>
                        <Badge bg="" style={{ background: '#fef7f5', color: '#d97757', fontWeight: '500', padding: '6px 12px', borderRadius: '6px', textTransform: 'capitalize' }}>
                          {job.experienceLevel} Level
                        </Badge>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '16px', color: '#6b7280', fontSize: '0.9rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Icon type="location" />
                          <span>{job.location}</span>
                        </div>
                        {formatSalary(job.salary) && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Icon type="dollar" />
                            <span>{formatSalary(job.salary)}</span>
                          </div>
                        )}
                      </div>

                      {/* Skills - Coral */}
                      {job.skills && job.skills.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                          {job.skills.slice(0, 4).map((skill, i) => (
                            <span key={i} style={{ background: '#fef7f5', color: '#d97757', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem' }}>
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 4 && (
                            <span style={{ color: '#6b7280', fontSize: '0.8rem', padding: '4px 0' }}>+{job.skills.length - 4} more</span>
                          )}
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9ca3af', fontSize: '0.85rem' }}>
                          <Icon type="clock" />
                          <span>{formatDate(job.postedAt || job.createdAt)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#d97757', fontWeight: '500', fontSize: '0.9rem' }}>
                          View Details <Icon type="arrow" />
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            {pagination.pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === pagination.current ? 'primary' : 'outline-secondary'}
                    onClick={() => fetchJobs(page)}
                    style={{
                      borderRadius: '8px',
                      minWidth: '40px',
                      background: page === pagination.current ? '#d97757' : undefined,
                      borderColor: page === pagination.current ? '#d97757' : undefined,
                    }}
                  >
                    {page}
                  </Button>
                ))}
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
};

export default JobSearch;
