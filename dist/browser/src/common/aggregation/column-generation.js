"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColumnGenerationOps = void 0;
var column_1 = require("../interfaces/column");
var inscription_1 = require("./inscription");
var filter_1 = require("../interfaces/filter");
var template_1 = require("../interfaces/template");
var dynamic_identifier_1 = require("./dynamic-identifier");
var ColumnGenerationOps = /** @class */ (function () {
    function ColumnGenerationOps() {
    }
    ColumnGenerationOps.dynamicColumnCategoryIdentifier = function (generatorIdentifier, value) {
        return dynamic_identifier_1.DynamicIdentifierOps.generateIdentifier({
            namespace: 'dynamic_column_category',
            sourceIdentifier: generatorIdentifier,
            instanceIdentifier: value,
        });
    };
    ColumnGenerationOps.dynamicColumnIdentifier = function (generatorIdentifier, columnInfo, value) {
        return dynamic_identifier_1.DynamicIdentifierOps.generateIdentifier({
            namespace: 'dynamic_column',
            sourceIdentifier: generatorIdentifier,
            sourceTag: columnInfo.tag,
            instanceIdentifier: value,
        });
    };
    ColumnGenerationOps.generateTemplateColumnWithValueFilter = function (generatorIdentifier, columnInfo, filterColumn, value, templateColumns, tagTemplateColumns) {
        var columnTemplate;
        switch (columnInfo.columnType) {
            case column_1.ColumnType.Sum:
                columnTemplate = ColumnGenerationOps.generateTemplateSumColumnWithValueFilter(generatorIdentifier, columnInfo, filterColumn, value);
                break;
            case column_1.ColumnType.Quotient:
                columnTemplate = ColumnGenerationOps.generateTemplateQuotientColumnWithValueFilter(generatorIdentifier, columnInfo, filterColumn, value, templateColumns, tagTemplateColumns);
                break;
        }
        if (!columnTemplate) {
            throw new Error('Received invalid column information when generating dynamic column.');
        }
        return ColumnGenerationOps.applyOptionsToTemplateColumn(columnTemplate, columnInfo.options);
    };
    ColumnGenerationOps.generateTemplateSumColumnWithValueFilter = function (generatorIdentifier, columnInfo, filterColumn, value) {
        return {
            metadata: {
                templateType: template_1.TemplateType.Column,
                columnType: column_1.ColumnType.Sum,
                identifier: ColumnGenerationOps.dynamicColumnIdentifier(generatorIdentifier, columnInfo, value),
            },
            displayName: inscription_1.InscriptionOps.inscribeText(columnInfo.inscribeDisplayName, inscription_1.InscriptionOps.Placeholders.Value, value),
            sumColumn: columnInfo.sumColumn,
            options: {
                rowFilters: [
                    {
                        metadata: {
                            identifier: dynamic_identifier_1.DynamicIdentifierOps.generateIdentifier({
                                namespace: 'row_filter',
                                sourceIdentifier: generatorIdentifier,
                                sourceTag: columnInfo.tag,
                                instanceIdentifier: filterColumn,
                            }),
                            templateType: template_1.TemplateType.RowFilter,
                        },
                        column: filterColumn,
                        operator: filter_1.ComparisonOperator.Equal,
                        value: value,
                    }
                ]
            },
        };
    };
    ColumnGenerationOps.generateTemplateQuotientColumnWithValueFilter = function (generatorIdentifier, columnInfo, filterColumn, value, templateColumns, tagTemplateColumns) {
        var denominatorColumn = ColumnGenerationOps.generateReferenceTemplateColumn(columnInfo.denominatorReference.tag
            ? tagTemplateColumns[columnInfo.denominatorReference.tag].metadata.identifier
            : columnInfo.denominatorReference.template);
        var numeratorColumn = ColumnGenerationOps.generateReferenceTemplateColumn(columnInfo.numeratorReference.tag
            ? tagTemplateColumns[columnInfo.numeratorReference.tag].metadata.identifier
            : columnInfo.numeratorReference.template);
        var quotientColumn = {
            metadata: {
                templateType: template_1.TemplateType.Column,
                columnType: column_1.ColumnType.Quotient,
                identifier: ColumnGenerationOps.dynamicColumnIdentifier(generatorIdentifier, columnInfo, value),
            },
            displayName: inscription_1.InscriptionOps.inscribeText(columnInfo.inscribeDisplayName, inscription_1.InscriptionOps.Placeholders.Value, value),
            denominatorTemplateColumn: denominatorColumn,
            numeratorTemplateColumn: numeratorColumn,
            options: {},
        };
        return quotientColumn;
    };
    ColumnGenerationOps.generateReferenceTemplateColumn = function (reference) {
        return {
            metadata: {
                templateType: template_1.TemplateType.Column,
                columnType: column_1.ColumnType.Reference,
                reference: reference,
            }
        };
    };
    ColumnGenerationOps.applyOptionsToTemplateColumn = function (templateColumn, options) {
        if (!options) {
            return templateColumn;
        }
        if (options.format) {
            templateColumn.options.format = options.format;
        }
        if (options.rowFilters) {
            var existingRowFilterIdentifierSet_1 = new Set((templateColumn.options.rowFilters || []).map(function (rowFilter) { return rowFilter.metadata.identifier; }));
            var newRowFilters = options.rowFilters.filter(function (rowFilter) { return !existingRowFilterIdentifierSet_1.has(rowFilter.metadata.identifier); });
            templateColumn.options.rowFilters = (templateColumn.options.rowFilters || []).concat(newRowFilters);
        }
        if (options.variableRowFilters) {
            var existingVariableRowFilterIdentifierSet_1 = new Set((templateColumn.options.variableRowFilters || []).map(function (variableRowFilter) { return variableRowFilter.metadata.identifier; }));
            var newVariableRowFilters = options.variableRowFilters.filter(function (variableRowFilter) {
                return !existingVariableRowFilterIdentifierSet_1.has(variableRowFilter.metadata.identifier);
            });
            templateColumn.options.variableRowFilters = (templateColumn.options.variableRowFilters || []).concat(newVariableRowFilters);
        }
        return templateColumn;
    };
    return ColumnGenerationOps;
}());
exports.ColumnGenerationOps = ColumnGenerationOps;
//# sourceMappingURL=column-generation.js.map