'use client';

import ChaserForm from '@/components/ChaserForm';
import SettingsDropdown from '@/components/SettingsDropdown';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useChasers } from '@/context/ChaserContext';
import { Chaser } from '@/types/chaser';

export default function Home() {
  const router = useRouter();
  const { addChaser } = useChasers();

  const handleCreateChaser = (formData: any) => {
    // Create a user object from the "who" field
    const customUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.customData.who,
      email: 'N/A',
      phone: 'N/A',
      company: 'N/A'
    };

    const newChaser: Chaser = {
      id: Math.random().toString(36).substr(2, 9),
      docType: formData.customData.documents as any,
      urgency: formData.customData.urgency as any,
      medium: 'Email' as any,
      user: customUser,
      createdAt: new Date(),
      status: 'pending',
    };

    addChaser(newChaser);
    
    // Redirect to dashboard
    router.push('/dashboard');
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
            <h1 className="text-4xl sm:text-6xl font-bold mb-4 text-warm-pink">
              🎯 Chaser Agent
            </h1>
            <p className="text-lg text-foreground">
              Automate document requests with intelligent follow-ups
            </p>
          </div>
        </header>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {/* Form Card */}
            <div className="bg-card-bg rounded-2xl p-8 shadow-xl border border-warm-pink">
              <h2 className="text-2xl font-bold mb-6 text-warm-pink">
                Create New Chaser
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
