var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
try {
    if (module.exports !== undefined) {
        var xyla = require('./xyla');
    }
}
catch (e) { }
(function () {
    /**
     * Utility functions for advanced and internal usage.
     * @namespace
     */
    xyla.tools = {};
    xyla.tools.presentError = function (error, elementSelector) {
        throw error;
    };
    /**
     * Flattens a nested array structure.
     * @param {Array<any>} array an array
     * @param {number} [depth=1] the number of levels to flatten
     * @returns a new array flattened by `depth` levels
     */
    xyla.tools.flatten = function (array, depth) {
        var flat = [].concat.apply([], array);
        return (depth > 1) ? xyla.tools.flatten(flat, depth - 1) : flat;
    };
    /**
     * Constructs an array containing an integer range.
     * @param {number} min the minimum integer in the range
     * @param {number} max the maximum integer in the range
     * @returns {Array<number>} an array containing all integers between `min` and `max`, inclusive, or an empty array if `max` is less than `min`
     */
    xyla.tools.range = function (min, max) {
        var range = [];
        for (var i = min; i <= max; i++) {
            range.push(i);
        }
        return range;
    };
    /**
     * Maps a relative index array to absolute indices for a specific array.
     * @param {Array<any>} array an array
     * @param {Array<number>|number|null} [indices=null] an array of integers or an integer specifying an index set, where negative numbers represent indices reckoned from the end of the array, with `-1` representing the last element. Pass `null` to represent all indices in the array.
     * @returns {Array<number>} an array containing all integers between `min` and `max`, inclusive, or an empty array if `max` is less than `min`
     * @throws {Error} if any index is out of the range of `array`.
     */
    xyla.tools.absoluteIndices = function (array, indices) {
        if (indices === undefined || indices === null) {
            return __spreadArrays(array.keys());
        }
        if (!Array.isArray(indices)) {
            indices = [indices];
        }
        return indices.map(function (i) {
            var index = (i < 0) ? array.length + i : i;
            if (index < 0 || index >= array.length) {
                return xyla.tools.presentError(new Error("Index " + index + " out of range in array " + array));
            }
            return index;
        });
    };
    /**
     * Returns an array element at a relative index location.
     * @param {Array<any>} array an array
     * @param {number} index an integer specifying a location in `array`, where negative numbers represent indices reckoned from the end of the array, with `-1` representing the last element
     * @returns {any} the element in `array` at `index`
     * @throws {Error} if `index` is out of the range of `array`
     */
    xyla.tools.elementAtRelativeIndex = function (array, index) {
        return array[xyla.tools.absoluteIndices(array, [index])[0]];
    };
    /**
     * Get a value in a nested object that can be found by accessing
     * the keys on the key path.
     * @param {object} nestedObj the nested object to extract a value from
     * @param {...string} keyPath the keys to follow inside the nested object
     * @returns {any} value if found, else undefined
     */
    xyla.tools.valueForKeys = function (nestedObj) {
        var keyPath = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            keyPath[_i - 1] = arguments[_i];
        }
        return keyPath.reduce(function (obj, key) {
            return (obj && obj[key] !== undefined) ? obj[key] : undefined;
        }, nestedObj);
    };
    /**
     * Applies a series of transformations to a set of data vectors.
     * @param {Array<DataVector>} vectors an array of data vectors
     * @param {Array<DataVectorTransformer>} transformers an array of data vector transformers
     * @returns {Array<DataVector>} the transformed data vectors
     */
    xyla.tools.transformVectors = function (vectors) {
        var transformers = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            transformers[_i - 1] = arguments[_i];
        }
        transformers.forEach(function (t) { return vectors = t(vectors); });
        return vectors;
    };
    /**
     * Renders a graph.
     * @param {xyla.RenderOptions} options the graph rendering options
     * @example
     * // set up the graph options and data
     * let graphOptions = {
     *
     * };
     * // render a line graph in an element like <div class="xyla-line-graph"></div>
     * xyla.tools.render('xyla-line-graph', );
     */
    xyla.tools.render = function (renderOptions) {
        xyla.grapher.highcharts.render(renderOptions);
    };
    /**
     * Utility functions for dealing with colors.
     * @namespace
     */
    xyla.tools.color = {};
    /**
     * Darken a hex color by a percentage.
     *
     * @param {string} color the hex value (with or without '#') to darken
     * @param {number} [amount=20] the percent to darken the color by
     */
    xyla.tools.color.darken = function (color, amount) {
        if (amount === void 0) { amount = 20; }
        var subtractLight = function (color, amount) {
            var cc = parseInt(color, 16) - amount;
            var c = (cc < 0) ? 0 : (cc);
            c = (c.toString(16).length > 1) ? c.toString(16) : "0" + c.toString(16);
            return c;
        };
        color = (color.indexOf("#") >= 0) ? color.substring(1, color.length) : color;
        amount = parseInt((255 * amount) / 100);
        return color = "#" + subtractLight(color.substring(0, 2), amount) + subtractLight(color.substring(2, 4), amount) + subtractLight(color.substring(4, 6), amount);
    };
    /**
     * Lighten a hex color by a percentage.
     *
     * @param {string} color the hex value (with or without '#') to lighten
     * @param {number} [amount=20] the percent to lighten the color by
     */
    xyla.tools.color.lighten = function (color, amount) {
        if (amount === void 0) { amount = 20; }
        var addLight = function (color, amount) {
            var cc = parseInt(color, 16) + amount;
            var c = (cc > 255) ? 255 : (cc);
            c = (c.toString(16).length > 1) ? c.toString(16) : "0" + c.toString(16);
            return c;
        };
        color = (color.indexOf("#") >= 0) ? color.substring(1, color.length) : color;
        amount = parseInt((255 * amount) / 100);
        return color = "#" + addLight(color.substring(0, 2), amount) + addLight(color.substring(2, 4), amount) + addLight(color.substring(4, 6), amount);
    };
    /**
     * Utility functions for dealing with colors.
     *
     * @namespace
     */
    xyla.tools.css = {};
    xyla.tools.css.convertCSSObjectToString = function (styles) {
        if (styles === void 0) { styles = {}; }
        var selectorKeys = Object.keys(styles);
        if (!selectorKeys.length) {
            return '';
        }
        return selectorKeys.reduce(function (allStyles, selectorKey) {
            var styleString = Object.keys(styles[selectorKey]).reduce(function (styleString, styleKey) {
                return styleString + (styleKey + ":" + styles[selectorKey][styleKey] + ";");
            }, '');
            return allStyles + (selectorKey + "{" + styleString + "}");
        }, '');
    };
    /**
     * Write a new style tag containing a string to the HTML document
     *
     * @param {string} styleString a string to write inside a `<style>` tag
     * @example
     * xyla.tools.css.addStyleStringToDocument(`@import 'https://code.highcharts.com/css/highcharts.css';`);
     */
    xyla.tools.css.addStyleStringToDocument = function (styleString) {
        var head = document.head || document.getElementsByTagName('head')[0];
        var styleElement = document.createElement('style');
        styleElement.type = 'text/css';
        if (styleElement.styleSheet) {
            // IE8 and below
            styleElement.styleSheet.cssText = styleString;
        }
        else {
            styleElement.appendChild(document.createTextNode(styleString));
        }
        head.appendChild(styleElement);
    };
    /**
     * Add styles defined in an object to the HTML document.
     *
     * @param {object} styles an object whose keys are CSS selectors and values are objects with multiple CSS properties
     *
     * @example
     * xyla.tools.css.addGlobalStyles({
     *  div: {
     *    color: red,
     *    background: black
     *  },
     *  '.highcharts-color-0': {
     *    fill: '#9E4BF6'
     *  }
     * });
     */
    xyla.tools.css.addGlobalStyles = function (styles) {
        if (styles === void 0) { styles = {}; }
        var styleString = xyla.tools.css.convertCSSObjectToString(styles);
        xyla.tools.css.addStyleStringToDocument(styleString);
    };
    /**
     * Splits a string into an array containing the string with placeholders substituted for quoted values as the first element, followed by the substitution value elements. The string can be reassembled with un-quoted values using {@link xyla.tools.substituteQuoted}
     * @param {string} text a string
     * @param {string} [quoteCharacter='"'] the character to represent the start and end of quoted literals. Within a quoted literal, the literal quote character may be represented by two consecutive quote characters.
     * @returns {Array<string>} an array whose first element is `text` with each quoted section replaced with `quoteCharacter` and whose subsequent elements are the quoted sections with quote characters removed
     */
    xyla.tools.extractQuoted = function (text, quoteCharacter) {
        if (quoteCharacter === undefined) {
            quoteCharacter = '"';
        }
        var unquoted = '';
        var quoted = [];
        var quoteStartIndex = null;
        var quoteIndex = null;
        var currentIndex = 0;
        do {
            quoteIndex = text.indexOf(quoteCharacter, currentIndex);
            if (quoteStartIndex === null) {
                if (quoteIndex === -1) {
                    unquoted += text.substring(currentIndex);
                }
                else {
                    unquoted += text.substring(currentIndex, quoteIndex) + quoteCharacter;
                    quoted.push('');
                    quoteStartIndex = quoteIndex;
                    currentIndex = quoteIndex + 1;
                }
            }
            else {
                if (quoteIndex === -1) {
                    quoted[quoted.length - 1] += text.substring(currentIndex);
                }
                else {
                    var nextQuoteIndex = text.indexOf(quoteCharacter, quoteIndex + 1);
                    quoted[quoted.length - 1] += text.substring(currentIndex, quoteIndex);
                    if (nextQuoteIndex === quoteIndex + 1) {
                        quoted[quoted.length - 1] += quoteCharacter;
                        currentIndex = nextQuoteIndex + 1;
                    }
                    else {
                        quoteStartIndex = null;
                        currentIndex = quoteIndex + 1;
                    }
                }
            }
        } while (quoteIndex !== -1);
        return [unquoted].concat(quoted);
    };
    /**
     * Substitues quoted sections back into a split string array as returned by {@link xyla.tools.extractQuoted}.
     * @param {Array<string>} splitText an array containing a string with `quoteCharacter` placeholders followed by substitution values for at least each placeholder. On return, `splitText` will contain only remaining unused substitution values.
     * @param {string} [quoteCharacter='"'] the character representing a placeholder in the first element of `splitText`
     * @returns {string} the first element of `splitText` with all `quoteCharacter` occurrences replaced with substitution values taken from consecutive elements of `splitText`
     */
    xyla.tools.substituteQuoted = function (splitText, quoteCharacter) {
        if (quoteCharacter === undefined) {
            quoteCharacter = '"';
        }
        if (!splitText.length) {
            return [];
        }
        var unquoted = splitText.shift();
        var replaced = '';
        var quoteIndex = null;
        var currentIndex = 0;
        do {
            quoteIndex = unquoted.indexOf(quoteCharacter, currentIndex);
            if (quoteIndex === -1) {
                replaced += unquoted.substring(currentIndex);
            }
            else {
                replaced += unquoted.substring(currentIndex, quoteIndex) + splitText.shift();
                currentIndex = quoteIndex + 1;
            }
        } while (quoteIndex !== -1);
        return replaced;
    };
    /**
     * Check if a given value is a valid ISO-8601 datetime string.
     * @param {any} value the value to be parsed for ISO-8601 compliance
     * @return {boolean} whether the value is valid
     */
    xyla.tools.isValidISO8601 = function (value) {
        if (typeof value !== 'string') {
            return false;
        }
        return value.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
    };
})();
//# sourceMappingURL=xyla_tools.js.map