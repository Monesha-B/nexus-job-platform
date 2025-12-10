import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../hooks/useAuth';

const Signup = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  // Password strength calculation
  const getPasswordStrength = (password) => {
    if (!password) return { level: '', text: '', color: '' };
    
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { level: 'weak', text: 'Weak', color: 'danger' };
    if (score <= 3) return { level: 'medium', text: 'Medium', color: 'warning' };
    return { level: 'strong', text: 'Strong', color: 'success' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;
    
    setLoading(true);
    const result = await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      role: 'jobseeker', // Default role
    });
    setLoading(false);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  const handleGoogleSignup = async () => {
    setError('Google OAuth - Configure GOOGLE_CLIENT_ID in .env');
  };

  return (
    <div className="auth-container">
      <Container className="d-flex justify-content-center py-5">
        <div className="auth-card">
          {/* Logo */}
          <div className="text-center mb-4">
            <Link to="/" className="text-decoration-none">
              <h1 className="text-primary fw-bold">NEXUS</h1>
            </Link>
          </div>
          
          <h2 className="text-center">Create Account</h2>
          <p className="subtitle text-center">Start your job matching journey</p>

          {error && (
            <Alert variant="danger" onClose={() => setError('')} dismissible>
              {error}
            </Alert>
          )}

          {/* Google Signup */}
          <Button
            variant="outline-secondary"
            className="btn-google w-100 mb-3"
            onClick={handleGoogleSignup}
            disabled={loading}
          >
            <FcGoogle size={20} />
            <span className="ms-2">Sign up with Google</span>
          </Button>

          <div className="divider"><span>or</span></div>

          {/* Signup Form */}
          <Form onSubmit={handleSubmit}>
            {/* Name Row */}
            <div className="row">
              <Form.Group className="col-6 mb-3">
                <Form.Label>First Name</Form.Label>
                <div className="position-relative">
                  <FiUser className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                  <Form.Control
                    type="text"
                    name="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    isInvalid={!!errors.firstName}
                    style={{ paddingLeft: '2.5rem' }}
                  />
                  <Form.Control.Feedback type="invalid">{errors.firstName}</Form.Control.Feedback>
                </div>
              </Form.Group>

              <Form.Group className="col-6 mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  name="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  isInvalid={!!errors.lastName}
                />
                <Form.Control.Feedback type="invalid">{errors.lastName}</Form.Control.Feedback>
              </Form.Group>
            </div>

            {/* Email */}
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <div className="position-relative">
                <FiMail className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  isInvalid={!!errors.email}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
              </div>
            </Form.Group>

            {/* Password */}
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <div className="position-relative">
                <FiLock className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  isInvalid={!!errors.password}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                />
                <Button
                  variant="link"
                  className="position-absolute top-50 end-0 translate-middle-y text-muted p-0 me-3"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </Button>
                <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className={`password-strength ${passwordStrength.level}`}></div>
                  <small className={`text-${passwordStrength.color}`}>
                    {passwordStrength.text}
                  </small>
                </div>
              )}
            </Form.Group>

            {/* Confirm Password */}
            <Form.Group className="mb-4">
              <Form.Label>Confirm Password</Form.Label>
              <div className="position-relative">
                <FiLock className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  isInvalid={!!errors.confirmPassword}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
              </div>
            </Form.Group>

            <Button 
              type="submit" 
              variant="primary" 
              className="w-100 py-2"
              disabled={loading}
            >
              {loading ? <Spinner size="sm" /> : 'Create Account'}
            </Button>
          </Form>

          <p className="text-center mt-4 mb-0">
            Already have an account?{' '}
            <Link to="/login" className="text-primary fw-semibold">
              Login
            </Link>
          </p>
        </div>
      </Container>
    </div>
  );
};

export default Signup;
