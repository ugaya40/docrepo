import { create } from 'zustand';
import type { Repo, FileNode } from '../types';
import { githubApi, type GitTreeItem } from '../lib/github';
import { cacheService } from '../services/cacheService';
import { useContentStore } from './contentStore';
import { contentRenderSession } from './sessions/contentRenderSession';

type FileTreeState = {
  files: FileNode[];
  expandedIds: Set<string>;
  selectedFile: FileNode | null;
  isLoadingTree: boolean;
};

type FileTreeActions = {
  restore: (repo: Repo) => Promise<void>;
  loadTree: (repo: Repo) => Promise<void>;
  refreshTree: (repo: Repo, showLoading: boolean) => Promise<void>;
  selectFile: (repo: Repo, file: FileNode) => Promise<void>;
  selectFileByPath: (repo: Repo, path: string) => Promise<boolean>;
  toggleFolder: (repo: Repo, path: string) => void;
  expandParentFolders: (repo: Repo, path: string) => void;
  getBlobSha: (path: string) => string | null;
  clear: () => void;
};

export type FileTreeStore = FileTreeState & FileTreeActions;

const initialState: FileTreeState = {
  files: [],
  expandedIds: new Set(),
  selectedFile: null,
  isLoadingTree: false,
};

const buildFileTree = (items: GitTreeItem[]): FileNode[] => {
  const sorted = [...items].sort((a, b) => a.path.localeCompare(b.path));

  const nodeMap = new Map<string, FileNode>();
  const roots: FileNode[] = [];

  for (const item of sorted) {
    const parts = item.path.split('/');
    const name = parts[parts.length - 1];
    const parentPath = parts.slice(0, -1).join('/');

    const node: FileNode = {
      name,
      path: item.path,
      sha: item.sha,
      type: item.type === 'tree' ? 'dir' : 'file',
      children: item.type === 'tree' ? [] : undefined,
    };

    nodeMap.set(item.path, node);

    if (parentPath === '') {
      roots.push(node);
    } else {
      const parent = nodeMap.get(parentPath);
      if (parent?.children) {
        parent.children.push(node);
      }
    }
  }

  return roots;
};

const findNodeByPath = (nodes: FileNode[], path: string): FileNode | null => {
  for (const node of nodes) {
    if (node.path === path) return node;
    if (node.children) {
      const found = findNodeByPath(node.children, path);
      if (found) return found;
    }
  }
  return null;
};

const saveTreeCache = async (repo: Repo, state: FileTreeState) => {
  await cacheService.setRepoTree(repo.fullName, repo.currentBranch, {
    files: state.files,
    expandedIds: Array.from(state.expandedIds),
    selectedFile: state.selectedFile,
  });
};

export const useFileTreeStore = create<FileTreeStore>((set, get) => {
  const setSelectedFileInternal = async (
    repo: Repo,
    newFile: FileNode | null,
    options?: { skipSaveCache?: boolean }
  ) => {
    const current = get().selectedFile;
    if (current?.path !== newFile?.path) {
      contentRenderSession.nextSession();
    }
    set({ selectedFile: newFile });

    if (!options?.skipSaveCache) {
      await saveTreeCache(repo, get());
    }

    if (newFile) {
      await useContentStore.getState().loadContent(repo, newFile);
    } else if (current) {
      useContentStore.getState().clear();
    }
  };

  return {
    ...initialState,

    async restore(repo) {
      const cached = await cacheService.getRepoTree(repo.fullName, repo.currentBranch);
      if (cached) {
        set({
          files: cached.files,
          expandedIds: new Set(cached.expandedIds),
        });
        await setSelectedFileInternal(repo, cached.selectedFile, { skipSaveCache: true });
      }
    },

    async loadTree(repo) {
      set({ isLoadingTree: true });

      try {
        const treeResponse = await githubApi.getTree(repo.owner, repo.name, repo.currentBranch);
        const files = buildFileTree(treeResponse.items);
        set({ files, expandedIds: new Set(), selectedFile: null, isLoadingTree: false });
        useContentStore.getState().clear();
        await saveTreeCache(repo, get());
      } catch {
        set({ isLoadingTree: false });
      }
    },

    async refreshTree(repo, showLoading) {
      if (showLoading) {
        set({ isLoadingTree: true });
      }

      try {
        const treeResponse = await githubApi.getTree(repo.owner, repo.name, repo.currentBranch);
        const files = buildFileTree(treeResponse.items);
        const { expandedIds, selectedFile } = get();

        let newSelectedFile: FileNode | null = null;
        if (selectedFile) {
          newSelectedFile = findNodeByPath(files, selectedFile.path);
        }

        set({ files, expandedIds, isLoadingTree: false });
        await setSelectedFileInternal(repo, newSelectedFile);
      } catch {
        set({ isLoadingTree: false });
      }
    },

    async selectFile(repo, file) {
      if (file.type === 'dir') return;
      if (get().selectedFile?.path === file.path) return;

      await setSelectedFileInternal(repo, file);
    },

  async selectFileByPath(repo, path) {
    const node = findNodeByPath(get().files, path);
    if (!node || node.type === 'dir') return false;
    get().expandParentFolders(repo, path);
    await get().selectFile(repo, node);
    return true;
  },

  toggleFolder(repo, path) {
    const { expandedIds } = get();
    const newExpanded = new Set(expandedIds);

    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);

      const parts = path.split('/');
      for (let i = 1; i < parts.length; i++) {
        const parentPath = parts.slice(0, i).join('/');
        newExpanded.add(parentPath);
      }
    }

    set({ expandedIds: newExpanded });
    saveTreeCache(repo, get());
  },

  expandParentFolders(repo, path) {
    const parts = path.split('/');
    if (parts.length <= 1) return;

    const { expandedIds } = get();
    const newExpanded = new Set(expandedIds);

    for (let i = 1; i < parts.length; i++) {
      const parentPath = parts.slice(0, i).join('/');
      newExpanded.add(parentPath);
    }

    const sortedExpanded = new Set([...newExpanded].sort());
    set({ expandedIds: sortedExpanded });
    saveTreeCache(repo, get());
  },

  getBlobSha(path) {
    const node = findNodeByPath(get().files, path);
    return node?.sha ?? null;
  },

  clear() {
    set(initialState);
    useContentStore.getState().clear();
  },
};});
