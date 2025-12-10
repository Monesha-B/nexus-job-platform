import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [hasApplied, setHasApplied] = useState(false);
  
  // AI Cover Letter states
  const [generatingCover, setGeneratingCover] = useState(false);
  const [coverLetterSource, setCoverLetterSource] = useState('none'); // none, generate, manual
  const [aiSettings, setAiSettings] = useState({
    tone: 'professional',
    highlights: '',
    customPoints: '',
  });

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/jobs/${id}`);
      setJob(res.data.data.job);
    } catch (err) {
      setError('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    setGeneratingCover(true);
    setError('');
    
    try {
      const res = await api.post('/ai/generate-cover-letter', {
        jobId: id,
        tone: aiSettings.tone,
        highlights: aiSettings.highlights,
        customPoints: aiSettings.customPoints,
      });
      
      setCoverLetter(res.data.data.coverLetter);
      setCoverLetterSource('generate');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate cover letter. Make sure you have uploaded a resume.');
    } finally {
      setGeneratingCover(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    setError('');
    
    try {
      await api.post('/applications', { job: id, coverLetter });
      setSuccess('Application submitted successfully!');
      setHasApplied(true);
      setShowApplyModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatSalary = (salary) => {
    if (!salary || !salary.isVisible) return 'Not disclosed';
    if (salary.min && salary.max) return `$${salary.min.toLocaleString()} - $${salary.max.toLocaleString()} / year`;
    if (salary.min) return `$${salary.min.toLocaleString()}+ / year`;
    return 'Not disclosed';
  };

  const Icon = ({ type }) => {
    const icons = {
      location: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
      briefcase: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
      clock: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
      dollar: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
      building: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/></svg>,
      users: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
      star: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
      check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
      arrow: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
      sparkles: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/><path d="M5 19l1 3 1-3 3-1-3-1-1-3-1 3-3 1 3 1z"/><path d="M19 13l1 2 1-2 2-1-2-1-1-2-1 2-2 1 2 1z"/></svg>,
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

  if (!job) {
    return (
      <Container style={{ padding: '60px 0', textAlign: 'center' }}>
        <h3>Job not found</h3>
        <Button onClick={() => navigate('/jobs')} style={{ marginTop: '20px' }}>Back to Jobs</Button>
      </Container>
    );
  }

  return (
    <div style={{ background: '#f8f9fa', minHeight: 'calc(100vh - 76px)' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '30px 0' }}>
        <Container>
          <Button 
            variant="link" 
            onClick={() => navigate('/jobs')}
            style={{ color: '#6b7280', textDecoration: 'none', padding: '0', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Icon type="arrow" /> Back to Jobs
          </Button>

          <Row className="align-items-center">
            <Col md={8}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div style={{ 
                  width: '80px', height: '80px', borderRadius: '16px', 
                  background: '#fef7f5', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#d97757', fontWeight: '700', fontSize: '2rem', flexShrink: 0
                }}>
                  {job.company?.charAt(0)}
                </div>
                <div>
                  <h1 style={{ color: '#111827', fontWeight: '700', marginBottom: '8px', fontSize: '1.75rem' }}>
                    {job.title}
                  </h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#6b7280', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Icon type="building" /> {job.company}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Icon type="location" /> {job.location}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Icon type="clock" /> {formatDate(job.postedAt || job.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </Col>
            <Col md={4} className="text-md-end mt-3 mt-md-0">
              {user?.role === 'jobseeker' && (
                <Button
                  onClick={() => setShowApplyModal(true)}
                  disabled={hasApplied}
                  style={{ 
                    background: hasApplied ? '#9ca3af' : '#d97757', 
                    border: 'none', padding: '14px 32px', borderRadius: '12px',
                    fontWeight: '600', fontSize: '1rem'
                  }}
                >
                  {hasApplied ? 'Applied ✓' : 'Apply Now'}
                </Button>
              )}
            </Col>
          </Row>
        </Container>
      </div>

      {/* Content */}
      <Container style={{ padding: '40px 0' }}>
        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

        <Row>
          <Col lg={8}>
            <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '24px' }}>
              <Card.Body style={{ padding: '32px' }}>
                <h4 style={{ color: '#111827', fontWeight: '600', marginBottom: '16px' }}>Job Description</h4>
                <p style={{ color: '#4b5563', lineHeight: '1.8', whiteSpace: 'pre-line' }}>{job.description}</p>
              </Card.Body>
            </Card>

            {job.responsibilities?.length > 0 && (
              <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '24px' }}>
                <Card.Body style={{ padding: '32px' }}>
                  <h4 style={{ color: '#111827', fontWeight: '600', marginBottom: '16px' }}>Responsibilities</h4>
                  <ul style={{ paddingLeft: '0', listStyle: 'none' }}>
                    {job.responsibilities.map((item, i) => (
                      <li key={i} style={{ display: 'flex', gap: '12px', marginBottom: '12px', color: '#4b5563' }}>
                        <span style={{ color: '#d97757', flexShrink: 0 }}><Icon type="check" /></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card.Body>
              </Card>
            )}

            {job.requirements?.length > 0 && (
              <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '24px' }}>
                <Card.Body style={{ padding: '32px' }}>
                  <h4 style={{ color: '#111827', fontWeight: '600', marginBottom: '16px' }}>Requirements</h4>
                  <ul style={{ paddingLeft: '0', listStyle: 'none' }}>
                    {job.requirements.map((item, i) => (
                      <li key={i} style={{ display: 'flex', gap: '12px', marginBottom: '12px', color: '#4b5563' }}>
                        <span style={{ color: '#d97757', flexShrink: 0 }}><Icon type="check" /></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card.Body>
              </Card>
            )}

            {job.benefits?.length > 0 && (
              <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <Card.Body style={{ padding: '32px' }}>
                  <h4 style={{ color: '#111827', fontWeight: '600', marginBottom: '16px' }}>Benefits</h4>
                  <ul style={{ paddingLeft: '0', listStyle: 'none' }}>
                    {job.benefits.map((item, i) => (
                      <li key={i} style={{ display: 'flex', gap: '12px', marginBottom: '12px', color: '#4b5563' }}>
                        <span style={{ color: '#10b981', flexShrink: 0 }}><Icon type="star" /></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card.Body>
              </Card>
            )}
          </Col>

          <Col lg={4}>
            <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '24px' }}>
              <Card.Body style={{ padding: '24px' }}>
                <h5 style={{ color: '#111827', fontWeight: '600', marginBottom: '20px' }}>Job Overview</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { icon: 'briefcase', label: 'Job Type', value: job.type },
                    { icon: 'location', label: 'Work Location', value: job.locationType },
                    { icon: 'users', label: 'Experience Level', value: `${job.experienceLevel} Level` },
                    { icon: 'dollar', label: 'Salary', value: formatSalary(job.salary) },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef7f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97757' }}>
                        <Icon type={item.icon} />
                      </div>
                      <div>
                        <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '2px' }}>{item.label}</p>
                        <p style={{ color: '#111827', fontWeight: '500', marginBottom: '0', textTransform: 'capitalize' }}>{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>

            {job.skills?.length > 0 && (
              <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <Card.Body style={{ padding: '24px' }}>
                  <h5 style={{ color: '#111827', fontWeight: '600', marginBottom: '16px' }}>Required Skills</h5>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {job.skills.map((skill, i) => (
                      <Badge bg="" key={i} style={{ background: '#fef7f5', color: '#d97757', fontWeight: '500', padding: '8px 14px', borderRadius: '8px', fontSize: '0.85rem' }}>
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>

      {/* Apply Modal with AI Cover Letter */}
      <Modal show={showApplyModal} onHide={() => setShowApplyModal(false)} size="lg" centered>
        <Modal.Header closeButton style={{ borderBottom: '1px solid #e5e7eb', padding: '20px 24px' }}>
          <Modal.Title style={{ fontWeight: '600' }}>Apply for {job.title}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleApply}>
          <Modal.Body style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              Your profile and resume will be shared with {job.company}.
            </p>

            {/* Cover Letter Options */}
            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: '600', color: '#111827', marginBottom: '12px' }}>Cover Letter</Form.Label>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <Button
                  type="button"
                  variant={coverLetterSource === 'none' ? 'primary' : 'outline-secondary'}
                  onClick={() => { setCoverLetterSource('none'); setCoverLetter(''); }}
                  style={{ 
                    borderRadius: '10px', 
                    padding: '10px 16px',
                    background: coverLetterSource === 'none' ? '#d97757' : undefined,
                    borderColor: coverLetterSource === 'none' ? '#d97757' : undefined,
                  }}
                >
                  No Cover Letter
                </Button>
                <Button
                  type="button"
                  variant={coverLetterSource === 'generate' ? 'primary' : 'outline-secondary'}
                  onClick={() => setCoverLetterSource('generate')}
                  style={{ 
                    borderRadius: '10px', 
                    padding: '10px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: coverLetterSource === 'generate' ? '#d97757' : undefined,
                    borderColor: coverLetterSource === 'generate' ? '#d97757' : undefined,
                  }}
                >
                  <Icon type="sparkles" /> AI Generate
                </Button>
                <Button
                  type="button"
                  variant={coverLetterSource === 'manual' ? 'primary' : 'outline-secondary'}
                  onClick={() => setCoverLetterSource('manual')}
                  style={{ 
                    borderRadius: '10px', 
                    padding: '10px 16px',
                    background: coverLetterSource === 'manual' ? '#d97757' : undefined,
                    borderColor: coverLetterSource === 'manual' ? '#d97757' : undefined,
                  }}
                >
                  Write Manually
                </Button>
              </div>
            </Form.Group>

            {/* AI Generation Options */}
            {coverLetterSource === 'generate' && (
              <Card style={{ background: '#fef7f5', border: '1px solid #fed7ca', borderRadius: '12px', marginBottom: '20px' }}>
                <Card.Body style={{ padding: '20px' }}>
                  <h6 style={{ color: '#d97757', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon type="sparkles" /> AI Cover Letter Settings
                  </h6>
                  
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: '500', color: '#374151' }}>Tone</Form.Label>
                    <Form.Select
                      value={aiSettings.tone}
                      onChange={(e) => setAiSettings({ ...aiSettings, tone: e.target.value })}
                      style={{ borderRadius: '8px' }}
                    >
                      <option value="professional">Professional & Formal</option>
                      <option value="friendly">Friendly & Approachable</option>
                      <option value="enthusiastic">Enthusiastic & Energetic</option>
                      <option value="confident">Confident & Bold</option>
                      <option value="humble">Humble & Eager to Learn</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: '500', color: '#374151' }}>Key Strengths to Highlight</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g., leadership, problem-solving, React expertise"
                      value={aiSettings.highlights}
                      onChange={(e) => setAiSettings({ ...aiSettings, highlights: e.target.value })}
                      style={{ borderRadius: '8px' }}
                    />
                    <Form.Text className="text-muted">Comma-separated skills or experiences to emphasize</Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: '500', color: '#374151' }}>Custom Points to Mention</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="e.g., I'm relocating to San Francisco next month, I've been following your company's work on..."
                      value={aiSettings.customPoints}
                      onChange={(e) => setAiSettings({ ...aiSettings, customPoints: e.target.value })}
                      style={{ borderRadius: '8px' }}
                    />
                  </Form.Group>

                  <Button
                    type="button"
                    onClick={handleGenerateCoverLetter}
                    disabled={generatingCover}
                    style={{ 
                      background: '#d97757', 
                      border: 'none', 
                      borderRadius: '10px', 
                      padding: '12px 24px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    {generatingCover ? (
                      <>
                        <Spinner animation="border" size="sm" /> Generating...
                      </>
                    ) : (
                      <>
                        <Icon type="sparkles" /> Generate Cover Letter
                      </>
                    )}
                  </Button>
                </Card.Body>
              </Card>
            )}

            {/* Cover Letter Text Area */}
            {(coverLetterSource === 'generate' || coverLetterSource === 'manual') && (
              <Form.Group className="mb-3">
                <Form.Label style={{ fontWeight: '500', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{coverLetterSource === 'generate' ? 'Generated Cover Letter (Edit if needed)' : 'Your Cover Letter'}</span>
                  <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{coverLetter.length}/5000</span>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={10}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder={coverLetterSource === 'generate' 
                    ? "Click 'Generate Cover Letter' above to create an AI-powered cover letter based on your resume and this job..."
                    : "Write your cover letter here. Tell the employer why you're the perfect fit for this role..."}
                  style={{ borderRadius: '10px', fontSize: '0.95rem', lineHeight: '1.6' }}
                  maxLength={5000}
                />
              </Form.Group>
            )}

            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
          </Modal.Body>
          <Modal.Footer style={{ borderTop: '1px solid #e5e7eb', padding: '16px 24px' }}>
            <Button variant="light" onClick={() => setShowApplyModal(false)} style={{ borderRadius: '8px', padding: '10px 20px' }}>
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={applying}
              style={{ background: '#d97757', border: 'none', borderRadius: '8px', padding: '10px 24px', fontWeight: '600' }}
            >
              {applying ? <Spinner animation="border" size="sm" /> : 'Submit Application'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default JobDetails;
