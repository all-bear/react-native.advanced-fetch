import hash from 'string-hash';

/**
 * Abstraction wrapper for HTTP requst
 */
export default class Request {
  /**
   * @param {String} url
   * @param {Object} params
   */
  constructor(url, params) {
    this.url = url;
    this.params = params;
    this.response = null;
    this.version = null;
  }

  /**
   * @return {String}
   */
  get id() {
    return hash(this.url + JSON.stringify(this.params));
  }

  /**
   * @param {Object|*} response
   */
  setResponse(response) {
    this.response = response;
  }

  /**
   * @return {Object|*}
   */
  getResponse() {
    return this.response;
  }

  /**
   * @param {String|Number} version
   */
  setVersion(version) {
    this.version = version;
  }

  /**
   * @return {String|Number}
   */
  getVersion() {
    return this.version;
  }

  /**
   * @return {{url: String, params: (Object|*)}}
   */
  toJSON() {
    const data = {
      url: this.url,
      params: this.params,
    };

    if (this.response) {
      data.response = this.response;
    }

    if (this.version) {
      data.version = this.version;
    }

    return data;
  }

  /**
   * @param {Object} data
   * @return {Request}
   */
  static fromJSON(data) {
    // TODO: Add supporting for the other possible types of data
    const parts = data && data.params && data.params.body && data.params.body._parts;

    if (parts) {
      data.params.body = Request.formatToFormData(parts);
    }

    const request = new Request(data.url, data.params);

    if (data.response) {
      request.setResponse(data.response);
    }

    if (data.version) {
      request.setVersion(data.version);
    }

    return request;
  }

  /**
   * @param {Array} parts
   * @return {FormData}
   */
  static formatToFormData(parts) {
    const data = new FormData();

    parts.forEach((element) => {
      data.append(element[0], element[1]);
    });

    return data;
  }
}
