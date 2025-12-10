import { Container } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer style={{ background: '#212529', color: '#adb5bd', padding: '30px 0', marginTop: 'auto' }}>
      <Container className="text-center">
        <p style={{ fontWeight: '600', color: 'white', marginBottom: '5px' }}>NEXUS</p>
        <p style={{ fontSize: '0.9rem', marginBottom: '0' }}>
          AI-Powered Job Matching Platform | INFO 6150 Final Project
        </p>
      </Container>
    </footer>
  );
};

export default Footer;
