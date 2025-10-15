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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert to the format expected by parent component
    onSubmit({
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
        className="w-full py-4 px-6 rounded-full bg-warm-pink text-background font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all border-2 border-warm-pink hover:bg-accent-coral"
      >
        🚀 Initialize Chaser
      </button>
    </form>
  );
}

