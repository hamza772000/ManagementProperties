import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { useProperties } from "../context/DataContext";
import ImageGallery from "../components/ImageGallery";

function currency(n: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);
}
const cover = (p: any) => p.images?.[0] ?? p.img ?? "";

// Enhanced icon components
const LocationIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
  </svg>
);

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg className="w-5 h-5" fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const ShareIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
  </svg>
);

export default function PropertyDetailPage() {
  const DATA = useProperties();
  const { id } = useParams();
  const property = DATA.find(p => p.id === Number(id));
  const [isFavorited, setIsFavorited] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'location'>('overview');

  if (!property) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-16">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg">
          <p className="text-zinc-700 mb-4">Property not found.</p>
          <Link to="/" className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
            ← Back to home
          </Link>
        </div>
      </main>
    );
  }

  const imgs = property.images?.length ? property.images : [cover(property)];
  const statusLabel = property.status === "rent" ? "For Rent" : "For Sale";

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-100">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden">
        {/* Dynamic background with animated gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700">
          <div className="absolute inset-0 bg-black/10"></div>
          {/* Animated background elements */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-green-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-teal-400/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-3">
          {/* Navigation breadcrumb */}
          <nav className="mb-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-emerald-100 hover:text-white transition-colors text-sm font-medium group"
            >
              <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to listings
            </Link>
          </nav>

          <header className="text-white">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <LocationIcon />
                  <span className="text-emerald-200 text-sm font-medium">{property.area}</span>
                </div>

                <h1 className="text-xl md:text-2xl font-bold tracking-tight mb-1 bg-gradient-to-r from-white via-emerald-100 to-green-200 bg-clip-text text-transparent leading-tight">
                  {property.title}
                </h1>

                <div className="flex items-center gap-2 mb-2">
                  <LocationIcon />
                  <p className="text-emerald-100 text-sm">{property.address}</p>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsFavorited(!isFavorited)}
                    className={`group flex items-center gap-1 px-2 py-1 rounded text-xs border transition-all duration-200 ${isFavorited
                        ? 'bg-red-500/20 border-red-400/30 text-red-100 hover:bg-red-500/30'
                        : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                      }`}
                  >
                    <HeartIcon filled={isFavorited} />
                    <span className="font-medium">
                      {isFavorited ? 'Saved' : 'Save'}
                    </span>
                  </button>

                  <button className="group flex items-center gap-1 px-2 py-1 rounded text-xs bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-200">
                    <ShareIcon />
                    <span className="font-medium">Share</span>
                  </button>
                </div>
              </div>
            </div>
          </header>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 -mt-8 relative z-10">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* LEFT COLUMN - Expanded */}
          <section className="lg:col-span-2 space-y-8">
            {/* Enhanced Image Gallery */}
            <div className="group rounded-3xl border border-white/20 bg-white/90 backdrop-blur-lg p-4 shadow-2xl hover:shadow-3xl transition-all duration-500">
              <div className="rounded-2xl overflow-hidden relative">
                <ImageGallery images={imgs} />
                {/* Image overlay with property features */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  {property.wifi && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/50 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white border border-white/20">
                      📶 Wi-Fi
                    </span>
                  )}
                  {property.billsIncluded && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/50 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white border border-white/20">
                      💡 Bills Inc.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Tabbed Content */}
            <div className="rounded-3xl border border-white/20 bg-white/90 backdrop-blur-lg shadow-2xl overflow-hidden">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-8 pt-6" aria-label="Tabs">
                  {[
                    { key: 'overview', label: 'Overview', icon: '📋' },
                    { key: 'details', label: 'Details', icon: '📊' },
                    { key: 'location', label: 'Location', icon: '📍' }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`group flex items-center gap-2 px-1 py-4 border-b-2 font-medium text-sm transition-all duration-200 ${activeTab === tab.key
                          ? 'border-emerald-500 text-emerald-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                      <span className="text-base">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-8">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
                        About this property
                      </h2>
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

                    {/* Key Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100">
                        <h4 className="font-semibold text-emerald-800 mb-2">🏠 Property Type</h4>
                        <p className="text-gray-700">Modern Apartment</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
                        <h4 className="font-semibold text-blue-800 mb-2">🚗 Parking</h4>
                        <p className="text-gray-700">Allocated Space</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
                        <h4 className="font-semibold text-purple-800 mb-2">⚡ EPC Rating</h4>
                        <p className="text-gray-700">C (77)</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-100">
                        <h4 className="font-semibold text-yellow-800 mb-2">🔑 Availability</h4>
                        <p className="text-gray-700">Available Now</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'details' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                      Property Details
                    </h2>
                    <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="group rounded-2xl border border-gray-100 p-6 hover:border-emerald-200 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-emerald-50 to-green-50">
                        <dt className="flex items-center gap-2 text-xs uppercase tracking-wide text-emerald-600 font-semibold mb-2">
                          🛏️ Bedrooms
                        </dt>
                        <dd className="text-3xl font-bold text-gray-900">{property.beds}</dd>
                      </div>
                      <div className="group rounded-2xl border border-gray-100 p-6 hover:border-teal-200 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-teal-50 to-cyan-50">
                        <dt className="flex items-center gap-2 text-xs uppercase tracking-wide text-teal-600 font-semibold mb-2">
                          🛁 Bathrooms
                        </dt>
                        <dd className="text-3xl font-bold text-gray-900">{property.baths}</dd>
                      </div>
                      <div className={`group rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-200 ${property.status === 'rent'
                          ? 'bg-gradient-to-br from-emerald-50 to-green-50 hover:border-emerald-200'
                          : 'bg-gradient-to-br from-orange-50 to-red-50 hover:border-orange-200'
                        }`}>
                        <dt className={`flex items-center gap-2 text-xs uppercase tracking-wide font-semibold mb-2 ${property.status === 'rent' ? 'text-emerald-600' : 'text-orange-600'
                          }`}>
                          🏷️ Status
                        </dt>
                        <dd className="text-3xl font-bold text-gray-900">{statusLabel}</dd>
                      </div>
                      <div className="group rounded-2xl border border-gray-100 p-6 hover:border-purple-200 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-purple-50 to-pink-50">
                        <dt className="flex items-center gap-2 text-xs uppercase tracking-wide text-purple-600 font-semibold mb-2">
                          💷 Monthly Rate
                        </dt>
                        <dd className="text-2xl font-bold text-gray-900">{currency(property.price)}</dd>
                      </div>
                    </dl>
                  </div>
                )}

                {activeTab === 'location' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                      Location & Transport
                    </h2>
                    <div className="grid gap-4">
                      <div className="p-6 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100">
                        <h4 className="font-semibold text-emerald-800 mb-2 flex items-center gap-2">
                          <LocationIcon />
                          Full Address
                        </h4>
                        <p className="text-gray-700 text-lg">{property.address}</p>
                      </div>
                      <div className="p-6 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100">
                        <h4 className="font-semibold text-blue-800 mb-2">🚇 Transport Links</h4>
                        <p className="text-gray-700">Perfectly positioned just seconds from West Harrow Underground Station and within easy walking distance of local shops.</p>
                      </div>
                      <div className="p-6 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100">
                        <h4 className="font-semibold text-purple-800 mb-2">🏢 Area</h4>
                        <p className="text-gray-700">{property.area} - A vibrant area with excellent amenities and transport connections.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* RIGHT SIDEBAR - Compact */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-8 space-y-6">
              {/* Enhanced Quick Contact & Pricing Card */}
              <div className="rounded-3xl border border-white/20 bg-white/95 backdrop-blur-lg p-6 shadow-2xl">
                {/* Price Section */}
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-1">
                    {currency(property.price)}
                    <span className="text-lg font-medium text-gray-600 ml-1">{property.priceUnit}</span>
                  </div>
                  <div className="text-gray-600 text-sm mb-4">Monthly Rate</div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200">
                      <div className="text-lg font-bold text-emerald-600 mb-1">🛏️</div>
                      <div className="text-xs text-emerald-600 font-medium">{property.beds} beds</div>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200">
                      <div className="text-lg font-bold text-teal-600 mb-1">🛁</div>
                      <div className="text-xs text-teal-600 font-medium">{property.baths} baths</div>
                    </div>
                    <div className={`text-center p-3 rounded-xl border ${property.status === 'rent'
                        ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
                        : 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200'
                      }`}>
                      <div className="text-lg font-bold mb-1">
                        {property.status === 'rent' ? '🏠' : '🏷️'}
                      </div>
                      <div className={`text-xs font-medium ${property.status === 'rent' ? 'text-green-600' : 'text-orange-600'
                        }`}>
                        {statusLabel}
                      </div>
                    </div>
                  </div>

                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-2 text-sm font-medium text-white shadow-lg">
                    <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                    Available
                  </span>
                </div>

                {/* Company Info */}
                <div className="text-center mb-6 pb-6 border-b border-gray-200">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl">
                    🏢
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Management Properties</h3>
                  <p className="text-sm text-gray-600">Your trusted property partner</p>
                </div>

                <div className="space-y-3">
                  <Link
                    to="/contact"
                    className="group relative inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 px-4 py-3 font-semibold text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105"
                  >
                    <span className="flex items-center gap-2 text-sm">
                      📅 Book Viewing
                    </span>
                  </Link>

                  <a
                    href="tel:+442076247665"
                    className="w-full inline-flex items-center justify-center rounded-2xl border-2 border-emerald-200 bg-emerald-50 px-4 py-3 font-semibold text-emerald-700 transition-all duration-300 hover:bg-emerald-100"
                  >
                    <span className="flex items-center justify-center gap-2 text-sm">
                      📞 Call Agent
                    </span>
                  </a>

                  <Link
                    to="/"
                    className="w-full inline-flex items-center justify-center rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 font-medium text-gray-600 transition-all duration-300 hover:border-gray-300 hover:bg-gray-50"
                  >
                    <span className="flex items-center gap-2 text-sm">
                      ← All Properties
                    </span>
                  </Link>
                </div>
              </div>

              {/* Enhanced Stats Card */}
              <div className="rounded-3xl border border-white/20 bg-white/95 backdrop-blur-lg p-6 shadow-xl">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  Additional Features
                </h3>

                <div className="space-y-4">
                  {(property.wifi || property.billsIncluded) && (
                    <div>
                      <div className="text-sm font-medium text-gray-900 mb-3">Included Features</div>
                      <div className="flex flex-wrap gap-2">
                        {property.wifi && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
                            📶 Wi-Fi
                          </span>
                        )}
                        {property.billsIncluded && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700 border border-yellow-200">
                            💡 Bills
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-100">
                    <div className="grid gap-3">
                      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100">
                        <div className="font-semibold text-emerald-800 mb-1 flex items-center gap-2">
                          <LocationIcon />
                          Full Address
                        </div>
                        <p className="text-gray-700 text-sm">{property.address}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-100">
                        <div className="font-semibold text-teal-800 mb-1">🏢 Area</div>
                        <p className="text-gray-700 text-sm">{property.area}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Similar Properties Teaser */}
              <div className="rounded-3xl border border-white/20 bg-gradient-to-br from-emerald-50 to-green-50 p-6 shadow-xl">
                <h3 className="text-lg font-bold text-emerald-800 mb-3 flex items-center gap-2">
                  <span className="text-2xl">🏘️</span>
                  Similar Properties
                </h3>
                <p className="text-sm text-emerald-700 mb-4">
                  Discover more properties in {property.area}
                </p>
                <Link
                  to={`/search?area=${encodeURIComponent(property.area)}`}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
                >
                  View Similar Properties
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}