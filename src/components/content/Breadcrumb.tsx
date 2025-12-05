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
      const el = document.querySelector(`[data-path="${selectedFile.path}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  return (
    <button
      onClick={handleClick}
      className={`flex gap-2 text-sm transition-colors mb-8 text-left md:-ml-4 ${isLight ? 'text-slate-500 hover:text-slate-700' : 'text-slate-400 hover:text-slate-200'}`}
    >
      <FolderOpen size={14} className="shrink-0 text-slate-500 mt-0.5" />
      <span className="break-all">
        <span className="text-slate-500">/</span>
        {pathParts.map((part, index) => (
          <span key={index}>
            {index > 0 && <ChevronRight size={12} className="inline-block mx-1 text-slate-600" />}
            <span className={index === pathParts.length - 1 ? (isLight ? 'text-slate-700' : 'text-slate-300') : ''}>
              {part}
            </span>
          </span>
        ))}
      </span>
    </button>
  );
};
