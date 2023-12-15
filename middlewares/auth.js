const jwt = require('jsonwebtoken');
const WrongToken = require('../errors/wrongToken');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new WrongToken('Некорректные данные! Перепроверьте почту и/или пароль'));
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, 'some-secret-key');
  } catch (e) {
    return next(new WrongToken('Некорректные данные! Перепроверьте почту и/или пароль'));
  }

  req.user = payload;

  return next();
};
