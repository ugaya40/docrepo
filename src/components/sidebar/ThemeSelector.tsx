import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import type { ThemeMode } from '../../stores/themeStore';

export const ThemeSelector: React.FC = () => {
  const theme = useThemeStore((s) => s.theme);
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isLight = theme === 'light';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (newMode: ThemeMode) => {
    setMode(newMode);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg transition-colors focus:outline-none ${isLight
          ? 'text-slate-500 hover:text-indigo-500 hover:bg-slate-200'
          : 'text-slate-400 hover:text-indigo-400 hover:bg-slate-800'
          } ${isOpen ? (isLight ? 'bg-slate-200 text-indigo-500' : 'bg-slate-800 text-indigo-400') : ''}`}
        title="Change theme"
      >
        {isLight ? <Sun size={20} /> : <Moon size={20} />}

        {/* System mode indicator */}
        {mode === 'system' && (
          <span className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 border-2 border-white dark:border-slate-950" />
        )}
      </button>

      {isOpen && (
        <div className={`absolute left-0 mt-2 w-48 rounded-lg shadow-lg border overflow-hidden z-50 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700'
          }`}>
          <div className="py-1">
            <ThemeOption
              label="Light"
              icon={<Sun size={16} />}
              isActive={mode === 'light'}
              onClick={() => handleSelect('light')}
              isLight={isLight}
            />
            <ThemeOption
              label="Dark"
              icon={<Moon size={16} />}
              isActive={mode === 'dark'}
              onClick={() => handleSelect('dark')}
              isLight={isLight}
            />
            <ThemeOption
              label="System"
              icon={<Monitor size={16} />}
              isActive={mode === 'system'}
              onClick={() => handleSelect('system')}
              isLight={isLight}
            />
          </div>
        </div>
      )}
    </div>
  );
};

interface ThemeOptionProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  isLight: boolean;
}

const ThemeOption: React.FC<ThemeOptionProps> = ({ label, icon, isActive, onClick, isLight }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-2 text-sm flex items-center gap-3 transition-colors ${isLight
        ? 'text-slate-700 hover:bg-slate-100'
        : 'text-slate-200 hover:bg-slate-800'
        } ${isActive ? (isLight ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-900/20 text-indigo-400') : ''}`}
    >
      <span className={isActive ? 'text-indigo-500' : 'text-slate-400'}>{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {isActive && <Check size={14} className="text-indigo-500" />}
    </button>
  );
};
