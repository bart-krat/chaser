'use client';

import { useState } from 'react';

interface ScheduleItem {
  id: string;
  attemptNumber: number;
  medium: string;
  scheduledFor: Date;
  status: string;
  content: string;
  sentAt: Date | null;
}

interface ChaserScheduleProps {
  schedule: ScheduleItem[];
  chaserUrgency: string;
}

export default function ChaserSchedule({ schedule, chaserUrgency }: ChaserScheduleProps) {
  const [isScheduleExpanded, setIsScheduleExpanded] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedEmail, setSelectedEmail] = useState<ScheduleItem | null>(null);

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return '✅';
      case 'delivered':
        return '📬';
      case 'pending':
        return '⏰';
      case 'failed':
        return '❌';
      default:
        return '📧';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return 'text-green-400 bg-green-500/20 border-green-500';
      case 'pending':
        return 'text-warm-yellow bg-warm-yellow/20 border-warm-yellow';
      case 'failed':
        return 'text-red-400 bg-red-500/20 border-red-500';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500';
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (scheduledFor: Date, status: string) => {
    return status === 'pending' && new Date(scheduledFor) < new Date();
  };

  const sentCount = schedule.filter(s => s.status === 'sent').length;
  const pendingCount = schedule.filter(s => s.status === 'pending').length;

  return (
    <div className="mt-1 pt-1 border-t border-warm-pink/30">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsScheduleExpanded(!isScheduleExpanded)}
        className="w-full flex items-center justify-between p-1 rounded hover:bg-warm-pink/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg
            className={`w-4 h-4 text-warm-pink transition-transform ${
              isScheduleExpanded ? 'rotate-90' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <h4 className="text-xs font-semibold text-foreground">
            📅 Activity Log ({schedule.length} emails)
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-foreground/60">
            ✅ {sentCount} sent • ⏰ {pendingCount} pending
          </span>
        </div>
      </button>

      {/* Schedule Items (Collapsible) */}
      {isScheduleExpanded && (
        <div className="space-y-1 mt-1">
        {schedule.map((item) => (
          <div key={item.id} className="bg-soft-pink/50 rounded border border-warm-pink/20">
            <button
              onClick={() => toggleExpand(item.id)}
              className="w-full text-left p-1 hover:bg-warm-pink/10 transition-colors rounded"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getStatusIcon(item.status)}</span>
                  <div>
                    <p className="font-semibold text-foreground text-xs">
                      Attempt {item.attemptNumber}
                    </p>
                    <p className="text-xs text-foreground/70">
                      {item.status === 'sent' && item.sentAt ? (
                        <>Sent: {formatDate(item.sentAt)}</>
                      ) : (
                        <>
                          Scheduled: {formatDate(item.scheduledFor)}
                          {isOverdue(item.scheduledFor, item.status) && (
                            <span className="ml-2 text-red-400">⚠️ Overdue</span>
                          )}
                        </>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                  <svg
                    className={`w-4 h-4 text-warm-pink transition-transform ${
                      expandedItems.has(item.id) ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Expanded Content */}
            {expandedItems.has(item.id) && (
              <div className="px-3 pb-3 space-y-2">
                <div className="bg-card-bg rounded-lg p-3 border border-warm-pink/20">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-warm-pink">Email Preview</p>
                    <button
                      onClick={() => setSelectedEmail(item)}
                      className="text-xs text-warm-yellow hover:text-warm-pink transition-colors"
                    >
                      View Full Email →
                    </button>
                  </div>
                  <p className="text-xs text-foreground/80 line-clamp-3 whitespace-pre-wrap">
                    {item.content}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
        </div>
      )}

      {/* Email Preview Modal */}
      {selectedEmail && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedEmail(null)}
        >
          <div
            className="bg-card-bg rounded-2xl border-2 border-warm-pink max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-soft-pink border-b border-warm-pink p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-warm-pink">
                    Attempt {selectedEmail.attemptNumber} - Email Preview
                  </h3>
                  <p className="text-sm text-foreground/70 mt-1">
                    {selectedEmail.status === 'sent' && selectedEmail.sentAt
                      ? `Sent: ${formatDate(selectedEmail.sentAt)}`
                      : `Scheduled: ${formatDate(selectedEmail.scheduledFor)}`}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="p-2 hover:bg-warm-pink/20 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-soft-pink rounded-lg p-4 border border-warm-pink/20">
                <pre className="text-sm text-foreground whitespace-pre-wrap font-sans">
                  {selectedEmail.content}
                </pre>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(selectedEmail.status)}`}>
                  {getStatusIcon(selectedEmail.status)} {selectedEmail.status.toUpperCase()}
                </span>
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="px-4 py-2 rounded-full bg-warm-pink text-background font-semibold hover:bg-accent-coral transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

