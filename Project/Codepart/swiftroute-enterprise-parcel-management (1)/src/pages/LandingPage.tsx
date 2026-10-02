import React, { useState } from 'react';
import { 
  Search, 
  Truck, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Package, 
  ArrowRight, 
  CheckCircle2, 
  Calculator, 
  Globe2, 
  Award,
  Zap,
  Building2,
  Lock,
  Sparkles,
  BarChart3,
  Check,
  ChevronRight,
  Send,
  Boxes
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import { TrackingTimeline } from '../components/common/TrackingTimeline';
import { InvoiceModal } from '../components/common/InvoiceModal';
import { AnimatedCounter } from '../components/common/AnimatedCounter';

interface LandingPageProps {
  onNavigateToAuth: () => void;
  onNavigateToDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToAuth, onNavigateToDashboard }) => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedInvoiceParcelId, setSelectedInvoiceParcelId] = useState<string | null>(null);

  // Rate calculator state
  const [calcWeight, setCalcWeight] = useState<number>(3.5);
  const [calcType, setCalcType] = useState<string>('express');
  const [calcDistance, setCalcDistance] = useState<number>(350);

  const handleTrackSubmit = async (e?: React.FormEvent, customNumber?: string) => {
    if (e) e.preventDefault();
    const query = (customNumber || trackingNumber).trim();
    if (!query) return;

    setIsSearching(true);
    setSearchError(null);
    setTrackingResult(null);

    try {
      const res = await api.trackParcel(query);
      setTrackingResult(res.data);
    } catch (err: any) {
      setSearchError(err.message || 'Consignment not found in active telemetry hubs');
    } finally {
      setIsSearching(false);
    }
  };

  const calculatedEstimate = () => {
    let base = calcWeight * 7.8;
    const distanceFactor = (calcDistance / 100) * 1.5;
    let surcharge = 0;
    if (calcType === 'express') surcharge = 15.0;
    if (calcType === 'fragile') surcharge = 8.5;
    if (calcType === 'heavy') surcharge = 22.0;

    const total = base + distanceFactor + surcharge;
    return Math.round(total * 100) / 100;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-20 pb-28 border-b border-slate-800">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#3b82f6_1.5px,transparent_1.5px)] [background-size:24px_24px]" />
        
        {/* Soft atmospheric gradient orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold uppercase tracking-wider backdrop-blur-md"
            >
              <Zap className="w-3.5 h-3.5" />
              Next-Gen Enterprise Logistics Infrastructure
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight"
            >
              Precision Parcel & Freight Management
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed"
            >
              Unified cloud telemetry for courier fleets, distribution hubs, and recipients. Real-time GPS check-ins, automated e-POD signatures, and itemized freight settlement.
            </motion.p>

            {/* Public Tracking Input Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="pt-4 max-w-2xl mx-auto"
            >
              <form onSubmit={handleTrackSubmit} className="bg-slate-900/90 backdrop-blur-xl p-2.5 rounded-2xl border border-slate-700/80 shadow-2xl flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter Consignment # (e.g. SR-2026CA-892104)"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-400 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  {isSearching ? 'Querying Hubs...' : 'Track Consignment'}
                </button>
              </form>

              {/* Sample Live Tracking Chips */}
              <div className="mt-4 flex items-center justify-center flex-wrap gap-2 text-xs text-slate-400">
                <span>Demo tracking samples:</span>
                <button
                  type="button"
                  onClick={() => {
                    setTrackingNumber('SR-2026CA-892104');
                    handleTrackSubmit(undefined, 'SR-2026CA-892104');
                  }}
                  className="font-mono font-semibold text-blue-400 hover:text-blue-300 underline cursor-pointer"
                >
                  SR-2026CA-892104 (Out for Delivery)
                </button>
                <span className="text-slate-600">•</span>
                <button
                  type="button"
                  onClick={() => {
                    setTrackingNumber('SR-2026TX-654321');
                    handleTrackSubmit(undefined, 'SR-2026TX-654321');
                  }}
                  className="font-mono font-semibold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                >
                  SR-2026TX-654321 (Delivered with e-POD)
                </button>
              </div>

              {searchError && (
                <div className="mt-4 p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs text-left">
                  {searchError}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Real-time Tracking Result View (when searched) */}
      <AnimatePresence>
        {trackingResult && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 mb-20 relative z-20"
          >
            <div className="flex items-center justify-between mb-3 bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live Freight Telemetry Session
              </span>
              <button
                onClick={() => setTrackingResult(null)}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold"
              >
                Close View ✕
              </button>
            </div>
            <TrackingTimeline
              parcel={trackingResult.parcel}
              tracking={trackingResult.tracking}
              proof={trackingResult.proof}
              onViewInvoice={(id) => setSelectedInvoiceParcelId(id)}
            />
          </motion.section>
        )}
      </AnimatePresence>

      {/* Metrics Bar with Animated Counters */}
      <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 py-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-black text-blue-600 dark:text-blue-400 font-mono">
                <AnimatedCounter value={99.8} decimals={1} suffix="%" />
              </div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1 block">
                On-Time SLA Guarantee
              </span>
            </div>
            <div>
              <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                <AnimatedCounter value={2400000} duration={1200} prefix="+" suffix=" pkg" />
              </div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1 block">
                Consignments Delivered
              </span>
            </div>
            <div>
              <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                <AnimatedCounter value={142} suffix=" hubs" />
              </div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1 block">
                Distribution Facilities
              </span>
            </div>
            <div>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                <AnimatedCounter value={100} suffix="%" />
              </div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1 block">
                Electronic Signatures Verified
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Key Capabilities */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Enterprise Standard
          </span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Engineered for Modern Logistics Fleets
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Built from the ground up for courier providers, delivery drivers, and customers requiring complete operational clarity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Automated Route Dispatch</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Administrators dynamically assign shipments to courier agents based on regional sorting facilities, route density, and real-time workload balancing.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Verified Proof of Delivery (e-POD)</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Delivery couriers capture digital recipient signatures, door delivery photo records, and time-stamped handover credentials directly in the field.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Commercial Invoicing & Settlement</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Automated freight calculation with itemized line items, express air surcharges, regulatory taxes, and printable audit-ready PDF invoices.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Logistics Rate Estimator & Portal Access */}
      <section className="bg-white dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800 py-20 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Rate Calculator */}
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                Rate Calculator
              </span>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                Instant Freight Estimation
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 mb-6">
                Calculate shipping fees upfront before dispatch. Our system automatically applies base weight rates, transport distances, and service tier handling.
              </p>

              <div className="space-y-5 bg-slate-50 dark:bg-slate-800/50 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800">
                {/* Weight slider */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    <span>Consignment Weight</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{calcWeight} kg</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="50"
                    step="0.5"
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>0.5 kg (Document / Pouch)</span>
                    <span>50 kg (Heavy Pallet)</span>
                  </div>
                </div>

                {/* Distance slider */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    <span>Transit Distance</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{calcDistance} miles</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="2000"
                    step="20"
                    value={calcDistance}
                    onChange={(e) => setCalcDistance(parseInt(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Intra-city (20 mi)</span>
                    <span>Cross-country (2000 mi)</span>
                  </div>
                </div>

                {/* Tier Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Service Level Agreement (SLA)
                  </label>
                  <select
                    value={calcType}
                    onChange={(e) => setCalcType(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="standard">Standard Ground Freight (Base Rate)</option>
                    <option value="express">Express Priority Air (+ $15.00)</option>
                    <option value="fragile">Fragile / High-Care Handling (+ $8.50)</option>
                    <option value="heavy">Heavy Cargo & Pallet Handling (+ $22.00)</option>
                  </select>
                </div>

                {/* Total box */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Estimated Shipping Fee:
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Itemized freight based on SLA parameters
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-blue-600 dark:text-blue-400 font-mono">
                      ${calculatedEstimate()}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">USD NET</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Portal Overview Card */}
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-8 sm:p-10 rounded-3xl text-white shadow-2xl space-y-6 border border-slate-800">
              <h3 className="text-2xl font-black tracking-tight text-white">
                Logistics Role Consoles
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                SwiftRoute provides role-segregated portals tailored to every logistics stakeholder with specialized telemetry:
              </p>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Shipper & Customer Portal</h4>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Book new shipments, inspect tracking telemetry, download commercial invoices, and pay online.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Courier & Agent Mobile Console</h4>
                    <p className="text-slate-400 text-xs mt-0.5">
                      View assigned delivery manifests, update status at checkpoints, and record recipient signature proofs.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Hub Operations & Fleet Dispatch</h4>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Dispatch consignments, audit tracking logs, manage agent fleets, and monitor revenue analytics.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onNavigateToAuth}
                  className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                >
                  <span>Sign In to Your Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Invoice Viewer Modal */}
      {selectedInvoiceParcelId && (
        <InvoiceModal
          parcelId={selectedInvoiceParcelId}
          onClose={() => setSelectedInvoiceParcelId(null)}
        />
      )}
    </div>
  );
};
