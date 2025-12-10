
import { useRepoContextStore } from '../../stores/repoContextStore';
import { SearchableCombobox } from '../ui/SearchableCombobox';

export const BranchCombobox: React.FC = () => {
  const branches = useRepoContextStore((s) => s.branches);
  const selectedRepo = useRepoContextStore((s) => s.selectedRepo);
  const isLoadingBranches = useRepoContextStore((s) => s.isLoadingBranches);
  const { selectBranch } = useRepoContextStore.getState();

  const handleSelect = (branch: string) => {
    selectBranch(branch);
  };

  return (
    <SearchableCombobox<string>
      items={branches}
      selectedItem={selectedRepo?.currentBranch || null}
      onSelect={handleSelect}
      getItemLabel={(branch) => branch}
      getItemKey={(branch) => branch}
      placeholder="Select a branch"
      searchPlaceholder="Find a branch..."
      emptyMessage="No branches found."
      loadingMessage="Loading branches..."
      isLoading={isLoadingBranches}
    />
  );
};
