'use client';

import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CookieBanner from '@/components/CookieBanner';
import AnalyticsTracker from '@/components/AnalyticsTracker';

export default function SiteLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />
      <main className="flex-grow flex flex-col">{children}</main>
      <Footer />
      <CookieBanner />
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
    </div>
  );
}

