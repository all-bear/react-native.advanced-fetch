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

  static fromJSON(data) {
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

  static formatToFormData(parts) {
    const data = new FormData();

    parts.forEach(element => {
      data.append(element[0], element[1])
    });

    return data;
  }
}
