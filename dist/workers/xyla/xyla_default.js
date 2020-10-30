try {
    if (module.exports !== undefined) {
        var xyla = require('./xyla');
    }
}
catch (e) { }
(function () {
    /**
     * Default options.
     * @namespace
     */
    xyla.default = {};
    /**
     * Default axis marker configuration.
     * @member {xyla.AxisMarker} axisMarker
     * @memberof xyla.default
     */
    Object.defineProperty(xyla.default, 'axisMarker', {
        get: function () {
            return {
                title: '',
                width: 1,
                type: xyla.AxisMarkerType.line,
                color: 'black'
            };
        }
    });
    /**
     * Default axis options.
     * @member {xyla.AxisOptions} axisOptions
     * @memberof xyla.default
     */
    Object.defineProperty(xyla.default, 'axisOptions', {
        get: function () {
            return {
                type: xyla.AxisType.auto,
                title: '',
                opposite: false,
                markers: [],
            };
        }
    });
    /**
     * Default axis options.
     * @member {xyla.GraphOptions} graphOptions
     * @memberof xyla.default
     */
    Object.defineProperty(xyla.default, 'graphOptions', {
        get: function () {
            return {
                title: '',
                type: xyla.GraphType.line,
                xAxisOptions: xyla.default.axisOptions,
                yAxisOptions: xyla.default.axisOptions,
                annotations: {},
            };
        }
    });
    /**
     * Default theme.
     * @member {xyla.Theme} theme
     * @memberof xyla.default
     */
    Object.defineProperty(xyla.default, 'theme', {
        get: function () {
            return {
                colors: [
                    '#17A9D4',
                    '#B8D438',
                    '#F3961F',
                    '#BB357A',
                    '#3452A1',
                    '#43A148',
                    '#EC4F27',
                    '#702980',
                ],
            };
        },
    });
    /**
     * Default annotation options.
     * @member {xyla.AnnotationOptions} annotationOptions
     * @memberof xyla.default
     */
    Object.defineProperty(xyla.default, 'annotationOptions', {
        get: function () {
            return {
                position: xyla.AnnotationPosition.top,
                xOffset: 0,
                yOffset: -2,
                theme: xyla.default.theme,
            };
        },
    });
    /**
     * Default element options.
     * @member {xyla.ElementOptions} elementOptions
     * @memberof xyla.default
     */
    Object.defineProperty(xyla.default, 'elementOptions', {
        get: function () {
            return {
                elementID: null,
                title: '',
                theme: xyla.default.theme,
            };
        }
    });
    /**
     * Default render options.
     * @member {xyla.RenderOptions} renderOptions
     * @memberof xyla.default
     */
    Object.defineProperty(xyla.default, 'renderOptions', {
        get: function () {
            return {
                elementOptions: xyla.default.elementOptions,
                graphs: [],
            };
        }
    });
    /**
     * Merges element options with default values to fill missing values.
     * @param {xyla.ElementOptions} options
     * @returns {xyla.ElementOptions} the merged options
     */
    xyla.default.mergeDefaultElementOptions = function (options) {
        var mergedElementOptions = Object.assign({}, xyla.default.elementOptions, options);
        mergedElementOptions.theme = xyla.default.mergeDefaultTheme(mergedElementOptions.theme);
        return mergedElementOptions;
    };
    /**
     * Merges a theme with default values to fill missing values.
     * @param {xyla.Theme} theme
     * @returns {xyla.Theme} the merged theme
     */
    xyla.default.mergeDefaultTheme = function (theme) {
        var mergedTheme = Object.assign({}, xyla.default.theme, theme);
        return mergedTheme;
    };
    /**
     * Merges graph options with default values to fill missing values.
     * @param {xyla.GraphOptions} options
     * @returns {xyla.GraphOptions} the merged options
     */
    xyla.default.mergeDefaultGraphOptions = function (options) {
        var mergedOptions = Object.assign({}, xyla.default.graphOptions, options);
        mergedOptions.xAxisOptions = Object.assign({}, xyla.default.axisOptions, mergedOptions.xAxisOptions);
        mergedOptions.xAxisOptions.markers = mergedOptions.xAxisOptions.markers.map(function (marker) { return Object.assign({}, xyla.default.axisMarker, marker); });
        mergedOptions.yAxisOptions = Object.assign({}, xyla.default.axisOptions, mergedOptions.yAxisOptions);
        mergedOptions.yAxisOptions.markers = mergedOptions.yAxisOptions.markers.map(function (marker) { return Object.assign({}, xyla.default.axisMarker, marker); });
        mergedOptions.theme = Object.assign({}, xyla.default.theme, mergedOptions.theme);
        for (var _i = 0, _a = Object.keys(mergedOptions.annotations); _i < _a.length; _i++) {
            key = _a[_i];
            if (!mergedOptions.annotations[key]) {
                delete mergedOptions.annotations[key];
            }
            else {
                mergedOptions.annotations[key] = Object.assign({}, xyla.default.annotationOptions, (typeof mergedOptions.annotations[key] === 'object') ? mergedOptions.annotations[key] : {});
            }
        }
        return mergedOptions;
    };
    /**
     * Merges render options with default values to fill missing values.
     * @param {xyla.RenderOptions} options
     * @returns {xyla.RenderOptions} the merged options
     */
    xyla.default.mergeDefaultRenderOptions = function (options) {
        var mergedOptions = Object.assign({}, xyla.default.renderOptions, options);
        mergedOptions.elementOptions = xyla.default.mergeDefaultElementOptions(mergedOptions.elementOptions);
        mergedOptions.graphs = mergedOptions.graphs.map(function (g) { return Object.assign({}, g, { graphOptions: xyla.default.mergeDefaultGraphOptions(g.graphOptions) }); });
        return mergedOptions;
    };
})();
//# sourceMappingURL=xyla_default.js.map