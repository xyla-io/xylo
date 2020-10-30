"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RowFilterOps = void 0;
var filter_1 = require("../interfaces/filter");
var RowFilterOps = /** @class */ (function () {
    function RowFilterOps() {
    }
    RowFilterOps.filterRows = function (columnVectors, rowFilters) {
        var _loop_1 = function (i) {
            var filter = rowFilters[i];
            var value = columnVectors[filter.column][i];
            if (!RowFilterOps.operations[filter.operator](value, filter.value)) {
                Object.keys(columnVectors).forEach(function (key) {
                    columnVectors[key].splice(i, 1);
                });
            }
        };
        for (var i = 0; i < rowFilters.length; i++) {
            _loop_1(i);
        }
    };
    RowFilterOps.getVariableRowFilters = function (templateColumn) {
        return templateColumn.options.variableRowFilters || [];
    };
    RowFilterOps.getDefault = function (variableRowFilter, property) {
        if (variableRowFilter.default) {
            return variableRowFilter.default[property];
        }
        if (variableRowFilter[property].constant) {
            return variableRowFilter[property].constant[property];
        }
        return variableRowFilter[property].choices[0][property];
    };
    RowFilterOps.replaceNullsWithDefault = function (rowFilter, variableRowFilter) {
        if (!rowFilter.column) {
            rowFilter.column = RowFilterOps.getDefaultColumn(variableRowFilter);
        }
        if (!rowFilter.operator) {
            rowFilter.operator = RowFilterOps.getDefaultOperator(variableRowFilter);
        }
        if (!rowFilter.value) {
            rowFilter.value = RowFilterOps.getDefaultValue(variableRowFilter, rowFilter.column);
        }
    };
    RowFilterOps.getDefaultColumn = function (variableRowFilter) {
        return RowFilterOps.getDefault(variableRowFilter, 'column');
    };
    RowFilterOps.getDefaultOperator = function (variableRowFilter) {
        return RowFilterOps.getDefault(variableRowFilter, 'operator');
    };
    RowFilterOps.getDefaultValue = function (variableRowFilter, columnLiteral) {
        if (variableRowFilter.default) {
            return variableRowFilter.default.value;
        }
        if (filter_1.hasConstantCrate(variableRowFilter.value)) {
            return variableRowFilter.value.constant;
        }
        var throwImplementationError = function () {
            throw new Error('Code path for default value not available for ' + JSON.stringify(variableRowFilter));
        };
        function getFirstChoice(choices, columnChoices, column) {
            if (choices) {
                return choices[0];
            }
            else if (columnChoices) {
                return columnChoices[column];
            }
            throwImplementationError();
        }
        function getFirstValueForChoice(choice) {
            if (choice.select) {
                if (choice.select.values) {
                    return choice.select.values[0];
                }
                if (typeof choice.select.min === 'number') {
                    return choice.select.min;
                }
            }
            throwImplementationError();
        }
        return getFirstValueForChoice(getFirstChoice(variableRowFilter.value.choices, variableRowFilter.value.columnChoices, columnLiteral));
    };
    RowFilterOps.findFilter = function (rowFilterSet, filterIdentifier) {
        var targetFilter = { rowFilter: null, variableRowFilter: null };
        targetFilter.variableRowFilter = rowFilterSet.variableRowFilters.get(filterIdentifier);
        targetFilter.rowFilter = rowFilterSet.rowFilters.get(filterIdentifier);
        return targetFilter;
    };
    RowFilterOps.shouldShowProductNameFilter = function (rowFilterSet) {
        var variableRowFilter = RowFilterOps.findFilter(rowFilterSet, 'row_filter:product_name').variableRowFilter;
        if (!variableRowFilter) {
            return false;
        }
        if (!filter_1.hasChoicesCrate(variableRowFilter.value)) {
            return false;
        }
        if (!filter_1.hasValueSelectionCrate(variableRowFilter.value.choices)) {
            return false;
        }
        var values = variableRowFilter.value.choices.select.values;
        if (values.filter(function (value) { return value !== 'Other'; }).length < 2) {
            return false;
        }
        return true;
    };
    RowFilterOps.operations = (_a = {},
        _a[filter_1.ComparisonOperator.Equal] = function (variable, constant) {
            return variable === String(constant);
        },
        _a[filter_1.ComparisonOperator.LessThanOrEqual] = function (variable, constant) {
            if (variable === '' || variable === undefined || variable === null) {
                return false;
            }
            return Number(variable) <= Number(constant);
        },
        _a);
    return RowFilterOps;
}());
exports.RowFilterOps = RowFilterOps;
//# sourceMappingURL=row-filter.js.map