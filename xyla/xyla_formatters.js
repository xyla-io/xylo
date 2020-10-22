try {
  if (module.exports !== undefined) {
    var xyla = require('./xyla');
  }
} catch (e) {}

(function() {
  /**
   * Formatters for Xyla values.
   * @namespace
   */
  xyla.formatters = {
    /**
     * Generates a formatter that adds a prefix and suffix to a string.
     * @param {string} [prefix] the prefix to add, if any
     * @param {string} [suffix] the suffix to add, if any
     * @param {string} [separator=''] the separator to place between the text and the affixes
     * @returns {xyla.ValueFormatter} the formatter
     * @example '{value|affix:start:stop}'      // 'and'    → 'startandstop'
     * @example '{value|affix:Hello:World: }'   // 'Small'  → 'Hello Small World'
     * @example '{value|affix:mega}'            // 'fauna'  → 'megafauna'
     * @example '{value|affix::ness}'           // 'quick'  → 'quickness'
     * @example '{value|affix::related,-}'      // 'food'   → 'food-related'
     */
    affix: (prefix, suffix, separator) => {
      if (separator === undefined) { separator = ''; }
      return value => xyla.formatters.empty(true, false)(value) ? '' : [prefix, value, suffix].filter(s => s !== undefined && s !== null).join(separator);
    },
    /**
     * Generates a formatter that substitutes default values for empty or non-empty values.
     * @param {any} [emptyValue=''] substituted if the value is `undefined`, `null`, or the empty string
     * @param {any} [fullValue] substituted if the value is not empty. Defaults to the unmodified value.
     * @returns {xyla.ValueFormatter} the formatter
     * @example '{value|empty:N/A}'                 // null     → 'N/A'
     * @example '{value|empty:N/A}'                 // ''       → 'N/A'
     * @example '{value|empty:Nothing:Something}'   // null     → 'Nothing'
     * @example '{value|empty:Nothing:Something}'   // 0        → 'Something'
     * @example '{value|empty:Nothing:Something}'   // 54       → 'Something'
     * @example '{value|empty:Nothing:Something}'   // 'thing'  → 'Something'
     */
    empty: (emptyValue, fullValue) => {
      if (emptyValue === undefined) { emptyValue = ''; }
      return value => {
        return (value === undefined || value === null || value === '') ? emptyValue : (fullValue === undefined) ? value : fullValue;
      };
    },
    /**
     * Generates a formatter that converts values to strings.
     * @returns {xyla.ValueFormatter} the formatter
     * @example '{value|string}'   // 4.5  → '4.5'
     */
    string: () => {
      return value => '' + xyla.formatters.empty()(value);
    },
    /**
     * Generates a formatter that formats date values using a date format string.
     * @param {string} [format='%Y-%m-%d'] the date format string. The supported format specifiers are a subset from PHP [strftime](http://www.php.net/manual/en/function.strftime.php).
     * @returns {xyla.ValueFormatter} the formatter
     * @example '{value|date:%m/%d}'      // '2019-01-08T00:00:00.000Z'  → '01/08'
     * @example '{value|date:%m/%d}'      // 1546905600000               → '01/08'
     * @example '{value|date:%m/%d/%Y}'   // 1546905600000               → '01/08/2019'
     */
    date: format => {
      if (format === undefined) { format = '%Y-%m-%d'; }
      return value => xyla.formatters.empty(true, false)(value) ? '' : Highcharts.dateFormat(format, new Date(value).getTime());
    },
    /**
     * Generates a formatter that formats numbers with specified precision, decimal marker, and comma separators.
     * @param {number|string} [precision=2] the number of digits after the decimal
     * @param {string} [decimal='.'] the decimal marker
     * @param {string} [separator=','] the thousands separator
     * @returns {xyla.ValueFormatter} the formatter
     * @example '{value|number:2}'      // 3.141592     →   3.14
     * @example '{value|number:3:&}'    // 3.141592     →   3&142
     * @example '{value|number:0}'      // 9123456.789  →   9,123,456
     * @example '{value|number:4:.: }'  // 9123456.789  →   9 123 456.7890
     * @example '${value|number:2}'     // 34.9154      →   $34.92
     * @example '${value|number:0}'     // 849254.27    →   $84,9254
     */
    number: (precision, decimal, separator) => {
      if (separator === undefined) { separator = ','; }
      return value => xyla.formatters.empty(true, false)(value) ? '' : Highcharts.numberFormat(value, precision, decimal, separator);
    },
    /**
     * Generates a formatter that calculates a new date that is an offset of a given date.
     * @param {number|string} [offset=0] the value to add to the date in units of `datePart`
     * @param {string} [datePart='days'] the units of the `offset` to add to the date
     * @returns {xyla.ValueFormatter} the formatter
     * @example '{value|dateAdd:1:week}'
     * @example '{value|dateAdd:4:days}'
     */
    dateAdd: (offset, datePart) => {
      if (!offset) { offset = 0; }
      offset = parseFloat(offset);
      if (isNaN(offset)) { return xyla.tools.presentError(new Error('A number is required for dateAdd formatter offset.')); }
      if (!datePart) { datePart = 'days'; }

      if (['month', 'months', 'mos', 'mo'].indexOf(datePart) !== -1) {
        return value => {
          if (xyla.formatters.empty(true, false)(value)) { return ''; }
          let date = new Date(value);
          return date.setMonth(date.getMonth() + offset);
        }
      }
      let offsetMillis = (() => {
        switch (datePart) {
          case 'ms':
          case 'millisecond':
          case 'milliseconds': return offset;
          case 's':
          case 'second': 
          case 'seconds': return offset * 1000;
          case 'm': 
          case 'minute': 
          case 'minutes': return offset * 1000 * 60;
          case 'h':
          case 'hour':
          case 'hours': return offset * 1000 * 60 * 60;
          case 'd':
          case 'day':
          case 'days': return offset * 1000 * 60 * 60 * 24;
          case 'w':
          case 'week':
          case 'weeks': return offset * 1000 * 60 * 60 * 24 * 7;
          default: return xyla.tools.presentError(new Error('Invalid datePart type in dateAdd formatter'));
        }
      })();
      return value => {
        if (xyla.formatters.empty(true, false)(value)) { return ''; }
        let valueMillis = new Date(value).getTime();
        return valueMillis + offsetMillis;
      }
    },
    /**
     * Generates a formatter that creates a date range between a date and an offset
     * of that date.
     * @param {number|string} [interval=0] the value to add to the start date to calculate the end date
     * @param {string} [datePart='days'] the units of the `interval`
     * @param {string} [format='%Y-%m-%d'] the date format string. The supported format specifiers are a subset from PHP [strftime](http://www.php.net/manual/en/function.strftime.php).
     * @param {string} [separator=' : '] the string to place between the two dates in the date range
     * @returns {xyla.ValueFormatter} the formatter
     * @example '{value|dateRange:1:week:%m/%d:–}'      // '2019-01-08T00:00:00.000Z'  → '01/08–01/14'
     * @example '{value|dateRange:2:months:%m/%d}'      // '2019-01-08T00:00:00.000Z'  → '01/08 : 03/08'
     * @example '{value|dateRange:4:days:%A: thru }'    // '2019-01-08T00:00:00.000Z'  → 'Tuesday thru Friday'
     */
    dateRange: (interval, datePart, format, separator) => {
      if (!interval) { interval = 0; }
      if (!datePart) { datePart = 'days'; }
      if (!format) { format = '%Y-%m-%d'; }
      if (!separator) { separator = ' : '; }
      return value => {
        if (xyla.formatters.empty(true, false)(value)) { return ''; }
        let startDate = xyla.formatters.dateAdd(0)(value);
        let endDate = xyla.formatters.dateAdd(interval, datePart)(value);
        let formattedStartDate = xyla.formatters.date(format)(startDate);
        let formattedEndDate = xyla.formatters.date(format)(endDate);
        return `${formattedStartDate}${separator}${formattedEndDate}`;
      }
    },
    /**
     * Generates a formatter that multiplies a number.
     * @param {number|string} [multiplier=0] the number to multiply by
     * @returns {xyla.ValueFormatter} the formatter
     * @example '{value|multiply:100}'                  // 0.6732  → 67.32000000000001
     * @example '{value|multiply:100|number:2}%'        // 0.6732  → 67%
     * @example '{value|multiply:0.5}'                  // 0.6732  → 0.3366
     */
    multiply: multiplier => {
      if (!multiplier) { multiplier = 0; }
      return value => {
        if (xyla.formatters.empty(true, false)(value)) { return ''; }
        let result = value * multiplier;
        if (isNaN(result)) {
          result = '';
          for (let i = 0; i < multiplier; i++) {
            result += value;
          }
        }
        return result;
      }
    },
    /**
     * Generates a formatter that parses a general format string.
     * @param {xyla.FormatString} format the format string
     * @returns {xyla.ValueFormatter} the formatter
     */
    format: format => {
      let splitFormat = xyla.tools.extractQuoted(format);
      let formatParts = splitFormat.shift().split(/{(.*?)}/);
      return (value, context) => {
        let targets = Object.assign({value: value}, context);
        let quoteSubstitutions = splitFormat.slice();
        return formatParts.map((part, index) => {
          if (index % 2 === 0) { return xyla.tools.substituteQuoted([part, quoteSubstitutions]); }
          let pipes = part.split('|');
          let targetName = xyla.tools.substituteQuoted([pipes.shift(), quoteSubstitutions]);
          let target = targets[targetName];
          pipes.forEach(pipe => {
            let parameters = pipe.split(':').map(s => xyla.tools.substituteQuoted([s, quoteSubstitutions]));
            let pipeName = parameters.shift();
            if (Object.keys(xyla.formatters).indexOf(pipeName) === -1) { return; }
            target = xyla.formatters[pipeName].apply(xyla.formatters, parameters)(target);
          });
          return target;
        }).join('');
      };
    },    
    /**
     * Apply a format string or function to a value.
     * @param {any} value the value to apply the `format` to
     * @param {xyla.FormatString|ValueFormatter} [format] the format to apply to the `value`, if any
     */
    apply: (value, format) => {
      switch (typeof format) {
        case 'string': return xyla.formatters.format(format)(value);
        case 'function': return format(value);
        default: return value;
      }
    },
  };

})();
