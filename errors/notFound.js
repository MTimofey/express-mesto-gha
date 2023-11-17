const { NOT_FOUND_ERROR } = require('./errors');

class NotFound extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = NOT_FOUND_ERROR;
  }
}

module.exports = NotFound;
