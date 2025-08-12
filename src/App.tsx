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
  const [live, setLive] = useState(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/properties");
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        if (!cancelled) {
          // ensure images[] exists for safety
          const safe = data.map((p: any) => ({
            ...p,
            images: p.images?.length ? p.images : p.img ? [p.img] : [],
          }));
          setLive(safe);
        }
      } catch (e) {
        console.warn("Using fallback PROPS. Live fetch failed:", e);
        if (!cancelled) setLive(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  const DATA = live ?? PROPS;
  return (
    <Router>
      <DataContext.Provider value={DATA}>
        <AppContent />
      </DataContext.Provider>
    </Router>
  );
}
