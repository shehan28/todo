import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, LogOut, Menu, X } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import Button from '@/components/ui/Button';

const Layout: React.FC = () => {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  
  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-primary rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl">
              <CheckCircle className="h-6 w-6 text-primary" />
              <span>TaskMaster</span>
            </Link>
          </div>
          
          {user && (
            <>
              <nav className="hidden md:flex items-center gap-6">
                <Link to="/" className="text-sm font-medium hover:text-primary">Dashboard</Link>
                <Link to="/completed" className="text-sm font-medium hover:text-primary">Completed</Link>
              </nav>
              
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <span className="text-sm font-medium">{user.displayName || user.email}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </Button>
              </div>
              
              {/* Mobile menu button */}
              <button 
                className="md:hidden p-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </>
          )}
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && user && (
          <div className="md:hidden border-t p-4 bg-background animate-fade-in">
            <nav className="flex flex-col gap-4 mb-4">
              <Link 
                to="/" 
                className="text-sm font-medium hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                to="/completed" 
                className="text-sm font-medium hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Completed
              </Link>
            </nav>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'User'} 
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <span className="text-sm font-medium">{user.displayName || user.email}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="justify-start">
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>
          </div>
        )}
      </header>
      
      <main className="flex-1 container py-6">
        <Outlet />
      </main>
      
      <footer className="border-t py-6 bg-muted/40">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">TaskMaster</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} TaskMaster. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;