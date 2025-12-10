
import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ChevronDown, Check, Loader2 } from 'lucide-react';
import { useRepoContextStore } from '../../stores/repoContextStore';
import { useThemeStore } from '../../stores/themeStore';

export const RepoCombobox: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const repos = useRepoContextStore((s) => s.repos);
  const selectedRepo = useRepoContextStore((s) => s.selectedRepo);
  const isLoadingRepos = useRepoContextStore((s) => s.isLoadingRepos);
  const { selectRepo } = useRepoContextStore.getState();
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  const filteredRepos = useMemo(() => {
    if (!searchQuery) return repos;
    const lowerQuery = searchQuery.toLowerCase();
    return repos.filter(repo =>
      repo.name.toLowerCase().includes(lowerQuery) ||
      repo.fullName.toLowerCase().includes(lowerQuery)
    );
  }, [repos, searchQuery]);

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

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  const handleSelect = (repo: typeof repos[0]) => {
    selectRepo(repo);
    setIsOpen(false);
  };

  if (isLoadingRepos) {
    return (
      <div className={`w-full border text-sm rounded-lg p-2 flex items-center gap-2 ${isLight ? 'bg-white border-slate-300 text-slate-500' : 'bg-slate-950 border-slate-700 text-slate-400'}`}>
        <Loader2 size={12} className="animate-spin" />
        Loading repositories...
      </div>
    );
  }

  return (
    <div className="relative w-full" ref={containerRef}>
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
          {selectedRepo ? selectedRepo.fullName : 'Select a repository'}
        </span>
        <ChevronDown size={14} className={`shrink-0 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
      </button>

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
          <div className={`p-2 border-b ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
            <div className={`flex items-center rounded-md px-2 py-1 ${isLight ? 'bg-slate-100' : 'bg-slate-800'}`}>
              <Search size={14} className={`mr-2 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
              <input
                ref={inputRef}
                type="text"
                placeholder="Find a repository..."
                className={`
                  w-full bg-transparent border-none text-sm focus:outline-none
                  ${isLight ? 'text-slate-700 placeholder:text-slate-400' : 'text-slate-200 placeholder:text-slate-500'}
                `}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1 p-1 custom-scrollbar">
            {filteredRepos.length === 0 ? (
              <div className={`p-3 text-center text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                No repositories found.
              </div>
            ) : (
              filteredRepos.map((repo) => (
                <button
                  key={repo.id}
                  onClick={() => handleSelect(repo)}
                  className={`
                    w-full text-left px-2 py-2 text-sm rounded-md flex items-center justify-between
                    transition-colors
                    ${selectedRepo?.name === repo.name
                      ? (isLight ? 'bg-indigo-50 text-indigo-700' : 'bg-indigo-900/30 text-indigo-300')
                      : (isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-slate-800')}
                  `}
                >
                  <span className="truncate">{repo.fullName}</span>
                  {selectedRepo?.name === repo.name && (
                    <Check size={14} className="shrink-0 ml-2" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
