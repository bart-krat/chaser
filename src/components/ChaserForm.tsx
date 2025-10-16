'use client';

import { useState, useEffect, useRef } from 'react';

interface SimpleFormData {
  task: string;
  documents: string;
  who: string;
  urgency: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
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
  
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  const searchCustomers = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    
    setIsSearching(true);
    
    try {
      const response = await fetch(`/api/customers/search?q=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      
      const customers = data.customers || [];
      setSearchResults(customers);
      setShowDropdown(customers.length > 0);
    } catch (error) {
      console.error('Error searching customers:', error);
      setSearchResults([]);
      setShowDropdown(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleWhoChange = (value: string) => {
    setFormData({ ...formData, who: value });
    setSelectedCustomer(null);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Debounce search by 300ms
    searchTimeoutRef.current = setTimeout(() => {
      searchCustomers(value);
    }, 300);
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({ ...formData, who: customer.email });
    setShowDropdown(false);
    setSearchResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Set loading state
    setIsSubmitting(true);
    
    try {
      // Show spinner for minimum 5 seconds
      const submitPromise = onSubmit({
        docType: formData.documents,
        urgency: formData.urgency,
        medium: 'Email', // Default
        userId: selectedCustomer?.id || '1',
        customData: {
          ...formData,
          contactEmail: selectedCustomer?.email || formData.who,
          contactPhone: selectedCustomer?.phone,
          customerData: selectedCustomer
        }
      });
      
      const delayPromise = new Promise(resolve => setTimeout(resolve, 5000));
      
      // Wait for both the submit and the 5 second delay
      await Promise.all([submitPromise, delayPromise]);
    } finally {
      setIsSubmitting(false);
    }
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

      {/* Documents - Large Textarea */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-foreground">
          Documents
        </label>
        <textarea
          value={formData.documents}
          onChange={(e) => setFormData({ ...formData, documents: e.target.value })}
          placeholder="Enter detailed document requirements...

Example:
Bank statements in PDF format confirming bank balances at 30.09.2025.
The last sale invoice in Xero is Inv-5 from 12.06.2025...
Purchase invoices:
- Payment to Lawdepot on 20.09.25 on £47.00..."
          rows={12}
          className="w-full p-4 rounded-lg border-2 border-warm-pink bg-soft-pink text-foreground placeholder:text-foreground/40 focus:border-warm-pink focus:outline-none transition-colors resize-y font-mono text-sm"
          required
        />
        <p className="text-xs text-foreground/60 mt-2">
          💡 Add as much detail as needed - all information will be preserved exactly in the email
        </p>
      </div>

      {/* Who - with Autocomplete */}
      <div className="relative" ref={dropdownRef}>
        <label className="block text-sm font-semibold mb-2 text-foreground">
          Who
        </label>
        <div className="relative">
          <input
            type="text"
            value={formData.who}
            onChange={(e) => handleWhoChange(e.target.value)}
            placeholder="Start typing name or email..."
            className="w-full p-4 rounded-lg border-2 border-warm-pink bg-soft-pink text-foreground placeholder:text-foreground/40 focus:border-warm-pink focus:outline-none transition-colors"
            required
            autoComplete="off"
          />
          {isSearching && (
            <div className="absolute right-4 top-4">
              <div className="w-5 h-5 border-2 border-warm-pink border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        
        {/* Autocomplete Dropdown */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-card-bg border-2 border-warm-pink rounded-lg shadow-xl max-h-60 overflow-y-auto">
            {searchResults.map((customer) => (
              <button
                key={customer.id}
                type="button"
                onClick={() => handleSelectCustomer(customer)}
                className="w-full text-left px-4 py-3 hover:bg-warm-pink/20 transition-colors border-b border-warm-pink/10 last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">{customer.name}</p>
                    <p className="text-sm text-foreground/70">{customer.email}</p>
                  </div>
                  {customer.company && (
                    <span className="text-xs text-warm-pink bg-warm-pink/20 px-2 py-1 rounded">
                      {customer.company}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
        
        {/* Selected Customer Preview */}
        {selectedCustomer && (
          <div className="mt-3 p-4 rounded-lg bg-warm-pink/10 border border-warm-pink">
            <p className="text-sm text-foreground">
              <span className="font-semibold text-warm-pink">✓ Selected:</span> {selectedCustomer.name}
            </p>
            <p className="text-xs text-foreground/70 mt-1">
              {selectedCustomer.email} {selectedCustomer.company && `• ${selectedCustomer.company}`}
            </p>
          </div>
        )}
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
        disabled={isSubmitting}
        className="w-full py-4 px-6 rounded-full bg-purple-500 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all border-2 border-purple-400 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-3">
            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>🐕 Chasey is fetching...</span>
          </span>
        ) : (
          '🐕 Fetch those Documents Boy!'
        )}
      </button>
    </form>
  );
}

