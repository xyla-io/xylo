import { RowFilter } from './interfaces/filter';
import {
  TemplateColumn,
  TemplateSumColumn,
  TemplateCountColumn,
  TemplateQuotientColumn,
  ColumnLiteral,
  DisplayColumn,
  ColumnIdentifier
} from './interfaces/column';
import { BreakdownIdentifier, TemplateBreakdown } from './interfaces/breakdown';
import { TreeNode } from './interfaces/tree-node';

import { RowFilterOps } from './aggregation/row-filter';
import { ColumnOps } from './aggregation/column-ops';

import { Store } from './store';
import { Looper, IterationActions } from './looper';
import { ReducerOps } from './aggregation/reducer-ops';
import { Chunker } from './chunker';

// TODO: can we replace with nest or other D3 collection?
// export interface DataSetGroup {
//   groupKey: string;
//   groupValue: string;
//   dataSet: DataSet;
// }

export class Roller {
  static readonly rowNameColumn = 'rowName';

  columnNames: string[];
  rowFilters: RowFilter[];
  breakdowns: TemplateBreakdown[];
  columnVectors: Record<string, any>;

  constructor(
    private columns: TemplateColumn[],
    options: {
      rowFilters?: RowFilter[],
      breakdowns?: TemplateBreakdown[],
    } = {}
  ) {
    const columnNameSet = new Set<string>();
    for (const column of columns) {
      for (const key of ['sumColumn', 'numeratorColumn', 'denominatorColumn']) {
        if (column[key]) { columnNameSet.add(column[key]); }
      }
    }

    this.breakdowns = options.breakdowns || [];
    for (const breakdown of this.breakdowns) {
      columnNameSet.add(breakdown.groupColumn);
    }

    this.rowFilters = [].concat(
      options.rowFilters || [],
      ...[].concat(...columns.map(column => (column.options.rowFilters || [])))
    );
    for (const filter of this.rowFilters) {
      columnNameSet.add(filter.column);
    }

    this.columnNames = Array.from(columnNameSet);

  }

  private removeRow(rowIndex) {
    Object.keys(this.columnVectors).forEach(key => {
      this.columnVectors[key].splice(rowIndex, 1);
    });
  }

  private iteration(rowIndex): number {

    for (const filter of this.rowFilters) {
      const value = this.columnVectors[filter.column][rowIndex];
      const keep = RowFilterOps.operations[filter.operator](value, filter.value);
      if (!keep) { return rowIndex; }
    }

    for (const breakdown of this.breakdowns) {
      const groupValue = this.columnVectors[breakdown.groupColumn][rowIndex];
    }

    return rowIndex + 1;
  }

  async roll(
    store: Store,
    options: {
      rowFilters?: RowFilter[],
      breakdowns?: TemplateBreakdown[],
    } = {}
  ) {

    const resultStore = new Store(`${store.key}_result`);
    await resultStore.destroy();
    const resultChunker = new Chunker(resultStore, this.columnNames);

    let chunkIndex = 0;
    for await (const chunk of store.chunks(this.columnNames)) {
      let tracker;
      this.columnVectors = {};

      for (const { doc } of chunk.rows) {
        const column = doc as any;
        // The tracker can be any of the column vectors since they
        // must all remain of equal length
        tracker = column.vector;
        this.columnVectors[column.name] = column.vector;
      }
      console.log('before', chunkIndex, tracker.length);

      // Loop through each row
      let rowIndex = 0;
      while (rowIndex < tracker.length) {
        rowIndex = this.iteration(rowIndex);
      }
      // Store the results
      await resultChunker.addColumnVectors(this.columnVectors);
      chunkIndex += 1;

      console.log(this.columnVectors['channel'].reduce((s, x) => { s.add(x); return s; }, new Set()));
      console.log('after', chunkIndex, tracker.length);
    }
    await resultStore.writeManifest(this.columnNames, chunkIndex);


    // const looper = new Looper;
    // looper.loop(store, this.columnNames, [
    //   (rowIndex: number, columnVectors: Record<string, any[]>, actions: IterationActions) => {
    //     for (const filter of this.rowFilters) {
    //       const value = columnVectors[filter.column][rowIndex];
    //       const keep = RowFilterOps.operations[filter.operator](value, filter.value);
    //       if (!keep) { return actions.removeRow(rowIndex, columnVectors); }
    //     }
    //   },

    //   (rowIndex: number, columnVectors: Record<string, any[]>) => {
    //     for (const breakdown of this.breakdowns) {
    //       const groupValue = columnVectors[breakdown.groupColumn][rowIndex];
    //     }
    //   },

      // (rowIndex: number, columnVectors: Record<string, any[]>) => {
      //   for (const column of columns) {
      //     ReducerOps.operations[column.metadata.columnType](
      //   }
      // },
    // ]);
  }


//   private static groupByColumn(dataSet: DataSet, column: ColumnLiteral): DataSetGroup[] {
    // const groupedDataFrameCollection = dataSet.dataFrame.groupBy(column).toCollection();
    // return groupedDataFrameCollection.map(group => ({
    //   groupKey: column,
    //   groupValue: group.groupKey[column],
    //   dataSet: new DataSet(group.group),
    // }));
  // }

