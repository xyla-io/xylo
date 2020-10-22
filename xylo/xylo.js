/**
 * @module xylo
 */

var xylo = {};
try {
  if (module.exports !== undefined) {
    module.exports = xylo;
  }
} catch (e) {}

(function() {
  console.log('Loading xylo.')

  /**
   * A list
   * @memberof module:xylo
   * @type object<string, string>
   * @property {string} dataFetched
   */
  var events = {
    dataFetched: 'xyloDataFetched',
  };
  xylo.events = events;

  /**
   * A data set.
   * @class
   * @param {any} dataFrame the data frame wrapped by the data set
   * @property {object} dataFrame a data frame representation of the set's data
   * @memberof module:xylo
   * @example
   * let dataSet = new xylo.DataSet(goalsDataFrame);
   */
  function DataSet(dataFrame) {
    this.dataFrame = dataFrame;
  }
  xylo.DataSet = DataSet;

  /**
   * A data model containing a group of data sets.
   * @class
   * @property {object<string, DataSet>} dataSets a dictionary of data sets
   * @property {Set<string>} pendingDataSetKeys an array of keys for data sets that are in the process of being loaded
   * @memberof module:xylo
   * @example
   * let model = new xylo.Model();
   */
  function Model() {
    this.dataSets = {};
    this.pendingDataSetKeys = new Set();
  }
  /**
   * Adds a data set.
   * @param {string} key the key under which to store the data set
   * @param {DataSet} dataSet a data set
   * @returns {Model} the model
   * @example
   * model.addDataSet('goals', goalsDataSet);
   */
  Model.prototype.addDataSet = function(key, dataSet) {
    this.dataSets[key] = dataSet;
    this.pendingDataSetKeys.delete(key);
    return this;
  };
  /**
   * Retrieves a data set.
   * @param {string} key the key under which to store the data set
   * @returns {Promise<DataSet>} a data set
   * @example
   * let goalsDataSet = model.getDataSet('goals');
   */
  Model.prototype.getDataSet = function(key) {
    return new Promise((resolve, reject) => {
      let dataSet = this.dataSets[key];
      if (dataSet) { return resolve(dataSet); }
      if (!this.pendingDataSetKeys.has(key)) {
        reject(new xylo.XyloNoDataSetException(key));
      }
      const interval = setInterval(() => {
        if (this.dataSets[key]) {
          clearInterval(interval);
          resolve(this.dataSets[key]);
        }
      }, 100);
    });
  };
  /**
   * Fetches a data set from a URL and adds it to the model.
   * @param {string} key the key under which to store the data set
   * @param {string} url the URL from which to retrieve the data
   * @returns {Model} the model
   * @example
   * model.fetchDataSet('goals', 'https://example.com/goals.csv');
   */
  Model.prototype.fetchDataSet = async function(key, url) {
    let fetcher = new xylo.Fetcher(url);
    this.pendingDataSetKeys.add(key);
    try {
      let dataFrame = await fetcher.fetch();
      let dataSet = new xylo.DataSet(dataFrame);
      this.addDataSet(key, dataSet);
      return this;
    } catch (e) {
      console.error(e);
      this.pendingDataSetKeys.delete(key);
    }
  };
  xylo.Model = Model;
})();
