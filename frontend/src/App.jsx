import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import CaterpillarLogo from './components/CaterpillarLogo';

// Page Imports
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

// Route protection wrapper
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" replace />;
};

function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-cat-dark text-cat-black dark:text-gray-200 transition-colors duration-300">
      <Navbar />
      <main className="flex-grow">
        <Routes>
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      
      {/* Heavy Machinery Style Footer */}
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
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <Layout />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </Router>
  );
}
