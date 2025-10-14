'use client';

import ChaserDashboard from '@/components/ChaserDashboard';
import SettingsDropdown from '@/components/SettingsDropdown';
import Link from 'next/link';
import { useChasers } from '@/context/ChaserContext';

export default function DashboardPage() {
  const { chasers, deleteChaser } = useChasers();

  return (
    <div className="font-sans min-h-screen bg-background">
      <div className="min-h-screen p-6 sm:p-10 lg:p-16">
        {/* Header with Settings Icon */}
        <header className="max-w-7xl mx-auto mb-12 relative">
          <div className="absolute top-0 right-0 z-10">
            <SettingsDropdown />
          </div>
          
          <div className="bg-card-bg rounded-2xl p-8 shadow-xl border border-warm-pink">
            <h1 className="text-4xl sm:text-6xl font-bold mb-4 text-warm-pink">
              📊 Dashboard
            </h1>
            <p className="text-lg text-foreground">
              Monitor all your active chasers
            </p>
          </div>
        </header>

        <div className="max-w-7xl mx-auto">
          {/* Back to Create Button */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-soft-pink border-2 border-warm-pink text-foreground hover:bg-warm-pink/20 transition-all font-semibold"
            >
              ← Create New Chaser
            </Link>
          </div>

          {/* Dashboard */}
          <div className="bg-card-bg rounded-2xl p-8 shadow-xl border border-warm-pink">
            <ChaserDashboard chasers={chasers} onDelete={deleteChaser} />
          </div>
        </div>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto mt-12 text-center text-foreground/50 text-sm">
          <p>Built with Next.js, TypeScript & Tailwind CSS</p>
        </footer>
      </div>
    </div>
  );
}

