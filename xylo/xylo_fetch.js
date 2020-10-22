try {
  if (module.exports !== undefined) {
    var xylo = require('./xylo');
  }
} catch (e) {}

(function() {
  /**
   * A data fetcher.
   * @class
   * @param {string} url the URL from which to fetch the data
   * @property {string} url the data URL
   * @memberof module:xylo
   * @example
   * let newfetcher = new xylo.Fetcher('https://example.com/data.csv');
   */
  function Fetcher(url) {
    this.url = url;
  }
  /**
   * Fetches the data set.
   * @returns {Promise<any>} a promise resolving to the fetched data frame
   * @example
   * fetcher.fetch().then(dataFrame => console.log(dataFrame));
   */
  Fetcher.prototype.fetch = function() {
    return dfjs.DataFrame.fromCSV(this.url);
  }
  xylo.Fetcher = Fetcher;
})();

