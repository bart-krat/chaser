'use client';

import { useState, useEffect, useRef } from 'react';

interface SimpleFormData {
  name: string;
  documents: string;
  who: string;
  dueDate: string; // ISO date string
  dueTime: string; // HH:MM format
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
    name: '',
    documents: '',
    who: '',
    dueDate: '', // Will be set to default tomorrow
    dueTime: '17:00', // Default to 5 PM
  });

  // Set default due date to tomorrow on mount
  useEffect(() => {
    if (!formData.dueDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, dueDate: dateStr }));
    }
  }, []);
  
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
      // Combine date and time into ISO datetime
      const dueDateTime = new Date(`${formData.dueDate}T${formData.dueTime}`);
      
      const submitPromise = onSubmit({
        docType: formData.documents,
        dueDate: dueDateTime.toISOString(),
        medium: 'Email', // Default
        userId: selectedCustomer?.id || '1',
        customData: {
          ...formData,
          dueDate: dueDateTime.toISOString(),
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
      {/* Two Column Layout: Documents on Left, Form Fields on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN - Documents */}
        <div className="flex flex-col">
          <label className="block text-sm font-semibold mb-2 text-foreground">
            Document Requirements 📄
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
            className="flex-1 p-4 rounded-lg border-2 border-warm-pink bg-soft-pink text-foreground placeholder:text-foreground/40 focus:border-warm-pink focus:outline-none transition-colors resize-none font-mono text-sm min-h-[400px]"
            required
          />
          <p className="text-xs text-foreground/60 mt-2">
            💡 Add as much detail as needed - all information will be preserved exactly in the email
          </p>
        </div>

        {/* RIGHT COLUMN - Other Form Fields */}
        <div className="space-y-4">
          {/* NAME */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-foreground">
              Project Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter chaser name..."
              className="w-full p-4 rounded-lg border-2 border-warm-pink bg-soft-pink text-foreground placeholder:text-foreground/40 focus:border-warm-pink focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Who - with Autocomplete */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-semibold mb-2 text-foreground">
              Client
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
              <div className="mt-3 p-3 rounded-lg bg-warm-pink/10 border border-warm-pink">
                <p className="text-sm text-foreground">
                  <span className="font-semibold text-warm-pink">✓</span> {selectedCustomer.name}
                </p>
                <p className="text-xs text-foreground/70 mt-1">
                  {selectedCustomer.email}
                </p>
              </div>
            )}
          </div>

          {/* Due Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">
                Due Date 📅
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-4 rounded-lg border-2 border-warm-pink bg-soft-pink text-foreground focus:border-warm-pink focus:outline-none transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-foreground">
                Due Time ⏰
              </label>
              <input
                type="time"
                value={formData.dueTime}
                onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                className="w-full p-4 rounded-lg border-2 border-warm-pink bg-soft-pink text-foreground focus:border-warm-pink focus:outline-none transition-colors"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button - Full Width */}
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
          'Fetch'
        )}
      </button>
    </form>
  );
}

