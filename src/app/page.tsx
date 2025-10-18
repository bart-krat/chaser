'use client';

import { useState, useEffect } from 'react';
import ChaserForm from '@/components/ChaserForm';
import ChaserDashboard from '@/components/ChaserDashboard';
import SettingsDropdown from '@/components/SettingsDropdown';
import Image from 'next/image';
import { Chaser } from '@/types/chaser';

export default function Home() {
  const [chasers, setChasers] = useState<Chaser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      
      console.log('📊 API Response:', data);
      
      if (!data.chasers) {
        console.error('❌ No chasers array in response:', data);
        setChasers([]);
        return;
      }
      
      console.log(`📊 Received ${data.chasers.length} chasers from API`);
      
      // Debug: Log first chaser's name field
      if (data.chasers.length > 0) {
        console.log('🔍 First chaser from API:', {
          id: data.chasers[0].id,
          name: data.chasers[0].name,
          contactName: data.chasers[0].contactName,
          who: data.chasers[0].who
        });
      }
      
      // Convert backend format to frontend format (include schedule data + documentItems)
      const formattedChasers: any[] = data.chasers.map((c: any) => ({
        id: c.id,
        name: c.name, // ← ADDED: Include the chaser name!
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
        schedule: c.schedule || [],
        documentItems: c.documentItems || []
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
        await fetchChasers();
      } else {
        console.error('Failed to delete chaser');
      }
    } catch (error) {
      console.error('Error deleting chaser:', error);
    }
  }

  const handleCreateChaser = async (formData: any) => {
    try {
      // Call the API to create chaser with full backend scheduling
      const response = await fetch('/api/chasers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.customData.name,
          documents: formData.customData.documents,
          who: formData.customData.who,
          dueDate: formData.customData.dueDate,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create chaser');
      }

      const result = await response.json();
      console.log('Chaser created:', result);

      // Close modal and refresh dashboard
      setIsModalOpen(false);
      await fetchChasers();
      
    } catch (error) {
      console.error('Error creating chaser:', error);
      alert('Failed to create chaser. Please try again.');
    }
  };

  return (
    <div className="font-sans min-h-screen bg-background">
      <div className="min-h-screen p-6 sm:p-10 lg:p-16">
        {/* Header with Settings Icon */}
        <header className="max-w-7xl mx-auto mb-8 relative">
          <div className="absolute top-0 right-0 z-10">
            <SettingsDropdown />
          </div>
          
          <div className="bg-soft-pink rounded-2xl p-8 shadow-xl border-2 border-warm-pink">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Image 
                  src="/chasey-new.png" 
                  alt="Chasey" 
                  width={180}
                  height={180}
                  priority
                  className="rounded-xl shadow-xl"
                />
                <h1 className="text-5xl sm:text-7xl font-bold text-white">
                  Chasey AI
                </h1>
              </div>
              
              {/* Call Chasey Button - Right Aligned */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-warm-pink/10 text-warm-pink font-bold text-lg shadow-lg hover:bg-warm-pink/20 transition-all border-2 border-warm-pink hover:scale-105"
              >
                <span className="text-2xl">🐕</span>
                Call Chasey
              </button>
            </div>
            <p className="text-lg text-white">
              Stop chasing clients for documents. Let AI do it for you
            </p>
          </div>
        </header>

        {/* Dashboard */}
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-warm-pink border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-foreground">Loading chasers...</p>
            </div>
          ) : (
            <ChaserDashboard chasers={chasers} onDelete={deleteChaser} />
          )}
        </div>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto mt-12 text-center text-foreground/50 text-sm">
          <p>Built with Next.js, TypeScript & Tailwind CSS</p>
        </footer>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-card-bg rounded-2xl p-8 shadow-2xl border-2 border-warm-pink max-w-7xl w-full max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-soft-pink hover:bg-warm-pink/20 transition-colors flex items-center justify-center text-foreground"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Form Header */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">
                Start Document Request
              </h2>
              <p className="text-foreground/70">
                Fill in the details to get Chasey AI to fetch those documents for you
              </p>
            </div>

            {/* Form */}
            <ChaserForm onSubmit={handleCreateChaser} />
          </div>
        </div>
      )}
    </div>
  );
}
