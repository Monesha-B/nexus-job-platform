import { Container } from 'react-bootstrap';

const LoadingSpinner = ({ fullScreen = false, small = false, text = 'Loading...' }) => {
  
  // Small inline spinner for buttons
  if (small) {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '16px',
          height: '24px',
          border: '2px solid #fff',
          borderRadius: '8px',
          position: 'relative'
        }}>
          <div style={{
            width: '3px',
            height: '6px',
            background: '#fff',
            borderRadius: '2px',
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            top: '4px',
            animation: 'scrollWheel 1s ease-in-out infinite'
          }}></div>
        </div>
        <style>{`
          @keyframes scrollWheel {
            0% { opacity: 1; top: 4px; }
            50% { opacity: 0.5; top: 10px; }
            100% { opacity: 1; top: 4px; }
          }
        `}</style>
      </div>
    );
  }

  const spinner = (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ padding: '40px' }}>
      <div style={{ position: 'relative', width: '50px', height: '70px', marginBottom: '16px' }}>
        <div style={{
          width: '36px',
          height: '56px',
          border: '3px solid #d97757',
          borderRadius: '18px',
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)'
        }}>
          <div style={{
            width: '6px',
            height: '12px',
            background: '#d97757',
            borderRadius: '3px',
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            top: '8px',
            animation: 'scrollWheel 1.5s ease-in-out infinite'
          }}></div>
        </div>
      </div>
      <p style={{ color: '#666', fontSize: '0.95rem', margin: 0 }}>{text}</p>
      
      <style>{`
        @keyframes scrollWheel {
          0% { opacity: 1; top: 8px; }
          50% { opacity: 0.5; top: 20px; }
          100% { opacity: 1; top: 8px; }
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(255, 255, 255, 0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        {spinner}
      </div>
    );
  }

  return (
    <Container className="d-flex justify-content-center">
      {spinner}
    </Container>
  );
};

export default LoadingSpinner;
