import { useParams, Link } from "react-router-dom";
import { useProperties } from "../context/DataContext";
import ImageGallery from "../components/ImageGallery";

function currency(n: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);
}
const cover = (p: any) => p.images?.[0] ?? p.img ?? "";

// Location icon component
const LocationIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
  </svg>
);

export default function PropertyDetailPage() {
  const DATA = useProperties();
  const { id } = useParams();
  const property = DATA.find(p => p.id === Number(id));

  if (!property) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-16">
        <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-zinc-700">Property not found.</p>
          <Link to="/" className="mt-3 inline-block text-sky-600 hover:underline">Back to home</Link>
        </div>
      </main>
    );
  }

  const imgs = property.images?.length ? property.images : [cover(property)];
  const statusLabel = property.status === "rent" ? "For Rent" : "For Sale";

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100">
      {/* Hero Section with Green Gradient Background */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-6xl mx-auto px-4 py-12">
          <header className="text-white">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <LocationIcon />
                  <span className="text-green-200 text-sm">{property.area}</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
                  {property.title}
                </h1>
                <p className="text-green-100 text-lg flex items-center gap-2">
                  <LocationIcon />
                  {property.address}
                </p>
              </div>
              <div className="text-right bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-3xl font-bold text-white mb-2">
                  {currency(property.price)}
                  <span className="text-lg font-medium text-green-200 ml-1">{property.priceUnit}</span>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white border border-white/30">
                    🛏️ {property.beds} beds
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white border border-white/30">
                    🛁 {property.baths} baths
                  </span>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${
                    property.status === 'rent' 
                      ? 'bg-emerald-500/20 text-emerald-100 border-emerald-400/30' 
                      : 'bg-orange-500/20 text-orange-100 border-orange-400/30'
                  }`}>
                    {statusLabel}
                  </span>
                </div>
              </div>
            </div>
          </header>
        </div>
        {/* Decorative elements in green theme */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-green-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-emerald-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-teal-400/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 -mt-8 relative z-10">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* LEFT COLUMN */}
          <section className="lg:col-span-3 space-y-8">
            {/* Image Gallery with Enhanced Styling */}
            <div className="group rounded-3xl border border-white/20 bg-white/80 backdrop-blur-sm p-3 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="rounded-2xl overflow-hidden">
                <ImageGallery images={imgs} />
              </div>
            </div>

            {/* About Section with Modern Card Design */}
            <div className="group rounded-3xl border border-white/20 bg-white/90 backdrop-blur-sm p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  About this property
                </h2>
              </div>
              {property.description ? (
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-8 whitespace-pre-line">
                    {property.description}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 italic">No description provided for this property.</p>
              )}
            </div>

            {/* Enhanced Key Details */}
            <div className="group rounded-3xl border border-white/20 bg-white/90 backdrop-blur-sm p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Key details
                </h3>
              </div>
              <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="group/item rounded-2xl border border-gray-100 p-6 hover:border-green-200 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-green-50 to-emerald-50">
                  <dt className="flex items-center gap-2 text-xs uppercase tracking-wide text-green-600 font-semibold mb-2">
                    🛏️ Bedrooms
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">{property.beds}</dd>
                </div>
                <div className="group/item rounded-2xl border border-gray-100 p-6 hover:border-teal-200 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-teal-50 to-cyan-50">
                  <dt className="flex items-center gap-2 text-xs uppercase tracking-wide text-teal-600 font-semibold mb-2">
                    🛁 Bathrooms
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">{property.baths}</dd>
                </div>
                <div className={`group/item rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-200 ${
                  property.status === 'rent' 
                    ? 'bg-gradient-to-br from-emerald-50 to-green-50 hover:border-emerald-200' 
                    : 'bg-gradient-to-br from-orange-50 to-red-50 hover:border-orange-200'
                }`}>
                  <dt className={`flex items-center gap-2 text-xs uppercase tracking-wide font-semibold mb-2 ${
                    property.status === 'rent' ? 'text-emerald-600' : 'text-orange-600'
                  }`}>
                    🏷️ Status
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">{statusLabel}</dd>
                </div>
                {property.wifi && (
                  <div className="group/item rounded-2xl border border-gray-100 p-6 hover:border-green-200 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-green-50 to-emerald-50">
                    <dt className="flex items-center gap-2 text-xs uppercase tracking-wide text-green-600 font-semibold mb-2">
                      📶 Connectivity
                    </dt>
                    <dd className="text-lg font-bold text-gray-900">Wi-Fi included</dd>
                  </div>
                )}
                {property.billsIncluded && (
                  <div className="group/item rounded-2xl border border-gray-100 p-6 hover:border-yellow-200 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-yellow-50 to-orange-50">
                    <dt className="flex items-center gap-2 text-xs uppercase tracking-wide text-yellow-600 font-semibold mb-2">
                      💡 Utilities
                    </dt>
                    <dd className="text-lg font-bold text-gray-900">Bills included</dd>
                  </div>
                )}
              </dl>
            </div>
          </section>

          {/* RIGHT SIDEBAR */}
          <aside className="lg:col-span-2">
            <div className="lg:sticky lg:top-8 space-y-6">
              {/* Enhanced Pricing Card */}
              <div className="rounded-3xl border border-white/20 bg-white/90 backdrop-blur-sm p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Monthly Rate</div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {currency(property.price)}
                      <span className="text-lg font-medium text-gray-600 ml-1">{property.priceUnit}</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-2 text-sm font-medium text-white shadow-lg">
                    <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                    Available
                  </span>
                </div>

                <div className="space-y-4">
                  <Link
                    to="/contact"
                    className="group relative inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 px-6 py-4 font-semibold text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 active:scale-95"
                  >
                    <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
                    <span className="relative flex items-center gap-2">
                      📅 Arrange a viewing
                    </span>
                  </Link>
                  <Link
                    to="/"
                    className="inline-flex w-full items-center justify-center rounded-2xl border-2 border-gray-200 bg-white px-6 py-4 font-semibold text-gray-800 transition-all duration-300 hover:border-green-300 hover:bg-green-50 hover:text-green-700"
                  >
                    ← Back to listings
                  </Link>
                </div>

                <div className="mt-8 border-t border-gray-200 pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <LocationIcon />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 mb-1">Address</div>
                        <div className="text-gray-700">{property.address}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-teal-50 to-green-50 border border-teal-100">
                      <div className="flex-shrink-0 w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 mb-1">Area</div>
                        <div className="text-gray-700">{property.area}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats Card */}
              <div className="rounded-3xl border border-white/20 bg-white/90 backdrop-blur-sm p-6 shadow-xl">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center text-white text-sm">📊</span>
                  Quick Stats
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                    <div className="text-2xl font-bold text-green-600">{property.beds}</div>
                    <div className="text-xs text-green-600 font-medium">Bedrooms</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200">
                    <div className="text-2xl font-bold text-teal-600">{property.baths}</div>
                    <div className="text-xs text-teal-600 font-medium">Bathrooms</div>
                  </div>
                </div>
                {(property.wifi || property.billsIncluded) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      {property.wifi && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 border border-green-200">
                          📶 Wi-Fi
                        </span>
                      )}
                      {property.billsIncluded && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700 border border-yellow-200">
                          💡 Bills Inc.
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
