'use client';

import { useState, useEffect } from 'react';
import ChaserDashboard from '@/components/ChaserDashboard';
import SettingsDropdown from '@/components/SettingsDropdown';
import Link from 'next/link';
import Image from 'next/image';
import { Chaser } from '@/types/chaser';

export default function DashboardPage() {
  const [chasers, setChasers] = useState<Chaser[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch chasers from database via API
  useEffect(() => {
    fetchChasers();
  }, []);

  async function fetchChasers() {
    try {
      setLoading(true);
      console.log('📡 Fetching chasers from database...');
      
      const response = await fetch('/api/chasers');
      const data = await response.json();
      
      console.log(`📊 Received ${data.chasers.length} chasers from API`);
      
      // Convert backend format to frontend format (include schedule data)
      const formattedChasers: any[] = data.chasers.map((c: any) => ({
        id: c.id,
        docType: c.documents,
        urgency: c.urgency,
        medium: 'Email' as any,
        user: {
          id: c.customer?.id || c.id,
          name: c.customer?.name || c.contactName,
          email: c.customer?.email || c.contactEmail || 'N/A',
          phone: c.customer?.phone || c.contactPhone || 'N/A',
          company: c.customer?.company || 'N/A'
        },
        createdAt: new Date(c.createdAt),
        status: c.status as any,
        schedule: c.schedule || [] // Include schedule data
      }));
      
      setChasers(formattedChasers);
      console.log(`✅ Dashboard loaded with ${formattedChasers.length} chasers`);
    } catch (error) {
      console.error('❌ Error fetching chasers:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteChaser(id: string) {
    try {
      console.log(`🗑️ Deleting chaser ${id}...`);
      
      const response = await fetch(`/api/chasers/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        console.log(`✅ Deleted chaser ${id}`);
        // Refresh the list from database
        await fetchChasers();
      } else {
        console.error('Failed to delete chaser');
      }
    } catch (error) {
      console.error('Error deleting chaser:', error);
    }
  }

  return (
    <div className="font-sans min-h-screen bg-background">
      <div className="min-h-screen p-6 sm:p-10 lg:p-16">
        {/* Header with Settings Icon */}
        <header className="max-w-7xl mx-auto mb-12 relative">
          <div className="absolute top-0 right-0 z-10">
            <SettingsDropdown />
          </div>
          
          <div className="bg-card-bg rounded-2xl p-8 shadow-xl border border-warm-pink">
            <div className="flex items-center gap-4 mb-6">
              <Image 
                src="/Favicon.png" 
                alt="Chasey" 
                width={80}
                height={80}
                priority
                className="rounded-xl"
              />
              <h1 className="text-5xl sm:text-7xl font-bold text-white">
                Chasey AI
              </h1>
            </div>
            <p className="text-lg text-white">
              Stop chasing clients for documents. Let AI do it for you
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
            {loading ? (
              <div className="text-center py-12">
                <p className="text-warm-pink text-xl animate-pulse">
                  Loading chasers from database...
                </p>
              </div>
            ) : (
              <ChaserDashboard chasers={chasers} onDelete={deleteChaser} />
            )}
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

