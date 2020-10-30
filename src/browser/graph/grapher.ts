import Plotly from 'plotly.js-dist';
import { v4 as uuid } from 'uuid';
import { xyla } from '../../../index';
import { Transformable, DataVector, pTransformable } from '../../common/parasite/transformable';
import { Contextual, iContextual, pContextual } from '../../common/parasite/contextual';
import { Templatable } from '../../common/util/template';
import { ThemeColor, ThemeConfig, Theme } from '../../common/theme';

//#region Interfaces

export interface GrapherTrace {
  values: any[];
  name: string,
}

export enum TracesFormatEnum {
  Dollar = 'dollar',
  Percent = 'percent',
}

export interface ValueFormatter {
  tickprefix?: string;
  ticksuffix?: string;
  tickformat?: string;
}

export interface GrapherConfig {
  element: string|any;
  theme?: string|ThemeConfig|Theme;
  identifier?: string;
  data: string|Record<string, any>[];
  jsonColumns?: Record<string, { prefix: string }>;
  filterValues?: Record<string, { values: string[] }[]>;
  range?: Record<string, [any, any]>;
  groupBy?: { columns: string[] };
  aggregate: { 
    sum?: string|string[];
  };
  xAxisColumn: string;
  transforms?: (string|[string, any[]])[];
  renderOptions?: GrapherRenderOptions;
  graphers: (string|ChildGrapherConfig|Grapher)[];
}

export interface ChildGrapherConfig extends Partial<GrapherConfig> {
}

export interface GrapherRenderOptions extends Partial<GrapherGlobalOptions> {
  yAxis?: number;
  yAxisOptions?: GrapherAxisOptions;
  distinctValueIndex?: number;
  traceIndex?: number;
  groupIndex?: number;
  rangeSlider?: boolean;
}

export interface GrapherAxisOptions extends Partial<GrapherGlobalOptions> {
  label?: string;
  format?: TracesFormatEnum;
}

export enum GraphTypeEnum {
  Line = 'line',
  Bar = 'bar',
  Scatter = 'scatter',
}

export interface GrapherGlobalOptions {
  palette: ThemeColor[];
  graphType: GraphTypeEnum;
}

export interface GrapherChildOptions {
  updateLayout?: boolean;
  updateTraces?: boolean; 
  ancestors?: Grapher[];
}

//#endregion

export class Grapher implements pTransformable, pContextual, Templatable {

  //#region Static

