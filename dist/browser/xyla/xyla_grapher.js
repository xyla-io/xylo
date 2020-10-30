try {
    if (module.exports !== undefined) {
        var xyla = require('./xyla');
    }
}
catch (e) { }
(function () {
    /**
     * Functions specitic to graphing libraries.
     * @namespace
     */
    xyla.grapher = {};
    /**
     * Functions specific to Highcharts.
     */
    xyla.grapher.highcharts = {};
    /**
     * Translates a Xyla graph type into a Highcharts graph type.
     * @param {GraphType} graphType a graph type
     * @returns {object} a corresponding graph type object to pass to Highcharts that includes type and typeOptions properties
     */
    xyla.grapher.highcharts.graphType = function (graphType) {
        switch (graphType) {
            case xyla.GraphType.bar:
            case xyla.GraphType.stackedBar:
                return 'column';
            case xyla.GraphType.dashedLine:
                return 'line';
            default: return graphType;
        }
    };
    /**
     * Generates a Highcharts series options based on the graph type.
     * @param {GraphType} graphType a graph type
     * @returns {object} the corresponding series options for a graph type
     */
    xyla.grapher.highcharts.seriesOptions = function (graphType) {
        var options = {
            type: xyla.grapher.highcharts.graphType(graphType),
        };
        switch (graphType) {
            case xyla.GraphType.stackedBar:
                options.stacking = 'normal';
                break;
            case xyla.GraphType.dashedLine:
                options.dashStyle = 'Dash';
        }
        return options;
    };
    /**
     * Translates a Xyla axis type into a Highcharts axis type.
     * @param {AxisType} axisType an axis type
     * @returns {string} a corresponding axis type to pass to Highcharts
     */
    xyla.grapher.highcharts.axisType = function (axisType) {
        switch (axisType) {
            case xyla.AxisType.auto: return 'linear';
            case xyla.AxisType.number: return 'linear';
            case xyla.AxisType.date: return 'datetime';
            default: return axisType;
        }
    };
    /**
     * Constructs Highcharts axis options from Xyla axis options.
     * @param {AxisOptions} axisOptions axis options
     * @returns {object} corresponding axis options for Highcharts
     */
    xyla.grapher.highcharts.axisOptions = function (axisOptions) {
        var options = {
            type: xyla.grapher.highcharts.axisType(axisOptions.type),
            title: {
                text: axisOptions.title,
            },
            opposite: axisOptions.opposite,
            plotLines: axisOptions.markers.map(function (marker) {
                return {
                    value: marker.position,
                    dashStyle: marker.type,
                    width: marker.width,
                    color: marker.color,
                    label: {
                        text: marker.title
                    },
                };
            }),
        };
        if (options.type === 'datetime') {
            options.dateTimeLabelFormats = {
                millisecond: '%H:%M:%S.%L',
                second: '%H:%M:%S',
                minute: '%H:%M',
                hour: '%H:%M',
                day: '%b %e',
                week: '%b %e',
                month: '%b \'%y',
                year: '%Y'
            };
        }
        options.labels = {};
        if (axisOptions.labelRotation !== undefined) {
            options.labels.rotation = axisOptions.labelRotation;
            if (axisOptions.labelRotation < 0) {
                options.labels.align = 'right';
            }
            else if (axisOptions.labelRotation > 0) {
                options.labels.align = 'left';
            }
            else {
                options.labels.align = 'center';
            }
        }
        if (axisOptions.labelInterval !== undefined) {
            options.labels.tickInterval = axisOptions.labelInterval;
        }
        if (axisOptions.format) {
            options.labels.formatter = function () {
                return xyla.formatters.apply(this.value, axisOptions.format);
            };
        }
        return options;
    };
    /**
     * Writes tooltip styles to the HTML document––Xyla style!
     *
     * This function has a side-effect that writes global tooltip-related
     * styles to the current HTML document.
     */
    xyla.grapher.highcharts.formatTooltipsWithCSS = function () {
        xyla.tools.css.addStyleStringToDocument("@import 'https://code.highcharts.com/css/highcharts.css';");
        xyla.tools.css.addGlobalStyles({
            '.highcharts-tooltip text': {
                'fill': 'white',
                'text-shadow': '0 0 3px black'
            },
            '.highcharts-tooltip-box': {
                'fill': 'black',
                'fill-opacity': '0.6',
                'stroke-width': '0',
                'border-radius': '5px',
            },
        });
    };
    /**
     * Generate Highcharts tooltip options.
     * @param {Array<xyla.RenderGraphOptions>} graphs an array of graph rendering options
     * @returns {object} a Highcharts top-level tooltip object
     */
    xyla.grapher.highcharts.tooltipOptions = function (graphs) {
        var yAxes = graphs.map(function (g) {
            if (g.graphOptions && g.graphOptions.yAxisOptions) {
                return g.graphOptions.yAxisOptions;
            }
            return undefined;
        }).filter(function (value) { return value; });
        var tooltip = {
            borderWidth: 0,
            borderRadius: 6,
            useHTML: true,
            shadow: false,
            style: {
                // Defining this color is required with the current 
                // CSS styles defined in `formatTooltipsWithCSS()`
                color: '#FFFFFF',
            }
        };
        var axisFormats = {
            primary: undefined,
            opposite: undefined,
        };
        yAxes.forEach(function (axis) {
            if (axis.opposite) {
                axisFormats.opposite = axis.format;
            }
            else {
                axisFormats.primary = axis.format;
            }
        });
        tooltip.formatter = function () {
            var format = this.series.yAxis.opposite ? axisFormats.opposite : axisFormats.primary;
            return xyla.formatters.apply(this.y, format);
        };
        return tooltip;
    };
    /**
     * Get the color for a group
     * @param {number} groupIndex the index of the group
     * @param {object} elementOptions the options for the containing element
     * @param {object} graphOptions the options for group's graph
     * @param {string} graphType the Highcharts type for the graph
     */
    xyla.grapher.highcharts.groupColor = function (groupIndex, elementOptions, graphOptions, graphType) {
        var groupColor = undefined;
        if (elementOptions.theme.colors.length) {
            groupColor = elementOptions.theme.colors[groupIndex % elementOptions.theme.colors.length];
        }
        if (graphOptions && graphOptions.theme && graphOptions.theme.colors) {
            if (graphOptions.theme.colors.length) {
                groupColor = graphOptions.theme.colors[groupIndex % graphOptions.theme.colors.length];
            }
        }
        if (graphType === 'line') {
            groupColor = xyla.tools.color.darken(groupColor, 10);
        }
        else {
            groupColor = xyla.tools.color.lighten(groupColor, 5);
        }
        return groupColor;
    };
    /**
     * Produces a Highcharts annotations object for displaying labels for the sum of each group
     * in a graph.
     * @param {array<xyla.DataVector>} vectors the graph rendering options to build the annotation labels for
     * @param {xyla.AnnotationOptions} options the options for the graph's annotations
     * @param {number} [graphIndex=0] the index of the graph in a multi-graph
     * @param {string|xyla.ValueFormatter} [format] the formatter to apply to the annotation
     * @returns {object} a Highcharts annotation object
     */
    xyla.grapher.highcharts.groupSumAnnotations = function (vectors, options, graphIndex, format) {
        if (graphIndex === undefined) {
            graphIndex = 0;
        }
        var groupSums = {};
        var labels = [];
        vectors.forEach(function (v) {
            var key = xyla.tools.elementAtRelativeIndex(v.vector, -2);
            var value = xyla.tools.elementAtRelativeIndex(v.vector, -1);
            if (!groupSums[key]) {
                groupSums[key] = value;
            }
            else {
                groupSums[key] += value;
            }
        });
        Object.keys(groupSums).forEach(function (key) {
            var y = (function () {
                switch (options.position) {
                    case 'bottom': return 0;
                    case 'top': return groupSums[key];
                    default: return xyla.tools.presentError(new Error('Position is required for group sum annotations.'));
                }
            })();
            // TODO Should we be passing in the AxisOptions.type instead of checking for a date here?
            var x = xyla.tools.isValidISO8601(key) ? new Date(key) : key;
            labels.push({
                point: {
                    x: x,
                    y: y,
                    yAxis: graphIndex,
                    xAxis: 0,
                },
                formatter: function () { return xyla.formatters.apply(groupSums[key], format); },
                x: options.xOffset,
                y: options.yOffset,
            });
        });
        return {
            labels: labels,
            draggable: '',
            labelOptions: {
                shape: 'rect',
                padding: 3,
            },
        };
    };
    /**
     * Produces a Highcharts annotations array that contains annotations
     * for each graph.
     * @param {Array<xyla.RenderGraphOptions>} graphs the graph rendering options to build annotations for
     * @return {Array<object>} the array of annotation objects to be passed to Highcharts
     */
    xyla.grapher.highcharts.annotations = function (graphs) {
        var annotations = [];
        graphs.forEach(function (graph, index) {
            if (graph.graphOptions.annotations.groupSum) {
                var annotation = xyla.grapher.highcharts.groupSumAnnotations(graph.dataVectors, graph.graphOptions.annotations.groupSum, index, graph.graphOptions.yAxisOptions.format);
                annotations.push(annotation);
            }
        });
        return annotations;
    };
    /**
     * Renders a Highcharts graph.
     * @param {xyla.RenderOptions} options the graph rendering options
     */
    xyla.grapher.highcharts.render = function (renderOptions) {
        var seriesIndex = -3;
        var xIndex = -2;
        var yIndex = -1;
        xyla.grapher.highcharts.formatTooltipsWithCSS();
        var mergedRenderOptions = xyla.default.mergeDefaultRenderOptions(renderOptions);
        var options = {
            credits: {
                enabled: false,
            },
            title: {
                text: mergedRenderOptions.elementOptions.title,
            },
            xAxis: [],
            yAxis: [],
            series: [],
            colors: mergedRenderOptions.elementOptions.theme.colors,
            tooltip: xyla.grapher.highcharts.tooltipOptions(mergedRenderOptions.graphs),
            annotations: xyla.grapher.highcharts.annotations(mergedRenderOptions.graphs),
        };
        var groupIndexMap = {};
        renderOptions.graphs.forEach(function (g, index) {
            var vectors = g.dataVectors;
            var mergedGraphOptions = mergedRenderOptions.graphs[index].graphOptions;
            var newXAxis = ((g.graphOptions && g.graphOptions.xAxisOptions) || index === 0) ? mergedGraphOptions.xAxisOptions : null;
            vectors = xyla.grapher.highcharts.prepareAxis(newXAxis, xIndex, options.xAxis, vectors);
            var newYAxis = ((g.graphOptions && g.graphOptions.yAxisOptions) || index === 0) ? mergedGraphOptions.yAxisOptions : null;
            vectors = xyla.grapher.highcharts.prepareAxis(newYAxis, yIndex, options.yAxis, vectors);
            var series = [];
            var seriesMap = {};
            var seriesOptions = xyla.grapher.highcharts.seriesOptions(mergedGraphOptions.type);
            vectors.forEach(function (v) {
                var groupName = xyla.tools.elementAtRelativeIndex(v.vector, seriesIndex);
                if (seriesMap[groupName] === undefined) {
                    seriesMap[groupName] = series.length;
                    if (groupIndexMap[groupName] === undefined) {
                        groupIndexMap[groupName] = seriesMap[groupName];
                    }
                    var groupIndex = groupIndexMap[groupName];
                    var groupColor = xyla.grapher.highcharts.groupColor(groupIndex, mergedRenderOptions.elementOptions, g.graphOptions, mergedGraphOptions.type);
                    series.push(Object.assign({
                        xAxis: options.xAxis.length - 1,
                        yAxis: options.yAxis.length - 1,
                        name: (renderOptions.graphs.length > 1 && g.elementOptions && g.elementOptions.title) ? g.elementOptions.title + " " + groupName : groupName,
                        data: [],
                        color: groupColor,
                    }, seriesOptions));
                }
                series[seriesMap[groupName]].data.push(v.vector.slice(v.vector.length - 2));
            });
            options.series = options.series.concat(series);
        });
        Highcharts.chart(mergedRenderOptions.elementOptions.elementID, options);
    };
    xyla.grapher.highcharts.prepareAxis = function (axisOptions, axisIndex, axes, vectors) {
        if (axisOptions) {
            if (axisOptions.type === xyla.AxisType.auto) {
                var typeVectors = xyla.transformers.vector.axisType(axisIndex)(vectors);
                axisOptions.type = xyla.AxisType.number;
                for (var i = 0; i < typeVectors.length; i++) {
                    if (typeVectors[i].vector[axisIndex] !== null) {
                        axisOptions.type = xyla.tools.elementAtRelativeIndex(typeVectors[i].vector, axisIndex);
                        break;
                    }
                }
            }
            axes.push(xyla.grapher.highcharts.axisOptions(axisOptions));
        }
        var axis = axes[axes.length - 1];
        if (axis.type === xyla.grapher.highcharts.axisType(xyla.AxisType.date)) {
            vectors = xyla.transformers.vector.timestamp(axisIndex)(vectors);
            // TODO Should we be setting axisOptions.type=xyla.AxisType.date here?
        }
        return vectors;
    };
})();
//# sourceMappingURL=xyla_grapher.js.map