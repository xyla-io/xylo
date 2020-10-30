"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.propertyCombinations = void 0;
function propertyCombinations(properties, records, preserveTypes, missingValue) {
    if (preserveTypes === void 0) { preserveTypes = true; }
    if (missingValue === void 0) { missingValue = undefined; }
    var combinations = {};
    records.forEach(function (record) {
        var propertyCombinations = combinations;
        properties.forEach(function (property) {
            var rawValue = record[property];
            if (rawValue === undefined) {
                if (missingValue === undefined) {
                    return;
                }
                rawValue = missingValue;
            }
            var value = preserveTypes ? JSON.stringify(record[property]) : record[property].toString();
            if (!Object.keys(propertyCombinations).includes(value)) {
                propertyCombinations[value] = {};
            }
            propertyCombinations = propertyCombinations[value];
        });
    });
    var output = [];
    function addCombinations(prefix, valueCombinations) {
        Object.keys(valueCombinations).forEach(function (value) {
            var valuePrefix = prefix.concat(preserveTypes ? JSON.parse(value) : value);
            output.push(valuePrefix);
            addCombinations(valuePrefix, valueCombinations[value]);
        });
    }
    addCombinations([], combinations);
    return output;
}
exports.propertyCombinations = propertyCombinations;
//# sourceMappingURL=collection.js.map