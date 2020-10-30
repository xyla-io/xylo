"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decomposeURL = exports.composeURL = exports.splitComponents = exports.joinComponents = exports.unescapeComponent = exports.escapeComponent = exports.mongoUnescape = exports.mongoEscape = exports.regExpEscape = void 0;
function regExpEscape(literal) {
    // Expression from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
    return literal.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
}
exports.regExpEscape = regExpEscape;
function mongoEscape(literal) {
    return literal.replace(/＄/g, '＄＄').replace(/．/g, '．．').replace(/\$/g, '＄').replace(/\./g, '．');
}
exports.mongoEscape = mongoEscape;
function mongoUnescape(escaped) {
    return escaped.replace(/((^|[^＄])(＄＄)*)＄/g, '$1$').replace(/＄＄/g, '＄').replace(/((^|[^．])(．．)*)．/g, '$1.').replace(/．．/g, '．');
}
exports.mongoUnescape = mongoUnescape;
function escapeComponent(component, reserved) {
    var reservedExpression;
    if (typeof reserved === 'string') {
        reservedExpression = new RegExp(regExpEscape(reserved), 'g');
    }
    else if (Array.isArray(reserved)) {
        var reservedPattern = reserved.map(regExpEscape).join('|');
        reservedExpression = new RegExp(reservedPattern, 'g');
    }
    else {
        reservedExpression = reserved;
    }
    return component.replace(/\\/g, '\\\\').replace(reservedExpression, '\\$&');
}
exports.escapeComponent = escapeComponent;
function unescapeComponent(escapedComponent) {
    return escapedComponent.replace(/((^|[^\\])(\\\\)*)\\([^\\]|$)/g, '$1$4').replace(/\\\\/g, '\\');
}
exports.unescapeComponent = unescapeComponent;
function joinComponents(components, separator) {
    return components.map(function (c) { return escapeComponent(c, [separator]); }).join(separator);
}
exports.joinComponents = joinComponents;
function splitComponents(joinedComponents, separators) {
    var splitExpression;
    if (typeof separators === 'string') {
        splitExpression = new RegExp(regExpEscape(separators));
    }
    else if (Array.isArray(separators)) {
        var separatorPattern = separators.map(regExpEscape).join('|');
        splitExpression = new RegExp(separatorPattern);
    }
    else {
        splitExpression = separators;
    }
    return joinedComponents.split(splitExpression).map(unescapeComponent);
}
exports.splitComponents = splitComponents;
function composeURL(scheme, components) {
    return scheme + '://' + components.map(function (c) { return escapeComponent(c, /\//g); }).join('/');
}
exports.composeURL = composeURL;
function decomposeURL(url) {
    var parts = url.split('://');
    console.assert(parts.length === 2, "Decomposing URL without exactly one '://' scheme separator: " + url);
    return {
        scheme: parts[0],
        components: splitComponents(parts[1], /\//g),
    };
}
exports.decomposeURL = decomposeURL;
//# sourceMappingURL=url.js.map