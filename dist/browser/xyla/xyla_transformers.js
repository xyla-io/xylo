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
     * Xyla data vector transformers.
     * @namespace
     */
    xyla.transformers = {};
    /**
     * Transformers that compose or modify other transformers.
     * @namespace
     */
    xyla.transformers.meta = {
        /**
         * Generates a transformer by composing a sequence of transformers.
         * @param {Array<DataVectorTransformer>} transformers the columns by which to group
         * @returns {DataVectorTransformer} the combined transformer
         */
        concat: function (transformers) {
            return function (vectors) {
                transformers.forEach(function (t) { return vectors = t(vectors); });
                return vectors;
            };
        },
    };
    /**
     * Transformers that operate on both vectors and rows in each DataVector.
     * @namespace
     */
    xyla.transformers.data = {
        /**
         * Generates a transformer that applies a mapping function to each `DataVector`
         * @param {function} callback a function as accepted by `Array.map()`, which should map a `DataVector` to a `DataVector`
         * @returns {DataVectorTransformer} the transformer
         */
        map: function (callback) {
            return function (vectors) { return vectors.map(callback); };
        },
        /**
         * Generates a transformer that applies a filter function to each `DataVector`.
         * @param {function} callback a function as accepted by `Array.filter()`, which should map a `DataVector` to a truthy value to keep it or a untruthy value to filter it out
         * @returns {DataVectorTransformer} the transformer
         */
        filter: function (callback) {
            return function (vectors) { return vectors.filter(callback); };
        },
        /**
         * Generates a transformer that reduces all `DataVector` into one.
         * @param {function} callback a function as accepted by `Array.reduce()`, which should combine each `DataVector` with a reduced `DataVector` value and return the new reduced value
         * @param {DataVector} [initialValue={vector: [], rows: []}] the initial reduced value
         * @returns {DataVectorTransformer} the transformer
         */
        reduce: function (callback, initialValue) {
            if (initialValue === undefined) {
                initialValue = { vector: [], rows: [] };
            }
            ;
            return function (vectors) { return [vectors.reduce(callback, initialValue)]; };
        },
        /**
         * Generates a transformer that sorts `DataVectors`.
         * @param {function} callback a function as accepted by `Array.sort()`, which should accept two `DataVector` objects compare
         * @returns {DataVectorTransformer} the transformer
         */
        sort: function (callback) {
            return function (vectors) { return vectors.slice().sort(callback); };
        },
        /**
         * Generates a transformer that sorts `DataVectors` by the values at specified vector indices.
         * @param {Array<number>|number} [indices] the vector indices by which to sort. Defaults to all vector indices.
         * @returns {DataVectorTransformer} the transformer
         */
        sortIndices: function (indices) {
            return xyla.transformers.data.sort(function (a, b) {
                var indicesA = xyla.tools.absoluteIndices(a.vector, indices);
                var indicesB = xyla.tools.absoluteIndices(b.vector, indices);
                for (i in indicesA) {
                    if (a.vector[indicesA[i]] < b.vector[indicesB[i]]) {
                        return -1;
                    }
                    if (a.vector[indicesA[i]] > b.vector[indicesB[i]]) {
                        return 1;
                    }
                }
                return 0;
            });
        },
        /**
         * Generates a transformer that concatenates the vector entries and rows from a sequence of data vectors.
         * @returns {DataVectorTransformer} the transformer
         */
        concat: function () { return xyla.transformers.data.reduce(function (r, v) { return { vector: r.vector.concat(v.vector), rows: r.rows.concat(v.rows) }; }); },
        /**
         * Generates a transformer that aligns the start and end of the data by eliminating rows that do not contain truthy day in required columns.
         *
         * @param {string} alignColumn the column on which to align the data
         * @param {Array<Array<string>>} requiredColumnSets an array of groups of columns to require. Data will be considered incomplete if it does not contain a truthy value in at least one column in each group.
         * @param {boolean} [alignStart=true] whether to align the beginning of the data (the lowest value of `alignColumn`)
         * @param {boolean} [alignEnd=true] whether to align the end of the data (the highest value of `alignColumn`)
         */
        align: function (alignColumn, requiredColumnSets, alignStart, alignEnd) {
            var transformer;
            transformer = function (inVectors) {
                if (!inVectors.length || !(alignStart || alignEnd)) {
                    return inVectors.slice();
                }
                if (alignStart === undefined) {
                    alignStart = true;
                }
                if (alignEnd === undefined) {
                    alignEnd = true;
                }
                if (inVectors.length > 1) {
                    return xyla.tools.flatten(inVectors.map(function (v) { return transformer([v]); }));
                }
                var vectors = inVectors;
                vectors = xyla.transformers.group.distinct(alignColumn)(vectors);
                requiredColumnSets.forEach(function (columnSet) {
                    vectors = xyla.transformers.aggregate.max(columnSet)(vectors);
                    vectors = xyla.transformers.data.filter(function (v) { return v.vector[v.vector.length - 1]; })(vectors);
                });
                var outVectors = inVectors;
                if (alignStart) {
                    var minAlignedValue = vectors.reduce(function (value, v) {
                        var vectorValue = v.vector[v.vector.length - requiredColumnSets.length - 1];
                        if (value === null || value === undefined || vectorValue < value) {
                            value = vectorValue;
                        }
                        return value;
                    }, null);
                    outVectors = xyla.transformers.row.filterLess(alignColumn, minAlignedValue, true)(outVectors);
                }
                if (alignEnd) {
                    var maxAlignedValue = vectors.reduce(function (value, v) {
                        var vectorValue = v.vector[v.vector.length - requiredColumnSets.length - 1];
                        if (value === null || value === undefined || vectorValue > value) {
                            value = vectorValue;
                        }
                        return value;
                    }, null);
                    outVectors = xyla.transformers.row.filterGreater(alignColumn, maxAlignedValue, true)(outVectors);
                }
                return outVectors;
            };
            return transformer;
        },
    };
    /**
     * Transformers that operate on the vector of each DataVector.
     * @namespace
     */
    xyla.transformers.vector = {
        /**
         * Generates a transformer that applies a mapping function to each `DataVector.vector` entry
         * @param {function} callback a function as accepted by `Array.map()`, which should map a vector entry to a vector entry
         * @param {Array<number>|number} [indices] the vector indices to map. Defaults to all vector indices.
         * @returns {DataVectorTransformer} the transformer
         */
        map: function (callback, indices) { return xyla.transformers.data.map(function (v) {
            var absoluteIndices = xyla.tools.absoluteIndices(v.vector, indices);
            return {
                vector: v.vector.map(function (x, i) { return (absoluteIndices.indexOf(i) === -1) ? x : callback.apply(this, arguments); }),
                rows: v.rows,
            };
        }); },
        /**
         * Generates a transformer that applies a filter function to each `DataVector.vector` entry.
         * @param {function} [callback] a function as accepted by `Array.filter()`, which should map a vector entry to a truthy value to keep it or a untruthy value to filter it out
         * @param {Array<number>|number} [indices] the vector indices to filter. Defaults to all vector indices.
         * @returns {DataVectorTransformer} the transformer
         */
        filter: function (callback) { return xyla.transformers.data.map(function (v) {
            var absoluteIndices = xyla.tools.absoluteIndices(v.vector, indices);
            return {
                vector: v.vector.filter(function (_, i) { return (absoluteIndices.indexOf(i) === -1) ? true : callback.apply(this, arguments); }),
                rows: v.rows,
            };
        }); },
        /**
         * Generates a transformer that reduces `DataVector.vector` entries into one.
         * @param {function} callback a function as accepted by `Array.reduce()`, which should combine each vector entry with a reduced value and return the new reduced value
         * @param {DataVector} [initialValue={vector: [], rows: []}] the initial reduced value
         * @param {Array<number>|number} [indices] the vector indices to reduce. Defaults to all vector indices.
         * @returns {DataVectorTransformer} the transformer
         */
        reduce: function (callback, initialValue, indices) {
            return xyla.transformers.data.map(function (v) {
                var absoluteIndices = xyla.tools.absoluteIndices(v.vector, indices);
                return {
                    vector: v.vector
                        .filter(function (_, i) { return absoluteIndices.indexOf(i) === -1; })
                        .concat([v.vector.reduce(function (r, _, i) { return (absoluteIndices.indexOf(i) === -1) ? r : callback.apply(this, arguments); }, initialValue)]),
                    rows: v.rows,
                };
            });
        },
        /**
         * Generates a transformer that sorts `DataVector.vector` entries.
         * @param {function} callback a function as accepted by `Array.sort()`, which should accept two vector entries to compare
         * @returns {DataVectorTransformer} the transformer
         */
        sort: function (callback) { return xyla.transformers.data.map(function (v, i) { return { vector: v.vector.slice().sort(callback), rows: v.rows }; }); },
        /**
         * Generates a transformer that applies a mapping function to each `DataVector.vector` as a whole.
         * @param {function} callback a function that should map a vector array and an index map to a vector array
         * @returns {DataVectorTransformer} the transformer
         */
        mapWhole: function (callback) { return xyla.transformers.data.map(function (v, i) { return { vector: callback(v.vector, i), rows: v.rows }; }); },
        /**
         * Generates a transformer that adds a vector entry by concatenating and removing selected existing vector entries.
         *
         * @param {string} [separator=', '] the separator to place between concatenated values
         * @param {Array<number>|number} [indices] the vector indices to concatenate. Defaults to all vector indices
         * @returns {DataVectorTransformer} the transformer
         */
        stringConcat: function (separator, indices) {
            if (separator === undefined) {
                separator = ', ';
            }
            return xyla.transformers.vector.reduce(function (r, x, i) { return (i > 0) ? r + separator + x : r + x; }, '', indices);
        },
        /**
         * Generates a transformer that adds a vector entry by generating a key from and removing selected vector indices.
         *
         * @param {Array<number>|number} [indices] the vector indices to combine into a key. Defaults to all vector indices.
         * @returns {DataVectorTransformer} the transformer
         */
        stringKey: function (indices) { return xyla.transformers.meta.concat([
            xyla.transformers.vector.reduce(function (r, x) { return r.concat([x]); }, [], indices),
            xyla.transformers.vector.map(function (x) { return JSON.stringify(x); }, -1),
        ]); },
        /**
         * Generates a transformer that rearranges vector entries using an index mapping.
         *
         * @param {object<string, number>} mapping a dictionary whose keys are numeric strings represening source vector indices and whose values are destination indices. Source vector entries whose indicies do not appear as keys will not be included in the transformed vector.
         * @returns {DataVectorTransformer} the transformer
         */
        indexMap: function (mapping) {
            var indexPairs = [];
            for (sourceIndexString in mapping) {
                indexPairs.push([mapping[sourceIndexString], parseInt(sourceIndexString)]);
            }
            return function (vectors) {
                return vectors.map(function (v) {
                    var destinationIndices = xyla.tools.absoluteIndices(v.vector, indexPairs.map(function (a) { return a[0]; }));
                    var sourceIndices = xyla.tools.absoluteIndices(v.vector, indexPairs.map(function (a) { return a[1]; }));
                    var absoluteIndexPairs = destinationIndices.map(function (destinationIndex, i) { return [destinationIndex, sourceIndices[i]]; });
                    absoluteIndexPairs.sort(function (a, b) { return a - b; });
                    if (JSON.stringify(absoluteIndexPairs.map(function (p) { return p[0]; })) != JSON.stringify(__spreadArrays(Array(absoluteIndexPairs.length).keys()))) {
                        return xyla.tools.presentError(new Error("Missing destination indices: " + absoluteIndexPairs.map(function (p) { return p[0]; })));
                    }
                    return {
                        vector: absoluteIndexPairs.map(function (p) { return v.vector[p[1]]; }),
                        rows: v.rows,
                    };
                });
            };
        },
        /**
         * Generates a transformer that appends entries to a vector.
         *
         * @param {Array<any>|any} values values to append to the end of the vector
         * @returns {DataVectorTransformer} the transformer
         */
        append: function (values) {
            if (!Array.isArray(values)) {
                values = [values];
            }
            return xyla.transformers.vector.mapWhole(function (v) { return v.concat(values); });
        },
        /**
         * Generates a transformer that maps date entries to a timestamp.
         *
         * @param {Array<number>|number} [indices] the vector indices to combine into a key. Defaults to all vector indices.
         * @returns {DataVectorTransformer} the transformer
         */
        timestamp: function (indices) {
            return xyla.transformers.vector.map(function (d) { return new Date(d).getTime(); }, indices);
        },
        /**
         * Generates a transformer that maps date entries to a timestamp.
         *
         * @param {Array<number>|number} [indices] the vector indices to combine into a key. Defaults to all vector indices.
         * @returns {DataVectorTransformer} the transformer
         */
        axisType: function (indices) {
            return xyla.transformers.vector.map(function (x) {
                if (x === null || x === undefined) {
                    return null;
                }
                if (xyla.tools.isValidISO8601(x)) {
                    return xyla.AxisType.date;
                }
                else if (typeof x === 'string') {
                    return xyla.AxisType.category;
                }
                else {
                    return xyla.AxisType.number;
                }
            }, indices);
        },
        /**
         * Generates a transformer that appends a vector entry that is the quotient of removed vector entries.
         *
         * @param {Array<number>|number} [indices=[-2,-1]] the vector indices to combine into a key. Defaults to all vector indices.
         * @returns {DataVectorTransformer} the transformer
         */
        quotient: function (indices) {
            if (indices === undefined) {
                indices = [-2, -1];
            }
            return xyla.transformers.vector.reduce(function (r, x, i) {
                if (r === undefined) {
                    return (x === undefined) ? null : x;
                }
                else if (r === null) {
                    return null;
                }
                else if (x === 0) {
                    return null;
                }
                else {
                    return r / x;
                }
            }, (Array.isArray(indices) && !indices.length) ? null : undefined, indices);
        },
        /**
         * Generates a transformer that deleted selected vector entries.
         *
         * @param {Array<number>|number} [indices] the vector indices to combine into a key. Defaults to all vector indices.
         * @returns {DataVectorTransformer} the transformer
         */
        delete: function (indices) { return xyla.transformers.vector.mapWhole(function (v) {
            var absoluteIndices = xyla.tools.absoluteIndices(v, indices);
            return v.filter(function (_, i) { return absoluteIndices.indexOf(i) === -1; });
        }); },
    };
    /**
     * Transformers split data into groups.
     * @namespace
     */
    xyla.transformers.group = {
        /**
         * Generates a transformer that groups by a group name generated from a list of columns.
         *
         * @param {Array<string>} [columns=[]] the columns by which to group
         * @param {string} [separator=', '] the separator to insert between column values
         * @returns {DataVectorTransformer} the transformer
         */
        by: function (columns, separator) {
            if (columns === undefined) {
                columns = [];
            }
            if (!columns.length) {
                return xyla.transformers.vector.append('');
            }
            return xyla.transformers.meta.concat([
                xyla.transformers.group.distinct(columns),
                xyla.transformers.vector.stringConcat(separator),
            ]);
        },
        /**
         * Generates a transformer that groups column values to split vectors add a new vector entries for each grouping column.
         *
         * @param {Array<string>|string} columnNames the columns by which to group
         * @returns {DataVectorTransformer} the group transformer
         */
        distinct: function (columnNames) {
            if (!Array.isArray(columnNames)) {
                columnNames = [columnNames];
            }
            return function (vectors) {
                return xyla.tools.flatten(vectors.map(function (vector) {
                    groups = [];
                    groupMap = {};
                    vector.rows.forEach(function (row) {
                        groupName = JSON.stringify(columnNames.map(function (column) { return row[column]; }));
                        if (groupMap[groupName] === undefined) {
                            groupMap[groupName] = groups.length;
                            groups.push({
                                vector: vector.vector.concat(JSON.parse(groupName)),
                                rows: [],
                            });
                        }
                        groups[groupMap[groupName]].rows.push(row);
                    });
                    return groups;
                }));
            };
        },
    };
    /**
     * Transformers that aggregate data together.
     * @namespace
     */
    xyla.transformers.aggregate = {
        /**
         * Generates a transformer that appends one new vector entry from a reduction of all rows in each `DataVector`.
         * @param {function} callback a function as accepted by `Array.reduce()`, which should combine each row with a reduced value and return the new reduced value
         * @param {DataVector} [initialValue] the initial reduced value
         * @returns {DataVectorTransformer} the transformer
         */
        reduce: function (callback, initialValue) { return xyla.transformers.data.map(function (v) { return { vector: v.vector.concat([v.rows.reduce(callback, initialValue)]), rows: v.rows }; }); },
        /**
         * Generates a transformer that sums column values to add a new vector entry.
         * @param {Array<string>|string} columnNames the columns to sum
         * @returns {DataVectorTransformer} the sum transformer
         */
        sum: function (columnNames) {
            if (!Array.isArray(columnNames)) {
                columnNames = [columnNames];
            }
            return xyla.transformers.aggregate.reduce(function (value, row) {
                columnNames.forEach(function (columnName) { return value += row[columnName] || 0; });
                return value;
            }, 0);
        },
        /**
         * Generates a transformer that takes the minimum column values to add a new vector entry.
         * @param {Array<string>|string} columnNames the columns to aggregate
         * @returns {DataVectorTransformer} the transformer
         */
        min: function (columnNames) {
            if (!Array.isArray(columnNames)) {
                columnNames = [columnNames];
            }
            return xyla.transformers.aggregate.reduce(function (value, row) {
                columnNames.forEach(function (columnName) {
                    if (value === null || value === undefined || row[columnName] < value) {
                        value = row[columnName];
                    }
                });
                return value;
            }, null);
        },
        /**
         * Generates a transformer that takes the maximum column values to add a new vector entry.
         * @param {Array<string>|string} columnNames the columns to aggregate
         * @returns {DataVectorTransformer} the transformer
         */
        max: function (columnNames) {
            if (!Array.isArray(columnNames)) {
                columnNames = [columnNames];
            }
            return xyla.transformers.aggregate.reduce(function (value, row) {
                columnNames.forEach(function (columnName) {
                    if (value === null || value === undefined || row[columnName] > value) {
                        value = row[columnName];
                    }
                });
                return value;
            }, null);
        },
    };
    /**
     * Transformers that join datasets together.
     * @namespace
     */
    xyla.transformers.join = {
        /**
         * Generates a transformer that left joins the rows of two vectors on specified columns.
         * @param {object<string, string>} mapping a dictionary whose keys are columns of the first vector's rows and whose values are matching columns in the second vector's rows
         * @returns {DataVectorTransformer} the transformer
         */
        on: function (mapping) {
            var leftColumns = Object.keys(mapping);
            var rightColumns = leftColumns.map(function (c) { return mapping[c]; });
            return function (vectors) {
                if (vectors.length !== 2) {
                    return xyla.tools.presentError(new Error('Joining requires exactly two vectors.'));
                }
                var leftTableVector = vectors[0];
                var leftNullVector = (leftTableVector.rows.length) ? Object.assign({}, leftTableVector.rows[0]) : {};
                for (key in leftNullVector) {
                    leftNullVector[key] = null;
                }
                var leftGroupIndices = __spreadArrays(Array(leftColumns.length).keys()).map(function (i) { return leftTableVector.vector.length + i; });
                var leftTransformer = xyla.transformers.meta.concat([
                    xyla.transformers.group.distinct(leftColumns),
                    xyla.transformers.vector.stringKey(leftGroupIndices),
                ]);
                var leftVectors = leftTransformer([leftTableVector]);
                var rightTableVector = vectors[1];
                var rightNullVector = (rightTableVector.rows.length) ? Object.assign({}, rightTableVector.rows[0]) : {};
                for (key in rightNullVector) {
                    rightNullVector[key] = null;
                }
                var rightGroupIndicies = __spreadArrays(Array(rightColumns.length).keys()).map(function (i) { return rightTableVector.vector.length + i; });
                var rightTransformer = xyla.transformers.meta.concat([
                    xyla.transformers.group.distinct(rightColumns),
                    xyla.transformers.vector.stringKey(rightGroupIndicies),
                ]);
                var rightVectors = rightTransformer([rightTableVector]);
                var joins = leftVectors.map(function (leftVector) {
                    return leftVector.rows.map(function (lRow) {
                        var joinVectors = rightVectors.filter(function (rightVector) { return leftVector.vector[leftVector.vector.length - 1] === rightVector.vector[rightVector.vector.length - 1]; });
                        if (!joinVectors.length) {
                            return {
                                vector: leftTableVector.vector.slice(),
                                rows: [Object.assign({}, rightNullVector, lRow)],
                            };
                        }
                        return joinVectors.map(function (v) {
                            return {
                                vector: leftTableVector.vector.concat(rightTableVector.vector),
                                rows: v.rows.map(function (rRow) { return Object.assign({}, rRow, lRow); }),
                            };
                        });
                    });
                });
                return xyla.transformers.data.concat()(xyla.tools.flatten(joins, 2));
            };
        },
    };
    /**
     * Transformers that operate on the rows in each DataVector.
     * @namespace
     */
    xyla.transformers.row = {
        /**
         * Generates a transformer that applies a mapping function to each `DataVector.rows` row.
         * @param {function} callback a function as accepted by `Array.map()`, which should map a row to a row
         * @returns {DataVectorTransformer} the transformer
         */
        map: function (callback) { return xyla.transformers.data.map(function (v) { return { vector: v.vector, rows: v.rows.map(callback) }; }); },
        /**
         * Generates a transformer that applies a mapping function to each column in each `DataVector.rows` row.
         * @param {function|object<string, function>} callback a function accepting a column value, column name, row index, row, and all rows, which should return the mapped cell value, or a mapping of column names to callbacks
         * @returns {DataVectorTransformer} the transformer
         */
        mapCells: function (callback) {
            if (typeof callback === 'function') {
                return xyla.transformers.row.map(function (row, index, rows) {
                    Object.keys(row).forEach(function (column) { return row[column] = callback(row[column], column, index, row, rows); });
                    return row;
                });
            }
            return xyla.transformers.row.map(function (row, index, rows) {
                Object.keys(callback).forEach(function (column) { return row[column] = callback[column](row[column], column, index, row, rows); });
                return row;
            });
        },
        /**
         * Generates a transformer that applies a filter function to each `DataVector.rows` row.
         * @param {function} callback a function as accepted by `Array.filter()`, which should map a row to a truthy value to keep it or a untruthy value to filter it out
         * @returns {DataVectorTransformer} the transformer
         */
        /**
         * Generates a transformer that applies a filter function to each `DataVector.rows` row.
         * @param {function} callback a function as accepted by `Array.filter()`, which should map a row to a truthy value to keep it or a untruthy value to filter it out
         * @returns {DataVectorTransformer} the transformer
         */
        filter: function (callback) { return xyla.transformers.data.map(function (v) { return { vector: v.vector, rows: v.rows.filter(callback) }; }); },
        /**
         * Generates a transformer that reduces all `DataVector.rows` rows into one.
         * @param {function} callback a function as accepted by `Array.reduce()`, which should combine each row with a reduced row value and return the new reduced value
         * @param {DataVector} [initialValue={vector: [], rows: []}] the initial reduced value
         * @returns {DataVectorTransformer} the transformer
         */
        reduce: function (callback, initialValue) {
            if (initialValue === undefined) {
                initialValue = { vector: [], rows: [] };
            }
            ;
            return xyla.transformers.data.map(function (v) { return { vector: v.vector, rows: rows.reduce(callback, initialValue) }; });
        },
        /**
         * Generates a transformer that sorts `DataVector.rows` elements.
         * @param {function} callback a function as accepted by `Array.sort()`, which should accept two rows to compare
         * @returns {DataVectorTransformer} the transformer
         */
        sort: function (callback) { return xyla.transformers.data.map(function (v, i) { return { vector: v.vector, rows: v.rows.slice().sort(callback) }; }); },
        /**
         * Generates a transformer that filters all rows by a given set of allowed values.
         *
         * @param {Array<string>|string} columnNames the columns by which to filter
         * @param {Array<any>|any} values the values by which to filter
         * @param {boolean} [negate=false] if true, keep rows that don't match `values`, otherwise keep rows that match `values`.
         * @returns {DataVectorTransformer} the sum transformer
         */
        filterValues: function (columnNames, values, negate) {
            if (!Array.isArray(columnNames)) {
                columnNames = [columnNames];
            }
            return xyla.transformers.row.filter(function (row) {
                for (var i in columnNames) {
                    if (negate && values.indexOf(row[columnNames[i]]) !== -1) {
                        return false;
                    }
                    if (!negate && values.indexOf(row[columnNames[i]]) === -1) {
                        return false;
                    }
                }
                return true;
            });
        },
        /**
         * Generates a transformer that filters all rows by comparing selected columns to a maximum threshold value.
         *
         * @param {Array<string>|string} columnNames the columns by which to filter
         * @param {any} threshold the criterion by which to filter
         * @param {boolean} [negate=false] if true, keep rows greater than or equal to `threshold`, otherwise keep rows less than `threshold`.
         * @returns {DataVectorTransformer} the sum transformer
         */
        filterLess: function (columnNames, threshold, negate) {
            if (!Array.isArray(columnNames)) {
                columnNames = [columnNames];
            }
            return xyla.transformers.row.filter(function (row) {
                for (var i in columnNames) {
                    var value = row[columnNames[i]];
                    if (value === null || value === undefined) {
                        return false;
                    }
                    if (negate && value < threshold) {
                        return false;
                    }
                    if (!negate && value >= threshold) {
                        return false;
                    }
                }
                return true;
            });
        },
        /**
         * Generates a transformer that filters all rows by comparing selected columns to a minimum threshold value.
         *
         * @param {Array<string>|string} columnNames the columns by which to filter
         * @param {any} threshold the criterion by which to filter
         * @param {boolean} [negate=false] if true, keep rows greater than or equal to `threshold`, otherwise keep rows less than `threshold`.
         * @returns {DataVectorTransformer} the sum transformer
         */
        filterGreater: function (columnNames, threshold, negate) {
            if (!Array.isArray(columnNames)) {
                columnNames = [columnNames];
            }
            return function (vectors) { return vectors.map(function (v) {
                return {
                    vector: v.vector,
                    rows: v.rows.filter(function (row) {
                        for (var i in columnNames) {
                            var value = row[columnNames[i]];
                            if (value === null || value === undefined) {
                                return false;
                            }
                            if (negate && value > threshold) {
                                return false;
                            }
                            if (!negate && value <= threshold) {
                                return false;
                            }
                        }
                        return true;
                    }),
                };
            }); };
        },
        /**
         * Generates a transformer that converts a column with JSON object data into new columns in each row.
         *
         * @param {Array<string>|string} columnNames the columns containing JSON object data
         * @param {function} [nameMapper=null] an optional callback to map the JSON object property names to new column names, accepting the property name, property value, row, row index, and all rows
         * @param {function} [nameMapper=null] an optional callback to map the JSON object property values to new values, accepting the property value, property name, new column name, row, row index, and all rows
    property names to new column names
         * @param {boolean} [consume=true] if true, delete the `columnNames` columns
         * @returns {DataVectorTransformer} the sum transformer
         */
        jsonColumns: function (columnNames, nameMapper, valueMapper, consume) {
            if (nameMapper === void 0) { nameMapper = null; }
            if (valueMapper === void 0) { valueMapper = null; }
            if (consume === void 0) { consume = true; }
            if (!Array.isArray(columnNames)) {
                columnNames = [columnNames];
            }
            return xyla.transformers.row.map(function (row, index, rows) {
                columnNames.forEach(function (column) {
                    if (!row[column]) {
                        return;
                    }
                    jsonColumns = JSON.parse(row[column]);
                    if (!jsonColumns) {
                        return;
                    }
                    Object.keys(jsonColumns).forEach(function (jsonColumn) {
                        var newColumn = (nameMapper) ? nameMapper(jsonColumn, row[jsonColumn], row, index, rows) : jsonColumn;
                        if (newColumn === null) {
                            return;
                        }
                        var newValue = (valueMapper) ? valueMapper(jsonColumns[jsonColumn], jsonColumn, newColumn, row, index, rows) : jsonColumns[jsonColumn];
                        row[newColumn] = newValue;
                    });
                    if (consume) {
                        delete row[column];
                    }
                });
                return row;
            });
        },
    };
})();
//# sourceMappingURL=xyla_transformers.js.map