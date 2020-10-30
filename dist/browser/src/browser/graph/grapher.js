"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Grapher = exports.GraphTypeEnum = exports.TracesFormatEnum = void 0;
var plotly_js_dist_1 = __importDefault(require("plotly.js-dist"));
var uuid_1 = require("uuid");
var index_1 = require("../../../index");
var transformable_1 = require("../../common/parasite/transformable");
var contextual_1 = require("../../common/parasite/contextual");
var theme_1 = require("../../common/theme");
var TracesFormatEnum;
(function (TracesFormatEnum) {
    TracesFormatEnum["Dollar"] = "dollar";
    TracesFormatEnum["Percent"] = "percent";
})(TracesFormatEnum = exports.TracesFormatEnum || (exports.TracesFormatEnum = {}));
var GraphTypeEnum;
(function (GraphTypeEnum) {
    GraphTypeEnum["Line"] = "line";
    GraphTypeEnum["Bar"] = "bar";
    GraphTypeEnum["Scatter"] = "scatter";
})(GraphTypeEnum = exports.GraphTypeEnum || (exports.GraphTypeEnum = {}));
//#endregion
var Grapher = /** @class */ (function () {
    function Grapher(config, context) {
        if (context === void 0) { context = {}; }
        this.transformable = new transformable_1.Transformable(this);
        this.config = config;
        this.dataVectors = [];
        this.graphers = [];
        this.context = Object.assign({}, Grapher.context, context);
        this.contextual = new contextual_1.Contextual(this);
        this.identifier = '';
        this.data = null;
        this.element = null;
        this.theme = null;
    }
    Grapher.mergeOptions = function (options, partialOptions) {
        return Object.freeze(__assign(__assign({}, options), partialOptions));
    };
    Grapher.getTracePropertiesForGraphType = function (graphType) {
        switch (graphType) {
            case GraphTypeEnum.Bar:
                return {
                    type: 'bar',
                    opacity: 0.5,
                };
            case GraphTypeEnum.Scatter:
                return {
                    type: 'scatter',
                    mode: 'markers',
                };
            case GraphTypeEnum.Line:
            default:
                return {
                    type: 'scatter',
                    connectgaps: true,
                    mode: 'lines',
                };
        }
    };
    Grapher.getGlobalStyles = function () {
        return JSON.parse(JSON.stringify(this._globalOptions));
    };
    Grapher.setGlobalStyles = function (options) {
        Grapher._globalOptions = Grapher.mergeOptions(Grapher.defaultGlobalOptions, options);
    };
    Grapher.render = function (config) {
        var grapher = new Grapher(config);
        grapher.prepare();
        grapher.applyTransforms();
        grapher.render();
        return grapher;
    };
    Grapher.makeTrace = function (axisIndex, vectors) {
        return {
            values: vectors.map(function (v) { return index_1.xyla.tools.elementAtRelativeIndex(v.vector, axisIndex); }),
            name: '',
        };
    };
    Grapher.makeGroupTraces = function (xTrace, vectors, groupVectorIndex, xVectorIndex, yVectorIndex) {
        if (groupVectorIndex === void 0) { groupVectorIndex = -3; }
        if (xVectorIndex === void 0) { xVectorIndex = -2; }
        if (yVectorIndex === void 0) { yVectorIndex = -1; }
        var xValueIndexRecord = xTrace.values.reduce(function (record, v, i) {
            record[v] = i;
            return record;
        }, {});
        var traces = [];
        var traceIndexRecord = {};
        vectors.forEach(function (v) {
            var groupName = index_1.xyla.tools.elementAtRelativeIndex(v.vector, groupVectorIndex);
            if (traceIndexRecord[groupName] === undefined) {
                traceIndexRecord[groupName] = traces.length;
                traces.push({
                    values: new Array(xTrace.values.length).fill(null),
                    name: groupName,
                });
            }
            var x = index_1.xyla.tools.elementAtRelativeIndex(v.vector, xVectorIndex);
            var y = index_1.xyla.tools.elementAtRelativeIndex(v.vector, yVectorIndex);
            traces[traceIndexRecord[groupName]].values[xValueIndexRecord[x]] = y;
        });
        return traces;
    };
    Grapher.configurationTemplate = function (configuration) {
        var template = Object.assign({}, configuration);
        if (typeof template.element !== 'string') {
            delete template.element;
        }
        if (typeof template.data !== 'string') {
            delete template.data;
        }
        if (template.graphers) {
            template.graphers = template.graphers.map(function (g) {
                if (typeof g === 'string') {
                    return g;
                }
                var config = g instanceof Grapher ? g.config : g;
                return Grapher.configurationTemplate(config);
            });
        }
        if (template.theme instanceof theme_1.Theme) {
            template.theme = template.theme.template;
        }
        return template;
    };
    Grapher.stringCompare = function (a, b) {
        if (a === null) {
            if (b === null) {
                return 0;
            }
            if (b === undefined) {
                return -1;
            }
            return 1;
        }
        if (b === null) {
            if (a === undefined) {
                return 1;
            }
            return -1;
        }
        return a < b ? -1 : a > b ? 1 : 0;
    };
    Object.defineProperty(Grapher.prototype, "template", {
        get: function () {
            return Grapher.configurationTemplate(this.config);
        },
        enumerable: false,
        configurable: true
    });
    //#region Build
    Grapher.prototype.prepare = function () {
        this.name();
        this.attach();
        this.style();
        this.load();
        this.createGraphers();
        this.graphers.forEach(function (g) { return g.prepare(); });
        return this;
    };
    Grapher.prototype.name = function (identifier) {
        if (identifier === undefined) {
            identifier = this.config.identifier;
        }
        if (typeof identifier !== 'string') {
            identifier = uuid_1.v4();
        }
        this.identifier = identifier;
        return this;
    };
    Grapher.prototype.attach = function (element) {
        if (element === undefined) {
            element = this.config.element;
        }
        this.element = element;
        return this;
    };
    Grapher.prototype.style = function (theme) {
        if (theme === undefined) {
            theme = this.config.theme;
        }
        this.theme = theme instanceof theme_1.Theme ? theme : theme ? new theme_1.Theme(theme) : null;
        return this;
    };
    Grapher.prototype.load = function (data) {
        if (data === undefined) {
            data = this.config.data;
        }
        this.data = data;
        return this;
    };
    Grapher.prototype.createGraphers = function () {
        var _this = this;
        this.graphers = (this.config.graphers || []).map(function (g) { return g instanceof Grapher ? g : new Grapher(g, _this.context); });
        return this;
    };
    Grapher.prototype.applyTransforms = function (ancestors) {
        var _this = this;
        if (ancestors === void 0) { ancestors = []; }
        var parent = ancestors[0];
        var config = this.config;
        this.dataVectors = this.data ? [{
                rows: this.data,
                vector: [],
            }] : parent.dataVectors;
        var t = this.transformable;
        if (config.jsonColumns) {
            Object.entries(config.jsonColumns).forEach(function (_a) {
                var col = _a[0], prefix = _a[1].prefix;
                t.transform(index_1.xyla.transformers.row.jsonColumns(col, function (c) { return "" + prefix + c; }, null, false));
            });
        }
        if (config.filterValues) {
            Object.entries(config.filterValues).forEach(function (_a) {
                var col = _a[0], values = _a[1].values;
                t.transform(index_1.xyla.transformers.row.filterValues(col, values, false));
            });
        }
        if (config.range) {
            Object.entries(config.range).forEach(function (_a) {
                var col = _a[0], _b = _a[1], min = _b[0], max = _b[1];
                if (min !== null) {
                    t.transform(index_1.xyla.transformers.row.filterLess(col, min, true));
                }
                if (max !== null) {
                    t.transform(index_1.xyla.transformers.row.filterGreater(col, max, true));
                }
            });
        }
        if (config.groupBy) {
            t.transform(index_1.xyla.transformers.group.by(config.groupBy.columns, ' '));
        }
        if (typeof config.xAxisColumn === 'string') {
            t.transform(index_1.xyla.transformers.group.distinct(config.xAxisColumn))
                .transform(index_1.xyla.transformers.data.sortIndices(-1));
        }
        if (config.aggregate && config.aggregate.sum) {
            [].concat(config.aggregate.sum).forEach(function (column) {
                var _a;
                t.transform(index_1.xyla.transformers.row.mapCells((_a = {}, _a[column] = parseFloat, _a)))
                    .transform(index_1.xyla.transformers.aggregate.sum(column));
            });
        }
        if (config.transforms && config.transforms.length) {
            config.transforms.forEach(function (transform) {
                var transformer;
                if (Array.isArray(transform)) {
                    var pathComponents = transform[0].split('.');
                    var factoryKey = pathComponents.pop();
                    var factoryCollectionPath = pathComponents.join('.');
                    var factoryCollection = _this.contextual.uncrate(factoryCollectionPath);
                    var factory = factoryCollection[factoryKey];
                    transformer = factory.apply(factoryCollection, transform[1]);
                }
                else {
                    transformer = _this.contextual.uncrate(transform);
                }
                t.transform(transformer);
            });
        }
        var lineage = [this].concat(ancestors);
        this.graphers.map(function (g) { return g.applyTransforms(lineage); });
        return this;
    };
    //#endregion
    //#region Children
    Grapher.prototype.childIndex = function (identifier) {
        for (var index = 0; index < this.graphers.length; ++index) {
            if (this.graphers[index].identifier === identifier) {
                return index;
            }
        }
        return null;
    };
    Grapher.prototype.childIdentifier = function (index) {
        return index < this.graphers.length ? this.graphers[index].identifier : null;
    };
    Grapher.prototype.childAt = function (indexOrIdentifier) {
        var index = typeof (indexOrIdentifier) === 'string' ? this.childIndex(indexOrIdentifier) : indexOrIdentifier;
        if (index === null) {
            return null;
        }
        return index < this.graphers.length ? this.graphers[index] : null;
    };
    Grapher.prototype.addChild = function (child, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.updateLayout, updateLayout = _c === void 0 ? true : _c, _d = _b.updateTraces, updateTraces = _d === void 0 ? true : _d, _e = _b.ancestors, ancestors = _e === void 0 ? [] : _e;
        return this.insertChildAt(this.graphers.length, child, { updateLayout: updateLayout, updateTraces: updateTraces, ancestors: ancestors });
    };
    Grapher.prototype.insertChildAt = function (indexOrIdentifier, child, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.updateLayout, updateLayout = _c === void 0 ? true : _c, _d = _b.updateTraces, updateTraces = _d === void 0 ? true : _d, _e = _b.ancestors, ancestors = _e === void 0 ? [] : _e;
        if (typeof child === 'string') {
            child = this.contextual.uncrate(child);
        }
        if (!this.config.graphers) {
            this.config.graphers = [];
        }
        console.assert(this.config.graphers.length === this.graphers.length, 'Grapher.graphers configuration and state have divered.');
        var index = typeof (indexOrIdentifier) === 'string' ? this.childIndex(indexOrIdentifier) : indexOrIdentifier;
        if (index === null) {
            console.assert(index !== null, "Invalid child indexOrIdentifier: " + indexOrIdentifier);
            return this;
        }
        var childGrapher = child instanceof Grapher ? child : new Grapher(child);
        this.graphers.splice(index, 0, childGrapher);
        this.config.graphers.splice(index, 0, child);
        var lineage = [this].concat(ancestors);
        if (!(child instanceof Grapher)) {
            childGrapher.prepare();
            childGrapher.applyTransforms(lineage);
        }
        if (updateLayout) {
            childGrapher.renderLayout(lineage);
        }
        if (updateTraces) {
            childGrapher.renderTraces(lineage);
        }
        return this;
    };
    Grapher.prototype.replaceChildAt = function (indexOrIdentifier, child, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.updateLayout, updateLayout = _c === void 0 ? true : _c, _d = _b.updateTraces, updateTraces = _d === void 0 ? true : _d, _e = _b.ancestors, ancestors = _e === void 0 ? [] : _e;
        this.removeChildAt(indexOrIdentifier, { updateLayout: updateLayout, updateTraces: updateTraces, ancestors: ancestors });
        return this.insertChildAt(indexOrIdentifier, child, { updateLayout: updateLayout, updateTraces: updateTraces, ancestors: ancestors });
    };
    Grapher.prototype.removeChildAt = function (indexOrIdentifier, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.updateLayout, updateLayout = _c === void 0 ? true : _c, _d = _b.updateTraces, updateTraces = _d === void 0 ? true : _d, _e = _b.ancestors, ancestors = _e === void 0 ? [] : _e;
        console.assert(this.config.graphers.length === this.graphers.length, 'Grapher.graphers configuration and state have divered.');
        var childGrapher = this.childAt(indexOrIdentifier);
        if (!childGrapher) {
            console.assert(!!childGrapher, "Invalid child indexOrIdentifier: " + indexOrIdentifier);
            return this;
        }
        var index = typeof (indexOrIdentifier) === 'string' ? this.childIndex(indexOrIdentifier) : indexOrIdentifier;
        this.graphers.splice(index, 1);
        this.config.graphers.splice(index, 1);
        var lineage = [this].concat(ancestors);
        if (updateLayout) {
            childGrapher.removeLayout(lineage);
        }
        if (updateTraces) {
            childGrapher.removeTraces(lineage);
        }
        return this;
    };
    //#endregion
    //#region Render
    Grapher.prototype.render = function (ancestors) {
        if (ancestors === void 0) { ancestors = []; }
        var lineage = [this].concat(ancestors);
        var element = lineage.reduce(function (e, g) { return e || g.element; }, null);
        if (!element) {
            return;
        }
        if (element === this.element) {
            var layout = this.generateLayout(ancestors);
            element.id = uuid_1.v4();
            plotly_js_dist_1.default.newPlot(element.id, [], layout, {
                displaylogo: false,
                modeBarButtonsToRemove: [
                    'lasso2d', 'toggleSpikelines', 'hoverCompareCartesian', 'hoverClosestCartesian'
                ],
            });
        }
        else {
            this.remove(ancestors);
        }
        this.renderLayout(ancestors);
        this.renderTraces(ancestors);
        return this;
    };
    Grapher.prototype.renderLayout = function (ancestors) {
        if (ancestors === void 0) { ancestors = []; }
        var lineage = [this].concat(ancestors);
        var element = lineage.reduce(function (e, g) { return e || g.element; }, null);
        if (!element) {
            return;
        }
        var layoutUpdate = this.generateLayoutUpdate(ancestors);
        if (Object.keys(layoutUpdate).length) {
            plotly_js_dist_1.default.relayout(element, layoutUpdate);
        }
        return this;
    };
    Grapher.prototype.renderTraces = function (ancestors) {
        if (ancestors === void 0) { ancestors = []; }
        var lineage = [this].concat(ancestors);
        var element = lineage.reduce(function (e, g) { return e || g.element; }, null);
        if (!element) {
            return;
        }
        var traces = this.generateTraces(ancestors);
        if (traces.length) {
            plotly_js_dist_1.default.addTraces(element, traces);
        }
        return this;
    };
    Grapher.prototype.generateLayout = function (ancestors) {
        if (ancestors === void 0) { ancestors = []; }
        var lineage = [this].concat(ancestors);
        var options = this.config.renderOptions || {};
        var renderOptions = Grapher.mergeOptions(Grapher._globalOptions, options || {});
        var valueFormatter = renderOptions.yAxisOptions && renderOptions.yAxisOptions.format ? Grapher.valueFormatters[renderOptions.yAxisOptions.format] : undefined;
        var layout = {
            margin: { l: 64, r: 32, t: 32, b: 32 },
            barmode: 'stack',
            xaxis: {
                domain: [0.0, 1.0],
                type: 'date'
            },
            yaxis: {
                title: renderOptions.yAxisOptions && renderOptions.yAxisOptions.label,
                tickprefix: valueFormatter && valueFormatter.tickprefix,
                ticksuffix: valueFormatter && valueFormatter.ticksuffix,
                tickformat: valueFormatter && valueFormatter.tickformat,
            },
        };
        if (renderOptions.rangeSlider) {
            var distinctValueIndex = lineage.reduce(function (i, g) { return i || (g.config.renderOptions && g.config.renderOptions.distinctValueIndex); }, null);
            var distinctValues = Number.isInteger(distinctValueIndex) ? Grapher.makeTrace(distinctValueIndex, this.dataVectors) : null;
            if (distinctValues) {
                Object.assign(layout.xaxis, {
                    title: distinctValues.name,
                    rangeslider: { range: [distinctValues.values[0], distinctValues.values[distinctValues.values.length - 1]] },
                });
            }
        }
        return layout;
    };
    Grapher.prototype.generateLayoutUpdate = function (ancestors) {
        if (ancestors === void 0) { ancestors = []; }
        var lineage = [this].concat(ancestors);
        var layout = {};
        if (this.config.renderOptions) {
            var renderOptions = this.config.renderOptions;
            var yAxis = 'yaxis';
            if (renderOptions.yAxis > 1) {
                var yAxisIndex = renderOptions.yAxis;
                yAxis = yAxis + yAxisIndex;
                layout[yAxis + '.overlaying'] = 'y';
                layout[yAxis + '.side'] = yAxisIndex % 2 ? 'left' : 'right';
                layout[yAxis + '.anchor'] = yAxisIndex > 2 ? 'free' : 'x';
                var extraLeftAxes = Math.ceil((yAxisIndex - 2) / 2);
                var extraRightAxes = Math.ceil((yAxisIndex - 1) / 2);
                layout['xaxis.domain'] = [extraLeftAxes * 0.05, 1.0 - extraRightAxes * 0.05];
                for (var axisIndex = yAxisIndex; axisIndex > 2; axisIndex--) {
                    layout['yaxis' + axisIndex + '.position'] = axisIndex % 2 ? (extraLeftAxes - Math.ceil((axisIndex - 2) / 2)) * 0.05 : 1.0 - (extraRightAxes - Math.ceil((axisIndex - 1) / 2)) * 0.05;
                }
            }
            layout[yAxis + '.title'] = (renderOptions.yAxisOptions && renderOptions.yAxisOptions.label) || '';
            layout[yAxis + '.tickprefix'] = '';
            layout[yAxis + '.ticksuffix'] = '';
            layout[yAxis + '.tickformat'] = '';
            if (renderOptions.yAxisOptions && renderOptions.yAxisOptions.format) {
                var valueFormatter = renderOptions.yAxisOptions && renderOptions.yAxisOptions.format ? Grapher.valueFormatters[renderOptions.yAxisOptions.format] : undefined;
                if (valueFormatter) {
                    layout[yAxis + '.tickprefix'] = valueFormatter.tickprefix || '';
                    layout[yAxis + '.ticksuffix'] = valueFormatter.ticksuffix || '';
                    layout[yAxis + '.tickformat'] = valueFormatter.tickformat || '';
                }
            }
        }
        this.graphers.forEach(function (g) { return Object.assign(layout, g.generateLayoutUpdate(lineage)); });
        return layout;
    };
    Grapher.prototype.generateTraces = function (ancestors) {
        var _this = this;
        if (ancestors === void 0) { ancestors = []; }
        var lineage = [this].concat(ancestors);
        var renderOptions = this.config.renderOptions || {};
        var traces = [];
        if (Number.isInteger(renderOptions.traceIndex)) {
            var distinctValueIndex = lineage.reduce(function (i, g) { return i || (g.config.renderOptions && g.config.renderOptions.distinctValueIndex); }, null);
            var distinctValues_1 = Number.isInteger(distinctValueIndex) ? Grapher.makeTrace(distinctValueIndex, this.dataVectors) : null;
            var graphType_1 = lineage.reduce(function (t, g) { return t || (g.config.renderOptions.graphType && g.config.renderOptions.graphType); }, null);
            var theme_2 = lineage.reduce(function (t, g) { return t || g.theme; }, null);
            var groupBy = lineage.reduce(function (t, g) { return t || g.config.groupBy; }, null);
            var tracesData = groupBy ? Grapher.makeGroupTraces(distinctValues_1, this.dataVectors, renderOptions.groupIndex, renderOptions.distinctValueIndex, renderOptions.traceIndex) : [Grapher.makeTrace(renderOptions.traceIndex, this.dataVectors)];
            traces = tracesData.sort(function (a, b) { return Grapher.stringCompare(a.name, b.name); }).map(function (trace) { return (Object.assign({
                x: distinctValues_1.values,
                y: trace.values.map(function (v) { return +(Math.round(Number(v + 'e+2')) + 'e-2'); }),
                name: renderOptions.yAxisOptions && renderOptions.yAxisOptions.label ? String(trace.name) + ' · ' + renderOptions.yAxisOptions.label : trace.name,
                yaxis: renderOptions.yAxis > 1 ? 'y' + renderOptions.yAxis : undefined,
                line: { shape: 'spline' },
                showlegend: true,
                marker: { color: theme_1.Theme.colorString(theme_2 ? theme_2.mappedColor(String(trace.name)) : undefined), width: 3 },
            }, Grapher.getTracePropertiesForGraphType(graphType_1), _this.identifier ? {
                meta: [_this.identifier],
            } : {})); });
        }
        traces = this.graphers.reduce(function (d, g) { return d.concat(g.generateTraces(lineage)); }, traces);
        return traces;
    };
    //#endregion
    //#region Remove
    Grapher.prototype.remove = function (ancestors) {
        if (ancestors === void 0) { ancestors = []; }
        this.removeLayout(ancestors);
        this.removeTraces(ancestors);
        return this;
    };
    Grapher.prototype.removeTraces = function (ancestors) {
        if (ancestors === void 0) { ancestors = []; }
        var traceIndices = this.identifyTraces(ancestors);
        if (!traceIndices.length) {
            return;
        }
        var lineage = [this].concat(ancestors);
        var element = lineage.reduce(function (e, g) { return e || g.element; }, null);
        if (!element) {
            return;
        }
        plotly_js_dist_1.default.deleteTraces(element, traceIndices);
        return this;
    };
    Grapher.prototype.identifyTraces = function (ancestors) {
        var _this = this;
        if (ancestors === void 0) { ancestors = []; }
        var lineage = [this].concat(ancestors);
        var traceIndices = [];
        if (this.identifier) {
            var element = lineage.reduce(function (e, g) { return e || g.element; }, null);
            if (element && element.data) {
                element.data.forEach(function (d, i) {
                    if (d.meta && d.meta[0] === _this.identifier) {
                        traceIndices.push(i);
                    }
                });
            }
        }
        traceIndices = this.graphers.reduce(function (t, g) { return t.concat(g.identifyTraces(lineage)); }, traceIndices);
        return traceIndices;
    };
    Grapher.prototype.removeLayout = function (ancestors) {
        if (ancestors === void 0) { ancestors = []; }
        var layout = this.identifyLayout(ancestors);
        if (!Object.keys(layout).length) {
            return;
        }
        var lineage = [this].concat(ancestors);
        var element = lineage.reduce(function (e, g) { return e || g.element; }, null);
        if (!element) {
            return;
        }
        plotly_js_dist_1.default.relayout(element, layout);
        return this;
    };
    Grapher.prototype.identifyLayout = function (ancestors) {
        if (ancestors === void 0) { ancestors = []; }
        return {};
    };
    //#region Static
    Grapher.defaultGlobalOptions = Object.freeze({
        palette: [
            // { name: 'primary', value: '#5603AD' },
            { name: 'primary', value: '#31017C' },
            { name: 'primary-light', value: '#D395F6' },
            { name: 'danger', value: '#FF0033' },
            { name: 'warning', value: '#F8BB04' },
            { name: 'warning', value: '#F8BB04' },
        ],
        graphType: GraphTypeEnum.Line,
    });
    Grapher.valueFormatters = Object.freeze((_a = {},
        _a[TracesFormatEnum.Dollar] = { tickprefix: '$' },
        _a[TracesFormatEnum.Percent] = { tickformat: '.1%' },
        _a));
    Grapher._globalOptions = Grapher.defaultGlobalOptions;
    Grapher.context = {
        xyla: index_1.xyla,
    };
    Grapher.contextual = new contextual_1.Contextual(Grapher);
    return Grapher;
}());
exports.Grapher = Grapher;
//# sourceMappingURL=grapher.js.map