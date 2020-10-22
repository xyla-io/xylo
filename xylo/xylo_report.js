try {
  if (module.exports !== undefined) {
    var xylo = require('./xylo');
  }
} catch (e) {}

(function() {
  /**
   * A data reporter.
   * @class
   * @param {string} csv the CSV encoded data string
   * @property {Object[]} data the report's data rows
   * @memberof module:xylo
   * @example
   * let reporter = new xylo.Reporter('https://api.xyla.io/.com/data.csv');
   */
  function Reporter(csv) {
    const file = new Blob([csv], "data.csv", );
    this.data = dfjs.DataFrame.fromCSV(file);
    console.log('csv', data);
  }
  xylo.Reporter = Reporter;
})();
