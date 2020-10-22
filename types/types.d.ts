/**
 * @module xylo
 */
declare module "xylo" {
    /**
     * A list
     * @memberof module:xylo
     * @type object<string, string>
     * @property {string} dataFetched
     */
    var events: {
        [key: string]: string;
    };
    /**
     * A data set.
     * @class
     * @param {any} dataFrame the data frame wrapped by the data set
     * @property {object} dataFrame a data frame representation of the set's data
     * @memberof module:xylo
     * @example
     * let dataSet = new xylo.DataSet(goalsDataFrame);
     */
    class DataSet {
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
    class Model {
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
    /**
     * An exception thrown when a requested DataSet can not be found.
     * @class
     * @param {string} key the key of the data set that could not be found
     * @property {string} key the key of the data set that could not be found
     * @memberof module:xylo
     * @example
     * throw new xylo.XyloNoDataSetException('goals');
     */
    class XyloNoDataSetException {
        constructor(key: string);
        /**
         * the key of the data set that could not be found
        */
        key: string;
    }
    /**
     * An exception thrown when a a requested DataSet is asynchronously pending and it is not yet known if the DataSet will be retrieved successfully.
     * @class
     * @param {string} key the key of the data set that is pending
     * @property {string} key the key of the data set that is pending
     * @memberof module:xylo
     * @example
     * throw new xylo.XyloPendingDataSetException('goals');
     */
    class XyloPendingDataSetException {
        constructor(key: string);
        /**
         * the key of the data set that is pending
        */
        key: string;
    }
    /**
     * A data fetcher.
     * @class
     * @param {string} url the URL from which to fetch the data
     * @property {string} url the data URL
     * @memberof module:xylo
     * @example
     * let newfetcher = new xylo.Fetcher('https://example.com/data.csv');
     */
    class Fetcher {
        constructor(url: string);
        /**
         * Fetches the data set.
         * @returns {Promise<any>} a promise resolving to the fetched data frame
         * @example
         * fetcher.fetch().then(dataFrame => console.log(dataFrame));
         */
        fetch(): Promise<any>;
        /**
         * the data URL
        */
        url: string;
    }
    /**
     * A data reporter.
     * @class
     * @param {string} csv the CSV encoded data string
     * @property {Object[]} data the report's data rows
     * @memberof module:xylo
     * @example
     * let reporter = new xylo.Reporter('https://api.xyla.io/.com/data.csv');
     */
    class Reporter {
        constructor(csv: string);
        /**
         * the report's data rows
        */
        data: object[];
    }
}

