try {
    if (module.exports !== undefined) {
        var xyla = require('./xyla');
    }
}
catch (e) { }
(function () {
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
        records: function () { return function (records) {
            return [{
                    vector: [],
                    rows: records,
                }];
        }; },
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
        records: function (columns) {
            if (columns === void 0) { columns = null; }
            if (columns === null) {
                return function (vectors) { return vectors.map(function (v) {
                    var record = {};
                    v.vector.forEach(function (value, index) { return record[index.toString()] = value; });
                    return record;
                }); };
            }
            var columnMap;
            if (Array.isArray(columns)) {
                columnMap = {};
                columns.forEach(function (column, index) {
                    if (column === null) {
                        return;
                    }
                    columnMap[column] = index;
                });
            }
            else {
                columnMap = columns;
            }
            return function (vectors) { return vectors.map(function (v) {
                record = {};
                Object.keys(columnMap).forEach(function (column) {
                    record[column] = xyla.tools.elementAtRelativeIndex(v.vector, columnMap[column]);
                });
                return record;
            }); };
        },
    };
})();
//# sourceMappingURL=xyla_converters.js.map