import { useRepoContextStore } from './repoContextStore';
import { useFileTreeStore } from './fileTreeStore';

export const appActions = {
  async initializeApp(params: URLSearchParams) {
    const repoParam = params.get('repo');
    const branchParam = params.get('branch');
    const pathParam = params.get('path');
    const hasDeepLink = repoParam && branchParam && pathParam;

    const { repos } = useRepoContextStore.getState();

    if (repos.length === 0) {
      if (!hasDeepLink) {
        await useRepoContextStore.getState().restore();
        const selectedRepo = useRepoContextStore.getState().selectedRepo;
        if (selectedRepo) {
          await useFileTreeStore.getState().refreshTree(selectedRepo, false);
          await useRepoContextStore.getState().loadBranches();
        }
      }
      return;
    }

    if (hasDeepLink) {
      const targetRepo = repos.find((r) => r.fullName === repoParam);
      if (targetRepo) {
        const repoWithBranch = { ...targetRepo, currentBranch: branchParam };

        await useRepoContextStore.getState().selectRepo(repoWithBranch, { restoreLastBranch: false });
        await useRepoContextStore.getState().loadBranches();

        const selectedRepo = useRepoContextStore.getState().selectedRepo;
        if (selectedRepo) {
          await useFileTreeStore.getState().selectFileByPath(selectedRepo, pathParam);
        }
      }
    }
  },
};
