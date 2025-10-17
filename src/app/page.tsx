'use client';

import ChaserForm from '@/components/ChaserForm';
import SettingsDropdown from '@/components/SettingsDropdown';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useChasers } from '@/context/ChaserContext';
import { Chaser } from '@/types/chaser';

export default function Home() {
  const router = useRouter();
  const { addChaser } = useChasers();

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

      // Create a simplified chaser for the frontend display
      const customUser = {
        id: result.chaser.id,
        name: formData.customData.who,
        email: 'N/A',
        phone: 'N/A',
        company: 'N/A'
      };

      const newChaser: Chaser = {
        id: result.chaser.id,
        docType: formData.customData.documents as any,
        urgency: formData.customData.urgency as any,
        medium: 'Email' as any,
        user: customUser,
        createdAt: new Date(result.chaser.createdAt),
        status: 'pending',
      };

      addChaser(newChaser);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating chaser:', error);
      alert('Failed to create chaser. Please try again.');
    }
  };

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

        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {/* Form Card */}
            <div className="bg-card-bg rounded-2xl p-8 shadow-xl border border-warm-pink">
              <h2 className="text-2xl font-bold mb-6 text-white">
                Go Get Chasey to Fetch
              </h2>
              <ChaserForm onSubmit={handleCreateChaser} />
            </div>

            {/* Navigation */}
            <div className="flex justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-soft-pink border-2 border-warm-pink text-foreground hover:bg-warm-pink/20 transition-all font-semibold"
              >
                View Dashboard →
              </Link>
            </div>

            {/* Info Card */}
            <div className="bg-soft-pink rounded-2xl p-6 border border-warm-pink">
              <h3 className="font-bold text-foreground mb-3">💡 How it works</h3>
              <ul className="space-y-2 text-sm text-foreground/90">
                <li>✅ Enter the task description</li>
                <li>✅ Specify which documents you need</li>
                <li>✅ Add who should be chased</li>
                <li>✅ Set the urgency level</li>
                <li>✅ Watch as automated outreach begins!</li>
              </ul>
            </div>
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
