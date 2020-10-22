import { TemplateColumn } from './column';
import { TemplateBreakdown } from './breakdown';
import { RowFilter } from './filter';

export interface LoadArgs {
  key: string;
  url: string;
}

export interface ComputeArgs {
  key: string;
  columns: TemplateColumn[];
  options?: {
    breakdowns?: TemplateBreakdown[];
    rowFilters?: RowFilter[];
  };
}

export interface UniqueArgs {
  key: string;
  columnName: string;
}

export interface XyloInterface {
  load: (LoadArgs) => Promise<any>;
  compute: (ComputeArgs) => Promise<any>;
}

