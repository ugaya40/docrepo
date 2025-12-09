import { ChevronRight, FolderOpen } from 'lucide-react';
import { useRepoContextStore } from '../../stores/repoContextStore';
import { useFileTreeStore } from '../../stores/fileTreeStore';
import { useLayoutStore } from '../../stores/layoutStore';
import { useThemeStore } from '../../stores/themeStore';

export const Breadcrumb: React.FC = () => {
  const selectedRepo = useRepoContextStore((s) => s.selectedRepo);
  const selectedFile = useFileTreeStore((s) => s.selectedFile);
  const expandParentFolders = useFileTreeStore.getState().expandParentFolders;
  const openSidebar = useLayoutStore.getState().openSidebar;
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  if (!selectedFile) return null;

  const pathParts = selectedFile.path.split('/');

  const handleClick = () => {
    if (selectedRepo) {
      expandParentFolders(selectedRepo, selectedFile.path);
    }
    openSidebar();
    requestAnimationFrame(() => {
      const el = document.querySelector(`[data-path="${CSS.escape(selectedFile.path)}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  return (
    <button
      onClick={handleClick}
      className={`group flex items-center gap-2 text-sm px-3 py-2 -ml-3 rounded-xl transition-all duration-200 border border-transparent ${isLight
          ? 'text-slate-500 hover:text-indigo-600 hover:bg-white hover:shadow-sm hover:border-slate-200'
          : 'text-slate-400 hover:text-indigo-400 hover:bg-slate-800/80 hover:border-slate-700'
        } mb-6 max-w-full`}
      title="Locate in sidebar"
    >
      <div className={`p-1 rounded-md transition-colors ${isLight
          ? 'bg-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600'
          : 'bg-slate-800 group-hover:bg-indigo-900/30 group-hover:text-indigo-400'
        }`}>
        <FolderOpen size={14} className="shrink-0" />
      </div>

      <div className="flex items-center overflow-hidden">
        <span className="truncate flex items-center">
          {pathParts.map((part, index) => (
            <span key={index} className="flex items-center whitespace-nowrap">
              {index > 0 && (
                <ChevronRight
                  size={14}
                  className={`mx-1.5 shrink-0 ${isLight ? 'text-slate-300' : 'text-slate-600'}`}
                />
              )}
              <span className={`transition-colors ${index === pathParts.length - 1
                  ? `font-medium ${isLight ? 'text-slate-800' : 'text-slate-200'}`
                  : ''
                }`}>
                {part}
              </span>
            </span>
          ))}
        </span>
      </div>
    </button>
  );
};
