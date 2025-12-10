import { useState } from 'react';
import { Navbar as BSNavbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinkStyle = ({ isActive }) => ({
    color: isActive ? '#d97757' : '#4b5563',
    fontWeight: isActive ? '600' : '500',
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    transition: 'all 0.2s',
  });

  return (
    <BSNavbar 
      expand="lg" 
      expanded={expanded}
      onToggle={setExpanded}
      style={{ 
        background: '#fff', 
        borderBottom: '1px solid #e5e7eb',
        padding: '12px 0'
      }}
    >
      <Container>
        <BSNavbar.Brand 
          as={Link} 
          to={isAuthenticated ? (isAdmin ? '/admin' : '/dashboard') : '/'} 
          style={{ fontWeight: '700', fontSize: '1.5rem', color: '#111827' }}
        >
          <span style={{ color: '#d97757' }}>NEX</span>US
        </BSNavbar.Brand>

        <BSNavbar.Toggle aria-controls="main-navbar" />
        
        <BSNavbar.Collapse id="main-navbar">
          <Nav className="ms-auto align-items-lg-center gap-1">
            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  /* Admin Navigation */
                  <>
                    <NavLink to="/admin" style={navLinkStyle} onClick={() => setExpanded(false)}>
                      Dashboard
                    </NavLink>
                  </>
                ) : (
                  /* Job Seeker Navigation */
                  <>
                    <NavLink to="/dashboard" style={navLinkStyle} onClick={() => setExpanded(false)}>
                      Dashboard
                    </NavLink>
                    <NavLink to="/match" style={navLinkStyle} onClick={() => setExpanded(false)}>
                      AI Match
                    </NavLink>
                    <NavLink to="/jobs" style={navLinkStyle} onClick={() => setExpanded(false)}>
                      Browse Jobs
                    </NavLink>
                    <NavLink to="/applications" style={navLinkStyle} onClick={() => setExpanded(false)}>
                      My Applications
                    </NavLink>
                  </>
                )}
                
                <NavLink to="/profile" style={navLinkStyle} onClick={() => setExpanded(false)}>
                  Profile
                </NavLink>

                {/* User Dropdown */}
                <Dropdown align="end" className="ms-2">
                  <Dropdown.Toggle 
                    variant="light" 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '10px',
                      padding: '8px 12px',
                      background: '#fff'
                    }}
                  >
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #d97757 0%, #c4624a 100%)', 
                      color: '#fff', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontWeight: '600', 
                      fontSize: '0.8rem' 
                    }}>
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </div>
                    <span style={{ color: '#374151', fontWeight: '500' }}>{user?.firstName}</span>
                    {isAdmin && (
                      <span style={{ 
                        background: '#fef7f5', 
                        color: '#d97757', 
                        fontSize: '0.65rem', 
                        fontWeight: '600', 
                        padding: '2px 6px', 
                        borderRadius: '4px' 
                      }}>
                        ADMIN
                      </span>
                    )}
                  </Dropdown.Toggle>

                  <Dropdown.Menu style={{ 
                    borderRadius: '10px', 
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)', 
                    border: '1px solid #e5e7eb', 
                    marginTop: '8px',
                    minWidth: '220px'
                  }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
                      <p style={{ fontWeight: '600', color: '#111827', marginBottom: '2px' }}>
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '4px' }}>{user?.email}</p>
                      <span style={{ 
                        display: 'inline-block',
                        fontSize: '0.7rem', 
                        fontWeight: '600', 
                        padding: '3px 8px', 
                        borderRadius: '4px',
                        background: '#fef7f5',
                        color: '#d97757',
                        textTransform: 'capitalize'
                      }}>
                        {user?.role}
                      </span>
                    </div>
                    
                    <Dropdown.Item as={Link} to="/profile" style={{ padding: '10px 16px' }}>
                      <span style={{ marginRight: '10px' }}>👤</span> Profile Settings
                    </Dropdown.Item>
                    
                    {isAdmin ? (
                      <Dropdown.Item as={Link} to="/admin" style={{ padding: '10px 16px' }}>
                        <span style={{ marginRight: '10px' }}>��</span> Admin Dashboard
                      </Dropdown.Item>
                    ) : (
                      <>
                        <Dropdown.Item as={Link} to="/match" style={{ padding: '10px 16px' }}>
                          <span style={{ marginRight: '10px' }}>🎯</span> AI Job Match
                        </Dropdown.Item>
                        <Dropdown.Item as={Link} to="/applications" style={{ padding: '10px 16px' }}>
                          <span style={{ marginRight: '10px' }}>📄</span> My Applications
                        </Dropdown.Item>
                      </>
                    )}
                    
                    <Dropdown.Divider />
                    
                    <Dropdown.Item onClick={handleLogout} style={{ padding: '10px 16px', color: '#dc2626' }}>
                      <span style={{ marginRight: '10px' }}>🚪</span> Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              /* Not Logged In */
              <>
                <NavLink to="/auth?role=jobseeker" style={navLinkStyle} onClick={() => setExpanded(false)}>
                  Job Seekers
                </NavLink>
                <NavLink to="/auth?role=admin" style={navLinkStyle} onClick={() => setExpanded(false)}>
                  Employers
                </NavLink>
                <Button 
                  as={Link} 
                  to="/" 
                  onClick={() => setExpanded(false)}
                  style={{ 
                    background: '#d97757', 
                    border: 'none', 
                    padding: '10px 20px', 
                    borderRadius: '10px', 
                    fontWeight: '600',
                    marginLeft: '8px'
                  }}
                >
                  Get Started
                </Button>
              </>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
};

export default Navbar;
