import {
  TemplateType,
  InternalTemplate,
  InternalMetadata,
} from './template';
import { ColumnLiteral } from './column';

export type BreakdownIdentifier = string;

export interface MetadataBreakdown extends InternalMetadata {
  identifier: BreakdownIdentifier;
  templateType: TemplateType.Breakdown;
}

export interface TemplateBreakdown extends InternalTemplate {
  metadata: MetadataBreakdown;
  displayName: string;
  groupColumn: ColumnLiteral;
  descendantIdentifiers: BreakdownIdentifier[];
}

