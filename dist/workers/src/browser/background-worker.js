"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackgroundWorker = exports.isWorkerType = exports.WorkerType = void 0;
var uuid_1 = require("uuid");
var WorkerType;
(function (WorkerType) {
    WorkerType["Model"] = "model";
})(WorkerType = exports.WorkerType || (exports.WorkerType = {}));
function isWorkerType(obj) {
    return Object.values(WorkerType).includes(obj);
}
exports.isWorkerType = isWorkerType;
var BackgroundWorker = /** @class */ (function () {
    /**
     * Create a new `Worker` (web worker) according to the type
     * of work needed to perform
     * @param workerType the type of the worker (file prefix)
     */
    function BackgroundWorker(workerType, name, autoTerminate) {
        var _this = this;
        if (name === void 0) { name = null; }
        if (autoTerminate === void 0) { autoTerminate = true; }
        this.promises = {};
        this.identifier = (name ? name : String(workerType)) + '-' + uuid_1.v4();
        this.autoTerminate = autoTerminate;
        this.worker = workerType instanceof Worker ? workerType : BackgroundWorker.newWorker(workerType);
        this.worker.onmessage = function (event) {
            // console.log('background worker on message', event);
            if (!event.data && !_this.promises[event.data.uuid]) {
                throw new Error('No valid UUID in message from background worker ' + _this.identifier);
            }
            var data = event.data;
            if (data.success) {
                _this.promises[data.uuid].resolve(data.result);
            }
            else {
                _this.promises[data.uuid].reject(data.error);
            }
            delete _this.promises[data.uuid];
            if (_this.autoTerminate && !Object.keys(_this.promises).length) {
                _this.terminate();
            }
        };
        this.worker.onerror = function (error) {
            console.error('Error in BackgroundWorker ' + _this.identifier, error);
            throw error;
        };
    }
    BackgroundWorker.newWorker = function (workerType) {
        var workerPath = isWorkerType(workerType) ? workerType + ".worker.js" : workerType;
        return new Worker(workerPath, { type: 'module' });
    };
    /**
     * Initiate some background work
     */
    BackgroundWorker.prototype.run = function (workRequest) {
        var _this = this;
        var promiseId = uuid_1.v4();
        return new Promise(function (resolve, reject) {
            _this.promises[promiseId] = { resolve: resolve, reject: reject };
            _this.worker.postMessage({ workRequest: workRequest, uuid: promiseId });
        });
    };
    /**
     * Terminate all work
     */
    BackgroundWorker.prototype.terminate = function () {
        console.log('Terminating BackgroundWorker ' + this.identifier);
        this.worker.terminate();
    };
    return BackgroundWorker;
}());
exports.BackgroundWorker = BackgroundWorker;
//# sourceMappingURL=background-worker.js.map