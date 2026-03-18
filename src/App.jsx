import React, { Suspense } from 'react'
import './App.css'
import './globals.css'
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import VisualEditAgent from '@/lib/VisualEditAgent'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageNotFound from './lib/PageNotFound';
import BathymetricCrowdsourcing from './pages/BathymetricCrowdsourcing';
import WeatherAlerts from './pages/WeatherAlerts';
import Events from './pages/Events';
import KiBuddyBeta from './pages/KiBuddyBeta';
import ARKnotenAssistent from './pages/ARKnotenAssistent';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, isAuthenticated, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  const PageFallback = (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-950">
      <div className="w-8 h-8 border-4 border-gray-700 border-t-cyan-400 rounded-full animate-spin" />
    </div>
  );

  // AnimatePresence needs location from inside Router
  return <AnimatedRoutes PageFallback={PageFallback} />;
};

const AnimatedRoutes = ({ PageFallback }) => {
  const location = useLocation();
  const { Pages, Layout, mainPage } = pagesConfig;
  const mainPageKey = mainPage ?? Object.keys(Pages)[0];
  const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;
  const LayoutWrapper = ({ children, currentPageName }) => Layout
    ? <Layout currentPageName={currentPageName}>{children}</Layout>
    : <>{children}</>;

  return (
    <Suspense fallback={PageFallback}>
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={
            <LayoutWrapper currentPageName={mainPageKey}>
              <MainPage />
            </LayoutWrapper>
          } />
          {Object.entries(Pages).map(([path, Page]) => (
            <Route
              key={path}
              path={`/${path}`}
              element={
                <LayoutWrapper currentPageName={path}>
                  <Page />
                </LayoutWrapper>
              }
            />
          ))}
          <Route path="/BathymetricCrowdsourcing" element={<LayoutWrapper currentPageName="BathymetricCrowdsourcing"><BathymetricCrowdsourcing /></LayoutWrapper>} />
          <Route path="/ARKnotenAssistent" element={<LayoutWrapper currentPageName="ARKnotenAssistent"><ARKnotenAssistent /></LayoutWrapper>} />
          <Route path="/KiBuddyBeta" element={<LayoutWrapper currentPageName="KiBuddyBeta"><KiBuddyBeta /></LayoutWrapper>} />
          <Route path="/Events" element={<LayoutWrapper currentPageName="Events"><Events /></LayoutWrapper>} />
          <Route path="/WeatherAlerts" element={<LayoutWrapper currentPageName="WeatherAlerts"><WeatherAlerts /></LayoutWrapper>} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <VisualEditAgent />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App