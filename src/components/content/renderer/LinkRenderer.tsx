import { useRepoContextStore } from "../../../stores/repoContextStore";
import { useFileTreeStore } from "../../../stores/fileTreeStore";
import { resolvePath } from "./resolvePath";

export const LinkRenderer = (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  const { href, children } = props;

  if (!href) return <a {...props}>{children}</a>;

  const isExternal = href.startsWith('http') || href.startsWith('mailto:');
  const isAnchor = href.startsWith('#');

  const handleClick = (e: React.MouseEvent) => {
    if (isExternal || isAnchor) return;

    e.preventDefault();

    const selectedRepo = useRepoContextStore.getState().selectedRepo;
    const selectedFile = useFileTreeStore.getState().selectedFile;

    if (selectedRepo && selectedFile) {
      const targetPath = resolvePath(selectedFile.path, href);
      useFileTreeStore.getState().selectFileByPath(selectedRepo, targetPath);
    }
  };

  return (
    <a
      {...props}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      onClick={handleClick}
      className="text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer"
    >
      {children}
    </a>
  );
};
