"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasChoicesCrate = exports.hasColumnChoicesCrate = exports.hasListChoicesCrate = exports.hasConstantCrate = exports.hasValueSelectionCrate = exports.hasRangeSelectionCrate = exports.hasSelectionCrate = exports.MergeStrategy = exports.ComparisonOperator = void 0;
var ComparisonOperator;
(function (ComparisonOperator) {
    ComparisonOperator["Equal"] = "equal";
    ComparisonOperator["LessThanOrEqual"] = "less_than_or_equal";
})(ComparisonOperator = exports.ComparisonOperator || (exports.ComparisonOperator = {}));
var MergeStrategy;
(function (MergeStrategy) {
    MergeStrategy["Merge"] = "merge";
})(MergeStrategy = exports.MergeStrategy || (exports.MergeStrategy = {}));
function hasSelectionCrate(obj) {
    return obj && obj.select;
}
exports.hasSelectionCrate = hasSelectionCrate;
function hasRangeSelectionCrate(obj) {
    return obj
        && obj.select
        && typeof obj.select.min === 'number'
        && typeof obj.select.max === 'number';
}
exports.hasRangeSelectionCrate = hasRangeSelectionCrate;
function hasValueSelectionCrate(obj) {
    return obj
        && obj.select
        && obj.select.values;
}
exports.hasValueSelectionCrate = hasValueSelectionCrate;
function hasConstantCrate(obj) {
    return obj && obj.constant !== undefined;
}
exports.hasConstantCrate = hasConstantCrate;
function hasListChoicesCrate(obj) {
    return obj && obj.choices && Array.isArray(obj.choices);
}
exports.hasListChoicesCrate = hasListChoicesCrate;
function hasColumnChoicesCrate(obj) {
    return obj && obj.columnChoices;
}
exports.hasColumnChoicesCrate = hasColumnChoicesCrate;
function hasChoicesCrate(obj) {
    return obj && obj.choices;
}
exports.hasChoicesCrate = hasChoicesCrate;
//# sourceMappingURL=filter.js.map