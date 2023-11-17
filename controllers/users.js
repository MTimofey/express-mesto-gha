const mongoose = require('mongoose');
const User = require('../models/users');
const NotFound = require('../errors/notFound');
const {
  OK_STATUS,
  OK_CREATED_STATUS,
  BAD_REQUEST_STATUS,
  NOT_FOUND_STATUS,
  INTERNAL_SERVER_STATUS,
} = require('../errors/errors');

const getUsers = (req, res) => {
  User.find()
    .then((users) => {
      res.status(OK_STATUS).send({ data: users });
    })
    .catch(() => {
      res.status(INTERNAL_SERVER_STATUS).send({ message: 'Что-то пошло не так' });
    });
};

const getUser = (req, res) => {
  const { userId } = req.params;
  User.findById(userId)
    .orFail(() => {
      throw new NotFound();
    })
    .then((user) => {
      res.status(OK_STATUS).send({ data: user });
    })
    .catch((e) => {
      if (e instanceof NotFound) {
        res.status(NOT_FOUND_STATUS).send({ message: 'Пользователь с таким id не найден' });
      } else if (e instanceof mongoose.Error.CastError) {
        res.status(BAD_REQUEST_STATUS).send({ message: 'Переданы некорректные данные о пользователе' });
      } else {
        res.status(INTERNAL_SERVER_STATUS).send({ message: 'Что-то пошло не так' });
      }
    });
};

const createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => {
      res.status(OK_CREATED_STATUS).send({ data: user });
    })
    .catch((e) => {
      if (e instanceof mongoose.Error.ValidationError) {
        const message = Object.values(e.errors)
          .map((error) => error.message)
          .join('; ');

        res.status(BAD_REQUEST_STATUS).send({ message });
      } else {
        res.status(INTERNAL_SERVER_STATUS).send({ message: 'Что-то пошло не так' });
      }
    });
};

const updateUser = (req, res, newData) => {
  User.findByIdAndUpdate(
    req.user._id,
    newData,
    {
      new: true,
      runValidators: true,
      upsert: false,
    },
  ).orFail(() => {
    throw new NotFound();
  })
    .then((user) => {
      res.status(OK_STATUS).send({ data: user });
    })
    .catch((e) => {
      if (e instanceof NotFound) {
        res.status(NOT_FOUND_STATUS).send({ message: 'Пользователь с таким id не найден' });
      } else if (e instanceof mongoose.Error.ValidationError) {
        res.status(BAD_REQUEST_STATUS).send({ message: 'Переданы некорректные данные при обновлении аватара' });
      } else {
        res.status(INTERNAL_SERVER_STATUS).send({ message: 'Что-то пошло не так' });
      }
    });
};

const updateUserInfo = (req, res) => {
  const { name, about } = req.body;
  return updateUser(req, res, { name, about });
};

const updateUserAvatar = (req, res) => {
  const { avatar } = req.body;
  return updateUser(req, res, { avatar });
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUserInfo,
  updateUserAvatar,
};
