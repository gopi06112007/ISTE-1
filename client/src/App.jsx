import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import useAuth from './hooks/useAuth';

// Layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public Pages
import Home from './pages/Home';
import Coordinators from './pages/Coordinators';
import Events from './pages/Events';
import Gallery from './pages/Gallery';
import Blog from './pages/Blog';
import Login from './pages/Login';
import ProfileDetailPage from './pages/ProfileDetailPage';

// Protected wrapper
import ProtectedRoute from './components/ProtectedRoute';

// Dashboard Pages
import StudentDashboard from './pages/dashboard/StudentDashboard';
import BranchFacultyDashboard from './pages/dashboard/BranchFacultyDashboard';
import CentralDashboard from './pages/dashboard/CentralDashboard';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
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
  }, []);

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
