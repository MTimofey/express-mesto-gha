const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const NotFound = require('../errors/notFound');
const BadRequest = require('../errors/badRequest');
const ConflictError = require('../errors/conflict');
const WrongTokenError = require('../errors/wrongToken');
const {
  OK_STATUS,
  OK_CREATED_STATUS,
} = require('../errors/errors');

const getUsers = (req, res, next) => {
  User
    .find()
    .then((users) => {
      res.status(OK_STATUS).send({ data: users });
    })
    .catch(next);
};

const getUser = (req, res, next) => {
  const { userId } = req.params;
  User
    .findById(userId)
    .orFail(() => {
      throw new NotFound();
    })
    .then((user) => {
      res.status(OK_STATUS).send({ data: user });
    })
    .catch((e) => {
      if (e instanceof NotFound) {
        next(new NotFound('Пользователь с таким id не найден'));
      } else if (e instanceof mongoose.Error.CastError) {
        next(new BadRequest('Переданы некорректные данные о карточке'));
      } else {
        next(e);
      }
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  return User
    .findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });
      res.status(OK_STATUS).send({ token });
    })
    .catch(() => {
      next(new WrongTokenError('Некорректные данные! Перепроверьте почту и/или пароль'));
    });
};

const createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then(() => {
      res.status(OK_CREATED_STATUS).send({
        data: {
          name, about, avatar, email,
        },
      });
    })
    .catch((e) => {
      if (e.code === 11000) {
        next(new ConflictError('Пользователь с таким e-mail уже зарегистрирован'));
      } else if (e instanceof mongoose.Error.ValidationError) {
        const message = Object
          .values(e.errors)
          .map((error) => error.message)
          .join('; ');
        next(new BadRequest(message));
      } else {
        next(e);
      }
    });
};

const getCurrentUserInfo = (req, res, next) => {
  const userId = req.user._id;
  User
    .findById(userId)
    .orFail(() => {
      throw new NotFound();
    })
    .then((user) => {
      res.status(OK_STATUS).send({ data: user });
    })
    .catch((e) => {
      if (e instanceof NotFound) {
        next(new NotFound('Пользователь с таким id не найден'));
      } else if (e instanceof mongoose.Error.CastError) {
        next(new BadRequest('Переданы некорректные данные о карточке'));
      } else {
        next(e);
      }
    });
};

const updateUser = (req, res, next, newData) => {
  User
    .findByIdAndUpdate(
      req.user._id,
      newData,
      {
        new: true,
        runValidators: true,
        upsert: false,
      },
    )
    .orFail(() => {
      throw new NotFound();
    })
    .then((user) => {
      res.status(OK_STATUS).send({ data: user });
    })
    .catch((e) => {
      if (e instanceof NotFound) {
        next(new NotFound('Пользователь с таким id не найден'));
      } else if (e instanceof mongoose.Error.ValidationError) {
        next(new BadRequest('Переданы некорректные данные о карточке'));
      } else {
        next(e);
      }
    });
};

const updateUserInfo = (req, res, next) => {
  const { name, about } = req.body;
  return updateUser(req, res, next, { name, about });
};

const updateUserAvatar = (req, res, next) => {
  const { avatar } = req.body;
  return updateUser(req, res, next, { avatar });
};

module.exports = {
  getUsers,
  getUser,
  login,
  createUser,
  getCurrentUserInfo,
  updateUserInfo,
  updateUserAvatar,
};