  // private static aggregateCountColumn(dataSet: DataSet, template: TemplateCountColumn): number {
  //   return null;
  //   // return dataSet.dataFrame.countValue(template.countValue, template.countColumn);
  // }

  // private static aggregateQuotientColumn(dataSet: DataSet, template: TemplateQuotientColumn): number {
  //   if (!ColumnOps.isConcreteColumn(template.numeratorTemplateColumn)) {
  //     throw new Error(`Numerator column is not a ConcreteTemplateColumn: ${JSON.stringify(template)}`);
  //   }
  //   if (!ColumnOps.isConcreteColumn(template.denominatorTemplateColumn)) {
  //     throw new Error(`Denominator column is not a ConcreteTemplateColumn: ${JSON.stringify(template)}`);
  //   }
  //   const numerator = AggregationOps.aggregateColumn(dataSet, template.numeratorTemplateColumn);
  //   const denominator = AggregationOps.aggregateColumn(dataSet, template.denominatorTemplateColumn);
  //   if (!denominator) { return null; }
  //   return numerator / denominator;
  // }

  // static aggregateTable(
  //   dataSet: DataSet,
  //   displayColumns: DisplayColumn[],
  //   displayBreakdownIdentifiers: BreakdownIdentifier[],
  //   templateColumnMap: Map<ColumnIdentifier, TemplateColumn>,
  //   templateBreakdownMap: Map<BreakdownIdentifier, TemplateBreakdown>,
  //   rowFilters: RowFilter[],
  // ): TreeNode[] {
  //   const nodes = AggregationOps.breakIntoGroups(
  //     dataSet,
  //     displayColumns,
  //     templateColumnMap,
  //     displayBreakdownIdentifiers,
  //     templateBreakdownMap,
  //     rowFilters,
  //   );
  //   return nodes;
  // }

  // static getDistinctValues(
  //   dataSet: DataSet,
  //   column: ColumnLiteral,
  // ): (string|number)[] {
  //   return [];
  //   // return dataSet.dataFrame.distinct(column).toArray(column);
  // }

  // private static breakIntoGroups(
  //   dataSet: DataSet,
  //   displayColumns: DisplayColumn[],
  //   templateColumnMap: Map<ColumnIdentifier, TemplateColumn>,
  //   displayBreakdownIdentifiers: BreakdownIdentifier[],
  //   templateBreakdownMap: Map<BreakdownIdentifier, TemplateBreakdown>,
  //   rowFilters: RowFilter[],
  //   level: number = 0
  // ): TreeNode[] {
  //   if (level >= displayBreakdownIdentifiers.length) { return null; }

  //   const templateBreakdownIdentifier = displayBreakdownIdentifiers[level];
  //   const templateBreakdown = templateBreakdownMap.get(templateBreakdownIdentifier);
  //   console.log(new Array(level + 1).join('—') + 'grouping by column: ', templateBreakdown.groupColumn);
  //   const dataSetGroups = AggregationOps.groupByColumn(dataSet, templateBreakdown.groupColumn);

  //   const nodes: TreeNode[] = dataSetGroups.map(dataSetGroup => {
  //     return {
  //       breakdownGroupKey: dataSetGroup.groupKey,
  //       breakdownGroupValue: dataSetGroup.groupValue,
  //       breakdownLevel: level,
  //       isTerminalNode: level === displayBreakdownIdentifiers.length - 1,
  //       data: displayColumns.reduce((aggregationRow, displayColumn) => {
  //         const columnTemplate = templateColumnMap.get(displayColumn.identifier);
  //         aggregationRow[displayColumn.uid] =
  //           AggregationOps.aggregateColumn(
  //             dataSetGroup.dataSet,
  //             columnTemplate,
  //             (displayColumn.parameters.rowFilters || []).concat(rowFilters || [])
  //           );
  //         return aggregationRow;
  //       }, {
  //         [AggregationOps.rowNameColumn]: dataSetGroup.groupValue,
  //       }),
  //       children: this.breakIntoGroups(
  //         dataSetGroup.dataSet,
  //         displayColumns,
  //         templateColumnMap,
  //         displayBreakdownIdentifiers,
  //         templateBreakdownMap,
  //         rowFilters,
  //         level + 1
  //       ),
  //     };
  //   });
  //   nodes.sort((a, b) => ((a.data as any)[AggregationOps.rowNameColumn] < (b.data as any)[AggregationOps.rowNameColumn]) ? -1 : 1);
  //   return nodes;
  // }
}
