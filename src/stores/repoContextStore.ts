import { create } from 'zustand';
import type { Repo } from '../types';
import { githubApi } from '../lib/github';
import { cacheService } from '../services/cacheService';
import { useFileTreeStore } from './fileTreeStore';

type RepoContextState = {
  repos: Repo[];
  branches: string[];
  selectedRepo: Repo | null;
  isLoadingRepos: boolean;
  isLoadingBranches: boolean;
};

type SelectRepoOptions = {
  restoreLastBranch?: boolean;
};

type RepoContextActions = {
  restore: () => Promise<void>;
  loadRepos: () => Promise<void>;
  loadBranches: () => Promise<void>;
  selectRepo: (repo: Repo, options?: SelectRepoOptions) => Promise<void>;
  selectBranch: (branch: string) => Promise<void>;
  reset: () => void;
};

export type RepoContextStore = RepoContextState & RepoContextActions;

const initialState: RepoContextState = {
  repos: [],
  branches: [],
  selectedRepo: null,
  isLoadingRepos: false,
  isLoadingBranches: false,
};

const saveAppState = async (repo: Repo | null) => {
  await cacheService.setAppState({ selectedRepo: repo });
};

export const useRepoContextStore = create<RepoContextStore>((set, get) => ({
  ...initialState,

  async restore() {
    const appState = await cacheService.getAppState();
    if (!appState?.selectedRepo) return;

    set({ selectedRepo: appState.selectedRepo });
    await useFileTreeStore.getState().restore(appState.selectedRepo);
  },

  async loadRepos() {
    set({ isLoadingRepos: true });
    try {
      const { selectedRepo } = get();
      const apiRepos = await githubApi.listRepos();

      const repos: Repo[] = apiRepos.map((repo) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.fullName,
        owner: repo.owner,
        private: repo.isPrivate,
        defaultBranch: repo.defaultBranch,
        currentBranch: (selectedRepo?.fullName === repo.fullName)
          ? selectedRepo.currentBranch
          : repo.defaultBranch,
      }));

      set({ repos, isLoadingRepos: false });
    } catch {
      set({ isLoadingRepos: false });
    }
  },

  async loadBranches() {
    const { selectedRepo } = get();
    if (!selectedRepo) return;

    set({ isLoadingBranches: true });
    try {
      const branches = await githubApi.listBranches(selectedRepo.owner, selectedRepo.name);
      set({ branches, isLoadingBranches: false });
    } catch {
      set({ branches: [], isLoadingBranches: false });
    }
  },

  async selectRepo(repo, options) {
    const { selectedRepo } = get();

    let targetBranch = repo.currentBranch;
    if (options?.restoreLastBranch !== false && repo.currentBranch === repo.defaultBranch) {
      const lastBranch = await cacheService.getLastBranch(repo.fullName);
      if (lastBranch) {
        targetBranch = lastBranch;
      }
    }
    const targetRepo = { ...repo, currentBranch: targetBranch };

    if (selectedRepo?.fullName === targetRepo.fullName && selectedRepo?.currentBranch === targetRepo.currentBranch) {
      return;
    }

    await cacheService.setLastBranch(targetRepo.fullName, targetRepo.currentBranch);

    const cached = await cacheService.getRepoTree(targetRepo.fullName, targetRepo.currentBranch);

    if (cached) {
      set({ selectedRepo: targetRepo });
      await saveAppState(targetRepo);
      await useFileTreeStore.getState().restore(targetRepo);
      await useFileTreeStore.getState().refreshTree(targetRepo, false);
    } else {
      set({ selectedRepo: targetRepo });
      await saveAppState(targetRepo);
      await useFileTreeStore.getState().loadTree(targetRepo);
    }
  },

  async selectBranch(branch) {
    const { selectedRepo } = get();
    if (!selectedRepo || selectedRepo.currentBranch === branch) return;

    const newRepo = { ...selectedRepo, currentBranch: branch };
    await get().selectRepo(newRepo, { restoreLastBranch: false });
  },

  reset() {
    set(initialState);
    useFileTreeStore.getState().clear();
  },
}));
