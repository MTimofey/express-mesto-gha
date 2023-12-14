const { NOT_OWNER_STATUS } = require('./errors');

class NotOwner extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotOwnerError';
    this.statusCode = NOT_OWNER_STATUS;
  }
}

module.exports = NotOwner;
