import { useState, useRef, useEffect } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

const AIChatbot = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = user 
        ? `Hi ${user.firstName}! 👋 I'm your NEXUS assistant. I can help you navigate the platform, give career advice, and answer questions. What would you like to know?`
        : `Hi there! 👋 I'm the NEXUS assistant. I can help you learn about our platform and answer your questions. What would you like to know?`;
      
      setMessages([{ role: 'assistant', content: greeting }]);
    }
  }, [isOpen, user]);

  const getPageContext = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'dashboard';
    if (path === '/jobs') return 'browse-jobs';
    if (path.startsWith('/jobs/')) return 'job-details';
    if (path === '/match') return 'ai-match';
    if (path === '/applications') return 'my-applications';
    if (path === '/profile') return 'profile';
    if (path === '/admin') return 'admin-dashboard';
    return 'general';
  };

  const quickSuggestions = {
    'dashboard': ['How do I apply for jobs?', 'How does AI Match work?', 'Tips to improve my profile'],
    'browse-jobs': ['How to filter jobs?', 'What do job types mean?', 'How to search effectively?'],
    'job-details': ['How to write a good cover letter?', 'What skills should I highlight?', 'Interview tips'],
    'ai-match': ['How does matching work?', 'How to improve my match score?', 'What skills are in demand?'],
    'my-applications': ['How to follow up?', 'What do statuses mean?', 'How long to wait for response?'],
    'profile': ['How to improve my resume?', 'What should I include?', 'How to upload documents?'],
    'admin-dashboard': ['How to post a job?', 'How to manage applications?', 'Best practices for job posts'],
    'general': ['What is NEXUS?', 'How to get started?', 'What features are available?'],
  };

  const handleSend = async (messageText = input) => {
    if (!messageText.trim()) return;

    const userMessage = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        message: messageText,
        context: getPageContext(),
        conversationHistory: messages.slice(-6),
      });

      setMessages(prev => [...prev, { role: 'assistant', content: res.data.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm having trouble connecting right now. Please try again in a moment!" 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const currentSuggestions = quickSuggestions[getPageContext()] || quickSuggestions['general'];

  // Don't show on auth pages
  if (location.pathname === '/auth' || location.pathname === '/login' || location.pathname === '/signup') {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #d97757 0%, #c4624a 100%)',
          border: 'none',
          boxShadow: '0 4px 20px rgba(217, 119, 87, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 24px rgba(217, 119, 87, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(217, 119, 87, 0.4)';
        }}
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            <circle cx="8" cy="10" r="1" fill="white"/>
            <circle cx="12" cy="10" r="1" fill="white"/>
            <circle cx="16" cy="10" r="1" fill="white"/>
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '24px',
            width: '380px',
            maxWidth: 'calc(100vw - 48px)',
            height: '500px',
            maxHeight: 'calc(100vh - 140px)',
            background: '#fff',
            borderRadius: '20px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 999,
            animation: 'slideUp 0.3s ease',
          }}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #d97757 0%, #c4624a 100%)',
            padding: '20px',
            color: '#fff',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z"/>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                  <line x1="9" y1="9" x2="9.01" y2="9"/>
                  <line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
              </div>
              <div>
                <h6 style={{ margin: 0, fontWeight: '600', fontSize: '1rem' }}>NEXUS Assistant</h6>
                <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.9 }}>Here to help you succeed!</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: '#f8f9fa',
          }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div style={{
                  maxWidth: '85%',
                  padding: '12px 16px',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.role === 'user' ? '#d97757' : '#fff',
                  color: msg.role === 'user' ? '#fff' : '#374151',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap',
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '12px 20px',
                  borderRadius: '16px 16px 16px 4px',
                  background: '#fff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <span className="typing-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d97757', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0s' }}></span>
                    <span className="typing-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d97757', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.2s' }}></span>
                    <span className="typing-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d97757', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length <= 2 && (
            <div style={{ padding: '12px 16px', borderTop: '1px solid #e5e7eb', background: '#fff' }}>
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '8px' }}>Quick questions:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {currentSuggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(suggestion)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      border: '1px solid #e5e7eb',
                      background: '#fff',
                      color: '#374151',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#d97757';
                      e.currentTarget.style.color = '#d97757';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.color = '#374151';
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb', background: '#fff' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Form.Control
                type="text"
                placeholder="Ask me anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{
                  borderRadius: '24px',
                  padding: '12px 20px',
                  border: '1px solid #e5e7eb',
                  fontSize: '0.9rem',
                }}
              />
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                style={{
                  borderRadius: '50%',
                  width: '46px',
                  height: '46px',
                  background: '#d97757',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </>
  );
};

export default AIChatbot;
