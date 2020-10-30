"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReducerOps = void 0;
var column_1 = require("../interfaces/column");
var ReducerOps = /** @class */ (function () {
    function ReducerOps() {
    }
    ReducerOps.operations = (_a = {},
        _a[column_1.ColumnType.Count] = function (column, accumulator, value) {
            if (value === column.countValue) {
                accumulator += 1;
            }
            return accumulator;
        },
        _a[column_1.ColumnType.Sum] = function (column, accumulator, value) {
            return accumulator + (Number(value) || 0);
        },
        _a[column_1.ColumnType.Quotient] = function (column, accumulator, value) {
            accumulator.numerator = ReducerOps[column.numeratorTemplateColumn.metadata.columnType];
        },
        _a);
    return ReducerOps;
}());
exports.ReducerOps = ReducerOps;
//# sourceMappingURL=reducer-ops.js.map