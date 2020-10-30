"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Theme = void 0;
var Theme = /** @class */ (function () {
    function Theme(config) {
        this.config = config;
    }
    Theme.colorString = function (color) {
        if (!color) {
            return color;
        }
        var rgba = color.rgba || [0, 0, 0, 1];
        return 'rgba(' + rgba.join(',') + ')';
    };
    Object.defineProperty(Theme.prototype, "template", {
        get: function () {
            return this.config;
        },
        enumerable: false,
        configurable: true
    });
    Theme.prototype.nextColor = function () {
        if (!(this.config.palette && this.config.palette.colors.length)) {
            return {};
        }
        var tier = Math.floor(this.config.palette.index / this.config.palette.colors.length);
        var color = this.config.palette.colors[this.config.palette.index++ % this.config.palette.colors.length];
        if (tier && this.config.fade) {
            color.tier = tier;
            color.rgba = color.rgba.slice();
            color.rgba[3] = color.rgba[3] * Math.pow(this.config.fade, tier);
        }
        return color;
    };
    Theme.prototype.mappedColor = function (path, generate) {
        if (generate === void 0) { generate = true; }
        if (!(path.length && this.config.colorMap && this.config.palette && this.config.palette.colors.length)) {
            return {};
        }
        if (!Array.isArray(path)) {
            path = [path];
        }
        console.assert(Boolean(path.length % 2), 'Path length must be odd to arrive at color instead of child');
        var map = this.config.colorMap;
        for (var _i = 0, _a = path.slice(0, -1); _i < _a.length; _i++) {
            var component = _a[_i];
            if (generate) {
                if (!map.children) {
                    map.children = {};
                }
                if (!map.children[component]) {
                    map.children[component] = {};
                }
            }
            if (map.children && Object.keys(map.children).includes(component)) {
                map = map.children[component];
            }
            else {
                return {};
            }
        }
        var lastComponent = path.slice(-1).pop();
        if (generate) {
            if (!map.colors) {
                map.colors = {};
            }
            if (!map.colors[lastComponent]) {
                var nextColor = this.nextColor();
                map.colors[lastComponent] = nextColor.name || nextColor.rgba;
            }
        }
        var color = map.colors[lastComponent];
        if (!color) {
            return {};
        }
        else if (Array.isArray(color)) {
            return {};
        }
        else {
            for (var _b = 0, _c = this.config.palette.colors; _b < _c.length; _b++) {
                var paletteColor = _c[_b];
                if (paletteColor.name === color) {
                    return paletteColor;
                }
            }
            return { name: color };
        }
    };
    return Theme;
}());
exports.Theme = Theme;
//# sourceMappingURL=theme.js.map