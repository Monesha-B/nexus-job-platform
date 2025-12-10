import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Tabs, Tab } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const JobMatch = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resumes, setResumes] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [copied, setCopied] = useState(false);
  const [matchHistory, setMatchHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  const [selectedResume, setSelectedResume] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [useTextInput, setUseTextInput] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  
  const [matchResult, setMatchResult] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [generatingCover, setGeneratingCover] = useState(false);

  useEffect(() => { 
    fetchResumes(); 
    fetchMatchHistory();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await api.get('/resumes');
      setResumes(response.data.data.resumes || []);
      if (response.data.data.resumes?.length > 0) setSelectedResume(response.data.data.resumes[0]._id);
    } catch (err) { console.error('Error fetching resumes:', err); }
    setLoadingResumes(false);
  };

  const fetchMatchHistory = async () => {
    try {
      const response = await api.get('/ai/matches?limit=20');
      setMatchHistory(response.data.data.matches || []);
    } catch (err) { console.error('Error fetching match history:', err); }
    setLoadingHistory(false);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError('');
    if (!jobDescription.trim()) { setError('Please paste a job description'); return; }
    if (!useTextInput && !selectedResume && resumes.length === 0) { setError('Please upload a resume first or paste your resume text'); return; }
    if (useTextInput && !resumeText.trim()) { setError('Please paste your resume text'); return; }

    setLoading(true);
    try {
      const payload = { jobDescription, jobTitle: jobTitle || undefined, company: company || undefined };
      if (useTextInput) payload.resumeText = resumeText;
      else if (selectedResume) payload.resumeId = selectedResume;
      const response = await api.post('/ai/match', payload);
      setMatchResult(response.data.data);
      setStep(2);
      fetchMatchHistory(); // Refresh history after new match
    } catch (err) { setError(err.response?.data?.message || 'Failed to analyze. Please try again.'); }
    setLoading(false);
  };

  const handleGenerateCoverLetter = async () => {
    if (!matchResult) return;
    setGeneratingCover(true);
    try {
      const response = await api.post('/ai/cover-letter', {
        jobDescription, jobTitle: jobTitle || 'the position', company: company || 'your company',
        matchId: matchResult.matchId, userName: `${user?.firstName} ${user?.lastName}`, userEmail: user?.email
      });
      let letter = response.data.data.coverLetter;
      letter = letter.replace(/John Smith|Jane Doe|\[Your Name\]|\[Name\]/gi, `${user?.firstName} ${user?.lastName}`);
      letter = letter.replace(/john@email\.com|\[Your Email\]|\[Email\]/gi, user?.email || '');
      setCoverLetter(letter);
    } catch (err) { setError(err.response?.data?.message || 'Failed to generate cover letter'); }
    setGeneratingCover(false);
  };

  const viewMatchDetails = async (matchId) => {
    setLoading(true);
    try {
      const response = await api.get(`/ai/matches/${matchId}`);
      const match = response.data.data.match;
      setMatchResult({
        matchId: match._id,
        matchScore: match.result.matchScore,
        summary: match.result.summary,
        strengths: match.result.strengths,
        gaps: match.result.gaps,
        skillsMatch: match.result.skillsMatch,
        experienceMatch: match.result.experienceMatch,
        educationMatch: match.result.educationMatch,
        recommendations: match.result.recommendations
      });
      setJobTitle(match.jobTitle || '');
      setCompany(match.company || '');
      setJobDescription(match.jobDescription || '');
      setCoverLetter(match.result.coverLetter || '');
      setStep(2);
    } catch (err) { setError('Failed to load match details'); }
    setLoading(false);
  };

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const getScoreColor = (score) => score >= 80 ? '#059669' : score >= 60 ? '#d97757' : '#dc2626';
  const getScoreLabel = (score) => score >= 80 ? 'Excellent Match' : score >= 60 ? 'Good Match' : score >= 40 ? 'Moderate Match' : 'Low Match';
  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const Icon = ({ type }) => {
    const icons = {
      upload: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
      file: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
      check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
      alert: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
      star: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
      copy: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
      checkCircle: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
      refresh: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
      history: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
      eye: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
      plus: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    };
    return icons[type] || null;
  };

  if (loading) return <LoadingSpinner fullScreen text="Loading..." />;

  return (
    <div style={{ background: '#f9fafb', minHeight: 'calc(100vh - 76px)' }}>
      <Container style={{ padding: '32px 20px', maxWidth: '1200px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ color: '#111827', fontWeight: '600', fontSize: '1.75rem', marginBottom: '8px' }}>AI Job Match</h1>
            <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>{step === 1 ? 'Paste a job description to see how well you match' : 'Your match analysis results'}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #d97757 0%, #c4624a 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600' }}>{user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}</div>
            <div>
              <p style={{ color: '#111827', fontWeight: '500', marginBottom: '0', fontSize: '0.9rem' }}>{user?.firstName} {user?.lastName}</p>
              <p style={{ color: '#6b7280', fontSize: '0.75rem', marginBottom: '0' }}>{user?.email}</p>
            </div>
          </div>
        </div>

        {step === 2 && (
          <div style={{ marginBottom: '24px' }}>
            <Button onClick={() => { setStep(1); setMatchResult(null); setCoverLetter(''); setJobTitle(''); setCompany(''); setJobDescription(''); }} style={{ background: '#fff', border: '1px solid #d97757', color: '#d97757', borderRadius: '8px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}><Icon type="plus" /> New Match</Button>
          </div>
        )}

        {error && <Alert variant="danger" onClose={() => setError('')} dismissible style={{ marginBottom: '24px', borderRadius: '10px', border: 'none', background: '#fef2f2', color: '#991b1b' }}>{error}</Alert>}

        {step === 1 && (
          <Row>
            <Col lg={7}>
              <Card style={{ border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: '24px' }}>
                <Card.Body style={{ padding: '28px' }}>
                  <Form onSubmit={handleAnalyze}>
                    <div style={{ marginBottom: '24px' }}>
                      <Form.Label style={{ fontWeight: '500', color: '#374151', marginBottom: '12px', display: 'block' }}>Your Resume</Form.Label>
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                        <Button type="button" onClick={() => setUseTextInput(false)} style={{ flex: 1, background: !useTextInput ? '#fef7f5' : '#fff', border: !useTextInput ? '2px solid #d97757' : '1px solid #e5e7eb', color: !useTextInput ? '#d97757' : '#6b7280', padding: '12px', borderRadius: '10px', fontWeight: '500', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Icon type="file" /> Uploaded Resume</Button>
                        <Button type="button" onClick={() => setUseTextInput(true)} style={{ flex: 1, background: useTextInput ? '#fef7f5' : '#fff', border: useTextInput ? '2px solid #d97757' : '1px solid #e5e7eb', color: useTextInput ? '#d97757' : '#6b7280', padding: '12px', borderRadius: '10px', fontWeight: '500', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Icon type="upload" /> Paste Text</Button>
                      </div>
                      {!useTextInput ? (
                        loadingResumes ? <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Loading resumes...</p> :
                        resumes.length > 0 ? <Form.Select value={selectedResume} onChange={(e) => setSelectedResume(e.target.value)} style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '10px' }}>{resumes.map(r => <option key={r._id} value={r._id}>{r.fileName} {r.isPrimary && '(Primary)'}</option>)}</Form.Select> :
                        <div style={{ background: '#fef7f5', padding: '20px', borderRadius: '10px', textAlign: 'center', border: '1px dashed #d97757' }}><p style={{ color: '#6b7280', marginBottom: '12px', fontSize: '0.875rem' }}>No resumes uploaded yet</p><Button as={Link} to="/profile" size="sm" style={{ background: '#d97757', border: 'none', borderRadius: '8px' }}>Upload Resume</Button></div>
                      ) : <Form.Control as="textarea" rows={6} placeholder="Paste your resume content here..." value={resumeText} onChange={(e) => setResumeText(e.target.value)} style={{ padding: '14px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '0.875rem' }} />}
                    </div>
                    <Row className="mb-3">
                      <Col md={6}><Form.Group><Form.Label style={{ fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>Job Title <span style={{ color: '#9ca3af' }}>(optional)</span></Form.Label><Form.Control type="text" placeholder="e.g. Software Engineer" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '10px' }} /></Form.Group></Col>
                      <Col md={6}><Form.Group><Form.Label style={{ fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>Company <span style={{ color: '#9ca3af' }}>(optional)</span></Form.Label><Form.Control type="text" placeholder="e.g. Google" value={company} onChange={(e) => setCompany(e.target.value)} style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '10px' }} /></Form.Group></Col>
                    </Row>
                    <Form.Group className="mb-4"><Form.Label style={{ fontWeight: '500', color: '#374151' }}>Job Description <span style={{ color: '#d97757' }}>*</span></Form.Label><Form.Control as="textarea" rows={10} placeholder="Paste the full job description here..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} style={{ padding: '14px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '0.875rem' }} required /></Form.Group>
                    <Button type="submit" disabled={loading} style={{ background: '#d97757', border: 'none', padding: '14px 28px', borderRadius: '10px', fontWeight: '500', width: '100%', fontSize: '1rem' }}>Analyze Match</Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={5}>
              {/* Match History */}
              <Card style={{ border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: '20px' }}>
                <Card.Body style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h5 style={{ fontWeight: '600', color: '#111827', marginBottom: '0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Icon type="history" /> Match History
                    </h5>
                    <span style={{ background: '#fef7f5', color: '#d97757', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' }}>{matchHistory.length} matches</span>
                  </div>
                  
                  {loadingHistory ? (
                    <p style={{ color: '#6b7280', fontSize: '0.875rem', textAlign: 'center', padding: '20px' }}>Loading history...</p>
                  ) : matchHistory.length > 0 ? (
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      {matchHistory.map((match, i) => (
                        <div 
                          key={match._id} 
                          onClick={() => viewMatchDetails(match._id)}
                          style={{ 
                            padding: '14px', 
                            borderRadius: '10px', 
                            border: '1px solid #e5e7eb', 
                            marginBottom: i < matchHistory.length - 1 ? '12px' : '0',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            background: '#fff'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#d97757'; e.currentTarget.style.background = '#fef7f5'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fff'; }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <div style={{ flex: 1 }}>
                              <p style={{ color: '#111827', fontWeight: '500', marginBottom: '4px', fontSize: '0.9rem' }}>
                                {match.jobTitle || 'Untitled Job'}
                              </p>
                              <p style={{ color: '#6b7280', fontSize: '0.8rem', marginBottom: '0' }}>
                                {match.company || 'Unknown Company'}
                              </p>
                            </div>
                            <div style={{ 
                              width: '48px', 
                              height: '48px', 
                              borderRadius: '50%', 
                              background: `conic-gradient(${getScoreColor(match.result?.matchScore || 0)} ${match.result?.matchScore || 0}%, #e5e7eb ${match.result?.matchScore || 0}%)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <div style={{ 
                                width: '40px', 
                                height: '40px', 
                                borderRadius: '50%', 
                                background: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: getScoreColor(match.result?.matchScore || 0) }}>
                                  {match.result?.matchScore || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{formatDate(match.createdAt)}</span>
                            <span style={{ color: '#d97757', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Icon type="eye" /> View
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '30px 20px', background: '#f9fafb', borderRadius: '10px' }}>
                      <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#fef7f5', color: '#d97757', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                        <Icon type="history" />
                      </div>
                      <p style={{ color: '#6b7280', marginBottom: '0', fontSize: '0.85rem' }}>No matches yet. Run your first AI match!</p>
                    </div>
                  )}
                </Card.Body>
              </Card>

              {/* What You'll Get */}
              <Card style={{ border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <Card.Body style={{ padding: '24px' }}>
                  <h5 style={{ fontWeight: '600', color: '#111827', marginBottom: '20px' }}>What You'll Get</h5>
                  {[{ icon: 'star', title: 'Match Score', desc: 'See how well your profile fits', color: '#d97757' },{ icon: 'check', title: 'Strengths', desc: 'What makes you a strong candidate', color: '#059669' },{ icon: 'alert', title: 'Gaps', desc: 'Areas you may need to address', color: '#d97706' },{ icon: 'file', title: 'Cover Letter', desc: 'AI-generated tailored letter', color: '#d97757' }].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}><div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${item.color}15`, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon type={item.icon} /></div><div><p style={{ fontWeight: '500', color: '#111827', marginBottom: '2px' }}>{item.title}</p><p style={{ color: '#6b7280', marginBottom: 0, fontSize: '0.8rem' }}>{item.desc}</p></div></div>
                  ))}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {step === 2 && matchResult && (
          <>
            <Card style={{ border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: '24px' }}>
              <Card.Body style={{ padding: '32px' }}>
                <Row className="align-items-center">
                  <Col md={3} className="text-center mb-3 mb-md-0">
                    <div style={{ width: '130px', height: '130px', borderRadius: '50%', background: `conic-gradient(${getScoreColor(matchResult.matchScore)} ${matchResult.matchScore}%, #e5e7eb ${matchResult.matchScore}%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                      <div style={{ width: '110px', height: '110px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                        <span style={{ fontSize: '2.25rem', fontWeight: '700', color: getScoreColor(matchResult.matchScore) }}>{matchResult.matchScore}</span>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>out of 100</span>
                      </div>
                    </div>
                  </Col>
                  <Col md={9}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <span style={{ background: getScoreColor(matchResult.matchScore), color: '#fff', padding: '6px 12px', borderRadius: '6px', fontWeight: '500', fontSize: '0.85rem' }}>{getScoreLabel(matchResult.matchScore)}</span>
                      <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>for {user?.firstName} {user?.lastName}</span>
                    </div>
                    <h4 style={{ fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{jobTitle || 'Job'} {company && `at ${company}`}</h4>
                    <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '0.9rem', lineHeight: '1.6' }}>{matchResult.summary?.replace(/John Smith|Jane Doe/gi, `${user?.firstName} ${user?.lastName}`)}</p>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <Button onClick={() => { setStep(1); setMatchResult(null); setCoverLetter(''); setJobTitle(''); setCompany(''); setJobDescription(''); }} style={{ background: '#fff', border: '1px solid #d97757', color: '#d97757', borderRadius: '8px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}><Icon type="plus" /> New Match</Button>
                      <Button as={Link} to="/dashboard" style={{ background: '#fff', border: '1px solid #e5e7eb', color: '#374151', borderRadius: '8px', fontWeight: '500' }}>Dashboard</Button>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Row>
              <Col lg={8}>
                <Card style={{ border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <Card.Body style={{ padding: '0' }}>
                    <Tabs defaultActiveKey="analysis" className="custom-tabs" style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <Tab eventKey="analysis" title="Analysis" style={{ padding: '24px' }}>
                        <div style={{ marginBottom: '28px' }}>
                          <h6 style={{ fontWeight: '600', color: '#059669', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon type="check" /></span>Strengths</h6>
                          <ul style={{ paddingLeft: '0', margin: 0, listStyle: 'none' }}>{matchResult.strengths?.map((s, i) => <li key={i} style={{ color: '#374151', marginBottom: '10px', fontSize: '0.9rem', display: 'flex', alignItems: 'flex-start', gap: '10px' }}><span style={{ color: '#059669', marginTop: '2px' }}>✓</span> {s}</li>)}</ul>
                        </div>
                        <div style={{ marginBottom: '28px' }}>
                          <h6 style={{ fontWeight: '600', color: '#d97706', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon type="alert" /></span>Areas to Address</h6>
                          <ul style={{ paddingLeft: '0', margin: 0, listStyle: 'none' }}>{matchResult.gaps?.map((g, i) => <li key={i} style={{ color: '#374151', marginBottom: '10px', fontSize: '0.9rem', display: 'flex', alignItems: 'flex-start', gap: '10px' }}><span style={{ color: '#d97706', marginTop: '2px' }}>!</span> {g}</li>)}</ul>
                        </div>
                        {matchResult.recommendations?.length > 0 && <div><h6 style={{ fontWeight: '600', color: '#d97757', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#fef7f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon type="star" /></span>Recommendations</h6><ul style={{ paddingLeft: '0', margin: 0, listStyle: 'none' }}>{matchResult.recommendations.map((r, i) => <li key={i} style={{ color: '#374151', marginBottom: '10px', fontSize: '0.9rem', display: 'flex', alignItems: 'flex-start', gap: '10px' }}><span style={{ color: '#d97757' }}>→</span> {r}</li>)}</ul></div>}
                      </Tab>
                      <Tab eventKey="skills" title="Skills Match" style={{ padding: '24px' }}>
                        {matchResult.skillsMatch?.map((skill, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < matchResult.skillsMatch.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                            <span style={{ color: '#374151', fontSize: '0.9rem', fontWeight: '500' }}>{skill.skill}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ background: skill.status === 'match' ? '#dcfce7' : skill.status === 'partial' ? '#fef3c7' : '#fee2e2', color: skill.status === 'match' ? '#166534' : skill.status === 'partial' ? '#92400e' : '#991b1b', fontWeight: '500', padding: '5px 12px', borderRadius: '6px', fontSize: '0.8rem' }}>{skill.status === 'match' ? '✓ Match' : skill.status === 'partial' ? '~ Partial' : '✗ Missing'}</span>
                              {skill.importance && <span style={{ background: '#f3f4f6', color: '#6b7280', fontWeight: '400', fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px' }}>{skill.importance}</span>}
                            </div>
                          </div>
                        ))}
                        {(!matchResult.skillsMatch || matchResult.skillsMatch.length === 0) && <p style={{ color: '#6b7280', textAlign: 'center', padding: '30px' }}>No skills data available</p>}
                      </Tab>
                      <Tab eventKey="cover" title="Cover Letter" style={{ padding: '24px' }}>
                        {coverLetter ? (
                          <>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                              <Button size="sm" onClick={() => copyToClipboard(coverLetter)} style={{ background: copied ? '#dcfce7' : '#fff', border: copied ? '1px solid #059669' : '1px solid #e5e7eb', color: copied ? '#059669' : '#374151', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>{copied ? <><Icon type="checkCircle" /> Copied!</> : <><Icon type="copy" /> Copy</>}</Button>
                            </div>
                            <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', color: '#374151', lineHeight: '1.8', background: '#f9fafb', padding: '24px', borderRadius: '10px', border: '1px solid #e5e7eb' }}>{coverLetter}</div>
                          </>
                        ) : (
                          <div style={{ textAlign: 'center', padding: '50px 20px' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#fef7f5', color: '#d97757', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.5rem' }}><Icon type="file" /></div>
                            <p style={{ color: '#6b7280', marginBottom: '20px' }}>Generate a tailored cover letter for <strong>{user?.firstName} {user?.lastName}</strong></p>
                            <Button onClick={handleGenerateCoverLetter} disabled={generatingCover} style={{ background: '#d97757', border: 'none', borderRadius: '10px', padding: '12px 24px', fontWeight: '500' }}>{generatingCover ? 'Generating...' : 'Generate Cover Letter'}</Button>
                          </div>
                        )}
                      </Tab>
                    </Tabs>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={4}>
                {matchResult.experienceMatch && <Card style={{ border: '1px solid #e5e7eb', borderRadius: '12px', marginBottom: '20px' }}><Card.Body style={{ padding: '24px' }}><h6 style={{ fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Experience</h6><div style={{ marginBottom: '12px' }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}><span style={{ color: '#6b7280' }}>Required</span><span style={{ color: '#111827', fontWeight: '500' }}>{matchResult.experienceMatch.yearsRequired || 0} years</span></div><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}><span style={{ color: '#6b7280' }}>Your Experience</span><span style={{ color: '#111827', fontWeight: '500' }}>{matchResult.experienceMatch.yearsActual || 0} years</span></div></div><p style={{ color: '#6b7280', fontSize: '0.8rem', marginBottom: 0, background: '#f9fafb', padding: '12px', borderRadius: '8px' }}>{matchResult.experienceMatch.assessment}</p></Card.Body></Card>}
                {matchResult.educationMatch && <Card style={{ border: '1px solid #e5e7eb', borderRadius: '12px' }}><Card.Body style={{ padding: '24px' }}><h6 style={{ fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Education</h6><div style={{ marginBottom: '12px' }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}><span style={{ color: '#6b7280' }}>Required</span><span style={{ color: '#111827', fontWeight: '500' }}>{matchResult.educationMatch.required || 'N/A'}</span></div><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}><span style={{ color: '#6b7280' }}>Your Education</span><span style={{ color: '#111827', fontWeight: '500' }}>{matchResult.educationMatch.actual || 'N/A'}</span></div></div><p style={{ color: '#6b7280', fontSize: '0.8rem', marginBottom: 0, background: '#f9fafb', padding: '12px', borderRadius: '8px' }}>{matchResult.educationMatch.assessment}</p></Card.Body></Card>}
              </Col>
            </Row>
          </>
        )}
      </Container>
      <style>{`.custom-tabs .nav-link { color: #6b7280; border: none; padding: 16px 20px; font-weight: 500; background: transparent; } .custom-tabs .nav-link.active { color: #d97757; border-bottom: 2px solid #d97757; background: transparent; } .custom-tabs .nav-link:hover { color: #d97757; }`}</style>
    </div>
  );
};

export default JobMatch;
