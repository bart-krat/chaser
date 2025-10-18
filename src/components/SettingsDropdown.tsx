'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function SettingsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-foreground/60 hover:text-foreground transition-colors"
        aria-label="Settings"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-card-bg rounded-xl shadow-2xl border-2 border-warm-pink overflow-hidden z-50">
          <div className="p-3 bg-soft-pink border-b border-warm-pink">
            <h3 className="text-warm-pink font-bold text-sm">⚙️ Settings</h3>
          </div>
          
          <div className="p-2">
            <Link
              href="/settings/urgency"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-warm-pink/20 transition-colors group"
            >
              <span className="text-2xl">🚨</span>
              <div>
                <p className="font-semibold text-foreground group-hover:text-warm-pink transition-colors">
                  Urgency Settings
                </p>
                <p className="text-xs text-foreground/60">
                  Configure urgency levels
                </p>
              </div>
            </Link>

            <Link
              href="/settings/medium"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-warm-yellow/20 transition-colors group"
            >
              <span className="text-2xl">📱</span>
              <div>
                <p className="font-semibold text-foreground group-hover:text-warm-yellow transition-colors">
                  Medium Settings
                </p>
                <p className="text-xs text-foreground/60">
                  Configure communication channels
                </p>
              </div>
            </Link>

            <div className="border-t border-warm-pink/30 my-2"></div>

            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-soft-pink transition-colors group"
            >
              <span className="text-2xl">🏠</span>
              <div>
                <p className="font-semibold text-foreground group-hover:text-accent-coral transition-colors">
                  Home / Dashboard
                </p>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

