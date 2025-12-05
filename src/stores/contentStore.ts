import { create } from 'zustand';
import type { Repo, FileNode } from '../types';
import { githubApi } from '../lib/github';
import { cacheService, type CachedContent } from '../services/cacheService';

type ContentState = {
  content: string | null;
  updatedAt: string | null;
  isLoadingContent: boolean;
};

type ContentActions = {
  loadContent: (repo: Repo, file: FileNode) => Promise<void>;
  clear: () => void;
};

export type ContentStore = ContentState & ContentActions;

const initialState: ContentState = {
  content: null,
  updatedAt: null,
  isLoadingContent: false,
};

const fetchAndCacheContent = async (
  repo: Repo,
  file: FileNode
): Promise<CachedContent | null> => {
  const [blobRes, updatedAt] = await Promise.all([
    githubApi.getBlob(repo.owner, repo.name, file.sha),
    githubApi.getLastCommitDate(repo.owner, repo.name, file.path),
  ]);

  const base64Content = blobRes.content.replace(/\n/g, '');
  const res = await fetch(`data:application/octet-stream;base64,${base64Content}`);
  const content = await res.text();

  await cacheService.setContent(repo.fullName, repo.currentBranch, file.path, {
    content,
    sha: file.sha,
    updatedAt: updatedAt ?? '',
  });

  return { content, sha: file.sha, updatedAt: updatedAt ?? '' };
};

export const useContentStore = create<ContentStore>((set) => ({
  ...initialState,

  async loadContent(repo, file) {
    if (file.type === 'dir') return;

    const cached = await cacheService.getContent(repo.fullName, repo.currentBranch, file.path);

    if (cached && cached.sha === file.sha) {
      set({
        content: cached.content,
        updatedAt: cached.updatedAt,
        isLoadingContent: false,
      });
      return;
    }

    set({ content: null, updatedAt: null, isLoadingContent: true });

    try {
      const result = await fetchAndCacheContent(repo, file);
      if (result) {
        set({
          content: result.content,
          updatedAt: result.updatedAt,
          isLoadingContent: false,
        });
      } else {
        set({ isLoadingContent: false });
      }
    } catch {
      set({ content: null, updatedAt: null, isLoadingContent: false });
    }
  },

  clear() {
    set(initialState);
  },
}));
