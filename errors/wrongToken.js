const { UNAUTHORIZED_STATUS } = require('./errors');

class WrongTokenError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = UNAUTHORIZED_STATUS;
  }
}

module.exports = WrongTokenError;
