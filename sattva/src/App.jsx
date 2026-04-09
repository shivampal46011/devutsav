import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';

// Lazy-load all non-Home routes — each becomes a separate chunk
// This reduces the initial JS bundle by ~50-60%
const Analyzer = React.lazy(() => import('./pages/Analyzer'));
const Whisper = React.lazy(() => import('./pages/Whisper'));
const Marketplace = React.lazy(() => import('./pages/Marketplace'));
const EngagementHub = React.lazy(() => import('./pages/EngagementHub'));
const RitualGuide = React.lazy(() => import('./pages/RitualGuide'));
const AdminPanel = React.lazy(() => import('./pages/AdminPanel'));
const Horoscope = React.lazy(() => import('./pages/Horoscope'));
const Blog = React.lazy(() => import('./pages/Blog'));
const BlogPost = React.lazy(() => import('./pages/BlogPost'));

// Minimal loading fallback — keeps the layout shell visible during chunk load
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      <span className="text-sm text-on-surface-variant font-label tracking-wide">Loading...</span>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/analyzer" element={<Analyzer />} />
            <Route path="/whisper" element={<Whisper />} />
            <Route path="/market" element={<Marketplace />} />
            {/* <Route path="/community" element={<EngagementHub />} /> */}
            <Route path="/ritual-guide" element={<RitualGuide />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/horoscope" element={<Horoscope />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
