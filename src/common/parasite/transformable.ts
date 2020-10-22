import { xyla } from '../../../index';

export interface DataVector {
  vector: any[];
  rows: Record<string, any>[];
}

export interface iTransformable {
  transform: (...transformers: any[]) => iTransformable;
  dataVectors: DataVector[];
}

export interface pTransformable {
  transformable: iTransformable;
  dataVectors: DataVector[];
}

export class Transformable implements iTransformable {
  host: pTransformable;

  constructor(host: pTransformable) {
    this.host = host
  }

  get dataVectors() { return this.host.dataVectors; }
  set dataVectors(dataVectors: DataVector[]) { this.host.dataVectors = dataVectors; }

  transform(...transformers): iTransformable {
    this.host.dataVectors = xyla.tools.transformVectors(this.host.dataVectors, ...transformers);
    return this;
  }
}