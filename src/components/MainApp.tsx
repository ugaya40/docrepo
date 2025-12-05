import { useEffect } from 'react';
import { useLayoutStore } from '../stores/layoutStore';
import { useRepoContextStore } from '../stores/repoContextStore';
import { useFileTreeStore } from '../stores/fileTreeStore';
import { useThemeStore } from '../stores/themeStore';
import { MOBILE_BREAKPOINT } from '../lib/constants';
import { Sidebar } from './sidebar/Sidebar';
import { MainContent } from './content/MainContent';
import { useHistorySync } from '../hooks/useHistorySync';

export const MainApp: React.FC = () => {
  const sidebarOpen = useLayoutStore((s) => s.sidebarOpen);
  const { closeSidebar, initSidebarByWidth } = useLayoutStore.getState();
  const theme = useThemeStore((s) => s.theme);

  const repos = useRepoContextStore((s) => s.repos);
  const restore = useRepoContextStore.getState().restore;
  const { loadBranches, selectRepo } = useRepoContextStore.getState();
  const { refreshTree, selectFileByPath } = useFileTreeStore.getState();

  useHistorySync();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const repoParam = params.get('repo');
    const branchParam = params.get('branch');
    const pathParam = params.get('path');
    const hasDeepLink = repoParam && branchParam && pathParam;

    if (repos.length === 0) {
      if (!hasDeepLink) {
        restore().then(() => {
          const selectedRepo = useRepoContextStore.getState().selectedRepo;
          if (selectedRepo) {
            refreshTree(selectedRepo, false);
            loadBranches();
          }
        });
      }
      return;
    }

    if (hasDeepLink) {
      const targetRepo = repos.find((r) => r.fullName === repoParam);
      if (targetRepo) {
        const repoWithBranch = { ...targetRepo, currentBranch: branchParam };
        selectRepo(repoWithBranch, { restoreLastBranch: false }).then(() => {
          loadBranches();
          const selectedRepo = useRepoContextStore.getState().selectedRepo;
          if (selectedRepo) {
            selectFileByPath(selectedRepo, pathParam);
          }
        });
      }
    }
  }, [repos]);

  useEffect(() => {
    initSidebarByWidth();
    const handleResize = () => initSidebarByWidth();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const id = 'hljs-theme';
    let link = document.getElementById(id) as HTMLLinkElement | null;

    if (!link) {
      link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    link.href = theme === 'light'
      ? 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css'
      : 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css';
  }, [theme]);

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-(--color-bg-primary) text-(--color-text-primary)">
      {sidebarOpen && window.innerWidth < MOBILE_BREAKPOINT && (
        <div
          className="fixed inset-0 bg-black/60 z-20 backdrop-blur-sm"
          onClick={closeSidebar}
        />
      )}
      <Sidebar />
      <MainContent />
    </div>
  );
};
