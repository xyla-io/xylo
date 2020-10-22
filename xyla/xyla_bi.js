try {
  if (module.exports !== undefined) {
    var xyla = require('./xyla');
  }
} catch (e) {}

(function() {
  /**
   * Functions specitic to business intelligence environments.
   * @namespace
   */
  xyla.bi = {};

  /**
   * Mode Analytics-related functionality.
   * @namespace
   */
  xyla.bi.mode = {};

  /**
   * Retrieves a mode data set object by name.
   * 
   * @param {string} queryName the name of the query (dataset).
   * @return {object} the mode data set object.
   * 
   * @example
   * let dataSet = xyla.bi.mode.dataSet('CPI by Campaign');
   */
  xyla.bi.mode.dataSet = function(queryName) {
    let dataSet = datasets.filter(dataset => dataset.queryName === queryName).pop();
    if (!dataSet) { return xyla.tools.presentError(new Error(`${arguments.callee.name} dataset not found. ${queryName}`)); }
    return dataSet;
  };
  /**
   * Generates an array of data vectors from a data set.
   * 
   * @param {string} queryName the name of the data set's query
   * @example
   * let vectors = xyla.bi.mode.dataVectors('CPI by Campaign');
   */
  xyla.bi.mode.dataVectors = function(queryName) {
    return [{
      vector: [],
      rows: xyla.bi.mode.dataSet(queryName).content,
    }];
  };
  /**
   * Constructs the group name for a row.
   * 
   * @param {object<string, any>} row a data row.
   * @param {Array<string>} groupByColumns an array of column names to group by.
   * @returns {string} the calculated group name for that row.
   * 
   * @example
   * xyla.bi.mode.groupForRow()
   */
  xyla.bi.mode.groupNameForRow = function(row, groupByColumns) {
    return JSON.stringify(groupByColumns.map(column => row[column]));
  }
  /**
   * Groups the rows in a data set by specified columns.
   * 
   * @param {Object} dataSet a data set to group.
   * @param {Array<string>} groupByColumns an array of column names to group by.
   * @returns {Object<string, Array<Object<string, *>>>} an object whose keys are group names and values are arrays of rows in those groups.
   * 
   * @example
   * xyla.bi.mode.groupedRows(xyla.bi.mode.dataSet('CPI by Campaign'), ['day', 'campaign_tag']);
   */
  xyla.bi.mode.groupedRows = function(dataSet, groupByColumns) {
    let groups = {};
    dataSet.content.forEach(row => {
      let groupName = this.groupNameForRow(row, groupByColumns);
      if (groups[groupName] === undefined) {
        groups[groupName] = [];
      }
      groups[groupName].push(row);
    });
    return groups;
  };

  xyla.bi.mode.needsFilterUpdate = false;
  xyla.bi.mode.didUpdateFilter = false;
  /**
   * Updates the filter selection to propagate changes to the filtered data into Mode charts and tables.
   * 
   * This function is used internally by xyla, but may be called directly when performing manual changes that need to be applied to Mode charts or tables whenever the user updates the filter selection.
   */
  xyla.bi.mode.setNeedsFilterUpdate = function() {
    if (this.needsFilterUpdate) { return; }
    this.needsFilterUpdate = true;
    let self = this;
    setTimeout(() => $(document).ready(function() {
      self.needsFilterUpdate = false;
      self.didUpdateFilter = !self.didUpdateFilter;
      if (self.didUpdateFilter) {
        $('.filter-panel-action.action-apply').click();
      }
    }));
  };
  /**
   * Filters a date string column using a Mode date filter.
   * 
   * To use this function, define two identical queries, one with a `date` column of type Date, and the other with no columns of type Date but with a `date_string` column defined as `DATE_FORMAT(date, "%Y-%m-%d") AS date_string`.
   * 
   * @param {string} dateStringQueryName the name of the query (dataset) to filter.
   * @param {string} dateStringColumn the name of the date string column in the query to be filtered.
   * @param {string} dateQueryName the name of the same query (dataset) that contains a filtered date column.
   * @param {string} dateColumn the name of the date column, in the `dateQueryName` query, that the mode filter is connected to.
   * 
   * @example
   * xyla.bi.mode.filterDateString('CPI by Campaign by Date String', 'date_string', 'CPI by Campaign by Date', 'date');
   */
  xyla.bi.mode.filterDateString = function(dateStringQueryName, dateStringColumn, dateQueryName, dateColumn) {
    let dataset = xyla.bi.mode.dataSet(dateStringQueryName);
    let dateDataset = xyla.bi.mode.dataSet(dateQueryName);
    if (!dataset || !dateDataset) { return; }

    dataset.content = dateDataset.content.map(dateRow => {
      let row = {};
      for (field in dateRow) {
        if (field === dateColumn) {
          row[dateStringColumn] = dateRow[field].toString().split('T')[0];
        } else {
          row[field] = dateRow[field];
        }
      }
      return row;
    });
    this.setNeedsFilterUpdate();
  };
  /**
   * Recalculates a grouped average or ratio column after any filter update.
   * 
   * **⚠️ Any date columns in the query will currently break this functionality, since Mode seems a apply a fix to format the date column, which overrides any alteration to the data. Use {@link #xylafilterdatestring filterDateString} to both filter by date and recalculate.⚠️ **
   * 
   * @param {string} queryName the name of the query (dataset).
   * @param {string} numeratorColumn the name of the column being divided.
   * @param {string} denominatorColumn the name of the column by which to divide.
   * @param {string} ratioColumn the name of the column to be recalculated.
   * @param {string[]} [groupByColumns] an array of column names to group by, if any. The `ratioColumn` will be recalculated separately for each group.
   * @param {boolean} [ratioColumnWillBeSummed = false] whether the ratio column will be aggregated and summed by Mode.
   * If `false` then `ratioColumn = SUM(numeratorColumn) / SUM(denomenatorColumn)`.
   * If `true` then `ratioColumn = SUM(numeratorColumn) / SUM(denomenatorColumn) / COUNT(rowsInGroup)`.
   * 
   * @example
   * // recalculate CPI grouped by camapaign tag each time the filter is changed.
   * // the chart should use the SUM aggregation function to display the data.
   * xyla.bi.mode.recalculateRatioColumnOnFilterChange('CPI by Campaign', 'spend', 'installs', 'cpi', ['day', 'campaign_tag'], true);
   */
  xyla.bi.mode.recalculateRatioColumnOnFilterChange = function(queryName, numeratorColumn, denominatorColumn, ratioColumn, groupByColumns, ratioColumnWillBeSummed) {
    if (groupByColumns === undefined) {
      groupByColumns = [];
    }
    if (ratioColumnWillBeSummed === undefined) {
      ratioColumnWillBeSummed = false;
    }
    let dataset = datasets.filter(dataset => dataset.queryName === queryName).pop();
    if (!dataset) {
      console.warn(`${arguments.callee.name} dataset not found`, queryName);
      return;
    }

    function groupForRow(row) {
      return JSON.stringify(groupByColumns.map(column => row[column]));
    }
    let numeratorTotals = {};
    let denominatorTotals = {};
    let groupCounts = {};
    dataset.content.forEach(row => {
      let group = groupForRow(row);
      groupCounts[group] = (groupCounts[group]) ? groupCounts[group] + 1 : 1;
      numeratorTotals[group] = (numeratorTotals[group]) ? numeratorTotals[group] + ((row[numeratorColumn]) ? row[numeratorColumn] : 0) : row[numeratorColumn];
      denominatorTotals[group] = (denominatorTotals[group]) ? denominatorTotals[group] + ((row[denominatorColumn]) ? row[denominatorColumn] : 0) : row[denominatorColumn];
    });
    let quotients = {};
    Object.keys(groupCounts).forEach(group => {
      quotients[group] = (denominatorTotals[group]) ? numeratorTotals[group] / denominatorTotals[group] : null;
      if (ratioColumnWillBeSummed) {
        quotients[group] = (quotients[group] === null) ? null : quotients[group] / groupCounts[group];
      }
    });
    dataset.content.forEach(row => {
      let group = groupForRow(row);
      row[ratioColumn] = (quotients[group]) ? quotients[group] : null;
    });
    xyla.bi.mode.setNeedsFilterUpdate();
  };
  /**
   * Recalculates a cumulative sum after any filter update.
   * 
   * **⚠️ Any date columns in the query will currently break this functionality, since Mode seems a apply a fix to format the date column, which overrides any alteration to the data. Use {@link #xylafilterdatestring filterDateString} to both filter by date and recalculate.⚠️ **
   * 
   * @param {string} queryName the name of the query (dataset).
   * @param {string} termColumn the name of the column to cumulatively sum.
   * @param {string} seriesColumn the name of the column specifying the order of the terms. `termColumn` values in all rows with a `seriesColumn` value less than or equal to the current row will be included in its cumulative sum.
   * @param {string} cumulativeSumColumn the name of the column to be recalculated as the cumulative sum of the `termColumn`.
   * @param {string[]} [groupByColumns] an array of column names to group by, if any. The `cumulativeSumColumn` will be recalculated separately for each group.
   * 
   * @example
   * // recalculate cumulative sum grouped by camapaign tag each time the filter is changed.
   * // the chart should use the SUM aggregation function to display the data.
   * xyla.bi.mode.recalculateCumulativeSumColumnOnFilterChange('Cumulative ROAS', 'spend', 'period', 'cumulative_spend', ['app_display_name', 'channel', 'campaign_tag', 'cohort']);
   */
  xyla.bi.mode.recalculateCumulativeSumColumnOnFilterChange = function(queryName, termColumn, seriesColumn, cumulativeSumColumn, groupByColumns) {
    if (groupByColumns === undefined) {
      groupByColumns = [];
    }
    let dataSet = xyla.bi.mode.dataSet(queryName);
    if (!dataSet) { return; }

    groups = xyla.bi.mode.groupedRows(dataSet, groupByColumns);
    for (groupName in groups) {
      group = groups[groupName];
      group.sort((a, b) => (a[seriesColumn] < b[seriesColumn]) ? -1 : (a[seriesColumn] > b[seriesColumn]) ? 1 : 0);
      let sum = 0;
      group.forEach(row => {
        if (row[termColumn] !== null) {
          sum += row[termColumn];
        }
        row[cumulativeSumColumn] = sum;
      });
    }
    this.setNeedsFilterUpdate();
  };
  /**
   * Removes the "Total" bottom row from a Mode pivot table.
   * 
   * @example
   * xyla.bi.mode.removePivotTableTotalRow();
   * 
   */
  xyla.bi.mode.removePivotTableTotalRow = function() {
    xyla.tools.css.addGlobalStyles({
      'th.pvtTotalFillerLabel': {
        display: 'none'
      },
      'th.pvtTotalFillerLabel+th.pvtTotalLabel': {
        display: 'none'
      },
      'td.pvtTotal.colTotal': {
        display: 'none'
      },
      'td.pvtGrandTotal': {
        display: 'none'
      },
    });
  };
})();
