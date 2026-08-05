import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomSelect({ 
  value, 
  onChange, 
  options, 
  placeholder = 'Select...',
  className = "w-40" 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options.find(opt => opt.value === 'all') || options[0];

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between pl-3 pr-2 py-[7px] bg-white border border-border-subtle rounded-lg text-xs focus:outline-none hover:border-neutral-400 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 text-text-main transition shadow-sm"
      >
        <span className="truncate pr-2">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown size={14} className={`text-text-muted transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-border-subtle rounded-lg shadow-lg max-h-60 overflow-auto custom-scrollbar animate-in fade-in slide-in-from-top-1 duration-150 py-1">
          <ul className="flex flex-col">
            {options.map((option) => (
              <li
                key={option.value}
                className={`px-3 py-2 text-xs cursor-pointer flex items-center justify-between hover:bg-neutral-50 transition-colors ${
                  value === option.value ? 'bg-neutral-50 text-neutral-900 font-medium' : 'text-text-main'
                }`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                <span className="truncate">{option.label}</span>
                {value === option.value && <Check size={14} className="text-neutral-900 ml-2 shrink-0" />}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
