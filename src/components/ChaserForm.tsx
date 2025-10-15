'use client';

import { useState } from 'react';

interface SimpleFormData {
  task: string;
  documents: string;
  who: string;
  urgency: string;
}

interface ChaserFormProps {
  onSubmit: (data: any) => void;
}

export default function ChaserForm({ onSubmit }: ChaserFormProps) {
  const [formData, setFormData] = useState<SimpleFormData>({
    task: '',
    documents: '',
    who: '',
    urgency: 'Medium', // Default to Medium
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert to the format expected by parent component
    onSubmit({
      docType: formData.documents,
      urgency: formData.urgency,
      medium: 'Email', // Default
      userId: '1', // Default
      customData: formData
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* TASK */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-foreground">
          TASK
        </label>
        <input
          type="text"
          value={formData.task}
          onChange={(e) => setFormData({ ...formData, task: e.target.value })}
          placeholder="Enter task description..."
          className="w-full p-4 rounded-lg border-2 border-warm-pink bg-soft-pink text-foreground placeholder:text-foreground/40 focus:border-warm-pink focus:outline-none transition-colors"
          required
        />
      </div>

      {/* Documents */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-foreground">
          Documents
        </label>
        <input
          type="text"
          value={formData.documents}
          onChange={(e) => setFormData({ ...formData, documents: e.target.value })}
          placeholder="e.g., VAT Receipt, Income Statement, Tax Return..."
          className="w-full p-4 rounded-lg border-2 border-warm-pink bg-soft-pink text-foreground placeholder:text-foreground/40 focus:border-warm-pink focus:outline-none transition-colors"
          required
        />
      </div>

      {/* Who */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-foreground">
          Who
        </label>
        <input
          type="text"
          value={formData.who}
          onChange={(e) => setFormData({ ...formData, who: e.target.value })}
          placeholder="Enter name or contact..."
          className="w-full p-4 rounded-lg border-2 border-warm-pink bg-soft-pink text-foreground placeholder:text-foreground/40 focus:border-warm-pink focus:outline-none transition-colors"
          required
        />
      </div>

      {/* Urgency */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-foreground">
          Urgency
        </label>
        <select
          value={formData.urgency}
          onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
          className="w-full p-4 rounded-lg border-2 border-warm-pink bg-soft-pink text-foreground focus:border-warm-pink focus:outline-none transition-colors"
          required
        >
          <option value="Low">Low - 3 days initial delay</option>
          <option value="Medium">Medium - 1 day initial delay</option>
          <option value="High">High - 6 hours initial delay</option>
        </select>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full py-4 px-6 rounded-full bg-warm-pink text-background font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all border-2 border-warm-pink hover:bg-accent-coral"
      >
        🚀 Initialize Chaser
      </button>
    </form>
  );
}

