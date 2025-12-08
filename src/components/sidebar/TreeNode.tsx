import { ChevronRight, ChevronDown } from 'lucide-react';
import type { FileNode } from '../../types';
import { FileIcon } from '../icons/FileIcon';

export interface TreeNodeProps {
  node: FileNode;
  level: number;
  onSelect: (node: FileNode) => void;
  selectedPath: string | undefined;
  expandedPaths: Set<string>;
  toggleFolder: (path: string) => void;
  isLight?: boolean;
  onKeyDown: (node: FileNode, e: React.KeyboardEvent) => void;
}

export const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  level,
  onSelect,
  selectedPath,
  expandedPaths,
  toggleFolder,
  isLight,
  onKeyDown,
}) => {
  const isExpanded = expandedPaths.has(node.path);
  const isSelected = selectedPath === node.path;
  const paddingLeft = `${level * 16 + 12}px`;
  const children = node.children || [];

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.type === 'dir') {
      toggleFolder(node.path);
    } else {
      onSelect(node);
    }
  };

  const selectedClass = isLight
    ? 'bg-indigo-100 text-indigo-700 border-r-2 border-indigo-500'
    : 'bg-indigo-900/40 text-indigo-100 border-r-2 border-indigo-500';
  const defaultClass = isLight
    ? 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-800'
    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200';

  return (
    <div className="select-none w-full">
      <div
        role="treeitem"
        tabIndex={0}
        aria-expanded={node.type === 'dir' ? isExpanded : undefined}
        aria-selected={isSelected}
        className={`
          flex items-center py-2 pr-4 cursor-pointer text-sm transition-colors duration-200 outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset
          ${isSelected ? selectedClass : defaultClass}
        `}
        style={{ paddingLeft }}
        onClick={handleClick}
        onKeyDown={(e) => onKeyDown(node, e)}
        data-path={node.path}
      >
        <span className="mr-2 opacity-70">
          {node.type === 'dir' && (
            isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          )}
          {node.type === 'file' && <div className="w-3.5" />}
        </span>
        <span className="mr-2">
          <FileIcon type={node.type} isOpen={isExpanded} />
        </span>
        <span className="whitespace-nowrap">{node.name}</span>
      </div>

      {node.type === 'dir' && isExpanded && children.length > 0 && (
        <div role="group" className="w-full">
          {children.map(child => (
            <TreeNode
              key={child.path}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              selectedPath={selectedPath}
              expandedPaths={expandedPaths}
              toggleFolder={toggleFolder}
              isLight={isLight}
              onKeyDown={onKeyDown}
            />
          ))}
        </div>
      )}
    </div>
  );
};
