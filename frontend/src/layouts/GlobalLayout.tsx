import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { MarketTicker } from '@/pages/home/components/MarketTicker';
import { GlobalNavbar } from '@/components/organisms/GlobalNavbar/GlobalNavbar';

// Routes that manage their own full-height layout (no padding wrapper)
const FULL_BLEED_ROUTES = ['/aihub', '/regulatory'];
// Routes that are purely content pages (need standard padding)
const CONTENT_ROUTES = ['/dashboard', '/portfolio', '/regulatory', '/upload', '/settings'];

export function GlobalLayout() {
  const location = useLocation();
  const isFullBleed = FULL_BLEED_ROUTES.includes(location.pathname);
  const isContentRoute = CONTENT_ROUTES.includes(location.pathname);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 selection:bg-blue-600/10">
      {/* ── Persistent Live Market Ticker (z-60) ── */}
      <MarketTicker />

      {/* ── Persistent Premium Global Navbar (z-50) ── */}
      <GlobalNavbar />

      {/* ── Dynamic Content Area ─────────────────── */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="w-full"
        >
          {isFullBleed ? (
            // Full-bleed: no padding, page controls its own height
            <Outlet />
          ) : isContentRoute ? (
            // Internal dashboard pages: standard padded container
            <div className="max-w-[1600px] mx-auto px-6 py-8 min-h-[calc(100vh-105px)]">
              <Outlet />
            </div>
          ) : (
            // Landing page + other public routes: no padding (they manage their own)
            <Outlet />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
