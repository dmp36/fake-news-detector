import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import History from './pages/History';
import { Loader2 } from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-deep flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} 
      />
      <Route 
        path="/history" 
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};


function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
