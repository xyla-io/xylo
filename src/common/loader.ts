import Papa from 'papaparse';
import * as pako from 'pako';

import { Store } from './store';
import { Chunker } from './chunker';

export interface Download {
  url: string;
  buffer: Uint8Array[];
  inflator: pako.Inflate;
  next: EventTarget;
  totalBytes?: number;
  downloadedBytes?: number;
}

export class Loader {

  static chunkSize = 100000;
  download: Download;

  constructor(private store: Store) {}

  /**
   * Stream a remote CSV file in chunks and store it in a local browser database.
   * As the rows are streamed they are broken up by column for convenient column-wise
   * access.
   */
  async loadUncompressed(url: string) {
    console.time('load');
    await this.store.destroy();
    let chunker;
    return new Promise((resolve, reject) => {
      Papa.parse(url, {
        download: true,
        chunk: (results, parser) => {
          const rows = results.data;
          // Always expect a header row and shift it out
          if (!chunker) {
            chunker = new Chunker(this.store, rows.shift());
          }
          parser.pause();
          chunker.addRowChunk(rows, () => {
            parser.resume();
          });
        },
        complete: async () => {
          await this.store.writeManifest(chunker.columnNames, chunker.chunkIndex);
          console.timeEnd('load');
          resolve();
        },
      });
    });
  }

  async fetchChunk(start: number) {

    const headers = new Headers();
    headers.append('Range', `bytes=${start}-${start + Loader.chunkSize - 1}`);
    fetch(this.download.url, {
      headers,
    }).then(response => {
      const contentRange = response.headers.get('Content-Range');
      const [range, total] = contentRange.split(' ')[1].split('/');
      const [rangeStart, rangeEnd] = range.split('-');
      this.download.totalBytes = +total;
      this.download.downloadedBytes = +rangeEnd + 1;
      return response.arrayBuffer();
    }).then(data => {
      // @ts-ignore -- @types/pako doesn't have Z_ constants
      const flag = pako.Z_SYNC_FLUSH;
      const bytes = new Uint8Array(data);
      this.download.inflator.push(bytes, flag);
    });
  }

  private downloadComplete() {
    const inflator = this.download.inflator;
    inflator.push([], true);
    console.log('done');
  }

  private next(start: number) {
    console.log('next');
    this.download.next.dispatchEvent(new CustomEvent('next', { detail: { start }}));
  }

  async load(url: string) {
    console.time('load');
    const loaderThis = this;
    await this.store.destroy();
    let chunker;
    let tail = '';
    const inflator = new pako.Inflate();
    this.download = {
      url,
      inflator,
      buffer: [],
      next: new EventTarget(),
    };
    this.download.next.addEventListener('next', (ev) => {
      this.fetchChunk((ev as any).detail.start);
    });

    inflator.onEnd = function (status) {
      // loaderThis.next(loaderThis.download.downloadedBytes);
      // Always expect a header row and shift it out
      const text = this.chunks.reduce((txt, chunk) => {
        const decoded = new TextDecoder('utf-8').decode(chunk);
        return txt + decoded;
      }, tail);
      this.chunks = [];
      const { data: rows } = Papa.parse(text);

      if (!chunker) { chunker = new Chunker(loaderThis.store, rows.shift()); }
      const isDone = loaderThis.download.downloadedBytes < loaderThis.download.totalBytes;
      if (!isDone) { tail = rows.pop().join(','); }
      chunker.addRowChunk(rows).then(() => {
        if (!isDone) {
          loaderThis.next(loaderThis.download.downloadedBytes);
        } else {
          chunker.flush().then(() => {
            loaderThis.store.writeManifest(chunker.columnNames, chunker.chunkIndex).then(() => {
              console.timeEnd('load');
              loaderThis.downloadComplete();
            });
          });
        }
      });
    };
    // inflator.onData = function (chunk: Uint8Array) {
    // };
    this.next(0);
  }
}

