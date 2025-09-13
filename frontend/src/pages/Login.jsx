import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Container, 
  Row, 
  Col, 
  Form, 
  Button, 
  Card,
  Spinner
} from 'react-bootstrap';
import { 
  FaEye, 
  FaEyeSlash, 
  FaUser,
  FaLock,
  FaEnvelope
} from 'react-icons/fa';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Pre-fill email if remember me was checked
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('userEmail');
    const rememberMe = localStorage.getItem('rememberMe');
    
    if (rememberedEmail && rememberMe === 'true') {
      setFormData(prev => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true
      }));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    if (loginError) setLoginError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');
    
    const result = await login(formData.email, formData.password, formData.rememberMe);
    
    if (result.success) {
      navigate('/');
    } else {
      setLoginError(result.error);
    }
    
    setIsLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#000000' }}>
        <Spinner animation="border" variant="light" />
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center" style={{ backgroundColor: '#000000' }}>
      <style>
        {`
          .form-control::placeholder {
            color: white !important;
            opacity: 0.7;
          }
          .form-control:focus {
            border-color: #007bff !important;
            box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25) !important;
          }
        `}
      </style>
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6} xl={5}>
            <Card className="shadow-lg border-0" style={{ backgroundColor: '#1a1a1a' }}>
              <Card.Body className="p-5">
                
                {/* Header */}
                <div className="text-center mb-4">
                  <div 
                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{ 
                      width: '80px', 
                      height: '80px',
                      backgroundColor: '#28a745',
                      color: 'white'
                    }}
                  >
                    <FaUser size={32} />
                  </div>
                  <h2 className="mb-2 fw-bold text-white">Welcome Back</h2>
                  <p className="text-light mb-0">Sign in to your Store Insights account</p>
                </div>

                {/* Error Message */}
                {loginError && (
                  <div className="alert alert-danger mb-3" role="alert">
                    <small>{loginError}</small>
                  </div>
                )}

                {/* Login Form */}
                <Form onSubmit={handleSubmit}>
                  
                  {/* Email Field */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-white">Email Address</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="form-control-lg"
                        style={{ 
                          paddingLeft: '45px',
                          borderRadius: '10px',
                          border: '2px solid #444',
                          backgroundColor: '#2d2d2d',
                          color: 'white'
                        }}
                        required
                      />
                      <FaEnvelope 
                        className="position-absolute text-muted" 
                        style={{ 
                          left: '15px', 
                          top: '50%', 
                          transform: 'translateY(-50%)',
                          fontSize: '16px'
                        }} 
                      />
                    </div>
                  </Form.Group>

                  {/* Password Field */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-white">Password</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="form-control-lg"
                        style={{ 
                          paddingLeft: '45px',
                          paddingRight: '50px',
                          borderRadius: '10px',
                          border: '2px solid #444',
                          backgroundColor: '#2d2d2d',
                          color: 'white'
                        }}
                        required
                      />
                      <FaLock 
                        className="position-absolute text-muted" 
                        style={{ 
                          left: '15px', 
                          top: '50%', 
                          transform: 'translateY(-50%)',
                          fontSize: '16px'
                        }} 
                      />
                      <button
                        type="button"
                        className="btn btn-link position-absolute text-muted p-0"
                        style={{ 
                          right: '15px', 
                          top: '50%', 
                          transform: 'translateY(-50%)',
                          border: 'none',
                          background: 'none'
                        }}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                      </button>
                    </div>
                  </Form.Group>

                  {/* Remember Me */}
                  <div className="mb-4">
                    <Form.Check
                      type="checkbox"
                      name="rememberMe"
                      id="rememberMe"
                      label="Remember me"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      className="text-light"
                    />
                  </div>

                  {/* Login Button */}
                  <Button
                    type="submit"
                    className="w-100 py-3 fw-bold"
                    size="lg"
                    style={{
                      backgroundColor: 'white',
                      color: 'black',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '16px'
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Signing In...
                      </>
                    ) : (
                      'Sign In to Dashboard'
                    )}
                  </Button>
                </Form>

                {/* Register Link */}
                <div className="text-center mt-4">
                  <p className="text-light mb-0">
                    Don't have an account?{' '}
                    <Link 
                      to="/register" 
                      className="text-decoration-none text-primary fw-bold"
                    >
                      Create Account
                    </Link>
                  </p>
                </div>

              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LoginPage;