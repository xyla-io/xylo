"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Configure = void 0;
var Configure = /** @class */ (function () {
    function Configure() {
    }
    Configure.registerServiceWorker = function (directory) {
        if ('serviceWorker' in navigator) {
            debugger;
            navigator.serviceWorker.getRegistration();
            navigator.serviceWorker.register(directory + "/service-worker.js")
                .then(function (registration) {
                return console.log("Service Worker registration complete, scope: '" + registration.scope + "'");
            })
                .catch(function (error) {
                return console.log("Service Worker registration failed with error: '" + error + "'");
            });
        }
    };
    return Configure;
}());
exports.Configure = Configure;
//# sourceMappingURL=configure.js.map