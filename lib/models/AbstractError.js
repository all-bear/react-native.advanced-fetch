export default class AbstractError {
  constuctor(...args) {
    this.error = new Error(...args);
  }

  toString() {
    return this.error.toString();
  }
};
