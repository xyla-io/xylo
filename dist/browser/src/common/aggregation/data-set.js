"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSet = void 0;
var DataSet = /** @class */ (function () {
    /**
     * Creates an instance of data set.
     * @param key the data frame wrapped by the data set
     * @example ```ts
     * let dataSet = new DataSet(goalsDataFrame);
     * ```
     */
    function DataSet(key) {
        this.key = key;
    }
    return DataSet;
}());
exports.DataSet = DataSet;
//# sourceMappingURL=data-set.js.map