import { Menu, RefreshCw, FileText, GitBranch } from 'lucide-react';
import { useRepoContextStore } from '../../stores/repoContextStore';
import { useFileTreeStore } from '../../stores/fileTreeStore';
import { useContentStore } from '../../stores/contentStore';
import { useLayoutStore } from '../../stores/layoutStore';
import { useThemeStore } from '../../stores/themeStore';
import { ShareActions } from './share/ShareActions';

const refreshTree = useFileTreeStore.getState().refreshTree;

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}/${m}/${d} ${h}:${min}`;
};

export const Header: React.FC = () => {
  const selectedRepo = useRepoContextStore((s) => s.selectedRepo);
  const selectedFile = useFileTreeStore((s) => s.selectedFile);
  const isLoadingTree = useFileTreeStore((s) => s.isLoadingTree);
  const updatedAt = useContentStore((s) => s.updatedAt);
  const isLoadingContent = useContentStore((s) => s.isLoadingContent);
  const headerVisible = useLayoutStore((s) => s.headerVisible);
  const toggleSidebar = useLayoutStore.getState().toggleSidebar;
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  const handleRefreshContent = () => {
    if (selectedRepo) {
      refreshTree(selectedRepo, true);
    }
  };

  return (
    <header className={`border-b px-4 py-2 backdrop-blur fixed md:sticky top-0 left-0 right-0 z-10 w-full transition-transform duration-200 ${headerVisible ? 'translate-y-0' : '-translate-y-full'} md:translate-y-0 ${isLight ? 'border-(--color-border) bg-white/80' : 'border-slate-800 bg-slate-950/80'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <button
            onClick={toggleSidebar}
            className={`p-2 rounded-lg transition-colors ${isLight ? 'text-slate-500 hover:text-slate-700 hover:bg-slate-200' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-3 text-sm truncate">
            {selectedRepo ? (
              <>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${isLight ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-500/20 text-indigo-400'}`}>
                  {selectedRepo.fullName}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 ${isLight ? 'bg-emerald-100 text-emerald-600' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  <GitBranch size={12} />
                  {selectedRepo.currentBranch}
                </span>
                {selectedFile && (
                  <span className={`hidden md:flex font-medium items-center gap-2 ${isLight ? 'text-slate-700' : 'text-slate-100'}`}>
                    <FileText size={14} className="text-emerald-500" />
                    {selectedFile.name}
                  </span>
                )}
              </>
            ) : (
              <span className="text-slate-500">No repository selected</span>
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          {selectedFile && (
            <>
              {updatedAt && (
                <span className="text-sm text-slate-500 whitespace-nowrap">
                  UpdatedAt:&nbsp;&nbsp;{formatDate(updatedAt)}
                </span>
              )}
              <ShareActions />
              <button
                onClick={handleRefreshContent}
                className={`p-2 rounded-lg transition-all ${(isLoadingContent || isLoadingTree) ? 'animate-spin text-indigo-400' : ''} ${isLight ? 'text-slate-500 hover:text-indigo-500 hover:bg-slate-200' : 'text-slate-400 hover:text-indigo-400 hover:bg-slate-800'}`}
                title="Refresh Content"
              >
                <RefreshCw size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      {selectedFile && (
        <div className="md:hidden flex items-center justify-between mt-1">
          <span className={`text-sm font-medium flex items-center gap-2 min-w-0 ${isLight ? 'text-slate-700' : 'text-slate-100'}`}>
            <FileText size={14} className="text-emerald-500 shrink-0" />
            <span className="truncate">{selectedFile.name}</span>
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {updatedAt && (
              <span className="text-xs text-slate-500">
                {formatDate(updatedAt)}
              </span>
            )}
            <ShareActions />
            <button
              onClick={handleRefreshContent}
              className={`p-1 rounded transition-all ${(isLoadingContent || isLoadingTree) ? 'animate-spin text-indigo-400' : ''} ${isLight ? 'text-slate-500 hover:text-indigo-500 hover:bg-slate-200' : 'text-slate-400 hover:text-indigo-400 hover:bg-slate-800'}`}
              title="Refresh Content"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
