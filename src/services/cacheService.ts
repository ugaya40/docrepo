import { get as idbGet, set as idbSet, clear as idbClear, entries as idbEntries } from 'idb-keyval';
import type { Repo, FileNode } from '../types';

export type CachedContent = {
  content: string;
  sha: string;
  updatedAt: string;
};

export type RepoTreeCache = {
  files: FileNode[];
  expandedIds: string[];
  selectedFile: FileNode | null;
};

export type AppState = {
  selectedRepo: Repo | null;
};

export const cacheService = {
  async getContent(repo: string, branch: string, path: string): Promise<CachedContent | null> {
    return await idbGet(`content:${repo}:${branch}:${path}`) ?? null;
  },

  async setContent(repo: string, branch: string, path: string, value: CachedContent): Promise<void> {
    await idbSet(`content:${repo}:${branch}:${path}`, value);
  },

  async getRepoTree(fullName: string, branch: string): Promise<RepoTreeCache | null> {
    return await idbGet(`repo:${fullName}:${branch}`) ?? null;
  },

  async setRepoTree(fullName: string, branch: string, cache: RepoTreeCache): Promise<void> {
    await idbSet(`repo:${fullName}:${branch}`, cache);
  },

  async getAppState(): Promise<AppState | null> {
    return await idbGet('app:state') ?? null;
  },

  async setAppState(state: AppState): Promise<void> {
    await idbSet('app:state', state);
  },

  async getLastBranch(fullName: string): Promise<string | null> {
    return await idbGet(`lastBranch:${fullName}`) ?? null;
  },

  async setLastBranch(fullName: string, branch: string): Promise<void> {
    await idbSet(`lastBranch:${fullName}`, branch);
  },

  async clearAll(): Promise<void> {
    await idbClear();
  },

  async getStats(): Promise<{ count: number; size: number }> {
    const allEntries = await idbEntries();
    const count = allEntries.length;
    const size = allEntries.reduce(
      (acc, [, value]) => acc + JSON.stringify(value).length * 2,
      0
    );
    return { count, size };
  },
};
