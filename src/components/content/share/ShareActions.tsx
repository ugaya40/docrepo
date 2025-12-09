import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Loader2 } from 'lucide-react';
import { isMobile, isIOS } from 'react-device-detect';
import { useContentStore } from '../../../stores/contentStore';
import { useFileTreeStore } from '../../../stores/fileTreeStore';
import { useRepoContextStore } from '../../../stores/repoContextStore';
import { useThemeStore } from '../../../stores/themeStore';
import { useHtmlGenerateSession } from '../../../stores/sessions/htmlGenerateSession';
import { DownloadAsHtmlButton } from './DownloadAsHtmlButton';
import { ShareAsHtmlButton } from './ShareAsHtmlButton';
import { ExportAsHtmlButton } from './ExportAsHtmlButton';
import { ExportModal } from './ExportModal';
import { PrintButton } from './PrintButton';

export const ShareActions: React.FC = () => {
  const content = useContentStore((s) => s.content);
  const selectedFile = useFileTreeStore((s) => s.selectedFile);
  const selectedRepo = useRepoContextStore((s) => s.selectedRepo);
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';
  const { state: htmlState } = useHtmlGenerateSession();
  const [showMenu, setShowMenu] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
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
        disabled={htmlState.isGenerating}
        aria-label="Export and print options"
        className={`p-2.5 rounded-lg transition-all ${htmlState.isGenerating ? 'text-indigo-400 cursor-wait' : ''} ${isLight ? 'text-slate-500 hover:text-indigo-500 hover:bg-slate-200' : 'text-slate-400 hover:text-indigo-400 hover:bg-slate-800'}`}
        title="Download & Print"
      >
        {htmlState.isGenerating ? <Loader2 size={24} className="animate-spin" /> : <MoreVertical size={24} />}
      </button>

      {showMenu && (
        <div className={`absolute right-0 top-full mt-1 border rounded-lg shadow-xl z-20 min-w-48 [&>*:first-child]:rounded-t-lg [&>*:last-child]:rounded-b-lg ${isLight ? 'bg-white border-slate-300' : 'bg-slate-800 border-slate-700'}`}>
          {isIOS ? (
            <ExportAsHtmlButton
              onExportStart={() => setShowMenu(false)}
              onExportComplete={() => setShowExportModal(true)}
            />
          ) : (
            <>
              <DownloadAsHtmlButton
                onDownloadStart={() => setShowMenu(false)}
                onDownloadEnd={() => { }}
              />
              {isMobile && (
                <ShareAsHtmlButton
                  onShareStart={() => setShowMenu(false)}
                  onShareEnd={() => { }}
                />
              )}
            </>
          )}
          <PrintButton />
        </div>
      )}

      {showExportModal && htmlState.result && (
        <ExportModal
          result={htmlState.result}
          onDownload={() => setShowExportModal(false)}
          onShare={() => setShowExportModal(false)}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
};
