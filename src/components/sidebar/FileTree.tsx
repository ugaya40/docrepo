import { useMemo } from 'react';
import { RefreshCw, FolderOpen } from 'lucide-react';
import type { FileNode } from '../../types';
import { useRepoContextStore } from '../../stores/repoContextStore';
import { useFileTreeStore } from '../../stores/fileTreeStore';
import { useLayoutStore } from '../../stores/layoutStore';
import { useThemeStore } from '../../stores/themeStore';
import { MOBILE_BREAKPOINT } from '../../lib/constants';
import { TreeNode } from './TreeNode';

const filterMarkdownTree = (nodes: FileNode[]): FileNode[] => {
  return nodes
    .map((node) => {
      if (node.type === 'file') {
        return node.name.toLowerCase().endsWith('.md') ? node : null;
      }
      if (node.children) {
        const filteredChildren = filterMarkdownTree(node.children);
        if (filteredChildren.length > 0) {
          return { ...node, children: filteredChildren };
        }
      }
      return null;
    })
    .filter((node): node is FileNode => node !== null);
};

const compactFolders = (nodes: FileNode[]): FileNode[] => {
  return nodes.map((node) => {
    if (node.type !== 'dir' || !node.children) return node;

    const compactedChildren = compactFolders(node.children);

    if (compactedChildren.length === 1 && compactedChildren[0].type === 'dir') {
      const child = compactedChildren[0];
      return {
        ...child,
        name: `${node.name}/${child.name}`,
        children: child.children,
      };
    }

    return { ...node, children: compactedChildren };
  });
};

export const FileTree: React.FC = () => {
  const selectedRepo = useRepoContextStore((s) => s.selectedRepo);
  const files = useFileTreeStore((s) => s.files);
  const selectedFile = useFileTreeStore((s) => s.selectedFile);
  const expandedIds = useFileTreeStore((s) => s.expandedIds);
  const isLoadingTree = useFileTreeStore((s) => s.isLoadingTree);
  const {selectFile, toggleFolder, refreshTree} = useFileTreeStore.getState();
  const closeSidebar = useLayoutStore.getState().closeSidebar;
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  const processedFiles = useMemo(() => {
    const filtered = filterMarkdownTree(files);
    return compactFolders(filtered);
  }, [files]);

  const handleSelectFile = (file: FileNode) => {
    if (selectedRepo) {
      selectFile(selectedRepo, file);
    }
    if (window.innerWidth < MOBILE_BREAKPOINT) {
      closeSidebar();
    }
  };

  const handleToggleFolder = (path: string) => {
    if (selectedRepo) {
      toggleFolder(selectedRepo, path);
    }
  };

  const handleRefreshTree = () => {
    if (selectedRepo) {
      refreshTree(selectedRepo, true);
    }
  };

  return (
    <div className="flex-1 overflow-auto py-2 custom-scrollbar">
      <div className="flex items-center justify-between px-4 pr-[0.65rem] py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        <span>Explorer</span>
        {selectedRepo && (
          <button
            onClick={handleRefreshTree}
            className={`p-1 rounded transition-colors ${isLoadingTree ? 'animate-spin' : ''} ${isLight ? 'hover:bg-slate-200 text-slate-500 hover:text-slate-700' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
            title="Refresh Tree"
          >
            <RefreshCw size={14} />
          </button>
        )}
      </div>

      <div className="mt-1">
        {!selectedRepo ? (
          <div className="px-4 py-8 text-center text-slate-500">
            <FolderOpen size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Select a repository</p>
          </div>
        ) : isLoadingTree ? (
          <div className="px-4 py-4 text-center text-slate-500">
            <RefreshCw size={16} className="mx-auto animate-spin" />
          </div>
        ) : processedFiles.length === 0 ? (
          <div className="px-4 py-8 text-center text-slate-500">
            <p className="text-sm">No markdown files found</p>
          </div>
        ) : (
          <div className="inline-block min-w-full">
            {processedFiles.map((node) => (
              <TreeNode
                key={node.path}
                node={node}
                level={0}
                onSelect={handleSelectFile}
                selectedPath={selectedFile?.path}
                expandedPaths={expandedIds}
                toggleFolder={handleToggleFolder}
                isLight={isLight}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
