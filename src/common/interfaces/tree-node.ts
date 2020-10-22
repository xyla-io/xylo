export interface TreeNode {
  breakdownGroupKey: string;
  breakdownGroupValue: string;
  breakdownLevel: number;
  isTerminalNode: boolean;
  data: object;
  children?: TreeNode[];
  expanded?: boolean;
}
