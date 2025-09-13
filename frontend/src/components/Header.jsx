


import { Container, Row, Col, Dropdown, Button } from "react-bootstrap";
import { FaUserCircle, FaSignOutAlt, FaCog } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function HeroHeader({
  title = "CEO Smart Insights",
  subtitle = "Monday 4 August 2025 | 04–1.5 pm",
}) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const formatDate = () => {
    const now = new Date();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return now.toLocaleDateString('en-US', options);
  };

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  return (
    <header className="hero-header">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

        .hero-header {
          font-family: 'Poppins', sans-serif;
          background: #0e0e0e;
          
          color: #fff;
          position: relative;
        }
        .hero-inner {
          height: 58px;
          display: flex; align-items: center;
          padding-left: 12px; padding-right: 12px;
        }
        .hairline {
          position: absolute; left: 0; right: 0; bottom: 0;
          height: 1px;
          background: rgba(255,255,255,0.06);
        }

        /* Left brand text */
        .brand-text {
          font-size: 20px;
          font-weight: 700;
          letter-spacing: 0.5px;
          margin: 0;
          background: linear-gradient( #ffffff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .brand-sub {
          font-size: 10px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.65);
          margin: 0;
        }

        /* Right block */
        .right-block { text-align: right; line-height: 1.1; }
        .title {
          font-size: 13px; font-weight: 600; letter-spacing: .1px;
          margin: 0; color: #f5f5f5;
        }
        .subtitle {
          font-size: 11px; font-weight: 400; opacity: .85; margin: 0;
        }

        /* Avatar icon */
        .avatar-icon {
          font-size: 28px;
          color: #bbb;
          margin-left: 10px;
        }

        @media (min-width: 576px) {
          .hero-inner { height: 60px; padding-left:16px; padding-right:16px; }
          .brand-text { font-size: 22px; }
          .avatar-icon { font-size: 30px; }
        }
      `}</style>

      <Container fluid className="hero-inner">
        <Row className="flex-nowrap align-items-center w-100">
          {/* Left: Rootments brand */}
          <Col xs="auto" className="d-flex flex-column justify-content-center">
            <p className="brand-text">ROOTMENTS</p>
            
          </Col>

          {/* Spacer */}
          <Col />

          {/* Right: User info + logout */}
          <Col xs="auto" className="d-flex align-items-center">
            {isAuthenticated && user ? (
              <>
                <div className="right-block me-3">
                  <p className="title mb-1">Welcome, {user.name}</p>
                  <p className="subtitle mb-0">{user.email}</p>
                </div>
                <Dropdown align="end">
                  <Dropdown.Toggle 
                    variant="link" 
                    className="p-0 border-0 bg-transparent"
                    style={{ color: '#bbb' }}
                  >
                    <FaUserCircle className="avatar-icon" />
                  </Dropdown.Toggle>
                  
                  <Dropdown.Menu 
                    variant="dark" 
                    className="border-0 shadow"
                    style={{ 
                      backgroundColor: '#1a1a1a',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px'
                    }}
                  >
                    <Dropdown.Header className="text-white-50">
                      <small>Signed in as</small><br/>
                      <strong>{user.name}</strong>
                    </Dropdown.Header>
                    <Dropdown.Divider className="my-2" style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                    <Dropdown.Item 
                      className="text-white-50 py-2"
                      onClick={handleLogout}
                      style={{ 
                        backgroundColor: 'transparent',
                        border: 'none'
                      }}
                    >
                      <FaSignOutAlt className="me-2" />
                      Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              <>
                <div className="right-block me-2">
                  <p className="title mb-1">{formatDate()}</p>
                  <p className="subtitle mb-0">{formatTime()}</p>
                </div>
                <FaUserCircle className="avatar-icon" />
              </>
            )}
          </Col>
        </Row>
      </Container>

      <div className="hairline" />
    </header>
  );
}
