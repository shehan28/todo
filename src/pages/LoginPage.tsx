import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithPopup, 
  signInWithRedirect,
  GoogleAuthProvider, 
  GithubAuthProvider, 
  FacebookAuthProvider, 
  AuthProvider 
} from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { CheckCircle, Github, Mail, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

const LoginPage: React.FC = () => {
  const [user, loading] = useAuthState(auth);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isRedirectMode, setIsRedirectMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleSocialLogin = async (provider: AuthProvider) => {
    try {
      setAuthError(null);
      if (isRedirectMode) {
        await signInWithRedirect(auth, provider);
      } else {
        try {
          await signInWithPopup(auth, provider);
        } catch (error: any) {
          if (error.code === 'auth/popup-blocked') {
            setIsRedirectMode(true);
            setAuthError('Popup was blocked. Click again to sign in with redirect.');
          } else {
            throw error;
          }
        }
      }
    } catch (error: any) {
      console.error('Error during authentication:', error);
      setAuthError(
        error.code === 'auth/popup-closed-by-user'
          ? 'Sign in was cancelled. Please try again.'
          : error.message || 'Authentication failed. Please try again.'
      );
    }
  };

  const googleLogin = () => handleSocialLogin(new GoogleAuthProvider());
  const githubLogin = () => handleSocialLogin(new GithubAuthProvider());
  const facebookLogin = () => handleSocialLogin(new FacebookAuthProvider());

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-primary rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            <CheckCircle className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Welcome to TaskMaster</h1>
          <p className="text-muted-foreground mt-2">Sign in to manage your tasks efficiently</p>
        </div>

        <div className="bg-card rounded-lg border shadow-sm p-6">
          {authError && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <div className="space-y-3">
            <Button 
              className="w-full justify-center gap-2"
              onClick={googleLogin}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </Button>
            
            <Button 
              className="w-full justify-center gap-2"
              variant="outline"
              onClick={githubLogin}
            >
              <Github className="h-5 w-5" />
              Sign in with GitHub
            </Button>
            
            <Button 
              className="w-full justify-center gap-2"
              variant="outline"
              onClick={facebookLogin}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#1877F2]" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z"
                />
              </svg>
              Sign in with Facebook
            </Button>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            By signing in, you agree to our{' '}
            <a href="#" className="underline underline-offset-2 hover:text-primary">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="underline underline-offset-2 hover:text-primary">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;