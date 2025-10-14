import SettingsDropdown from '@/components/SettingsDropdown';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
              ⚙️ Settings
            </h1>
            <p className="text-lg text-foreground">
              Configure your Chaser Agent preferences
            </p>
          </div>
        </header>

        <main className="max-w-7xl mx-auto">
          {children}
        </main>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto mt-12 text-center text-foreground/50 text-sm">
          <p>Built with Next.js, TypeScript & Tailwind CSS</p>
        </footer>
      </div>
    </div>
  );
}

