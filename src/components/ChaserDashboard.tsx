'use client';

import { useState } from 'react';
import { Chaser } from '@/types/chaser';
import ChaserSchedule from './ChaserSchedule';

interface ChaserDashboardProps {
  chasers: any[]; // Extended to include schedule
  onDelete: (id: string) => void;
}

export default function ChaserDashboard({ chasers, onDelete }: ChaserDashboardProps) {
  const [expandedDocs, setExpandedDocs] = useState<{ [key: string]: boolean }>({});
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
            className="bg-soft-pink rounded-xl p-3 border-2 border-warm-pink shadow-lg hover:shadow-xl transition-all"
          >
            {/* Header with stickers and Delete Button */}
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(chaser.status)} animate-pulse`}></div>
                <h3 className="text-lg font-bold text-foreground">{chaser.name || chaser.task || 'Unnamed Chaser'}</h3>
                <span className="text-lg">{getMediumIcon(chaser.medium)}</span>
              </div>
              
              {/* Simple X Delete Button */}
              <button
                onClick={() => onDelete(chaser.id)}
                className="w-6 h-6 rounded-full bg-foreground/10 hover:bg-foreground/20 transition-colors flex items-center justify-center text-foreground/60 hover:text-foreground group -mr-2 -mt-2"
                title="Delete chaser"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Chaser Details */}
            <div className="space-y-1 text-sm mb-2">
              <p className="text-foreground">
                <span className="font-semibold">Who:</span> {chaser.contactName || chaser.user?.name || chaser.who}
              </p>
              <p className="text-foreground">
                <span className="font-semibold">Due:</span> {chaser.urgency?.replace('Due: ', '') || chaser.dueDate}
              </p>
              <p className="text-xs text-foreground/60">
                Created: {new Date(chaser.createdAt).toLocaleDateString()} {new Date(chaser.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {/* Document Items - Collapsible */}
            {chaser.documentItems && chaser.documentItems.length > 0 && (
              <div className="mt-1 pt-1 border-t border-warm-pink/30">
                <button
                  onClick={() => setExpandedDocs(prev => ({ ...prev, [chaser.id]: !prev[chaser.id] }))}
                  className="w-full flex items-center justify-between p-1 rounded hover:bg-warm-pink/10 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <svg
                      className={`w-4 h-4 text-warm-pink transition-transform ${
                        expandedDocs[chaser.id] ? 'rotate-90' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <h4 className="text-xs font-semibold text-foreground">
                      📋 Documents Tracking ({chaser.documentItems.length})
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-foreground/60">
                      {chaser.documentItems.filter((d: any) => d.status === 'received').length} received • {chaser.documentItems.filter((d: any) => d.status === 'pending').length} pending
                    </span>
                  </div>
                </button>
                
                {expandedDocs[chaser.id] && (
                  <div className="space-y-1 mt-1">
                    {chaser.documentItems
                      .sort((a: any, b: any) => a.order - b.order)
                      .map((doc: any) => (
                      <div
                        key={doc.id}
                        className="flex items-start justify-between gap-2 p-1 rounded bg-card-bg border border-warm-pink/20 hover:border-warm-pink/40 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-medium text-foreground truncate">
                              {doc.name}
                            </span>
                          </div>
                          {doc.notes && (
                            <p className="text-xs text-foreground/60 line-clamp-1">
                              {doc.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          {doc.status === 'pending' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-warm-yellow/20 text-warm-yellow border border-warm-yellow">
                              ⏳
                            </span>
                          )}
                          {doc.status === 'received' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500">
                              ✅
                            </span>
                          )}
                          {doc.status === 'altered' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500">
                              📝
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

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

