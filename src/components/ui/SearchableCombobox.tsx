
import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ChevronDown, Check, Loader2 } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';

interface SearchableComboboxProps<T> {
  items: T[];
  selectedItem: T | null;
  onSelect: (item: T) => void;
  getItemLabel: (item: T) => string;
  getItemKey: (item: T) => string | number;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  loadingMessage?: string;
  isLoading?: boolean;
  className?: string;
}

export function SearchableCombobox<T>({
  items,
  selectedItem,
  onSelect,
  getItemLabel,
  getItemKey,
  placeholder = "Select an item",
  searchPlaceholder = "Search...",
  emptyMessage = "No items found.",
  loadingMessage = "Loading...",
  isLoading = false,
  className = "",
}: SearchableComboboxProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    const lowerQuery = searchQuery.toLowerCase();
    return items.filter(item =>
      getItemLabel(item).toLowerCase().includes(lowerQuery)
    );
  }, [items, searchQuery, getItemLabel]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus input when opening and reset query when closing
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  const handleSelect = (item: T) => {
    onSelect(item);
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <div className={`w-full border text-sm rounded-lg p-2 flex items-center gap-2 ${isLight ? 'bg-white border-slate-300 text-slate-500' : 'bg-slate-950 border-slate-700 text-slate-400'} ${className}`}>
        <Loader2 size={12} className="animate-spin" />
        {loadingMessage}
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full border text-sm rounded-lg p-2 flex items-center justify-between
          focus:outline-none focus:ring-2 focus:ring-indigo-500
          transition-colors cursor-pointer text-left
          ${isLight
            ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            : 'bg-slate-950 border-slate-700 text-slate-200 hover:bg-slate-900'}
        `}
      >
        <span className="truncate mr-2">
          {selectedItem ? getItemLabel(selectedItem) : placeholder}
        </span>
        <ChevronDown size={14} className={`shrink-0 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`
            absolute top-full left-0 w-full mt-1 z-50 rounded-lg shadow-lg border overflow-hidden
            flex flex-col max-h-[300px]
            ${isLight
              ? 'bg-white border-slate-200 shadow-slate-200/50'
              : 'bg-slate-900 border-slate-700 shadow-black/50'}
          `}
        >
          {/* Search Input */}
          <div className={`p-2 border-b ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
            <div className={`flex items-center rounded-md px-2 py-1 ${isLight ? 'bg-slate-100' : 'bg-slate-800'}`}>
              <Search size={14} className={`mr-2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
              <input
                ref={inputRef}
                type="text"
                placeholder={searchPlaceholder}
                className={`
                  w-full bg-transparent border-none text-sm focus:outline-none
                  ${isLight ? 'text-slate-700 placeholder:text-slate-400' : 'text-slate-200 placeholder:text-slate-500'}
                `}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1 p-1 custom-scrollbar">
            {filteredItems.length === 0 ? (
              <div className={`p-3 text-center text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {emptyMessage}
              </div>
            ) : (
              filteredItems.map((item) => {
                const isSelected = selectedItem && getItemKey(selectedItem) === getItemKey(item);
                return (
                  <button
                    key={getItemKey(item)}
                    onClick={() => handleSelect(item)}
                    className={`
                      w-full text-left px-2 py-3 text-sm rounded-md flex items-center justify-between
                      transition-colors
                      ${isSelected
                        ? (isLight ? 'bg-indigo-50 text-indigo-700' : 'bg-indigo-900/30 text-indigo-300')
                        : (isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-slate-800')}
                    `}
                  >
                    <span className="truncate">{getItemLabel(item)}</span>
                    {isSelected && (
                      <Check size={14} className="shrink-0 ml-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
