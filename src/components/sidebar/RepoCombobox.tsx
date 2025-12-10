
import { useRepoContextStore } from '../../stores/repoContextStore';
import { SearchableCombobox } from '../ui/SearchableCombobox';
import type { Repo } from '../../types';

export const RepoCombobox: React.FC = () => {
  const repos = useRepoContextStore((s) => s.repos);
  const selectedRepo = useRepoContextStore((s) => s.selectedRepo);
  const isLoadingRepos = useRepoContextStore((s) => s.isLoadingRepos);
  const { selectRepo } = useRepoContextStore.getState();

  const handleSelect = (repo: Repo) => {
    selectRepo(repo);
  };

  return (
    <SearchableCombobox<Repo>
      items={repos}
      selectedItem={selectedRepo}
      onSelect={handleSelect}
      getItemLabel={(repo) => repo.fullName}
      getItemKey={(repo) => repo.id}
      placeholder="Select a repository"
      searchPlaceholder="Find a repository..."
      emptyMessage="No repositories found."
      loadingMessage="Loading repositories..."
      isLoading={isLoadingRepos}
    />
  );
};
