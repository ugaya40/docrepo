import { useEffect } from 'react';
import { ChevronDown, X, Loader2, RefreshCw, GitBranch, FolderGit2 } from 'lucide-react';
import { useRepoContextStore } from '../../stores/repoContextStore';
import { useLayoutStore } from '../../stores/layoutStore';
import { useThemeStore } from '../../stores/themeStore';
import { ThemeSelector } from './ThemeSelector';
import { RepoCombobox } from './RepoCombobox';

export const SideHeader: React.FC = () => {

  const branches = useRepoContextStore((s) => s.branches);
  const selectedRepo = useRepoContextStore((s) => s.selectedRepo);
  const isLoadingRepos = useRepoContextStore((s) => s.isLoadingRepos);
  const isLoadingBranches = useRepoContextStore((s) => s.isLoadingBranches);
  const { loadRepos, loadBranches, selectBranch } = useRepoContextStore.getState();
  const closeSidebar = useLayoutStore.getState().closeSidebar;
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    loadRepos();
  }, []);

  useEffect(() => {
    if (selectedRepo) {
      loadBranches();
    }
  }, [selectedRepo?.fullName]);

  const isLight = theme === 'light';

  return (
    <div className={`p-4 border-b backdrop-blur sticky top-0 z-10 ${isLight ? 'border-(--color-border) bg-(--color-bg-secondary)/95' : 'border-slate-800 bg-slate-900/95'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-8">
          <h2 className={`text-lg font-bold flex items-center gap-2 ${isLight ? 'text-(--color-text-primary)' : 'text-white'}`}>
            <img src="/cap.png" alt="docRepo" className="w-9 h-9 object-contain" />
            docRepo
          </h2>
          <ThemeSelector />
        </div>
        <button onClick={closeSidebar} className={`md:hidden p-2.5 rounded-lg transition-colors ${isLight ? 'text-slate-500 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'}`}>
          <X size={24} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <FolderGit2 size={14} className="text-slate-500 shrink-0" />
        <div className="relative flex-1">
          {isLoadingRepos ? (
            <div className={`w-full border text-sm rounded-lg p-2 flex items-center gap-2 ${isLight ? 'bg-white border-slate-300 text-slate-500' : 'bg-slate-950 border-slate-700 text-slate-400'}`}>
              <Loader2 size={12} className="animate-spin" />
              Loading repositories...
            </div>
          ) : (
            <>
              <>
                <RepoCombobox />
              </>
            </>
          )}
        </div>
        <button
          onClick={loadRepos}
          disabled={isLoadingRepos}
          className={`p-3 rounded-lg transition-all disabled:opacity-50 ${isLight ? 'text-slate-500 hover:text-indigo-500 hover:bg-slate-200' : 'text-slate-400 hover:text-indigo-400 hover:bg-slate-800'}`}
          title="Refresh repository list"
        >
          <RefreshCw size={20} className={isLoadingRepos ? 'animate-spin' : ''} />
        </button>
      </div>

      {selectedRepo && (
        <div className="flex items-center gap-2 mt-2">
          <GitBranch size={14} className="text-slate-500 shrink-0" />
          <div className="relative flex-1">
            {isLoadingBranches ? (
              <div className={`w-full border text-sm rounded-lg p-2 flex items-center gap-2 ${isLight ? 'bg-white border-slate-300 text-slate-500' : 'bg-slate-950 border-slate-700 text-slate-400'}`}>
                <Loader2 size={12} className="animate-spin" />
                Loading branches...
              </div>
            ) : (
              <>
                <select
                  aria-label="Select branch"
                  className={`w-full border text-sm rounded-lg p-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer transition-colors ${isLight ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100' : 'bg-slate-950 border-slate-700 text-slate-200 hover:bg-slate-800'}`}
                  value={selectedRepo.currentBranch}
                  onChange={(e) => selectBranch(e.target.value)}
                >
                  {branches.map((branch) => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
                <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  <ChevronDown size={14} />
                </div>
              </>
            )}
          </div>
          <button
            onClick={loadBranches}
            disabled={isLoadingBranches}
            className={`p-3 rounded-lg transition-all disabled:opacity-50 ${isLight ? 'text-slate-500 hover:text-indigo-500 hover:bg-slate-200' : 'text-slate-400 hover:text-indigo-400 hover:bg-slate-800'}`}
            title="Refresh branch list"
          >
            <RefreshCw size={20} className={isLoadingBranches ? 'animate-spin' : ''} />
          </button>
        </div>
      )}
    </div>
  );
};
