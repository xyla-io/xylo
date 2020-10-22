try {
  if (module.exports !== undefined) {
    var xyla = require('./xyla');
  }
} catch (e) {}

(function() {
  /**
   * Xyla data vector converters.
   * @namespace
   */
  xyla.converters = {};

  /**
   * Converters that create data vectors from other data.
   * @namespace
   */
  xyla.converters.from = {
    /**
     * Generates a data vector array from an array of dictionaries.
     * @returns {DataVectorConverterFrom} the converter
     */
    records: () => records => {
      return [{
        vector: [],
        rows: records,
      }];
    },
  };

  /**
   * Converters that create other data formats from data vectors.
   * @namespace
   */
  xyla.converters.to = {
    /**
     * Generates an array of dictionaries from a data vector array.
     * @param {Array<string>|object<string, integer>} [columns=null] an optional array of column names or dictionary mapping column names to vector indicies
     * @returns {DataVectorConverterTo} the converter
     */
    records: (columns = null) => {
      if (columns === null) {
        return vectors => vectors.map(v => {
          const record = {};
          v.vector.forEach((value, index) => record[index.toString()] = value);
          return record;
        });
      }
      let columnMap;
      if (Array.isArray(columns)) {
        columnMap = {};
        columns.forEach((column, index) => {
          if (column === null) { return; }
          columnMap[column] = index;
        });
      } else {
        columnMap = columns;
      }
      return vectors => vectors.map(v => {
        record = {};
        Object.keys(columnMap).forEach(column => {
          record[column] = xyla.tools.elementAtRelativeIndex(v.vector, columnMap[column]);
        });
        return record;
      });
    },
  };

})();
