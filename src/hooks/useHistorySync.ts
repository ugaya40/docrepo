import { useEffect } from 'react';
import { useRepoContextStore } from '../stores/repoContextStore';
import { useFileTreeStore } from '../stores/fileTreeStore';
import { useAuthStore } from '../stores/authStore';

export const useHistorySync = () => {
  useEffect(() => {
    let prevRepo = useRepoContextStore.getState().selectedRepo;
    let prevFile = useFileTreeStore.getState().selectedFile;

    const unsubscribeRepo = useRepoContextStore.subscribe((state) => {
      if (!useAuthStore.getState().isLoggedIn || !state.selectedRepo) return;

      const selectedFile = useFileTreeStore.getState().selectedFile;
      if (state.selectedRepo === prevRepo && selectedFile === prevFile) return;

      prevRepo = state.selectedRepo;

      updateUrl(state.selectedRepo, selectedFile);
    });

    const unsubscribeFile = useFileTreeStore.subscribe((state) => {
      const selectedRepo = useRepoContextStore.getState().selectedRepo;
      if (!useAuthStore.getState().isLoggedIn || !selectedRepo) return;

      if (selectedRepo === prevRepo && state.selectedFile === prevFile) return;

      prevFile = state.selectedFile;

      updateUrl(selectedRepo, state.selectedFile);
    });

    const updateUrl = (selectedRepo: { fullName: string; currentBranch: string }, selectedFile: { path: string } | null) => {
      const params = new URLSearchParams(window.location.search);
      const currentRepo = params.get('repo');
      const currentBranch = params.get('branch');
      const currentPath = params.get('path');

      const newRepo = selectedRepo.fullName;
      const newBranch = selectedRepo.currentBranch;
      const newPath = selectedFile?.path || '';

      if (currentRepo !== newRepo || currentBranch !== newBranch || currentPath !== newPath) {
        const newParams = new URLSearchParams();
        newParams.set('repo', newRepo);
        newParams.set('branch', newBranch);
        if (newPath) newParams.set('path', newPath);

        const newUrl = `${window.location.pathname}?${newParams.toString()}`;

        window.history.pushState(
          { repo: newRepo, branch: newBranch, path: newPath },
          '',
          newUrl
        );
      }
    };

    const handlePopState = async () => {
      const { selectedRepo, repos, selectRepo, selectBranch } = useRepoContextStore.getState();
      const { selectedFile, selectFileByPath } = useFileTreeStore.getState();

      const params = new URLSearchParams(window.location.search);
      const repoParam = params.get('repo');
      const branchParam = params.get('branch');
      const pathParam = params.get('path');

      if (repoParam && (!selectedRepo || selectedRepo.fullName !== repoParam)) {
        const targetRepo = repos.find(r => r.fullName === repoParam);
        if (targetRepo) {
          if (branchParam && branchParam !== targetRepo.currentBranch) {
            await selectRepo({ ...targetRepo, currentBranch: branchParam }, { restoreLastBranch: false });
          } else {
            await selectRepo(targetRepo);
          }
        }
      } else if (branchParam && selectedRepo && branchParam !== selectedRepo.currentBranch) {
        await selectBranch(branchParam);
      }

      const currentRepo = useRepoContextStore.getState().selectedRepo;
      if (pathParam && pathParam !== selectedFile?.path && currentRepo) {
        await selectFileByPath(currentRepo, pathParam);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      unsubscribeRepo();
      unsubscribeFile();
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
};
