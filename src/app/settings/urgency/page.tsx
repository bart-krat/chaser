'use client';

import { useState } from 'react';

interface UrgencyConfig {
  level: string;
  color: string;
  description: string;
  followUpDays: number;
  reminderFrequency: string;
  enabled: boolean;
}

export default function UrgencySettingsPage() {
  const [urgencyConfigs, setUrgencyConfigs] = useState<UrgencyConfig[]>([
    {
      level: 'Low',
      color: '#10b981',
      description: 'Non-critical documents with flexible deadlines',
      followUpDays: 7,
      reminderFrequency: 'Weekly',
      enabled: true,
    },
    {
      level: 'Medium',
      color: '#FFD166',
      description: 'Important documents requiring timely response',
      followUpDays: 3,
      reminderFrequency: 'Every 3 days',
      enabled: true,
    },
    {
      level: 'High',
      color: '#FF6B9D',
      description: 'Critical documents needing immediate attention',
      followUpDays: 1,
      reminderFrequency: 'Daily',
      enabled: true,
    },
  ]);

  const handleToggle = (index: number) => {
    const updated = [...urgencyConfigs];
    updated[index].enabled = !updated[index].enabled;
    setUrgencyConfigs(updated);
  };

  const handleFollowUpChange = (index: number, value: number) => {
    const updated = [...urgencyConfigs];
    updated[index].followUpDays = value;
    setUrgencyConfigs(updated);
  };

  const handleDescriptionChange = (index: number, value: string) => {
    const updated = [...urgencyConfigs];
    updated[index].description = value;
    setUrgencyConfigs(updated);
  };

  return (
    <div className="space-y-6">
      <div className="bg-card-bg rounded-2xl p-8 shadow-xl border border-warm-pink">
        <h2 className="text-3xl font-bold mb-2 text-warm-pink">
          🚨 Urgency Level Configuration
        </h2>
        <p className="text-foreground mb-8">
          Customize how each urgency level behaves and when follow-ups are triggered
        </p>

        <div className="space-y-6">
          {urgencyConfigs.map((config, index) => (
            <div
              key={config.level}
              className="bg-soft-pink rounded-xl p-6 border-2 border-warm-pink/30 hover:border-warm-pink transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full shadow-lg"
                    style={{ backgroundColor: config.color }}
                  ></div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">{config.level}</h3>
                    <p className="text-sm text-foreground/60">{config.reminderFrequency} reminders</p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleToggle(index)}
                  className={`px-6 py-2 rounded-full font-semibold transition-all border-2 ${
                    config.enabled
                      ? 'bg-warm-pink border-warm-pink text-background shadow-lg'
                      : 'bg-soft-pink border-gray-600 text-gray-400'
                  }`}
                >
                  {config.enabled ? '✓ Enabled' : 'Disabled'}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={config.description}
                    onChange={(e) => handleDescriptionChange(index, e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-warm-pink bg-card-bg text-foreground focus:border-warm-pink focus:outline-none transition-colors"
                    disabled={!config.enabled}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Initial Follow-up After (days)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="14"
                      value={config.followUpDays}
                      onChange={(e) => handleFollowUpChange(index, parseInt(e.target.value))}
                      className="flex-1"
                      disabled={!config.enabled}
                    />
                    <span className="text-2xl font-bold text-warm-pink w-16 text-center">
                      {config.followUpDays}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button className="px-6 py-3 rounded-full bg-soft-pink border-2 border-warm-pink/50 text-foreground hover:border-warm-pink transition-all font-semibold">
            Reset to Defaults
          </button>
          <button className="px-6 py-3 rounded-full bg-warm-pink border-2 border-warm-pink text-background font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
            💾 Save Changes
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-soft-pink rounded-2xl p-6 border border-warm-pink">
        <h3 className="font-bold text-foreground mb-3">💡 How Urgency Works</h3>
        <ul className="space-y-2 text-sm text-foreground">
          <li>✅ <strong>Low:</strong> Best for routine documents that can wait</li>
          <li>✅ <strong>Medium:</strong> Standard business documents requiring attention</li>
          <li>✅ <strong>High:</strong> Time-sensitive documents needing immediate action</li>
          <li>✅ Disabled urgency levels won't appear as options when creating chasers</li>
        </ul>
      </div>
    </div>
  );
}

