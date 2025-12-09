import { useMemo, useCallback } from 'react';
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

type CompactResult = {
  nodes: FileNode[];
  parentMap: Map<string, { parent: FileNode | null; siblings: FileNode[]; index: number }>;
};

const compactFolders = (
  nodes: FileNode[],
  parent: FileNode | null = null,
  parentMap: Map<string, { parent: FileNode | null; siblings: FileNode[]; index: number }> = new Map()
): CompactResult => {
  const resultNodes: FileNode[] = [];

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    if (node.type !== 'dir' || !node.children) {
      resultNodes.push(node);
      continue;
    }

    const { nodes: compactedChildren } = compactFolders(node.children, node, parentMap);

    if (compactedChildren.length === 1 && compactedChildren[0].type === 'dir') {
      const child = compactedChildren[0];
      const merged: FileNode = {
        ...child,
        name: `${node.name}/${child.name}`,
        children: child.children,
      };
      parentMap.delete(child.path);
      resultNodes.push(merged);
    } else {
      resultNodes.push({ ...node, children: compactedChildren });
    }
  }

  for (let i = 0; i < resultNodes.length; i++) {
    parentMap.set(resultNodes[i].path, { parent, siblings: resultNodes, index: i });
  }

  return { nodes: resultNodes, parentMap };
};

export const FileTree: React.FC = () => {
  const selectedRepo = useRepoContextStore((s) => s.selectedRepo);
  const files = useFileTreeStore((s) => s.files);
  const selectedFile = useFileTreeStore((s) => s.selectedFile);
  const expandedIds = useFileTreeStore((s) => s.expandedIds);
  const isLoadingTree = useFileTreeStore((s) => s.isLoadingTree);
  const { selectFile, toggleFolder, refreshTree } = useFileTreeStore.getState();
  const closeSidebar = useLayoutStore.getState().closeSidebar;
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === 'light';

  const { processedFiles, parentMap } = useMemo(() => {
    const filtered = filterMarkdownTree(files);
    const { nodes, parentMap } = compactFolders(filtered);
    return { processedFiles: nodes, parentMap };
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

  const focusNode = useCallback((path: string) => {
    const el = document.querySelector(`[data-path="${CSS.escape(path)}"]`) as HTMLElement | null;
    el?.focus();
  }, []);

  const getLastVisibleDescendant = useCallback((node: FileNode): FileNode => {
    if (node.type === 'dir' && expandedIds.has(node.path) && node.children?.length) {
      return getLastVisibleDescendant(node.children[node.children.length - 1]);
    }
    return node;
  }, [expandedIds]);

  const handleKeyDown = useCallback((node: FileNode, e: React.KeyboardEvent) => {
    const entry = parentMap.get(node.path);
    if (!entry) return;

    const { parent, siblings, index } = entry;

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        if (node.type === 'dir' && expandedIds.has(node.path) && node.children?.length) {
          focusNode(node.children[0].path);
        } else if (index < siblings.length - 1) {
          focusNode(siblings[index + 1].path);
        } else if (parent) {
          let currentEntry = parentMap.get(parent.path);
          while (currentEntry) {
            if (currentEntry.index < currentEntry.siblings.length - 1) {
              focusNode(currentEntry.siblings[currentEntry.index + 1].path);
              break;
            }
            if (!currentEntry.parent) break;
            currentEntry = parentMap.get(currentEntry.parent.path);
          }
        }
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        if (index > 0) {
          const prevSibling = siblings[index - 1];
          focusNode(getLastVisibleDescendant(prevSibling).path);
        } else if (parent) {
          focusNode(parent.path);
        }
        break;
      }
      case 'ArrowRight': {
        e.preventDefault();
        if (node.type === 'dir') {
          if (!expandedIds.has(node.path)) {
            handleToggleFolder(node.path);
          } else if (node.children?.length) {
            focusNode(node.children[0].path);
          }
        }
        break;
      }
      case 'ArrowLeft': {
        e.preventDefault();
        if (node.type === 'dir' && expandedIds.has(node.path)) {
          handleToggleFolder(node.path);
        } else if (parent) {
          focusNode(parent.path);
        }
        break;
      }
      case 'Enter':
      case ' ': {
        e.preventDefault();
        if (node.type === 'dir') {
          handleToggleFolder(node.path);
        } else {
          handleSelectFile(node);
        }
        break;
      }
      case 'Home': {
        e.preventDefault();
        if (processedFiles.length > 0) {
          focusNode(processedFiles[0].path);
        }
        break;
      }
      case 'End': {
        e.preventDefault();
        if (processedFiles.length > 0) {
          const lastRoot = processedFiles[processedFiles.length - 1];
          focusNode(getLastVisibleDescendant(lastRoot).path);
        }
        break;
      }
    }
  }, [expandedIds, processedFiles]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between px-4 pr-[0.65rem] py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">
        <span>Explorer</span>
        {selectedRepo && (
          <button
            onClick={handleRefreshTree}
            className={`p-3 mr-1.5 rounded-lg transition-colors ${isLoadingTree ? 'animate-spin' : ''} ${isLight ? 'hover:bg-slate-200 text-slate-500 hover:text-slate-700' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
            title="Refresh Tree"
          >
            <RefreshCw size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
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
          <div role="tree" aria-label="File tree" className="inline-block min-w-full">
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
                onKeyDown={handleKeyDown}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
