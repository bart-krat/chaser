'use client';

import { useState } from 'react';

interface MediumConfig {
  type: string;
  icon: string;
  description: string;
  enabled: boolean;
  template: string;
  maxRetries: number;
  retryDelay: number;
}

export default function MediumSettingsPage() {
  const [mediumConfigs, setMediumConfigs] = useState<MediumConfig[]>([
    {
      type: 'Email',
      icon: '📧',
      description: 'Professional email communication',
      enabled: true,
      template: 'Dear {name}, We are following up on the {docType} request...',
      maxRetries: 3,
      retryDelay: 2,
    },
    {
      type: 'Whatsapp',
      icon: '💬',
      description: 'Quick messaging via WhatsApp',
      enabled: true,
      template: 'Hi {name}! Quick reminder about the {docType} 📄',
      maxRetries: 2,
      retryDelay: 1,
    },
    {
      type: 'Call',
      icon: '📞',
      description: 'Direct phone call outreach',
      enabled: true,
      template: 'Script: Hello {name}, I\'m calling regarding {docType}...',
      maxRetries: 2,
      retryDelay: 3,
    },
    {
      type: 'Hybrid',
      icon: '🔄',
      description: 'Multi-channel approach (Email → WhatsApp → Call)',
      enabled: true,
      template: 'Automated sequence across all channels',
      maxRetries: 5,
      retryDelay: 1,
    },
  ]);

  const handleToggle = (index: number) => {
    const updated = [...mediumConfigs];
    updated[index].enabled = !updated[index].enabled;
    setMediumConfigs(updated);
  };

  const handleTemplateChange = (index: number, value: string) => {
    const updated = [...mediumConfigs];
    updated[index].template = value;
    setMediumConfigs(updated);
  };

  const handleMaxRetriesChange = (index: number, value: number) => {
    const updated = [...mediumConfigs];
    updated[index].maxRetries = value;
    setMediumConfigs(updated);
  };

  const handleRetryDelayChange = (index: number, value: number) => {
    const updated = [...mediumConfigs];
    updated[index].retryDelay = value;
    setMediumConfigs(updated);
  };

  return (
    <div className="space-y-6">
      <div className="bg-card-bg rounded-2xl p-8 shadow-xl border border-warm-pink">
        <h2 className="text-3xl font-bold mb-2 text-warm-pink">
          📱 Communication Medium Configuration
        </h2>
        <p className="text-foreground mb-8">
          Customize message templates and retry settings for each communication channel
        </p>

        <div className="space-y-6">
          {mediumConfigs.map((config, index) => (
            <div
              key={config.type}
              className="bg-soft-pink rounded-xl p-6 border-2 border-warm-pink/30 hover:border-warm-pink transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{config.icon}</span>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">{config.type}</h3>
                    <p className="text-sm text-foreground/60">{config.description}</p>
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
                    Message Template
                  </label>
                  <textarea
                    value={config.template}
                    onChange={(e) => handleTemplateChange(index, e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border-2 border-warm-pink bg-card-bg text-foreground focus:border-warm-yellow focus:outline-none transition-colors font-mono text-sm"
                    disabled={!config.enabled}
                    placeholder="Enter your template here..."
                  />
                  <p className="text-xs text-foreground/60 mt-1">
                    Use {'{name}'}, {'{docType}'}, {'{company}'} as placeholders
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Max Retry Attempts
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={config.maxRetries}
                        onChange={(e) => handleMaxRetriesChange(index, parseInt(e.target.value))}
                        className="flex-1"
                        disabled={!config.enabled}
                      />
                      <span className="text-xl font-bold text-warm-pink w-12 text-center">
                        {config.maxRetries}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Retry Delay (days)
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="1"
                        max="7"
                        value={config.retryDelay}
                        onChange={(e) => handleRetryDelayChange(index, parseInt(e.target.value))}
                        className="flex-1"
                        disabled={!config.enabled}
                      />
                      <span className="text-xl font-bold text-warm-yellow w-12 text-center">
                        {config.retryDelay}
                      </span>
                    </div>
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
        <h3 className="font-bold text-foreground mb-3">💡 Communication Channels</h3>
        <ul className="space-y-2 text-sm text-foreground">
          <li>✅ <strong>Email:</strong> Best for formal, detailed communication with attachments</li>
          <li>✅ <strong>WhatsApp:</strong> Quick, informal follow-ups with high open rates</li>
          <li>✅ <strong>Call:</strong> Personal touch for high-priority or complex situations</li>
          <li>✅ <strong>Hybrid:</strong> Escalating strategy starting with email, then WhatsApp, finally call</li>
          <li>✅ Disabled mediums won't appear as options when creating chasers</li>
        </ul>
      </div>
    </div>
  );
}

