/**
 * This is the xyla object. Utilities functions are available as static methods of this object.
 * @global
 * @namespace
 * @module xyla
 */

var xyla = {};
try {
  if (module.exports !== undefined) {
    module.exports = xyla;
  }
} catch (e) {}

(function() {
  /**
   * Wait to run a callback function until the document is ready to be manipulated.
   * @param {function} callback the function to run when the document is stable
   * @example xyla.ready(function() {
   *   // Your code here...
   * });
   **/
  xyla.ready = function(callback) {
    $(document).ready(callback);
  }

  /**
   * A mix-in for objects that can be rendered in an HTML element.
   * @mixin
   */
  xyla.Renderable = {
    /**
     * Renders the graph.
     * 
     * @returns the object
     */
    render: function() {
      let renderOptions = {
        elementOptions: this.elementOptions,
        graphs: [{
          graphOptions: this.graphOptions,
          dataVectors: this.dataVectors,
        }],
      };
      xyla.tools.render(renderOptions);
      return this;
    },
  };

  /**
   * A mix-in for objects that can be transformed with a `DataVectorTransformer`.
   * @mixin
   */
  xyla.Transformable = {
    /**
     * Transforms the receiver's data vectors.
     * @param {...xyla.DataVectorTransformer} transformers one or more transformers to apply
     * @returns the receiver
     */
    transform: function(...transformers) {
      this.dataVectors = xyla.tools.transformVectors(this.dataVectors, ...transformers);
      return this;
    },
  };

  /**
   * Xyla Graph base class.
   * @class
   * @extends mode
   * @mixes xyla.Renderable
   * @mixes xyla.Transformable
   * @property {xyla.DataVector} dataBectors the graph's vectors
   * @property {xyla.GraphOptions} graphOptions the graph's options
   * @property {xyla.ElementOptions} elementOptions the graph's target element options
   * 
   * @example // Make a Graph instance for later use
   * let graph = new xyla.Graph();
   * @example // Define and render a graph all at once
   * new xyla.Graph()
   *     .options({
   *         title: 'ROAS',
   *         markers: [{position: 8, title: 'Uncrystallized'}]
   *     })
   *     .dataVectors(vectors)
   *     .targetElementID('graph')
   *     .render();
   */
  xyla.Graph = function() {
    this.dataVectors = null;
    this.graphOptions = null;
    this.elementOptions = null;
  };
  Object.assign(xyla.Graph.prototype, xyla.Renderable, xyla.Transformable);
  /**
   * Sets the graph's vectors.
   * 
   * @param {Array<DataVector>} vectors to use as the data set
   * @example graph.dataVectors(vectors);
   */
  xyla.Graph.prototype.setDataVectors = function(vectors) {
    this.dataVectors = (Array.isArray(vectors)) ? vectors : [vectors];
    return this;
  };
  /**
   * Sets the graphs options.
   * 
   * @param {object} options to use when rendering the graph
   * @example graph.graphOptions({title: 'Performance'});
   */
  xyla.Graph.prototype.setGraphOptions = function(options) {
    this.graphOptions = options;
    return this;
  };
  /**
   * Sets the graph's target element ID for rendering.
   * 
   * @param {ElementOptions} elementOptions options related to the HTML element in which the graph will render
   * @example // <div> in HTML
   * <div id="graph"></div>
   * @example // in <script>
   * graph.targetElementOptions({elementID: 'graph', title: 'CPI'});
   */
  xyla.Graph.prototype.setElementOptions = function(elementOptions) {
    this.elementOptions = elementOptions;
    return this;
  };
  /**
   * Perform a left join on multiple data sources
   *
   * @param {string|object|Array<string|object>} columns mapping of columns to join on
   *
   * @example // Join on 'campaign_id' in both data sources
   * graph.leftJoin('campaign_id');
   *
   * @example // Join on 'campaign_id' and 'platform' in both data sources
   * graph.leftJoin(['campaign_id', 'platform']);
   *
   * @example // Join on 'campaign_id' in data source 1 and map to 'campaignID' in data source 2
   * graph.leftJoin([{campaign_id: 'campaignID'}]);
   */
  xyla.Graph.prototype.leftJoinGraph = function(columns) {
    let mapping = {};
    if (typeof columns === 'string') {
      mapping[columns] = columns;
    }
    if (typeof columns === 'array') {
      columns.forEach(col => mapping[col] = col);
    }
    if (typeof columns === 'object') {
      mapping = columns;
    }
    this.transform(xyla.transformers.join.on(mapping));
    return this;
  };
  /**
   * Split the data into multiple plot groups
   * 
   * @param {string|Array<string>} columns to group data by
   * @param {string} separator displayed between column names (used in legend)
   * @example graph.groupBy('campaign_type');
   * @example graph.groupBy('platform', '|');
   */
  xyla.Graph.prototype.addGroupNamesDimension = function(columns, separator) {
    this.transform(xyla.transformers.group.by(columns, separator));
    return this;
  };
  /**
   * Set the group name for a series of points that do not require
   * a column to group by (`#addGroupNamesDimension()`).
   * This is the name that will appear in the legend.
   * @param {string} groupName the group name of the data 
   */
  xyla.Graph.prototype.setGroupName = function(groupName) {
    this.transform(xyla.transformers.vector.append(groupName));
    return this;
  };
  /**
   * Choose a data column that will be distinct along an axis 
   * 
   * @param {string} column name of the data column to break into distinct groups
   * @example graph.groupDistinct('cohort_date');
   */
  xyla.Graph.prototype.addDistinctValuesDimension = function(column) {
    this.transform(xyla.transformers.group.distinct(column));
    return this;
  };
  /**
   * Calculate a sum for each of the given columns
   * 
   * @param {string|Array<string>} columns to calulate a sum over
   * @example graph.sum('spend_dollars');
   */
  xyla.Graph.prototype.addSumDimension = function(columns) {
    this.transform(xyla.transformers.aggregate.sum(columns));
    return this;
  };
  /**
   * Calculate a ratio for two given columns
   * 
   * @param {string} numeratorColumn to divide
   * @param {string} denominatorColumn to divide by
   * @example graph.ratio('spend_dollars', 'installs');
   */
  xyla.Graph.prototype.addQuotientDimension = function(numeratorColumn, denominatorColumn) {
    this.transform(
      xyla.transformers.aggregate.sum(numeratorColumn),
      xyla.transformers.aggregate.sum(denominatorColumn),
      xyla.transformers.vector.quotient(),
    );
    return this;
  };
  /**
   * Align the end of the data by removing rows that contain empty data for certain columns
   * 
   * @param {string} alignColumn the column on which to align the data
   * @param {Array<Array<string>>} requiredColumnSets groups of columns to require. Data will be considered incomplete if it does not contain a truthy value in at least one column in each group.
   */
  xyla.Graph.prototype.alignDataEnd = function(alignColumn, ...requiredColumnSets) {
    this.transform(xyla.transformers.data.align(alignColumn, requiredColumnSets, false, true));
    return this;
  }

  /**
   * A Graph subclass for graphing the sum of a column.
   * 
   * @param {Array<DataVector>} vectors data vectors to graph
   * @param {Array<string>|string} colorByColumns columns by which to separate and color graph plots
   * @param {string} xColumn the x-axis column
   * @param {string} yColumn the y-axis column to be summed
   * 
   * @class
   * @extends xyla.Graph
   * @example
   * let sumGraph = new xyla.SumGraph(vectors, ['campaign_tag', 'channel'], 'date', 'spend').render('spend_graph');
   */
  xyla.SumGraph = function(vectors, colorByColumns, xColumn, yColumn) {
    xyla.Graph.call(this);
    this.setDataVectors(vectors).addGroupNamesDimension(colorByColumns).addDistinctValuesDimension(xColumn).addSumDimension(yColumn);
  };
  xyla.SumGraph.prototype = Object.create(xyla.Graph.prototype);
  xyla.SumGraph.prototype.constructor = xyla.SumGraph;

  /**
   * A Graph subclass for displaying mutiple graphs in the same space.
   * 
   * @class
   * @extends xyla.Graph
   * @param {Array<xyla.Graph>} graphs the graphs contained in the multi-graph.
   * @property {Array<xyla.Graph>} graphs the graphs contained in the multi-graph.
   */
  xyla.MultiGraph = function(graphs) {
    xyla.Graph.call(this);
    this.graphs = graphs
  }
  xyla.MultiGraph.prototype = Object.create(xyla.Graph.prototype);
  xyla.MultiGraph.prototype.constructor = xyla.MultiGraph;
  /**
   *
   */
  xyla.MultiGraph.prototype.render = function() {
    let renderOptions = {
      elementOptions: this.elementOptions,
      graphs: this.graphs.map(g => {
        return {
          graphOptions: g.graphOptions,
          dataVectors: g.dataVectors,
          elementOptions: g.elementOptions,
        };
      }),
    };
    xyla.tools.render(renderOptions);
    return this;
  };

  /**
   * Xyla graph types.
   * @typedef {enum} xyla.GraphType
   * @property {GraphType} bar a vertical bar graph
   * @property {GraphType} stackedBar a vertical bar graph with stacked groups
   * @property {GraphType} line a line graph
   * @property {GraphType} dashedLine a dashed line graph
   */
  xyla.GraphType = {
    bar: 'bar',
    stackedBar: 'stackedBar',
    line: 'line',
    dashedLine: 'dashedLine',
  };

  /**
   * Xyla axis types.
   * @typedef {enum} xyla.AxisType
   * @property {AxisType} auto automatically detect the type
   * @property {AxisType} date the axis values are date strings
   * @property {AxisType} number the axis values are numbers
   */
  xyla.AxisType = {
    auto: 'auto',
    date: 'date',
    number: 'number',
    category: 'category',
  };

  /**
   * Xyla axis marker types.
   * @typedef {enum} xyla.AxisMarkerType
   * @property {AxisMarkerType} line a solid line
   * @property {AxisMarkerType} dash a dashed line with normal dashes
   * @property {AxisMarkerType} shortdash a dashed line with short dashes
   * @property {AxisMarkerType} longdash a dashed line with long dashes
   * @property {AxisMarkerType} dot a dotted line
   */
  xyla.AxisMarkerType = {
    line: 'solid',
    dash: 'dash',
    shortDash: 'shortdash',
    longDash: 'longdash',
    dot: 'dot'
  };

  /**
   * Xyla annotation position.
   * @typedef {enum} xyla.AnnotationPosition
   * @property {AnnotationPosition} top position at top
   * @property {AnnotationPosition} bottom position at bottom
   */
  xyla.AnnotationPosition = {
    top: 'top',
    bottom: 'bottom',
  };

  /**
   * Theme configuration for rendered elements.
   * @typedef {object} xyla.Theme
   * @property {Array<string>} [colors] HTML color strings used in the theme
   */

  /**
   * Configuration for adding annotations to graphs.
   * @typedef {object} xyla.GraphAnnotations
   * @property {xyla.AnnotationOptions|boolean} [groupSum] annotation options for summarizing each distinct group
   */

  /**
   * Configuration for adding annotations to graphs.
   * @typedef {object} xyla.AnnotationOptions
   * @property {xyla.AnnotationPosition} [position=xyla.AnnotationPosition.top] the point of reference for positioning the annotation
   * @property {number} [xOffset] the horizontal offset of the annotation
   * @property {number} [yOffset] the vertical offset of the annotation
   * @property {xlya.Theme} [theme] for the annotation
   * @property {xyla.FormatString|xyla.Formatter} [format] 👻 for the annotation
   * @property {function} [filter] 👻 a function that should accept the value to be annotated and return a value whose truthiness indicates whether to display the annotation
   */

  /**
   * Xyla options for rendered elements.
   * @typedef {object} xyla.ElementOptions
   * @property {string} title the rendered title
   * @property {string} elementID the ID of the HTML element in which to render the graph(s)
   * @property {xyla.Theme} [theme] the theming options for the element and its graph(s)
   */

  /**
   * Xyla graph options.
   * @typedef {object} xyla.GraphOptions
   * @property {xyla.GraphType} [type=GraphType.line] the basic type of graph
   * @property {xyla.AxisOptions} [xAxisOptions] options for the x-axis
   * @property {xyla.AxisOptions} [yAxisOptions] options for the y-axis
   * @property {xyla.GroupOptions} [groupOptions] 👻 options for the presentation of multiple plots
   * @property {xyla.Theme} [theme] the theming options for the graph
   * @property {xyla.GraphAnnotations} [annotations] options for adding annotations to the graph
   */

  /**
   * Xyla axis options.
   * @typedef {object} xyla.AxisOptions
   * @property {xyla.AxisType} [type=xyla.AxisType.auto] the type values on the axis
   * @property {string} [title] the axis title
   * @property {boolean} [opposite=false] whether to place this axis opposite its normal position
   * @property {Array<xyla.AxisMarker>} [axisMarkers=[]] markers for displaying things like benchmarks or other thresholds/boundaries
   * @property {string|function} [format] the format string or formatter function to apply to each axis label
   * @property {number} [labelRotation] number of degrees by which to rotate labels clockwise
   * @property {number} [labelInterval] the interval between labels on the axis
   */

  /**
   * Xyla group options.
   * @typedef {object} xyla.GroupOptions
   * @property {string|xyla.ValueFormatter} [format] the formatter for the group label
   * @property {boolean} [stacked=false] whether to stack each group cumulatively on the previous groups
   */

  /**
   * Xyla AxisMarker.
   * @typedef {object} xyla.AxisMarker
   * @property {string} [title] the axis marker title
   * @property {any} position the value on the axis to mark
   * @property {number} [width=1] the width of the marker
   * @property {string} [color='black'] the color of the marker
   * @property {xyla.AxisMarkerType} [type=xyla.AxisMarkerType.line] the type of marker that is rendered on the axis
   */

  /**
   * Xyla data vector.
   * @typedef {object} xyla.DataVector
   * @property {Array<any>} vector a vector of values of any type, representing a point
   * @property {Array<object>} rows an array of data rows that the vector represents
   */

  /**
   * Xyla data vector transformer.
   * @callback xyla.DataVectorTransformer
   * @param {Array<xyla.DataVector>} vectors the data vectors to transform
   * @returns {Array<xyla.DataVector>} the transformed data vectors
   */

  /**
   * Xyla data vector converter from.
   * @callback xyla.DataVectorConverterFrom
   * @param {any} data the data to convert
   * @returns {Array<xyla.DataVector>} the data converted data vectors
   */

  /**
   * Xyla data vector converter to.
   * @callback xyla.DataVectorConverterTo
   * @param {Array<xyla.DataVector>} vectors the data vectors to convert
   * @returns {any} the converted data
   */

  /**
   * Xyla rendering options for one graph.
   * @typedef {object} xyla.RenderGraphOptions
   * @property {GraphOptions} graphOptions the graph options
   * @property {Array<DataVector>} dataVectors the graph vectors
   */

  /**
   * Xyla graph rendering options.
   * @typedef {object} xyla.RenderOptions
   * @property {ElementOptions} elementOptions options for the rendered element
   * @property {Array<RenderGraphOptions>|RenderGraphOptions} graphs an array of options, each for rendering a graph in the same element
   */

  /* Xyla value formatter.
   * @callback xyla.ValueFormatter
   * @param {any} value the value to be formatted
   * @param {object} context a dictionary of contextual values
   * @returns {any} the formatted value
   */

   /**
    * Xyal format string.
    * 
    * Format strings may contain placeholders of the form `{target|formatter:parameter:parameter...|formatter:parameter:parameter...}`, for example `{value|number:1} Million`.
    * 
    * `target` represents the item to be substituted, usually `value`, but possibly a key in the formatting `context`.
    * 
    * `formatter` names a member of {@link xyla.formatters}.
    * 
    * `parameter` strings specify arguments to `formatter`.
    * 
    * Literal `{` and `}` characters in format strings must be quoted with `"`, for example `from "{0, 0}" to "{"{value}, {value}"}"`.
    * 
    * Literal `|` and `:` characters inside placeholders must be quoted with `"`, for example `Minute of {value|date:"%H:%M"}`.
    * 
    * Literal `"` characters must by quoted `"` and doubled inside the quotes. For example, `Azrael said, "Deploy!"` can be represented with `"Azreal said, ""Deploy!"""` and a single literal `"` can be represented with `""""`.
    * 
    * @typedef {string} xyla.FormatString
    */

  return xyla;
})();
