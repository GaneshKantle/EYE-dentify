import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Navbar } from "./components/layout/Navbar";
import Dashboard from "./Dashboard";
import AddFace from "./AddFace";
import RecognizeFace from "./RecognizeFace";
import Gallery from "./Gallery";
import About from "./About";
import FaceSketch from "./components/facesketch/FaceSketch";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import { LoadingProvider, GlobalLoading } from "./contexts/LoadingContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { useAuthStore } from "./store/authStore";

interface AppProps {}

const AppContent: React.FC = () => {
  const { isAuthenticated, checkAuth, token } = useAuthStore();

  useEffect(() => {
    // Check authentication on mount
    if (token) {
      checkAuth();
    }
  }, [checkAuth, token]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} />
      
      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add"
        element={
          <ProtectedRoute>
            <AddFace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recognize"
        element={
          <ProtectedRoute>
            <RecognizeFace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gallery"
        element={
          <ProtectedRoute>
            <Gallery />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sketch"
        element={
          <ProtectedRoute>
            <FaceSketch />
          </ProtectedRoute>
        }
      />
      <Route
        path="/about"
        element={
          <ProtectedRoute>
            <About />
          </ProtectedRoute>
        }
      />
      
      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC<AppProps> = () => {
  return (
    <ErrorBoundary>
      <LoadingProvider>
        <NotificationProvider>
          <Router>
            <Layout>
              <Navbar />
              <main className="min-h-screen">
                <AppContent />
              </main>
              <GlobalLoading />
            </Layout>
          </Router>
        </NotificationProvider>
      </LoadingProvider>
    </ErrorBoundary>
  );
};

export default App;
