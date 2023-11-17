const { BAD_REQUEST_ERROR } = require('./errors');

class BadRequest extends Error {
  constructor(message) {
    super(message);
    this.statusCode = BAD_REQUEST_ERROR;
  }
}

module.exports = BadRequest;
