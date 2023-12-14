const rateLimiter = require('express-rate-limit');

const limiter = rateLimiter({
  windowMS: 60 * 1000,
  max: 100,
  message: 'Превышено количество запросов на сервер. Повторите позднее',
  headers: true,
});

module.exports = limiter;
