'use client';

import { Chaser } from '@/types/chaser';
import ChaserSchedule from './ChaserSchedule';

interface ChaserDashboardProps {
  chasers: any[]; // Extended to include schedule
  onDelete: (id: string) => void;
}

export default function ChaserDashboard({ chasers, onDelete }: ChaserDashboardProps) {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'High':
        return 'bg-red-500/20 text-red-400 border-red-500';
      case 'Medium':
        return 'bg-warm-yellow/20 text-warm-yellow border-warm-yellow';
      case 'Low':
        return 'bg-green-500/20 text-green-400 border-green-500';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };

  const getMediumIcon = (medium: string) => {
    switch (medium) {
      case 'Email':
        return '📧';
      case 'Whatsapp':
        return '💬';
      case 'Call':
        return '📞';
      case 'Hybrid':
        return '🔄';
      default:
        return '📨';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'sent':
        return 'bg-warm-yellow';
      case 'pending':
        return 'bg-warm-pink';
      default:
        return 'bg-gray-400';
    }
  };

  if (chasers.length === 0) {
    return (
      <div className="text-center py-12 bg-soft-pink rounded-2xl border-2 border-dashed border-warm-pink">
        <p className="text-xl text-foreground mb-2">No active chasers yet</p>
        <p className="text-sm text-foreground/70">Create your first chaser above to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4 text-warm-pink">
        Active Chasers ({chasers.length})
      </h2>
      
      <div className="grid gap-4">
        {chasers.map((chaser) => (
          <div
            key={chaser.id}
            className="bg-soft-pink rounded-xl p-6 border-2 border-warm-pink shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              {/* Left Section */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(chaser.status)} animate-pulse`}></div>
                  <h3 className="text-xl font-bold text-foreground">{chaser.user.name}</h3>
                  <span className="text-2xl">{getMediumIcon(chaser.medium)}</span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <p className="text-foreground">
                    <span className="font-semibold">Document:</span> {chaser.docType}
                  </p>
                  <p className="text-foreground">
                    <span className="font-semibold">Urgency:</span> {chaser.urgency}
                  </p>
                </div>
              </div>

              {/* Right Section */}
              <div className="flex flex-col gap-3 sm:items-end justify-between">
                <span className="text-xs text-foreground/60">
                  {new Date(chaser.createdAt).toLocaleDateString()} {new Date(chaser.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                
                <button
                  onClick={() => onDelete(chaser.id)}
                  className="px-4 py-2 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all font-medium text-sm border border-red-500"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Schedule Display */}
            {chaser.schedule && chaser.schedule.length > 0 && (
              <ChaserSchedule 
                schedule={chaser.schedule} 
                chaserUrgency={chaser.urgency}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

