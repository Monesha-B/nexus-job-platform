import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register, googleLogin, isAuthenticated, user, isAdmin } = useAuth();
  
  const roleFromUrl = searchParams.get('role') || 'jobseeker';
  const [role, setRole] = useState(roleFromUrl);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });

  // Debug log
  useEffect(() => {
    console.log('Auth useEffect - isAuthenticated:', isAuthenticated, 'user:', user, 'isAdmin:', isAdmin);
    if (isAuthenticated && user) {
      const redirectPath = user.role === 'admin' ? '/admin' : '/dashboard';
      console.log('Redirecting to:', redirectPath);
      navigate(redirectPath);
    }
  }, [isAuthenticated, user, isAdmin, navigate]);

  useEffect(() => {
    setRole(roleFromUrl);
  }, [roleFromUrl]);

  const isAdminRole = role === 'admin';

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateLoginForm = () => {
    const newErrors = {};
    if (!loginData.email.trim()) newErrors.loginEmail = 'Email is required';
    else if (!validateEmail(loginData.email)) newErrors.loginEmail = 'Please enter a valid email';
    if (!loginData.password) newErrors.loginPassword = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignupForm = () => {
    const newErrors = {};
    if (!signupData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!signupData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!signupData.email.trim()) newErrors.email = 'Email is required';
    else if (!validateEmail(signupData.email)) newErrors.email = 'Please enter a valid email';
    if (!signupData.password) newErrors.password = 'Password is required';
    else if (signupData.password.length < 6) newErrors.password = 'Min 6 characters';
    else if (!/[A-Z]/.test(signupData.password)) newErrors.password = 'Need one uppercase letter';
    else if (!/[0-9]/.test(signupData.password)) newErrors.password = 'Need one number';
    if (signupData.password !== signupData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 2) return { strength: 33, label: 'Weak', color: '#ef4444' };
    if (score <= 3) return { strength: 66, label: 'Medium', color: '#f59e0b' };
    return { strength: 100, label: 'Strong', color: '#22c55e' };
  };

  const passwordStrength = getPasswordStrength(signupData.password);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateLoginForm()) return;
    setLoading(true);
    
    console.log('Attempting login with:', loginData.email);
    const result = await login(loginData.email, loginData.password);
    console.log('Login result:', result);
    setLoading(false);
    
    if (!result.success) {
      setError(result.error);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateSignupForm()) return;
    setLoading(true);
    
    const result = await register({ 
      firstName: signupData.firstName,
      lastName: signupData.lastName,
      email: signupData.email,
      password: signupData.password,
      role: role
    });
    setLoading(false);
    
    if (!result.success) {
      setError(result.error);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    const result = await googleLogin(credentialResponse.credential);
    setLoading(false);
    
    if (!result.success) {
      setError(result.error);
    }
  };

  const Icon = ({ type }) => {
    const icons = {
      mail: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
      lock: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
      briefcase: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
      shield: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
      arrow: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
    };
    return icons[type] || null;
  };

  return (
    <div style={{ 
      minHeight: 'calc(100vh - 76px)', 
      background: 'linear-gradient(135deg, #fef7f5 0%, #fff 50%, #fef7f5 100%)',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '40px 20px' 
    }}>
      <Container style={{ maxWidth: '440px' }}>
        <Link 
          to="/" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            color: '#6b7280', 
            textDecoration: 'none',
            marginBottom: '24px',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}
        >
          <Icon type="arrow" /> Back to role selection
        </Link>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          marginBottom: '24px',
          padding: '16px 20px',
          background: '#fef7f5',
          borderRadius: '12px',
          border: '1px solid rgba(217, 119, 87, 0.2)'
        }}>
          <div style={{ color: '#d97757' }}>
            {isAdminRole ? <Icon type="shield" /> : <Icon type="briefcase" />}
          </div>
          <div>
            <p style={{ color: '#d97757', fontWeight: '600', marginBottom: '2px', fontSize: '0.9rem' }}>
              {isAdminRole ? 'Admin / Recruiter' : 'Job Seeker'}
            </p>
            <p style={{ color: '#6b7280', fontSize: '0.8rem', marginBottom: '0' }}>
              {isAdminRole ? 'Post jobs & manage platform' : 'Find your dream job'}
            </p>
          </div>
        </div>

        <div style={{ 
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          padding: '40px',
        }}>
          <div style={{ display: 'flex', marginBottom: '32px', background: '#f3f4f6', borderRadius: '10px', padding: '4px' }}>
            <button
              onClick={() => { setIsLogin(true); setError(''); setErrors({}); }}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                background: isLogin ? '#fff' : 'transparent',
                color: isLogin ? '#d97757' : '#6b7280',
                boxShadow: isLogin ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); setErrors({}); }}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                background: !isLogin ? '#fff' : 'transparent',
                color: !isLogin ? '#d97757' : '#6b7280',
                boxShadow: !isLogin ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              Sign Up
            </button>
          </div>

          {error && <Alert variant="danger" style={{ borderRadius: '10px', marginBottom: '20px' }}>{error}</Alert>}

          {isLogin ? (
            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontWeight: '500', color: '#374151', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icon type="mail" /> Email
                </Form.Label>
                <Form.Control 
                  type="email" 
                  value={loginData.email} 
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  isInvalid={!!errors.loginEmail}
                  style={{ padding: '12px', borderRadius: '10px' }}
                  placeholder="you@example.com"
                />
                <Form.Control.Feedback type="invalid">{errors.loginEmail}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label style={{ fontWeight: '500', color: '#374151', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icon type="lock" /> Password
                </Form.Label>
                <Form.Control 
                  type="password" 
                  value={loginData.password} 
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  isInvalid={!!errors.loginPassword}
                  style={{ padding: '12px', borderRadius: '10px' }}
                  placeholder="••••••••"
                />
                <Form.Control.Feedback type="invalid">{errors.loginPassword}</Form.Control.Feedback>
              </Form.Group>

              <Button 
                type="submit" 
                disabled={loading} 
                style={{ 
                  width: '100%', 
                  background: '#d97757', 
                  border: 'none', 
                  padding: '14px', 
                  borderRadius: '10px', 
                  fontWeight: '600',
                  marginBottom: '20px'
                }}
              >
                {loading ? <><Spinner animation="border" size="sm" /> Signing in...</> : 'Sign In'}
              </Button>

              <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
                <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
                <span style={{ padding: '0 16px', color: '#9ca3af', fontSize: '0.875rem' }}>or continue with</span>
                <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <GoogleLogin 
                  onSuccess={handleGoogleSuccess} 
                  onError={() => setError('Google sign-in failed')} 
                  theme="outline" 
                  size="large" 
                />
              </div>
            </Form>
          ) : (
            <Form onSubmit={handleSignup}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Form.Group className="mb-3" style={{ flex: 1 }}>
                  <Form.Label style={{ fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>First Name</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={signupData.firstName} 
                    onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                    isInvalid={!!errors.firstName}
                    style={{ padding: '12px', borderRadius: '10px' }}
                  />
                  <Form.Control.Feedback type="invalid">{errors.firstName}</Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" style={{ flex: 1 }}>
                  <Form.Label style={{ fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>Last Name</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={signupData.lastName} 
                    onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                    isInvalid={!!errors.lastName}
                    style={{ padding: '12px', borderRadius: '10px' }}
                  />
                  <Form.Control.Feedback type="invalid">{errors.lastName}</Form.Control.Feedback>
                </Form.Group>
              </div>

              <Form.Group className="mb-3">
                <Form.Label style={{ fontWeight: '500', color: '#374151', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icon type="mail" /> Email
                </Form.Label>
                <Form.Control 
                  type="email" 
                  value={signupData.email} 
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  isInvalid={!!errors.email}
                  style={{ padding: '12px', borderRadius: '10px' }}
                  placeholder="you@example.com"
                />
                <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label style={{ fontWeight: '500', color: '#374151', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icon type="lock" /> Password
                </Form.Label>
                <Form.Control 
                  type="password" 
                  value={signupData.password} 
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  isInvalid={!!errors.password}
                  style={{ padding: '12px', borderRadius: '10px' }}
                  placeholder="••••••••"
                />
                <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                {signupData.password && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ height: '4px', background: '#e5e7eb', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${passwordStrength.strength}%`, background: passwordStrength.color, transition: 'all 0.3s' }}></div>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: passwordStrength.color, marginTop: '4px', marginBottom: '0' }}>{passwordStrength.label}</p>
                  </div>
                )}
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label style={{ fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>Confirm Password</Form.Label>
                <Form.Control 
                  type="password" 
                  value={signupData.confirmPassword} 
                  onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                  isInvalid={!!errors.confirmPassword}
                  style={{ padding: '12px', borderRadius: '10px' }}
                  placeholder="••••••••"
                />
                <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
              </Form.Group>

              <Button 
                type="submit" 
                disabled={loading} 
                style={{ 
                  width: '100%', 
                  background: '#d97757', 
                  border: 'none', 
                  padding: '14px', 
                  borderRadius: '10px', 
                  fontWeight: '600',
                  marginBottom: '20px'
                }}
              >
                {loading ? <><Spinner animation="border" size="sm" /> Creating account...</> : `Create ${isAdminRole ? 'Admin' : 'Job Seeker'} Account`}
              </Button>

              <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
                <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
                <span style={{ padding: '0 16px', color: '#9ca3af', fontSize: '0.875rem' }}>or continue with</span>
                <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <GoogleLogin 
                  onSuccess={handleGoogleSuccess} 
                  onError={() => setError('Google sign-in failed')} 
                  theme="outline" 
                  size="large" 
                />
              </div>
            </Form>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px', color: '#6b7280' }}>
          {isAdminRole ? 'Looking for a job?' : 'Want to post jobs?'}{' '}
          <Link 
            to={`/auth?role=${isAdminRole ? 'jobseeker' : 'admin'}`}
            style={{ color: '#d97757', fontWeight: '600', textDecoration: 'none' }}
          >
            Switch to {isAdminRole ? 'Job Seeker' : 'Admin'}
          </Link>
        </p>
      </Container>
    </div>
  );
};

export default Auth;
