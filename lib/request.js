import hash from 'string-hash';

export default class Request {
  constructor(url, params) {
    this.url = url;
    this.params = params;
    this.response = null;
    this.version = null;
  }

  get id() {
    return hash(this.url + JSON.stringify(this.params));
  }

  setResponse(response) {
    this.response = response;
  }

  getResponse() {
    return this.response;
  }

  setVersion(version) {
    this.version = version;
  }

  getVersion() {
    return this.version;
  }

  toJSON() {
    const data = {
      url: this.url,
      params: this.params
    };

    if (this.response) {
      data.response = this.response;
    }

    if (this.version) {
      data.version = this.version;
    }

    return data;
  }

  static fromJSON(json) {
    const data = JSON.parse(json);

    const request = new Request(data.url, data.params);

    if (data.response) {
      request.setResponse(data.response);
    }

    return request;
  }
}