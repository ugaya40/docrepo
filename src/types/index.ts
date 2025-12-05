export interface Repo {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  private: boolean;
  defaultBranch: string;
  currentBranch: string;
}

export type FileType = 'dir' | 'file';

export interface FileNode {
  name: string;
  path: string;
  sha: string;
  type: FileType;
  children?: FileNode[];
}
