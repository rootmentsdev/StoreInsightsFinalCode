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
  FaEnvelope,
  FaUserPlus
} from 'react-icons/fa';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, isLoading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (registerError) setRegisterError('');
    if (registerSuccess) setRegisterSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setRegisterError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setRegisterError('');
    
    const result = await register(formData.name, formData.email, formData.password);
    
    if (result.success) {
      setRegisterSuccess('Registration successful! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } else {
      setRegisterError(result.error);
    }
    
    setIsLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#f8f9fa' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center" style={{ backgroundColor: '#f8f9fa' }}>
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6} xl={5}>
            <Card className="shadow-lg border-0">
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
                    <FaUserPlus size={32} />
                  </div>
                  <h2 className="mb-2 fw-bold text-dark">Create Account</h2>
                  <p className="text-muted mb-0">Join Store Insights today</p>
                </div>

                {/* Success Message */}
                {registerSuccess && (
                  <div className="alert alert-success mb-3" role="alert">
                    <small>{registerSuccess}</small>
                  </div>
                )}

                {/* Error Message */}
                {registerError && (
                  <div className="alert alert-danger mb-3" role="alert">
                    <small>{registerError}</small>
                  </div>
                )}

                {/* Register Form */}
                <Form onSubmit={handleSubmit}>
                  
                  {/* Name Field */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-dark">Full Name</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type="text"
                        name="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="form-control-lg"
                        style={{ 
                          paddingLeft: '45px',
                          borderRadius: '10px',
                          border: '2px solid #e9ecef'
                        }}
                        required
                        minLength="2"
                        maxLength="50"
                      />
                      <FaUser 
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

                  {/* Email Field */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-dark">Email Address</Form.Label>
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
                          border: '2px solid #e9ecef'
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
                    <Form.Label className="fw-semibold text-dark">Password</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="form-control-lg"
                        style={{ 
                          paddingLeft: '45px',
                          paddingRight: '50px',
                          borderRadius: '10px',
                          border: '2px solid #e9ecef'
                        }}
                        required
                        minLength="6"
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

                  {/* Confirm Password Field */}
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-dark">Confirm Password</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="form-control-lg"
                        style={{ 
                          paddingLeft: '45px',
                          paddingRight: '50px',
                          borderRadius: '10px',
                          border: '2px solid #e9ecef'
                        }}
                        required
                        minLength="6"
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
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                      </button>
                    </div>
                  </Form.Group>

                  {/* Register Button */}
                  <Button
                    type="submit"
                    className="w-100 py-3 fw-bold"
                    size="lg"
                    style={{
                      backgroundColor: '#28a745',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '16px'
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </Form>

                {/* Login Link */}
                <div className="text-center mt-4">
                  <p className="text-muted mb-0">
                    Already have an account?{' '}
                    <Link 
                      to="/login" 
                      className="text-decoration-none text-primary fw-bold"
                    >
                      Sign In
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

export default RegisterPage;