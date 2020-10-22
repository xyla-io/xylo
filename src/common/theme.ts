import { Templatable } from './util/template';

export interface ThemeColor {
  name?: string;
  tier?: number;
  rgba?: [number, number, number, number];
}

export interface ThemePalette {
  colors: ThemeColor[];
  index: number;
}

export interface ThemeConfig {
  palette?: ThemePalette;
  colorMap?: ThemeColorMap;
  fade?: number;
}

export interface ThemeColorMap {
  colors?: Record<string, string|[number, number, number, number]>;
  children?: Record<string, ThemeColorMap>;
}

export class Theme implements Templatable {
  static colorString(color?: ThemeColor): string|any {
    if (!color) { return color; }
    const rgba = color.rgba || [0, 0, 0, 1];
    return 'rgba(' + rgba.join(',') + ')';
  }

  config: ThemeConfig;

  constructor(config: ThemeConfig) {
    this.config = config;
  }

  get template(): Record<string, any> {
    return this.config;
  }

  nextColor(): ThemeColor {
    if (!(this.config.palette && this.config.palette.colors.length)) { return {}; }
    const tier = Math.floor(this.config.palette.index / this.config.palette.colors.length);
    const color = this.config.palette.colors[this.config.palette.index++ % this.config.palette.colors.length];
    if (tier && this.config.fade) {
      color.tier = tier;
      color.rgba = color.rgba.slice() as [number, number, number, number];
      color.rgba[3] = color.rgba[3] * Math.pow(this.config.fade, tier);
    }
    return color;
  }

  mappedColor(path: string|string[], generate: boolean = true): ThemeColor {
    if (!(path.length && this.config.colorMap && this.config.palette && this.config.palette.colors.length)) { return {}; }
    if (!Array.isArray(path)) { path = [path]; }
    console.assert(path.length % 2, 'Path length must be odd to arrive at color instead of child');
    let map = this.config.colorMap;
    for (const component of path.slice(0, -1)) {
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
      } else {
        return {};
      }
    }
    const lastComponent = path.slice(-1).pop();
    if (generate) {
      if (!map.colors) {
        map.colors = {};
      }
      if (!map.colors[lastComponent]) {
        const nextColor = this.nextColor();
        map.colors[lastComponent] = nextColor.name || nextColor.rgba;
      }
    }
    const color = map.colors[lastComponent];
    if (!color) {
      return {};
    } else if (Array.isArray(color)) {
      return {};
    } else {
      for (const paletteColor of this.config.palette.colors) {
        if (paletteColor.name === color) {
          return paletteColor;
        }
      }
      return { name: color };
    }
  }
}
