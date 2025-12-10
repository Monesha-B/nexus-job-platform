import { useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Home = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? '/admin' : '/dashboard');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  if (isAuthenticated) return null;

  const Icon = ({ type }) => {
    const icons = {
      briefcase: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
      shield: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
      zap: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
      target: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
      file: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
      users: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
      chart: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
      settings: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/></svg>,
    };
    return icons[type] || null;
  };

  const RoleCard = ({ role, title, description, icon, features }) => (
    <div 
      style={{ 
        border: '2px solid #e5e7eb',
        borderRadius: '20px',
        padding: '40px 30px',
        background: '#fff',
        height: '100%',
        transition: 'all 0.3s ease',
      }}
      className="role-card"
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          width: '100px', 
          height: '100px', 
          borderRadius: '50%', 
          background: 'linear-gradient(135deg, #fef7f5 0%, #fed7c9 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          color: '#d97757'
        }}>
          <Icon type={icon} />
        </div>
        <h3 style={{ color: '#111827', fontWeight: '700', fontSize: '1.5rem', marginBottom: '12px' }}>
          {title}
        </h3>
        <p style={{ color: '#6b7280', marginBottom: '24px', lineHeight: '1.6' }}>
          {description}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left', marginBottom: '24px' }}>
          {features.map((feature, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ color: '#d97757' }}><Icon type={feature.icon} /></div>
              <span style={{ color: '#374151' }}>{feature.text}</span>
            </div>
          ))}
        </div>
        <Button 
          onClick={() => navigate(`/auth?role=${role}`)}
          style={{ 
            background: '#d97757', 
            border: 'none', 
            padding: '14px 32px', 
            borderRadius: '12px', 
            fontWeight: '600',
            fontSize: '1rem',
            width: '100%'
          }}
        >
          Get Started
        </Button>
      </div>
    </div>
  );

  return (
    <div style={{ background: '#fff', minHeight: 'calc(100vh - 76px)' }}>
      {/* Hero Section */}
      <section style={{ 
        background: 'linear-gradient(135deg, #fef7f5 0%, #fff 50%, #fef7f5 100%)',
        padding: '80px 0 100px'
      }}>
        <Container>
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 60px' }}>
            <h1 style={{ 
              color: '#111827', 
              fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', 
              fontWeight: '700', 
              lineHeight: '1.2', 
              marginBottom: '20px' 
            }}>
              Your AI-Powered Career Platform
            </h1>
            <p style={{ color: '#6b7280', fontSize: '1.2rem', lineHeight: '1.7' }}>
              Whether you're looking for your dream job or managing talent, NEXUS uses AI to create perfect matches.
            </p>
          </div>

          {/* Role Selection */}
          <Row className="justify-content-center" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <Col md={6} className="mb-4">
              <RoleCard
                role="jobseeker"
                title="I'm a Job Seeker"
                description="Find your perfect job match with AI-powered resume analysis."
                icon="briefcase"
                features={[
                  { icon: 'zap', text: 'AI-powered job matching' },
                  { icon: 'file', text: 'Smart resume analysis' },
                  { icon: 'target', text: 'Personalized cover letters' },
                ]}
              />
            </Col>
            <Col md={6} className="mb-4">
              <RoleCard
                role="admin"
                title="I'm an Admin / Recruiter"
                description="Post jobs, manage applications, and find the best candidates."
                icon="shield"
                features={[
                  { icon: 'users', text: 'Manage job postings' },
                  { icon: 'chart', text: 'Platform analytics' },
                  { icon: 'settings', text: 'Application management' },
                ]}
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* How It Works */}
      <section style={{ padding: '80px 0', background: '#fff' }}>
        <Container>
          <h2 style={{ textAlign: 'center', color: '#111827', fontWeight: '700', fontSize: '2rem', marginBottom: '60px' }}>
            How NEXUS Works
          </h2>
          <Row>
            {[
              { num: 1, title: 'Choose Your Role', desc: 'Select job seeker or admin' },
              { num: 2, title: 'Create Account', desc: 'Sign up with email or Google' },
              { num: 3, title: 'Upload & Match', desc: 'Upload resume or post jobs' },
              { num: 4, title: 'Get AI Insights', desc: 'Receive smart recommendations' },
            ].map((step, i) => (
              <Col md={3} sm={6} key={i} className="mb-4 text-center">
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%', 
                  background: '#fef7f5', 
                  color: '#d97757', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '1.5rem', 
                  fontWeight: '700', 
                  margin: '0 auto 16px' 
                }}>
                  {step.num}
                </div>
                <h5 style={{ color: '#111827', fontWeight: '600', marginBottom: '8px' }}>{step.title}</h5>
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>{step.desc}</p>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Footer */}
      <footer style={{ background: '#111827', color: '#9ca3af', padding: '40px 0' }}>
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="mb-3 mb-md-0">
              <span style={{ color: '#fff', fontWeight: '700', fontSize: '1.25rem' }}>
                <span style={{ color: '#d97757' }}>NEX</span>US
              </span>
              <span style={{ marginLeft: '16px', fontSize: '0.9rem' }}>AI-Powered Career Platform</span>
            </Col>
            <Col md={6} className="text-md-end">
              <p style={{ marginBottom: 0, fontSize: '0.9rem' }}>© {new Date().getFullYear()} NEXUS. All rights reserved.</p>
            </Col>
          </Row>
        </Container>
      </footer>

      <style>{`
        .role-card:hover {
          border-color: #d97757 !important;
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(217, 119, 87, 0.15);
        }
      `}</style>
    </div>
  );
};

export default Home;
