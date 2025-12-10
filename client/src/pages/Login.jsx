import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
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
    const result = await login(formData.email, formData.password);
    setLoading(false);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #fdf8f6 0%, #f5ebe8 100%)', minHeight: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center' }}>
      <Container style={{ maxWidth: '420px' }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '40px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', border: '1px solid #e8e8e8' }}>
          <div className="text-center mb-4">
            <h2 style={{ fontWeight: '600', color: '#2d2d2d', marginBottom: '8px' }}>Welcome Back</h2>
            <p style={{ color: '#888' }}>Login to your account</p>
          </div>

          {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: '500', color: '#2d2d2d' }}>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                isInvalid={!!errors.email}
                style={{ padding: '12px', border: '1px solid #d9d9d9' }}
              />
              <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: '500', color: '#2d2d2d' }}>Password</Form.Label>
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                isInvalid={!!errors.password}
                style={{ padding: '12px', border: '1px solid #d9d9d9' }}
              />
              <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
            </Form.Group>

            <Button 
              type="submit" 
              className="w-100"
              disabled={loading}
              style={{ background: '#d97757', border: 'none', padding: '12px', fontWeight: '500' }}
            >
              {loading ? <Spinner size="sm" /> : 'Login'}
            </Button>
          </Form>

          <p className="text-center mt-4 mb-0" style={{ color: '#666' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: '#d97757', fontWeight: '500', textDecoration: 'none' }}>
              Sign up
            </Link>
          </p>
        </div>
      </Container>
    </div>
  );
};

export default Login;
