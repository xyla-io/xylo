try {
  if (module.exports !== undefined) {
    var xylo = require('./xylo');
  }
} catch (e) {}

(function() {

  function subclassError(subclass) {
    subclass.prototype = Object.create(Error.prototype, {
      constructor: {
        value: subclass,
        enumerable: false,
        writable: true,
        configurable: true,
      },
    });
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(subclass, Error);
    } else { 
      subclass.__proto__ = Error;
    }
  }
  /**
   * An exception thrown when a requested DataSet can not be found.
   * @class
   * @param {string} key the key of the data set that could not be found
   * @property {string} key the key of the data set that could not be found
   * @memberof module:xylo
   * @example
   * throw new xylo.XyloNoDataSetException('goals');
   */
  function XyloNoDataSetException(key) {
    let instance = new Error('No xylo.DataSet named ' + key + ' found in xylo.Model');
    Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
    instance.key = key;
    return instance;
  }
  subclassError(XyloNoDataSetException);

  /**
   * An exception thrown when a a requested DataSet is asynchronously pending and it is not yet known if the DataSet will be retrieved successfully.
   * @class
   * @param {string} key the key of the data set that is pending
   * @property {string} key the key of the data set that is pending
   * @memberof module:xylo
   * @example
   * throw new xylo.XyloPendingDataSetException('goals');
   */
  function XyloPendingDataSetException(key) {
    let instance = new Error('The xylo.DataSet named ' + key + ' is not yet available.');
    Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
    instance.key = key;
    return instance;
  }
  subclassError(XyloPendingDataSetException);

  xylo.XyloNoDataSetException = XyloNoDataSetException;
  xylo.XyloPendingDataSetException = XyloPendingDataSetException;
})();

