import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminAuthProvider, useAdminAuth } from './admin/context/AdminAuthContext';
import Navbar from './components/Navbar';
import CaterpillarLogo from './components/CaterpillarLogo';

// Operator Page Imports
import Welcome from './pages/Welcome';
import Login from './pages/Login'; 
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Analysis from './pages/Analysis';
import Results from './pages/Results';
import Report from './pages/Report';
import About from './pages/About';
import Support from './pages/Support';
import Contact from './pages/Contact';

// Admin Page Imports
import AdminDashboard from './admin/pages/AdminDashboard';
import UserManagement from './admin/pages/UserManagement';
import AnalysisManagement from './admin/pages/AnalysisManagement';
import ReportManagement from './admin/pages/ReportManagement';
import EngineManagement from './admin/pages/EngineManagement';
import LeakZoneManagement from './admin/pages/LeakZoneManagement';
import VideoManagement from './admin/pages/VideoManagement';
import AuditLogs from './admin/pages/AuditLogs';
import SystemReports from './admin/pages/SystemReports';

// Route protection wrapper
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" replace />;
};

// Admin route protection - checks AdminAuthContext instead of regular AuthContext
const AdminProtectedRoute = ({ children }) => {
  const { currentAdmin } = useAdminAuth();
  if (!currentAdmin) return <Navigate to="/login" replace />;
  return children;
};

// Redirect /admin/login to unified /login
const AdminLoginRedirect = () => <Navigate to="/login" replace />;

function Layout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  return (
    <div className="min-h-screen flex flex-col bg-white text-cat-black">
      {!isAdminRoute && <Navbar />}
      <main className="flex-grow">
        <Routes>
          {/* Operator Routes */}
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analysis" 
            element={
              <ProtectedRoute>
                <Analysis />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/results" 
            element={
              <ProtectedRoute>
                <Results />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute>
                <Report />
              </ProtectedRoute>
            } 
          />
          
          <Route path="/about" element={<About />} />
          <Route path="/support" element={<Support />} />
          <Route path="/contact" element={<Contact />} />
          
{/* Admin Routes - protected by AdminAuthContext */}
          <Route path="/admin/login" element={<AdminLoginRedirect />} />
          <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
          <Route path="/admin/users" element={<AdminProtectedRoute><UserManagement /></AdminProtectedRoute>} />
          <Route path="/admin/analyses" element={<AdminProtectedRoute><AnalysisManagement /></AdminProtectedRoute>} />
          <Route path="/admin/reports" element={<AdminProtectedRoute><ReportManagement /></AdminProtectedRoute>} />
          <Route path="/admin/engines" element={<AdminProtectedRoute><EngineManagement /></AdminProtectedRoute>} />
          <Route path="/admin/leak-zones" element={<AdminProtectedRoute><LeakZoneManagement /></AdminProtectedRoute>} />
          <Route path="/admin/videos" element={<AdminProtectedRoute><VideoManagement /></AdminProtectedRoute>} />
          <Route path="/admin/audit-logs" element={<AdminProtectedRoute><AuditLogs /></AdminProtectedRoute>} />
          <Route path="/admin/system-reports" element={<AdminProtectedRoute><SystemReports /></AdminProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      
      {/* Heavy Machinery Style Footer - hidden on admin routes */}
      {!isAdminRoute && (
        <footer className="bg-cat-black text-gray-500 text-xs font-mono py-8 border-t-2 border-cat-yellow/30 text-center select-none print:hidden">
          <div className="max-w-7xl mx-auto px-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CaterpillarLogo className="h-5 text-white" />
                <span className="border-l border-gray-800 pl-3 font-bold tracking-widest text-gray-400">ENGINE DIAGNOSTICS &copy; 2026</span>
              </div>
              <div className="flex gap-4">
                <a href="#privacy" className="hover:text-cat-yellow transition-colors">PRIVACY CODE</a>
                <a href="#terms" className="hover:text-cat-yellow transition-colors">USAGE LICENSE</a>
                <a href="#eula" className="hover:text-cat-yellow transition-colors">EULA</a>
              </div>
            </div>
            <div className="border-t border-gray-900 pt-4 flex flex-col sm:flex-row items-center justify-between text-[10px] text-gray-600 gap-2">
              <span>PLATFORM: React v19 + Vite + Tailwind v4 CSS Engine + Chart.js v4</span>
              <span>DIAG-STATUS: SECURE CONNECTIVITY OK</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <AdminAuthProvider>
            <Layout />
          </AdminAuthProvider>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}
