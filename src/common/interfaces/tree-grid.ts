import { TreeNode } from './tree-node';

export interface TreeGrid {
  nodes: TreeNode[];
  columnDisplayNames: string[];
  nameColumn: string;
  uids: string[];
}
