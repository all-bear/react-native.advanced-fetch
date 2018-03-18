/**
 *
 * Abstract error which is for inheritance as base error class
 */
export default class AbstractError {
  /**
   * @param {Object} args
   */
  constuctor(...args) {
    this.error = new Error(...args);
  }

  /**
   * @return {*|string}
   */
  toString() {
    return this.error.toString();
  }
};
