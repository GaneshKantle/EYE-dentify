import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Navbar } from "./components/layout/Navbar";
import Dashboard from "./Dashboard";
import AddFace from "./AddFace";
import RecognizeFace from "./RecognizeFace";
import Gallery from "./Gallery";
import About from "./About";
import FaceSketch from "./components/facesketch/FaceSketch";
import ErrorBoundary from "./components/ErrorBoundary";
import { LoadingProvider, GlobalLoading } from "./contexts/LoadingContext";
import { NotificationProvider } from "./contexts/NotificationContext";

interface AppProps {}

const App: React.FC<AppProps> = () => {
  return (
    <ErrorBoundary>
      <LoadingProvider>
        <NotificationProvider>
          <Router>
            <Layout>
              <Navbar />
              <main className="min-h-screen">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/add" element={<AddFace />} />
                  <Route path="/recognize" element={<RecognizeFace />} />
                  <Route path="/gallery" element={<Gallery />} />
                  <Route path="/sketch" element={<FaceSketch />} />
                  <Route path="/about" element={<About />} />
                </Routes>
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
