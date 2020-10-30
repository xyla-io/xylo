"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColumnOps = void 0;
var lodash_es_1 = require("lodash-es");
var column_1 = require("../interfaces/column");
var row_filter_1 = require("./row-filter");
var inscription_1 = require("./inscription");
var ColumnOps = /** @class */ (function () {
    function ColumnOps() {
    }
    ColumnOps.getDisplayColumnName = function (_a) {
        var displayColumn = _a.displayColumn, templateColumn = _a.templateColumn;
        if (displayColumn) {
            var userDisplayName = displayColumn.parameters.userDisplayName;
            if (userDisplayName) {
                return userDisplayName;
            }
        }
        return inscription_1.InscriptionOps.inscribeAllReplacements({
            baseDisplayName: templateColumn.displayName,
            inscriptionRecords: row_filter_1.RowFilterOps.getVariableRowFilters(templateColumn),
            replacementRecords: displayColumn ? displayColumn.parameters.rowFilters : [],
        });
    };
    ColumnOps.getTemplateColumns = function (displayColumns, templateColumnMap) {
        return displayColumns
            .map(function (displayColumn) { return templateColumnMap.get(displayColumn.identifier); });
    };
    ColumnOps.resolveReferences = function (template, templates) {
        function resolve(innerTemplate) {
            if (ColumnOps.isReferenceColumn(innerTemplate)) {
                var resolvedTemplate = templates.find(function (t) { return t.metadata.identifier === innerTemplate.metadata.reference; });
                return resolvedTemplate;
            }
            return innerTemplate;
        }
        var templateClone = lodash_es_1.cloneDeep(template);
        if (ColumnOps.isQuotientColumn(templateClone)) {
            var resolvedTemplate = Object.assign({}, templateClone, {
                numeratorTemplateColumn: resolve(templateClone.numeratorTemplateColumn),
                denominatorTemplateColumn: resolve(templateClone.denominatorTemplateColumn),
            });
            resolvedTemplate.options.variableRowFilters = (resolvedTemplate.options.variableRowFilters || []).concat(resolvedTemplate.numeratorTemplateColumn.options.variableRowFilters, resolvedTemplate.denominatorTemplateColumn.options.variableRowFilters).filter(function (x) { return x; });
            return resolvedTemplate;
        }
        return templateClone;
    };
    ColumnOps.isConcreteColumn = function (template) {
        return ColumnOps.isSumColumn(template) ||
            ColumnOps.isCountColumn(template) ||
            ColumnOps.isQuotientColumn(template);
    };
    ColumnOps.isSumColumn = function (template) {
        return template.metadata.columnType === column_1.ColumnType.Sum;
    };
    ColumnOps.isCountColumn = function (template) {
        return template.metadata.columnType === column_1.ColumnType.Count;
    };
    ColumnOps.isQuotientColumn = function (template) {
        return template.metadata.columnType === column_1.ColumnType.Quotient;
    };
    ColumnOps.isReferenceColumn = function (template) {
        return template.metadata.columnType === column_1.ColumnType.Reference;
    };
    return ColumnOps;
}());
exports.ColumnOps = ColumnOps;
//# sourceMappingURL=column-ops.js.map