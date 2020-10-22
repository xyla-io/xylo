/**
 * Thrown when a requested DataSet can not be found.
 */
export class XyloNoDataSetException extends Error {
  /**
   * @param key the key of the data set that could not be found
   * @example ```ts
   * throw new XyloNoDataSetException('goals');
   * ```
   */
  constructor(public key: string) {
    super('No DataSet named ' + key + ' found in Model');
  }
}
