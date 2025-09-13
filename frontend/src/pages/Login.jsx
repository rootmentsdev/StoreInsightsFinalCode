






import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Form, 
  Button, 
  Card, 
  InputGroup,
  Spinner,
  Badge,
  Alert
} from 'react-bootstrap';
import { 
  FaUser, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaShieldAlt
} from 'react-icons/fa';

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validated, setValidated] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    // Clear error when user starts typing
    if (loginError) setLoginError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setIsLoading(true);
    setValidated(true);
    setLoginError('');
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      // Mock authentication logic
      // Replace this with your actual authentication logic
      if (formData.email && formData.password.length >= 6) {
        // Successful login
        console.log('Login successful:', formData);
        
        // Store user session (optional)
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', formData.email);
        
        // Navigate to home page
        navigate('/');
      } else {
        // Failed login
        setLoginError('Invalid email or password. Please try again.');
      }
    }, 2000);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div 
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 25%, #1e1e1e 50%, #0d0d0d 100%)',
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col xs={11} sm={8} md={6} lg={5} xl={4}>
            {/* Main Login Card - Black Glassmorphic Effect */}
            <Card 
              className="shadow-lg border-0"
              style={{
                borderRadius: '16px',
                backdropFilter: 'blur(15px)',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.7)'
              }}
            >
              <Card.Body className="p-4">
                
                {/* Header Section - Updated for dark theme */}
                <div className="text-center mb-3">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
                       style={{ 
                         width: '60px', 
                         height: '60px',
                         background: 'rgba(255, 255, 255, 0.1)',
                         backdropFilter: 'blur(10px)',
                         border: '1px solid rgba(255, 255, 255, 0.2)'
                       }}>
                    <FaShieldAlt className="text-white" style={{ fontSize: '1.5rem' }} />
                  </div>
                  <h3 className="fw-bold text-white mb-1">Store Insights</h3>
                  <p className="text-white-50 mb-2" style={{ fontSize: '14px' }}>Log in to access your dashboard</p>
                </div>

                {/* Error Alert */}
                {loginError && (
                  <Alert 
                    variant="danger" 
                    className="mb-3 py-2" 
                    style={{ 
                      fontSize: '14px',
                      backgroundColor: 'rgba(220, 53, 69, 0.2)',
                      border: '1px solid rgba(220, 53, 69, 0.3)',
                      color: '#ff6b6b'
                    }}
                  >
                    {loginError}
                  </Alert>
                )}

                {/* Login Form */}
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                  
                  {/* Email Input */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-white" style={{ fontSize: '14px' }}>Email Address</Form.Label>
                    <InputGroup className="mb-1">
                      <InputGroup.Text 
                        className="border-end-0" 
                        style={{ 
                          fontSize: '14px',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: 'white'
                        }}
                      >
                        <FaUser className="text-white" style={{ fontSize: '14px' }} />
                      </InputGroup.Text>
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="border-start-0 py-2"
                        style={{ 
                          fontSize: '14px',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: 'white'
                        }}
                        required
                      />
                      <Form.Control.Feedback type="invalid" style={{ fontSize: '12px', color: '#ffffff' }}>
                        Please provide a valid email address.
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>

                  {/* Password Input */}
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-white" style={{ fontSize: '14px' }}>Password</Form.Label>
                    <InputGroup className="mb-1">
                      <InputGroup.Text 
                        className="border-end-0" 
                        style={{ 
                          fontSize: '14px',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: 'white'
                        }}
                      >
                        <FaLock className="text-white" style={{ fontSize: '14px' }} />
                      </InputGroup.Text>
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="border-start-0 border-end-0 py-2"
                        style={{ 
                          fontSize: '14px',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: 'white'
                        }}
                        required
                        minLength="6"
                      />
                      <InputGroup.Text 
                        className="border-start-0 cursor-pointer"
                        onClick={togglePasswordVisibility}
                        style={{ 
                          cursor: 'pointer', 
                          fontSize: '14px',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: 'white'
                        }}
                      >
                        {showPassword ? <FaEyeSlash className="text-white-50" style={{ fontSize: '14px' }} /> : <FaEye className="text-white-50" style={{ fontSize: '14px' }} />}
                      </InputGroup.Text>
                      <Form.Control.Feedback type="invalid" style={{ fontSize: '12px', color: '#ff6b6b' }}>
                        Password must be at least 6 characters long.
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>

                  {/* Remember Me & Forgot Password */}
                  <Row className="mb-3">
                    <Col xs={6}>
                      <Form.Check
                        type="checkbox"
                        name="rememberMe"
                        id="rememberMe"
                        label="Remember me"
                        checked={formData.rememberMe}
                        onChange={handleInputChange}
                        className="text-white-50"
                        style={{ fontSize: '13px' }}
                      />
                    </Col>
                    <Col xs={6} className="text-end">
                      <Button 
                        variant="link" 
                        className="p-0 text-decoration-none fw-semibold text-white-50"
                        style={{ fontSize: '13px' }}
                      >
                        Forgot Password?
                      </Button>
                    </Col>
                  </Row>

                  {/* Login Button */}
                  <div className="d-grid mb-3">
                    <Button
                      type="submit"
                      size="md"
                      className="py-2 fw-semibold"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '10px',
                        color: 'white',
                        fontSize: '14px',
                        backdropFilter: 'blur(10px)'
                      }}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            className="me-2"
                          />
                          Signing In...
                        </>
                      ) : (
                        'Sign In to Dashboard'
                      )}
                    </Button>
                  </div>
                </Form>

                {/* Security Badge */}
                <div className="text-center mt-3">
                  <small className="text-white-50 d-flex align-items-center justify-content-center" style={{ fontSize: '11px' }}>
                    <FaShieldAlt className="me-1 text-success" style={{ fontSize: '11px' }} />
                    Store Insights is committed to your security.
                  </small>
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
