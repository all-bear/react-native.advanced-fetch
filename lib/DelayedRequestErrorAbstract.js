export default class DelayedRequestErrorAbstract {
  constuctor(...args) {
    this.error = new Error(...args);
  }

  toString() {
    return this.error.toString();
  }
};
