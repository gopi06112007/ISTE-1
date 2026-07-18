import { lazy, Suspense, useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import useAuth from './hooks/useAuth';

// Layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Protected wrapper
import ProtectedRoute from './components/ProtectedRoute';

const Home = lazy(() => import('./pages/Home'));
const Coordinators = lazy(() => import('./pages/Coordinators'));
const Events = lazy(() => import('./pages/Events'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Blog = lazy(() => import('./pages/Blog'));
const Login = lazy(() => import('./pages/Login'));
const ProfileDetailPage = lazy(() => import('./pages/ProfileDetailPage'));
const StudentDashboard = lazy(() => import('./pages/dashboard/StudentDashboard'));
const BranchFacultyDashboard = lazy(() => import('./pages/dashboard/BranchFacultyDashboard'));
const CentralDashboard = lazy(() => import('./pages/dashboard/CentralDashboard'));

import { PageLoaderSkeleton } from './components/ui/SkeletonLoaders';

function PageLoader() {
  return <PageLoaderSkeleton />;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/coordinators" element={<Coordinators />} />
          <Route path="/coordinators/:id" element={<ProfileDetailPage />} />
          <Route path="/events" element={<Events />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<Blog />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

function ScrollProgress() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setWidth((window.scrollY / totalScroll) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-iste-blue via-iste-violet to-iste-teal z-[200] transition-all duration-100 ease-out"
      style={{ width: `${width}%` }}
    />
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

/**
 * GlobalFooter — renders the Footer statically at the bottom of all subpages.
 * Hides the footer on Home, Login, and Dashboard routes.
 */
function GlobalFooter() {
  const location = useLocation();
  if (
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/blog/')
  ) {
    return null;
  }
  return <Footer />;
}

function App() {
  // removed theme initialization
  const { checkAuth } = useAuth();

  useEffect(() => {
    // initialization
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col relative text-slate-800 font-inter transition-colors duration-300">
        <ScrollProgress />
        <Toaster position="top-right" toastOptions={{ className: 'font-sans' }} />
        <Navbar />
        <main className="flex-1">
          <AnimatedRoutes />
        </main>
        <GlobalFooter />
      </div>
    </Router>
  );
}

/**
 * Dashboard router — renders the appropriate dashboard based on user role.
 */
function DashboardRouter() {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'student_coordinator':
      return <StudentDashboard />;
    case 'branch_faculty':
      return <BranchFacultyDashboard />;
    case 'central_faculty':
      return <CentralDashboard />;
    default:
      return (
        <div className="section-container py-20 text-center">
          <h2 className="text-2xl font-bold text-red-500">Unknown Role</h2>
          <p className="text-gray-500 mt-2">Your account role is not recognized.</p>
        </div>
      );
  }
}

export default App;
