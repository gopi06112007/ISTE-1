import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
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

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-iste-blue/20 border-t-iste-blue rounded-full animate-spin" />
        <p className="text-slate-500 font-bold">Loading page...</p>
      </div>
    </div>
  );
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

function App() {
  // removed theme initialization
  const { checkAuth } = useAuth();

  useEffect(() => {
    // initialization
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <div className="min-h-screen flex flex-col relative text-slate-800  font-inter transition-colors duration-300">
        <ScrollProgress />
        <Toaster position="top-right" toastOptions={{ className: 'font-sans' }} />
        <Navbar />
        <main className="flex-1">
          <AnimatedRoutes />
        </main>
        <Footer />
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
