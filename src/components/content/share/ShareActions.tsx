import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Loader2 } from 'lucide-react';
import { useContentStore } from '../../../stores/contentStore';
import { useFileTreeStore } from '../../../stores/fileTreeStore';
import { useRepoContextStore } from '../../../stores/repoContextStore';
import { useThemeStore } from '../../../stores/themeStore';
import { DownloadAsHtmlButton } from './DownloadAsHtmlButton';
import { PrintButton } from './PrintButton';

export const ShareActions: React.FC = () => {
  const content = useContentStore((s) => s.content);
  const selectedFile = useFileTreeStore((s) => s.selectedFile);
  const selectedRepo = useRepoContextStore((s) => s.selectedRepo);
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';
  const [isGenerating, setIsGenerating] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!content || !selectedFile || !selectedRepo) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isGenerating}
        className={`p-2 rounded-lg transition-all ${isGenerating ? 'text-indigo-400 cursor-wait' : ''} ${isLight ? 'text-slate-500 hover:text-indigo-500 hover:bg-slate-200' : 'text-slate-400 hover:text-indigo-400 hover:bg-slate-800'}`}
        title="Download & Print"
      >
        {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <MoreVertical size={18} />}
      </button>

      {showMenu && (
        <div className={`absolute right-0 top-full mt-1 border rounded-lg shadow-xl z-20 min-w-64 [&>*:first-child]:rounded-t-lg [&>*:last-child]:rounded-b-lg ${isLight ? 'bg-white border-slate-300' : 'bg-slate-800 border-slate-700'}`}>
          <DownloadAsHtmlButton
            downloadTheme="dark"
            onDownloadStart={() => { setIsGenerating(true); setShowMenu(false); }}
            onDownloadEnd={() => setIsGenerating(false)}
          />
          <DownloadAsHtmlButton
            downloadTheme="light"
            onDownloadStart={() => { setIsGenerating(true); setShowMenu(false); }}
            onDownloadEnd={() => setIsGenerating(false)}
          />
          <PrintButton />
        </div>
      )}
    </div>
  );
};