  static readonly defaultGlobalOptions: GrapherGlobalOptions = Object.freeze({
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

  static readonly valueFormatters: Record<TracesFormatEnum, ValueFormatter> = Object.freeze({
    [TracesFormatEnum.Dollar]: { tickprefix: '$' },
    [TracesFormatEnum.Percent]: { tickformat: '.1%' },
  });

  private static _globalOptions: GrapherGlobalOptions = Grapher.defaultGlobalOptions;

  private static mergeOptions(options: GrapherGlobalOptions, partialOptions: Partial<GrapherGlobalOptions>): GrapherGlobalOptions {
    return Object.freeze({
      ...options,
      ...partialOptions,
    });
  }

  private static getTracePropertiesForGraphType(graphType: GraphTypeEnum) {
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
  }

  static getGlobalStyles(): GrapherGlobalOptions {
    return JSON.parse(JSON.stringify(this._globalOptions));
  }

  static setGlobalStyles(options: Partial<GrapherGlobalOptions>) {
    Grapher._globalOptions = Grapher.mergeOptions(
      Grapher.defaultGlobalOptions,
      options,
    );
  }

  static render(config: GrapherConfig): Grapher {
    const grapher = new Grapher(config);
    grapher.prepare();
    grapher.applyTransforms();
    grapher.render();
    return grapher;
  }

  static makeTrace(axisIndex: number, vectors: DataVector[]): GrapherTrace {
		return {
      values: vectors.map(v => xyla.tools.elementAtRelativeIndex(v.vector, axisIndex)),
      name: '',
    }
  }
  
  static makeGroupTraces(xTrace: GrapherTrace, vectors: DataVector[], groupVectorIndex = -3, xVectorIndex = -2, yVectorIndex = -1) {
    const xValueIndexRecord = xTrace.values.reduce((record, v, i) => {
      record[v] = i;
      return record;
    }, {});
    let traces = [];
    let traceIndexRecord = {};
    vectors.forEach(v => {
      let groupName = xyla.tools.elementAtRelativeIndex(v.vector, groupVectorIndex);
      if (traceIndexRecord[groupName] === undefined) {
        traceIndexRecord[groupName] = traces.length;
        traces.push({
          values: new Array(xTrace.values.length).fill(null),
          name: groupName,
        });
      }
      const x = xyla.tools.elementAtRelativeIndex(v.vector, xVectorIndex);
      const y = xyla.tools.elementAtRelativeIndex(v.vector, yVectorIndex);
      traces[traceIndexRecord[groupName]].values[xValueIndexRecord[x]] = y;
    });
    return traces;
  }

  static context: Record<string, any> = {
    xyla: xyla,
  };

  static contextual: iContextual = new Contextual(Grapher);

  static configurationTemplate(configuration: GrapherConfig|ChildGrapherConfig): Record<string, any> {
    const template = Object.assign({}, configuration);
    if (typeof template.element !== 'string') {
      delete template.element;
    }
    if (typeof template.data !== 'string') {
      delete template.data;
    }
    if (template.graphers) {
      template.graphers = template.graphers.map(g => {
        if (typeof g === 'string') { return g; }
        const config = g instanceof Grapher ? g.config : g;
        return Grapher.configurationTemplate(config);
      });
    }
    if (template.theme instanceof Theme) {
      template.theme = template.theme.template;
    }
    return template;
  }

  static stringCompare(a: string|null|undefined, b: string|null|undefined): number {
    if (a === null) {
      if (b === null) { return 0; }
      if (b === undefined) { return -1; }
      return 1;
    }
    if (b === null) {
      if (a === undefined) { return 1; }
      return -1;
    }
    return a < b ? -1 : a > b ? 1 : 0;
  }

  //#endregion

  //#region Instance

  contextual: Contextual
  context: Record<string, any>
  transformable: Transformable
  config: GrapherConfig|ChildGrapherConfig
  dataVectors: DataVector[]
  graphers: Grapher[]
  identifier: string;
  data: Record<string, any>[]|null;
  element: any|null;
  theme: Theme|null;

  constructor(config: GrapherConfig|ChildGrapherConfig, context: Record<string, any> = {}) {
    this.transformable = new Transformable(this);
    this.config = config;
    this.dataVectors = [];
    this.graphers = [];
    this.context = Object.assign({}, Grapher.context, context);
    this.contextual = new Contextual(this);
    this.identifier = '';
    this.data = null;
    this.element = null;
    this.theme = null;
  }

  get template(): Record<string, any> {
    return Grapher.configurationTemplate(this.config);
  }

  //#region Build

  prepare(): Grapher {
    this.name();
    this.attach();
    this.style();
    this.load();
    this.createGraphers();
    this.graphers.forEach(g => g.prepare());
    return this;
  }

  name(identifier?: string): Grapher {
    if (identifier === undefined) {
      identifier = this.config.identifier;
    }
    if (typeof identifier !== 'string') {
      identifier = uuid();
    }
    this.identifier = identifier;
    return this;
  }

  attach(element?: string|any): Grapher {
    if (element === undefined) {
      element = this.config.element;
    }
    this.element = element;
    return this;
  }

  style(theme?: string|ThemeConfig|Theme): Grapher {
    if (theme === undefined) {
      theme = this.config.theme;
    }
    this.theme = theme instanceof Theme ? theme : theme ? new Theme(theme as ThemeConfig) : null;
    return this;
  }

  load(data?: string|Record<string, any>[]): Grapher {
    if (data === undefined) {
      data = this.config.data;
    }

    this.data = data as Record<string, any>[];
    return this;
  }

  createGraphers(): Grapher {
    this.graphers = (this.config.graphers || []).map(g => g instanceof Grapher ? g : new Grapher(g as ChildGrapherConfig, this.context));
    return this;
  }

  applyTransforms(ancestors: Grapher[] = []): Grapher {
    const parent = ancestors[0];
    const config = this.config;
    this.dataVectors = this.data ? [{
      rows: this.data,
      vector: [],
    }] : parent.dataVectors;
    const t = this.transformable;
    if (config.jsonColumns) {
      Object.entries(config.jsonColumns).forEach(([col, {prefix}]) => {
        t.transform(xyla.transformers.row.jsonColumns(col, c => `${prefix}${c}`, null, false));
      });
    }
    if (config.filterValues) {
      Object.entries(config.filterValues).forEach(([col, {values}]) => {
        t.transform(xyla.transformers.row.filterValues(col, values, false));
      });
    }
    if (config.range) {
      Object.entries(config.range).forEach(([col, [min, max]]) => {
        if (min !== null) {
          t.transform(xyla.transformers.row.filterLess(col, min, true));
        }
        if (max !== null) {
          t.transform(xyla.transformers.row.filterGreater(col, max, true));
        }
      });
    }
    if (config.groupBy) {
      t.transform(xyla.transformers.group.by(config.groupBy.columns, ' '))
    }
    if (typeof config.xAxisColumn === 'string') {
      t.transform(xyla.transformers.group.distinct(config.xAxisColumn))
      .transform(xyla.transformers.data.sortIndices(-1))
    }
    if (config.aggregate && config.aggregate.sum) {
      [].concat(config.aggregate.sum).forEach(column => {
        t.transform(xyla.transformers.row.mapCells({ [column]: parseFloat }))
        .transform(xyla.transformers.aggregate.sum(column));
      });
    }
    if (config.transforms && config.transforms.length) {
      config.transforms.forEach(transform => {
        let transformer;
        if (Array.isArray(transform)) {
          const pathComponents = transform[0].split('.');
          const factoryKey = pathComponents.pop();
          const factoryCollectionPath = pathComponents.join('.');
          const factoryCollection = this.contextual.uncrate(factoryCollectionPath);
          const factory = factoryCollection[factoryKey];
          transformer = factory.apply(factoryCollection, transform[1]);
        } else {
          transformer = this.contextual.uncrate(transform);
        }
        t.transform(transformer);
      });
    }
    const lineage = [this as Grapher].concat(ancestors);
    this.graphers.map(g => g.applyTransforms(lineage));
    return this;
  }

  //#endregion

  //#region Children

  childIndex(identifier: string): number {
    for (let index = 0; index < this.graphers.length; ++index) {
      if (this.graphers[index].identifier === identifier) { return index; }
    }
    return null;
  }

  childIdentifier(index: number): string {
    return index < this.graphers.length ? this.graphers[index].identifier : null;
  }

  childAt(indexOrIdentifier: number|string): Grapher {
    const index = typeof(indexOrIdentifier) === 'string' ? this.childIndex(indexOrIdentifier) : indexOrIdentifier;
    if (index === null) { return null; }
    return index < this.graphers.length ? this.graphers[index] : null;
  }

  addChild(child: string|Grapher|ChildGrapherConfig, {updateLayout = true, updateTraces = true, ancestors = []}: GrapherChildOptions = {}): Grapher {
    return this.insertChildAt(this.graphers.length, child, {updateLayout, updateTraces, ancestors});
  }

  insertChildAt(indexOrIdentifier: number|string, child: string|Grapher|ChildGrapherConfig, {updateLayout = true, updateTraces = true, ancestors = []}: GrapherChildOptions = {}): Grapher {
    if (typeof child === 'string') {
      child = this.contextual.uncrate(child);
    }
    if (!this.config.graphers) {
      this.config.graphers = [];
    }
    console.assert(this.config.graphers.length === this.graphers.length, 'Grapher.graphers configuration and state have divered.');
    const index = typeof(indexOrIdentifier) === 'string' ? this.childIndex(indexOrIdentifier) : indexOrIdentifier;
    if (index === null) {
      console.assert(index !== null, `Invalid child indexOrIdentifier: ${indexOrIdentifier}`);
      return this;
    }
    const childGrapher = child instanceof Grapher ? child : new Grapher(child as ChildGrapherConfig);
    this.graphers.splice(index, 0, childGrapher);
    this.config.graphers.splice(index, 0, child);
    const lineage = [this as Grapher].concat(ancestors);
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
  }

  replaceChildAt(indexOrIdentifier: number|string, child: Grapher|ChildGrapherConfig, {updateLayout = true, updateTraces = true, ancestors = []}: GrapherChildOptions = {}): Grapher {
    this.removeChildAt(indexOrIdentifier, {updateLayout, updateTraces, ancestors});
    return this.insertChildAt(indexOrIdentifier, child, {updateLayout, updateTraces, ancestors});
  }

  removeChildAt(indexOrIdentifier: number|string, {updateLayout = true, updateTraces = true, ancestors = []}: GrapherChildOptions = {}): Grapher {
    console.assert(this.config.graphers.length === this.graphers.length, 'Grapher.graphers configuration and state have divered.');
    const childGrapher = this.childAt(indexOrIdentifier);
    if (!childGrapher) {
      console.assert(!!childGrapher, `Invalid child indexOrIdentifier: ${indexOrIdentifier}`);
      return this;
    }
    const index = typeof(indexOrIdentifier) === 'string' ? this.childIndex(indexOrIdentifier) : indexOrIdentifier;
    this.graphers.splice(index, 1);
    this.config.graphers.splice(index, 1);

    const lineage = [this as Grapher].concat(ancestors);
    if (updateLayout) {
      childGrapher.removeLayout(lineage);
    }
    if (updateTraces) {
      childGrapher.removeTraces(lineage);
    }
    return this;
  }

  //#endregion

  //#region Render

  render(ancestors: Grapher[] = []): Grapher {
    const lineage = [this as Grapher].concat(ancestors);
    const element = lineage.reduce((e, g) => e || g.element, null as any);
    if (!element) { return; }

    if (element === this.element) {
      const layout = this.generateLayout(ancestors);
      element.id = uuid();
      Plotly.newPlot(element.id, [], layout, {
        displaylogo: false,
        modeBarButtonsToRemove: [
          'lasso2d', 'toggleSpikelines', 'hoverCompareCartesian', 'hoverClosestCartesian'
        ],
      });
    } else {
      this.remove(ancestors);
    }
    this.renderLayout(ancestors);
    this.renderTraces(ancestors);
    return this;
  }

  renderLayout(ancestors: Grapher[] = []): Grapher {
    const lineage = [this as Grapher].concat(ancestors);
    const element = lineage.reduce((e, g) => e || g.element, null as any);
    if (!element) { return; }
    const layoutUpdate = this.generateLayoutUpdate(ancestors);
    if (Object.keys(layoutUpdate).length) {
      Plotly.relayout(element, layoutUpdate);
    }
    return this;
  }

  renderTraces(ancestors: Grapher[] = []): Grapher {
    const lineage = [this as Grapher].concat(ancestors);
    const element = lineage.reduce((e, g) => e || g.element, null as any);
    if (!element) { return; }

    const traces = this.generateTraces(ancestors);
    if (traces.length) {
      Plotly.addTraces(element, traces);
    }
    return this;
  }

  generateLayout(ancestors: Grapher[] = []): Record<string, any> {
    const lineage = [this as Grapher].concat(ancestors);
    const options = this.config.renderOptions || {};  
    const renderOptions = Grapher.mergeOptions(
      Grapher._globalOptions,
      options || {},
    ) as GrapherRenderOptions;

    const valueFormatter = renderOptions.yAxisOptions && renderOptions.yAxisOptions.format ? Grapher.valueFormatters[renderOptions.yAxisOptions.format] : undefined;

    const layout = {
      margin: {l: 64, r: 32, t: 32, b: 32},
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
      const distinctValueIndex = lineage.reduce((i, g) => i || (g.config.renderOptions && g.config.renderOptions.distinctValueIndex), null as number)
      const distinctValues = Number.isInteger(distinctValueIndex) ? Grapher.makeTrace(distinctValueIndex, this.dataVectors) : null;
      if (distinctValues) {
        Object.assign(layout.xaxis, {
          title: distinctValues.name,
          rangeslider: {range: [distinctValues.values[0], distinctValues.values[distinctValues.values.length - 1]]},
        });
      }
    }
    return layout;
  }

  generateLayoutUpdate(ancestors: Grapher[] = []): Record<string, any> {
    const lineage = [this as Grapher].concat(ancestors);

    let layout: Record<string, any> = {};
    if (this.config.renderOptions) {
      const renderOptions = this.config.renderOptions;
      let yAxis = 'yaxis';
      if (renderOptions.yAxis > 1) {
        const yAxisIndex = renderOptions.yAxis;
        yAxis = yAxis + yAxisIndex;
        layout[yAxis + '.overlaying'] = 'y';
        layout[yAxis + '.side'] = yAxisIndex % 2 ? 'left' : 'right';
        layout[yAxis + '.anchor'] = yAxisIndex > 2 ? 'free' : 'x';
        const extraLeftAxes = Math.ceil((yAxisIndex - 2) / 2);
        const extraRightAxes = Math.ceil((yAxisIndex - 1) / 2);
        layout['xaxis.domain'] = [extraLeftAxes * 0.05, 1.0 - extraRightAxes * 0.05];
        for (let axisIndex = yAxisIndex; axisIndex > 2; axisIndex--) {
          layout['yaxis' + axisIndex + '.position'] = axisIndex % 2 ? (extraLeftAxes -  Math.ceil((axisIndex - 2) / 2)) * 0.05 : 1.0 - (extraRightAxes - Math.ceil((axisIndex - 1) / 2)) * 0.05;
        }
      }
      
      layout[yAxis + '.title'] = (renderOptions.yAxisOptions && renderOptions.yAxisOptions.label) || '';
      layout[yAxis + '.tickprefix'] = '';
      layout[yAxis + '.ticksuffix'] = '';
      layout[yAxis + '.tickformat'] = '';
      if (renderOptions.yAxisOptions && renderOptions.yAxisOptions.format) {
        const valueFormatter = renderOptions.yAxisOptions && renderOptions.yAxisOptions.format ? Grapher.valueFormatters[renderOptions.yAxisOptions.format] : undefined;
        if (valueFormatter) {
          layout[yAxis + '.tickprefix'] = valueFormatter.tickprefix || '';
          layout[yAxis + '.ticksuffix'] = valueFormatter.ticksuffix || '';
          layout[yAxis + '.tickformat'] = valueFormatter.tickformat || '';
        }
      }
    }
    this.graphers.forEach(g => Object.assign(layout, g.generateLayoutUpdate(lineage)))
    return layout;
  }

  generateTraces(ancestors: Grapher[] = []): any[] {
    const lineage = [this as Grapher].concat(ancestors);
    const renderOptions = this.config.renderOptions || {} as GrapherRenderOptions;
    let traces = [];
    if (Number.isInteger(renderOptions.traceIndex)) {
      const distinctValueIndex = lineage.reduce((i, g) => i || (g.config.renderOptions && g.config.renderOptions.distinctValueIndex), null as number)
      const distinctValues = Number.isInteger(distinctValueIndex) ? Grapher.makeTrace(distinctValueIndex, this.dataVectors) : null;    
      const graphType = lineage.reduce((t, g) => t || (g.config.renderOptions.graphType && g.config.renderOptions.graphType), null as string)
      const theme = lineage.reduce((t, g) => t || g.theme, null as Theme);
      const groupBy = lineage.reduce((t, g) => t || g.config.groupBy, null as { columns: string[] });
      const tracesData = groupBy ? Grapher.makeGroupTraces(distinctValues, this.dataVectors, renderOptions.groupIndex, renderOptions.distinctValueIndex, renderOptions.traceIndex) : [Grapher.makeTrace(renderOptions.traceIndex, this.dataVectors)]
  
      traces = tracesData.sort((a, b) => Grapher.stringCompare(a.name, b.name)).map(trace => (Object.assign(
        {
          x: distinctValues.values,
          y: trace.values.map(v => +(Math.round(Number(v + 'e+2')) + 'e-2')),
          name: renderOptions.yAxisOptions && renderOptions.yAxisOptions.label ? String(trace.name) + ' · ' + renderOptions.yAxisOptions.label : trace.name,
          yaxis: renderOptions.yAxis > 1 ? 'y' + renderOptions.yAxis : undefined,
          line: { shape: 'spline' },
          showlegend: true,
          marker: { color: Theme.colorString(theme ? theme.mappedColor(String(trace.name)) : undefined), width: 3 },
        },
        Grapher.getTracePropertiesForGraphType(graphType as GraphTypeEnum),
        this.identifier ? {
          meta: [this.identifier],
        } : {},
      )));  
    }
    traces = this.graphers.reduce((d, g) => d.concat(g.generateTraces(lineage)), traces);
    return traces;
  }

  //#endregion

  //#region Remove

  remove(ancestors: Grapher[] = []): Grapher {
    this.removeLayout(ancestors);
    this.removeTraces(ancestors)
    return this;
  }

  removeTraces(ancestors: Grapher[] = []): Grapher {
    const traceIndices = this.identifyTraces(ancestors);
    if (!traceIndices.length) { return; }
    const lineage = [this as Grapher].concat(ancestors);
    const element = lineage.reduce((e, g) => e || g.element, null as any);
    if (!element) { return; }
    Plotly.deleteTraces(element, traceIndices);
    return this;
  }

  identifyTraces(ancestors: Grapher[] = []): number[] {
    const lineage = [this as Grapher].concat(ancestors);
    let traceIndices = [];
    if (this.identifier) {
      const element = lineage.reduce((e, g) => e || g.element, null as any);
      if (element && element.data) {
        element.data.forEach((d, i) => {
          if (d.meta && d.meta[0] === this.identifier) {
            traceIndices.push(i);
          }
        });
      }
    }
    traceIndices = this.graphers.reduce((t, g) => t.concat(g.identifyTraces(lineage)), traceIndices);
    return traceIndices;
  }

  removeLayout(ancestors: Grapher[] = []): Grapher {
    const layout = this.identifyLayout(ancestors);
    if (!Object.keys(layout).length) { return; }
    const lineage = [this as Grapher].concat(ancestors);
    const element = lineage.reduce((e, g) => e || g.element, null as any);
    if (!element) { return; }
    Plotly.relayout(element, layout);
    return this;
  }

  identifyLayout(ancestors: Grapher[] = []): Record<string, any> {
    return {};
  }

  //#endregion

  //#endregion
}
