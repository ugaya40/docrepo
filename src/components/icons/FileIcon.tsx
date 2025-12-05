import { FileText, Folder, FolderOpen } from 'lucide-react';
import type { FileType } from '../../types';

export interface FileIconProps {
  type: FileType;
  isOpen?: boolean;
}

export const FileIcon: React.FC<FileIconProps> = ({ type, isOpen }) => {
  if (type === 'dir') {
    return isOpen
      ? <FolderOpen size={16} className="text-indigo-400" />
      : <Folder size={16} className="text-slate-400" />;
  }
  return <FileText size={16} className="text-emerald-400" />;
};
