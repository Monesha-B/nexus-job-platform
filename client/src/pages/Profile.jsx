import { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Modal, Spinner } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

const countries = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IN', name: 'India' },
  { code: 'JP', name: 'Japan' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AE', name: 'United Arab Emirates' },
];

const statesByCountry = {
  US: ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'],
  CA: ['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland', 'Nova Scotia', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan'],
  UK: ['England', 'Scotland', 'Wales', 'Northern Ireland'],
  AU: ['New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia', 'Tasmania'],
  DE: ['Bavaria', 'Berlin', 'Hamburg', 'Hesse', 'North Rhine-Westphalia', 'Saxony'],
  FR: ['Île-de-France', 'Provence-Alpes-Côte d\'Azur', 'Auvergne-Rhône-Alpes', 'Occitanie'],
  IN: ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Gujarat', 'West Bengal', 'Telangana', 'Kerala'],
  JP: ['Tokyo', 'Osaka', 'Kyoto', 'Hokkaido', 'Kanagawa'],
  SG: ['Central', 'East', 'North', 'West'],
  AE: ['Abu Dhabi', 'Dubai', 'Sharjah'],
};

const Profile = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resumes, setResumes] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState(null);
  const [availableStates, setAvailableStates] = useState([]);
  const [savedLocation, setSavedLocation] = useState({ country: '', state: '', city: '' });

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    country: '', state: '', city: '',
    linkedIn: '', github: '', portfolio: '', bio: ''
  });

  useEffect(() => {
    if (user) {
      const userData = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        country: user.country || '',
        state: user.state || '',
        city: user.city || '',
        linkedIn: user.linkedIn || '',
        github: user.github || '',
        portfolio: user.portfolio || '',
        bio: user.bio || ''
      };
      setFormData(userData);
      setSavedLocation({ country: user.country || '', state: user.state || '', city: user.city || '' });
      if (user.country && statesByCountry[user.country]) {
        setAvailableStates(statesByCountry[user.country]);
      }
    }
    fetchResumes();
  }, [user]);

  const fetchResumes = async () => {
    try {
      const response = await api.get('/resumes');
      setResumes(response.data.data.resumes || []);
    } catch (err) {
      console.error('Error fetching resumes:', err);
    }
    setLoadingResumes(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'country') {
      setAvailableStates(statesByCountry[value] || []);
      setFormData(prev => ({ ...prev, country: value, state: '' }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.put('/auth/profile', formData);
      if (response.data.success) {
        updateUser(response.data.data.user);
        setSavedLocation({ country: formData.country, state: formData.state, city: formData.city });
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
    setSaving(false);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PDF or Word document');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const uploadData = new FormData();
      uploadData.append('resume', file);

      const response = await api.post('/resumes/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setSuccess('Resume uploaded successfully!');
        fetchResumes();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload resume');
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSetPrimary = async (resumeId) => {
    try {
      await api.put(`/resumes/${resumeId}/primary`);
      setSuccess('Primary resume updated!');
      fetchResumes();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set primary resume');
    }
  };

  const handleDeleteResume = async () => {
    if (!resumeToDelete) return;
    try {
      await api.delete(`/resumes/${resumeToDelete}`);
      setSuccess('Resume deleted successfully!');
      fetchResumes();
      setShowDeleteModal(false);
      setResumeToDelete(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete resume');
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getLocationDisplay = () => {
    const parts = [];
    if (savedLocation.city) parts.push(savedLocation.city);
    if (savedLocation.state) parts.push(savedLocation.state);
    if (savedLocation.country) {
      const countryObj = countries.find(c => c.code === savedLocation.country);
      if (countryObj) parts.push(countryObj.name);
    }
    return parts.join(', ') || 'Not specified';
  };

  const Icon = ({ type }) => {
    const icons = {
      user: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
      mail: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
      phone: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.58 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
      location: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
      linkedin: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>,
      github: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>,
      globe: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
      file: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
      upload: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
      trash: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
      star: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
      download: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
      check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
    };
    return icons[type] || null;
  };

  return (
    <div style={{ background: '#f9fafb', minHeight: 'calc(100vh - 76px)' }}>
      <Container style={{ padding: '32px 20px', maxWidth: '1100px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ color: '#111827', fontWeight: '600', fontSize: '1.75rem', marginBottom: '8px' }}>Profile Settings</h1>
          <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>Manage your account information and resumes</p>
        </div>

        {error && <Alert variant="danger" onClose={() => setError('')} dismissible style={{ marginBottom: '24px', borderRadius: '10px', border: 'none', background: '#fef2f2', color: '#991b1b' }}>{error}</Alert>}
        {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible style={{ marginBottom: '24px', borderRadius: '10px', border: 'none', background: '#f0fdf4', color: '#166534' }}>{success}</Alert>}

        <Row>
          <Col lg={7} className="mb-4">
            <Card style={{ border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <Card.Body style={{ padding: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
                  <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, #d97757 0%, #c4624a 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '1.5rem' }}>
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </div>
                  <div>
                    <h4 style={{ color: '#111827', fontWeight: '600', marginBottom: '4px' }}>{user?.firstName} {user?.lastName}</h4>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0' }}>{user?.email}</p>
                  </div>
                </div>

                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: '500', color: '#374151', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}><Icon type="user" /> First Name</Form.Label>
                        <Form.Control type="text" name="firstName" value={formData.firstName} onChange={handleChange} style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '10px' }} />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>Last Name</Form.Label>
                        <Form.Control type="text" name="lastName" value={formData.lastName} onChange={handleChange} style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '10px' }} />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: '500', color: '#374151', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}><Icon type="mail" /> Email</Form.Label>
                    <Form.Control type="email" value={formData.email} disabled style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '10px', background: '#f9fafb' }} />
                    <Form.Text style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Email cannot be changed</Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: '500', color: '#374151', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}><Icon type="phone" /> Phone</Form.Label>
                    <Form.Control type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="(555) 123-4567" style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '10px' }} />
                  </Form.Group>

                  <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
                    <h6 style={{ fontWeight: '600', color: '#374151', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Icon type="location" /> Location</h6>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>Country</Form.Label>
                          <Form.Select name="country" value={formData.country} onChange={handleChange} style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '10px' }}>
                            <option value="">Select Country</option>
                            {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>State/Province</Form.Label>
                          <Form.Select name="state" value={formData.state} onChange={handleChange} disabled={!formData.country} style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '10px' }}>
                            <option value="">{formData.country ? 'Select State' : 'Select country first'}</option>
                            {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group>
                      <Form.Label style={{ fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>City</Form.Label>
                      <Form.Control type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Enter city" style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '10px' }} />
                    </Form.Group>
                  </div>

                  <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
                    <h6 style={{ fontWeight: '600', color: '#374151', marginBottom: '16px' }}>Social Links</h6>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ fontWeight: '500', color: '#374151', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}><Icon type="linkedin" /> LinkedIn</Form.Label>
                      <Form.Control type="url" name="linkedIn" value={formData.linkedIn} onChange={handleChange} placeholder="https://linkedin.com/in/username" style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '10px' }} />
                    </Form.Group>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ fontWeight: '500', color: '#374151', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}><Icon type="github" /> GitHub</Form.Label>
                          <Form.Control type="url" name="github" value={formData.github} onChange={handleChange} placeholder="https://github.com/username" style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '10px' }} />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ fontWeight: '500', color: '#374151', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}><Icon type="globe" /> Portfolio</Form.Label>
                          <Form.Control type="url" name="portfolio" value={formData.portfolio} onChange={handleChange} placeholder="https://yoursite.com" style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '10px' }} />
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>

                  <Form.Group className="mb-4">
                    <Form.Label style={{ fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>Bio</Form.Label>
                    <Form.Control as="textarea" rows={3} name="bio" value={formData.bio} onChange={handleChange} placeholder="Tell us about yourself..." style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '10px' }} />
                    <Form.Text style={{ color: '#9ca3af' }}>{formData.bio?.length || 0}/500</Form.Text>
                  </Form.Group>

                  <Button type="submit" disabled={saving} style={{ background: saving ? '#e8956d' : '#d97757', border: 'none', padding: '12px 28px', borderRadius: '10px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px', minWidth: '160px', justifyContent: 'center' }}>
                    {saving ? (
                      <>
                        <Spinner animation="border" size="sm" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Icon type="check" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={5} className="mb-4">
            <Card style={{ border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: '20px' }}>
              <Card.Body style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h5 style={{ color: '#111827', fontWeight: '600', marginBottom: '0', display: 'flex', alignItems: 'center', gap: '8px' }}><Icon type="file" /> My Resumes</h5>
                  <span style={{ background: '#fef7f5', color: '#d97757', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600' }}>{resumes.length} files</span>
                </div>

                <div onClick={() => !uploading && fileInputRef.current?.click()} style={{ border: '2px dashed #d97757', borderRadius: '10px', padding: '24px', textAlign: 'center', marginBottom: '20px', background: '#fef7f5', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1 }}>
                  <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".pdf,.doc,.docx" style={{ display: 'none' }} />
                  {uploading ? (
                    <><Spinner animation="border" size="sm" style={{ color: '#d97757' }} /><p style={{ color: '#374151', fontWeight: '500', marginBottom: '0', marginTop: '8px' }}>Uploading...</p></>
                  ) : (
                    <><div style={{ color: '#d97757', marginBottom: '8px' }}><Icon type="upload" /></div><p style={{ color: '#374151', fontWeight: '500', marginBottom: '4px' }}>Click to upload resume</p><p style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0' }}>PDF or Word (Max 5MB)</p></>
                  )}
                </div>

                {loadingResumes ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}><Spinner animation="border" size="sm" style={{ color: '#d97757' }} /></div>
                ) : resumes.length > 0 ? (
                  <div>
                    {resumes.map((resume, i) => (
                      <div key={resume._id} style={{ padding: '14px', borderRadius: '10px', border: resume.isPrimary ? '2px solid #d97757' : '1px solid #e5e7eb', marginBottom: i < resumes.length - 1 ? '12px' : '0', background: resume.isPrimary ? '#fef7f5' : '#fff' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <p style={{ color: '#111827', fontWeight: '500', marginBottom: '0', fontSize: '0.9rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{resume.fileName}</p>
                          {resume.isPrimary && <span style={{ background: '#d97757', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '600' }}>PRIMARY</span>}
                        </div>
                        <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: '12px' }}>{formatFileSize(resume.fileSize)} • {formatDate(resume.createdAt)}</p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {!resume.isPrimary && <Button size="sm" onClick={() => handleSetPrimary(resume._id)} style={{ background: '#fff', border: '1px solid #e5e7eb', color: '#374151', borderRadius: '6px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px' }}><Icon type="star" /> Set Primary</Button>}
                          <Button size="sm" as="a" href={`http://localhost:5001${resume.fileUrl}`} target="_blank" style={{ background: '#fff', border: '1px solid #e5e7eb', color: '#374151', borderRadius: '6px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', textDecoration: 'none' }}><Icon type="download" /> View</Button>
                          <Button size="sm" onClick={() => { setResumeToDelete(resume._id); setShowDeleteModal(true); }} style={{ background: '#fff', border: '1px solid #fee2e2', color: '#dc2626', borderRadius: '6px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px' }}><Icon type="trash" /> Delete</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '30px', background: '#f9fafb', borderRadius: '10px' }}><p style={{ color: '#6b7280', marginBottom: '0' }}>No resumes uploaded yet</p></div>
                )}
              </Card.Body>
            </Card>

            <Card style={{ border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <Card.Body style={{ padding: '24px' }}>
                <h5 style={{ color: '#111827', fontWeight: '600', marginBottom: '20px' }}>Account</h5>
                <div style={{ fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}><span style={{ color: '#6b7280' }}>Role</span><span style={{ color: '#111827', fontWeight: '500', textTransform: 'capitalize' }}>{user?.role}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}><span style={{ color: '#6b7280' }}>Location</span><span style={{ color: '#111827', fontWeight: '500', textAlign: 'right', maxWidth: '180px' }}>{getLocationDisplay()}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}><span style={{ color: '#6b7280' }}>Member Since</span><span style={{ color: '#111827', fontWeight: '500' }}>{user?.createdAt ? formatDate(user.createdAt) : 'N/A'}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>Status</span><span style={{ color: '#059669', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }}></span> Active</span></div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton style={{ border: 'none' }}><Modal.Title style={{ fontWeight: '600', fontSize: '1.1rem' }}>Delete Resume</Modal.Title></Modal.Header>
        <Modal.Body><p style={{ color: '#6b7280' }}>Are you sure you want to delete this resume?</p></Modal.Body>
        <Modal.Footer style={{ border: 'none' }}>
          <Button variant="light" onClick={() => setShowDeleteModal(false)} style={{ borderRadius: '8px' }}>Cancel</Button>
          <Button onClick={handleDeleteResume} style={{ background: '#dc2626', border: 'none', borderRadius: '8px' }}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Profile;
