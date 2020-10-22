export interface iContextual {
  context: Record<string, any>;
  register: (context: Record<string, any>) => iContextual;
  push: (clear: boolean) => iContextual;
  pop: () => iContextual;
  uncrate: (crated: any) => any;
}

export interface pContextual {
  contextual: iContextual;
  context: Record<string, any>
}

export enum ContextualKey {
  Crate = 'iocrate',
  Context = 'iocontext',
  String = 'str'
}

export interface ContextualCrate {
  [ContextualKey.Crate]: any;
}

export function isContextualCrate(value: any): boolean {
  return typeof value === 'object' && Object.keys(value) == [ContextualKey.Crate] && Object.getPrototypeOf(value) === Object.getPrototypeOf({});
}

export class Contextual implements iContextual {
  static crate(uncrated: any): ContextualCrate {
    return {
      [ContextualKey.Crate]: uncrated,
    };
  }

  host: pContextual;
  private contextStack: Record<string, any>[];

  constructor(host: pContextual) {
    this.host = host;
    this.contextStack = [];
  }

  get context() { return this.host.context; }
  set context(context: Record<string, any>) { this.host.context = context; }

  register(context: Record<string, any>): iContextual {
    Object.assign(this.context, context);
    return this;
  }

  push(clear: boolean = false): iContextual {
    const oldContext = this.context;
    const newContext = {};
    if (!clear) {
      Object.assign(newContext, oldContext);
    }
    this.contextStack.push(oldContext);
    this.context = newContext;
    return this;
  }

  pop(): iContextual {
    console.assert(this.contextStack.length, 'Attempt to pop context with no context stack.');
    this.context = this.contextStack.pop();
    return this;
  }

  uncrate(crated: any): any {
    if (isContextualCrate(crated)) {
      return crated[ContextualKey.Crate];
    }
    if (typeof crated === 'string') { 
      const realm = crated.split('.', 1).pop();
      switch (realm) {
        case ContextualKey.String: return crated.substr(ContextualKey.String.length + 1);
        case ContextualKey.Context:
          const components = crated.split('.').slice(1);
          const value = components.reduce((v, c) => v === null || v === undefined ? null : v[c], this.context);      
          return value;
      }
    } else if (typeof crated === 'object') {
      const uncrated = {};
      Object.keys(crated).forEach(key => uncrated[key] = this.uncrate[crated[key]]);
      return uncrated;
    } else if (Array.isArray(crated)) {
      return crated.map(v => this.uncrate(v));
    } else {
      return crated;
    }
  }
}