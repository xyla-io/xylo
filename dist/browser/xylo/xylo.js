/**
 * @module xylo
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var xylo = {};
try {
    if (module.exports !== undefined) {
        module.exports = xylo;
    }
}
catch (e) { }
(function () {
    console.log('Loading xylo.');
    /**
     * A list
     * @memberof module:xylo
     * @type object<string, string>
     * @property {string} dataFetched
     */
    var events = {
        dataFetched: 'xyloDataFetched',
    };
    xylo.events = events;
    /**
     * A data set.
     * @class
     * @param {any} dataFrame the data frame wrapped by the data set
     * @property {object} dataFrame a data frame representation of the set's data
     * @memberof module:xylo
     * @example
     * let dataSet = new xylo.DataSet(goalsDataFrame);
     */
    function DataSet(dataFrame) {
        this.dataFrame = dataFrame;
    }
    xylo.DataSet = DataSet;
    /**
     * A data model containing a group of data sets.
     * @class
     * @property {object<string, DataSet>} dataSets a dictionary of data sets
     * @property {Set<string>} pendingDataSetKeys an array of keys for data sets that are in the process of being loaded
     * @memberof module:xylo
     * @example
     * let model = new xylo.Model();
     */
    function Model() {
        this.dataSets = {};
        this.pendingDataSetKeys = new Set();
    }
    /**
     * Adds a data set.
     * @param {string} key the key under which to store the data set
     * @param {DataSet} dataSet a data set
     * @returns {Model} the model
     * @example
     * model.addDataSet('goals', goalsDataSet);
     */
    Model.prototype.addDataSet = function (key, dataSet) {
        this.dataSets[key] = dataSet;
        this.pendingDataSetKeys.delete(key);
        return this;
    };
    /**
     * Retrieves a data set.
     * @param {string} key the key under which to store the data set
     * @returns {Promise<DataSet>} a data set
     * @example
     * let goalsDataSet = model.getDataSet('goals');
     */
    Model.prototype.getDataSet = function (key) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var dataSet = _this.dataSets[key];
            if (dataSet) {
                return resolve(dataSet);
            }
            if (!_this.pendingDataSetKeys.has(key)) {
                reject(new xylo.XyloNoDataSetException(key));
            }
            var interval = setInterval(function () {
                if (_this.dataSets[key]) {
                    clearInterval(interval);
                    resolve(_this.dataSets[key]);
                }
            }, 100);
        });
    };
    /**
     * Fetches a data set from a URL and adds it to the model.
     * @param {string} key the key under which to store the data set
     * @param {string} url the URL from which to retrieve the data
     * @returns {Model} the model
     * @example
     * model.fetchDataSet('goals', 'https://example.com/goals.csv');
     */
    Model.prototype.fetchDataSet = function (key, url) {
        return __awaiter(this, void 0, void 0, function () {
            var fetcher, dataFrame, dataSet, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fetcher = new xylo.Fetcher(url);
                        this.pendingDataSetKeys.add(key);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fetcher.fetch()];
                    case 2:
                        dataFrame = _a.sent();
                        dataSet = new xylo.DataSet(dataFrame);
                        this.addDataSet(key, dataSet);
                        return [2 /*return*/, this];
                    case 3:
                        e_1 = _a.sent();
                        console.error(e_1);
                        this.pendingDataSetKeys.delete(key);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    xylo.Model = Model;
})();
//# sourceMappingURL=xylo.js.map