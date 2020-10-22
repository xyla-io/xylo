import { WorkerType, BackgroundWorker } from '../../browser/background-worker';
import { TreeGrid } from '../interfaces/tree-grid';


export class DataSet {
  /**
   * Creates an instance of data set.
   * @param key the data frame wrapped by the data set
   * @example ```ts
   * let dataSet = new DataSet(goalsDataFrame);
   * ```
   */
  constructor(public key: string) {}

  // worker = new BackgroundWorker<XyloWork, any>(WorkerType.Xylo);

  // async fetchData(dataSetKey: string, url: string): Promise<{dataSetKey: string, url: string}> {
  //   return await this.worker.perform({
  //     dataSetKey,
  //     url,
  //   });
  // }

  // async aggregateColumn(columnWork: ColumnWork): Promise<number> {
  //   return await this.worker.perform(columnWork);
  // }

  // async aggregateTable(tableWork: TableWork): Promise<TreeGrid> {
  //   return await this.worker.perform(tableWork);
  // }

  // async getDistinctValues(distinctValuesWork: DistinctValuesWork): Promise<(string|number)[]> {
  //   return await this.worker.perform(distinctValuesWork);
  // }

}

