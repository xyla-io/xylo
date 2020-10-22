import {
  TemplateCountColumn,
  TemplateSumColumn,
  TemplateQuotientColumn,
  ColumnType,
} from '../interfaces/column';
export class ReducerOps {
  static operations = {
    [ColumnType.Count]: (
      column: TemplateCountColumn,
      accumulator: number,
      value: any,
    ) => {
      if (value === column.countValue) { accumulator += 1; }
      return accumulator;
    },
    [ColumnType.Sum]: (
      column: TemplateSumColumn,
      accumulator: number,
      value: any,
    ) => {
      return accumulator + (Number(value) || 0);
    },
    [ColumnType.Quotient]: (
      column: TemplateQuotientColumn,
      accumulator: { numerator: number, denominator: number },
      value: any,
    ) => {
      accumulator.numerator = ReducerOps[column.numeratorTemplateColumn.metadata.columnType];
    },
  };
}
