export const xylo
export const xyla
/**
 * A data set.
 * @class
 * @param {any} dataFrame the data frame wrapped by the data set
 * @property {object} dataFrame a data frame representation of the set's data
 * @memberof module:xylo
 * @example
 * let dataSet = new xylo.DataSet(goalsDataFrame);
 */
export class DataSet {
  constructor(dataFrame: any);
  /**
   * a data frame representation of the set's data
  */
  dataFrame: any;
}
/**
 * A data model containing a group of data sets.
 * @class
 * @property {object<string, DataSet>} dataSets a dictionary of data sets
 * @property {Set<string>} pendingDataSetKeys an array of keys for data sets that are in the process of being loaded
 * @memberof module:xylo
 * @example
 * let model = new xylo.Model();
 */
export class Model {
    constructor();
    /**
     * Adds a data set.
     * @param {string} key the key under which to store the data set
     * @param {DataSet} dataSet a data set
     * @returns {Model} the model
     * @example
     * model.addDataSet('goals', goalsDataSet);
     */
    addDataSet(key: string, dataSet: DataSet): Model;
    /**
     * Retrieves a data set.
     * @param {string} key the key under which to store the data set
     * @returns {Promise<DataSet>} a data set
     * @example
     * let goalsDataSet = model.getDataSet('goals');
     */
    getDataSet(key: string): Promise<DataSet>;
    /**
     * Fetches a data set from a URL and adds it to the model.
     * @param {string} key the key under which to store the data set
     * @param {string} url the URL from which to retrieve the data
     * @returns {Model} the model
     * @example
     * model.fetchDataSet('goals', 'https://example.com/goals.csv');
     */
    fetchDataSet(key: string, url: string): Model;
    /**
     * a dictionary of data sets
    */
    dataSets: {
        [key: string]: DataSet;
    };
    /**
     * an array of keys for data sets that are in the process of being loaded
    */
    pendingDataSetKeys: Set<string>;
}