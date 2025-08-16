import { HashRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "./components/ui/Header";
import Footer from "./components/ui/Footer";
import HomePage from "./pages/HomePage";
import ListingByStatus from "./pages/ListingByStatus";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import Placeholder from "./pages/Placeholder";
import ServicesFeesPage from "./pages/services";
import AdminPage from "./pages/admin";
import ContactPage from "./pages/contact";
import { DataContext } from "./context/DataContext";
import { PROPS } from "./data/properties";
import staticProperties from "./data/static-properties";
import MembershipStrip from "./components/ui/MembershipStrip";

function AppContent() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900">
      <Header />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/for-sale" element={<ListingByStatus status="sale" />} />
          <Route path="/for-rent" element={<ListingByStatus status="rent" />} />
          <Route path="/property/:id" element={<PropertyDetailPage />} />
          <Route path="/landlords" element={<Placeholder text="Landlords page (todo)" />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/services" element={<ServicesFeesPage />} />
          <Route path="/list" element={<Placeholder text="List your property form (todo)" />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Placeholder text="404 – Page not found" />} />
        </Routes>
      </div>
      {isHome && <MembershipStrip />}
      <Footer />
    </div>
  );
}

export default function App() {
  // Start with static properties (generated at build time) for instant loading
  const [live, setLive] = useState(staticProperties.length > 0 ? staticProperties : null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [lastFetch, setLastFetch] = useState<number>(0);
  
  const refetchProperties = async (force = false) => {
    // Avoid too frequent refetches unless forced
    if (!force && Date.now() - lastFetch < 5000) return;
    
    setIsEnhancing(true);
    setLastFetch(Date.now());
    
    try {
      // Add cache-busting to ensure fresh data after admin changes
      const cacheBust = force ? `?t=${Date.now()}` : '';
      const res = await fetch(`/api/properties${cacheBust}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      
      // ensure images[] exists for safety
      const safe = data.map((p: any) => ({
        ...p,
        images: p.images?.length ? p.images : p.img ? [p.img] : [],
      }));
      setLive(safe);
    } catch (e) {
      console.warn("Using fallback PROPS. Live fetch failed:", e);
      // Only fallback to PROPS if we don't already have static data
      if (!staticProperties.length) setLive(null);
    } finally {
      setIsEnhancing(false);
    }
  };
  
  useEffect(() => {
    let cancelled = false;
    
    const doInitialFetch = async () => {
      await refetchProperties();
      if (cancelled) return;
    };
    
    doInitialFetch();
    
    // Listen for storage events (admin panel can trigger refresh)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'properties_updated') {
        refetchProperties(true);
        localStorage.removeItem('properties_updated');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      cancelled = true;
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Expose refetch function globally for admin panel
  useEffect(() => {
    (window as any).__refetchProperties = () => refetchProperties(true);
  }, []);
  
  // Priority: live data > static data > fallback PROPS
  const DATA = live ?? (staticProperties.length > 0 ? staticProperties : PROPS);
  return (
    <Router>
      <DataContext.Provider value={DATA}>
        {isEnhancing && staticProperties.length > 0 && (
          <div className="fixed top-4 right-4 z-50 bg-blue-50 border border-blue-200 text-blue-800 px-3 py-2 rounded-lg text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              Refreshing data...
            </div>
          </div>
        )}
        <AppContent />
      </DataContext.Provider>
    </Router>
  );
}
