import { useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import { useAuthStore } from './stores/authStore';
import { useThemeStore } from './stores/themeStore';
import { usePreferredColorScheme } from './hooks/usePreferredColorScheme';
import { LoginScreen } from './components/auth/LoginScreen';
import { MainApp } from './components/MainApp';
import { usePrintSync } from './hooks/usePrintSync';

export default function App() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const isLoading = useAuthStore((s) => s.isLoading);
  const theme = useThemeStore((s) => s.theme);
  const mode = useThemeStore((s) => s.mode);
  const setTheme = useThemeStore((s) => s.setTheme);
  const preferredColorScheme = usePreferredColorScheme();
  usePrintSync();

  useEffect(() => {
    if (mode === 'system') {
      setTheme(preferredColorScheme);
    }
  }, [mode, preferredColorScheme]);

  useEffect(() => {

    const message = 'An unexpected error occurred. Please try again later.';

    const handlePromiseError = (event: PromiseRejectionEvent) => {
      console.error('Unhandled rejection:', event.reason);
      toast.error(message);
    };

    const handleGlobalError = (event: ErrorEvent) => {
      console.error('Global error:', event.message);
      toast.error(message);
    };

    window.addEventListener('unhandledrejection', handlePromiseError);
    window.addEventListener('error', handleGlobalError);

    return () => {
      window.removeEventListener('unhandledrejection', handlePromiseError);
      window.removeEventListener('error', handleGlobalError);
    };
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-(--color-bg-primary)">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      );
    }

    if (!isLoggedIn) {
      return <LoginScreen />;
    }

    return <MainApp />;
  };

  return (
    <>
      <div className={theme} id="app-root">
        <Toaster
          theme={theme}
          richColors
          position="top-center"
          closeButton
          toastOptions={{
            classNames: {
              closeButton: 'toast-close-button',
            },
          }}
        />
        {renderContent()}
      </div>
      <div id="print-container" className="light" style={{ display: 'none' }} />
    </>
  );
}
