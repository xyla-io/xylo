export function regExpEscape(literal: string): string {
  // Expression from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
  return literal.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
}

export function mongoEscape(literal: string): string {
  return literal.replace(/＄/g, '＄＄').replace(/．/g, '．．').replace(/\$/g, '＄').replace(/\./g, '．');
}

export function mongoUnescape(escaped: string): string {
  return escaped.replace(/((^|[^＄])(＄＄)*)＄/g, '$1$').replace(/＄＄/g, '＄').replace(/((^|[^．])(．．)*)．/g, '$1.').replace(/．．/g, '．'); 
}

export function escapeComponent(component: string, reserved: string|string[]|RegExp): string {
  let reservedExpression: RegExp;
  if (typeof reserved === 'string') {
    reservedExpression = new RegExp(regExpEscape(reserved as string), 'g');
  } else if (Array.isArray(reserved)) {
    const reservedPattern = reserved.map(regExpEscape).join('|');
    reservedExpression = new RegExp(reservedPattern, 'g');
  } else {
    reservedExpression = reserved as RegExp;
  }
  return component.replace(/\\/g, '\\\\').replace(reservedExpression, '\\$&');
}

export function unescapeComponent(escapedComponent: string): string {
  return escapedComponent.replace(/((^|[^\\])(\\\\)*)\\([^\\]|$)/g, '$1$4').replace(/\\\\/g, '\\');
}

export function joinComponents(components: string[], separator: string): string {
  return components.map(c => escapeComponent(c, [separator])).join(separator);
}

export function splitComponents(joinedComponents: string, separators: string|string[]|RegExp) {
  let splitExpression: RegExp;
  if (typeof separators === 'string') {
    splitExpression = new RegExp(regExpEscape(separators as string));
  } else if (Array.isArray(separators)) {
    const separatorPattern = separators.map(regExpEscape).join('|');
    splitExpression = new RegExp(separatorPattern);
  } else {
    splitExpression = separators as RegExp;
  }
  return joinedComponents.split(splitExpression).map(unescapeComponent);
}

export function composeURL(scheme: string, components: string[]): string {
  return scheme + '://' + components.map(c => escapeComponent(c, /\//g)).join('/');
}

export function decomposeURL(url: string): { scheme: string, components: string[] } {
  const parts = url.split('://');
  console.assert(parts.length === 2, `Decomposing URL without exactly one '://' scheme separator: ${url}`);
  return {
    scheme: parts[0],
    components: splitComponents(parts[1], /\//g),
  };
}