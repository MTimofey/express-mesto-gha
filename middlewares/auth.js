const jwt = require('jsonwebtoken');
const { UNAUTHORIZED_STATUS } = require('../errors/errors');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(UNAUTHORIZED_STATUS).send({ message: 'Некорректные данные! Перепроверьте почту и/или пароль' });
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, 'some-secret-key');
  } catch (e) {
    return res.status(UNAUTHORIZED_STATUS).send({ message: 'Некорректные данные! Перепроверьте почту и/или пароль' });
  }

  req.user = payload;

  return next();
};
