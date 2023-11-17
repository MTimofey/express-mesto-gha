const mongoose = require('mongoose');
const Card = require('../models/cards');
const NotFound = require('../errors/notFound');
const {
  OK_STATUS,
  OK_CREATED_STATUS,
  BAD_REQUEST_STATUS,
  NOT_FOUND_STATUS,
  INTERNAL_SERVER_STATUS,
} = require('../errors/errors');

const getCards = (req, res) => {
  Card.find({})
    .populate(['owner', 'likes'])
    .then((cards) => {
      res.status(OK_STATUS).send({ data: cards });
    })
    .catch(() => {
      res.status(INTERNAL_SERVER_STATUS).send({ message: 'Что-то пошло не так' });
    });
};

const createCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => {
      res.status(OK_CREATED_STATUS).send({ data: card });
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

const deleteCard = (req, res) => {
  const { cardId } = req.params;
  Card.findByIdAndRemove(cardId)
    .orFail(() => {
      throw new NotFound();
    })
    .populate(['owner', 'likes'])
    .then((card) => {
      res.status(OK_STATUS).send({ data: card });
    })
    .catch((e) => {
      if (e instanceof NotFound) {
        res.status(NOT_FOUND_STATUS).send({ message: 'Карточка не найдена' });
      } else if (e instanceof mongoose.Error.CastError) {
        res.status(BAD_REQUEST_STATUS).send({ message: 'Переданы некорректные данные о карточке' });
      } else {
        res.status(INTERNAL_SERVER_STATUS).send({ message: 'Что-то пошло не так' });
      }
    });
};

const updateCardLike = (req, res, newData, statusCode) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    newData,
    { new: true },
  ).orFail(() => {
    throw new NotFound();
  })
    .populate(['owner', 'likes'])
    .then((card) => {
      res.status(statusCode).send({ data: card });
    })
    .catch((e) => {
      if (e instanceof NotFound) {
        res.status(NOT_FOUND_STATUS).send({ message: 'Карточка не найдена' });
      } else if (e instanceof mongoose.Error.CastError) {
        res.status(BAD_REQUEST_STATUS).send({ message: 'Переданы некорректные данные о карточке' });
      } else {
        res.status(INTERNAL_SERVER_STATUS).send({ message: 'Что-то пошло не так' });
      }
    });
};

const setLike = (req, res) => {
  const newLike = { $addToSet: { likes: req.user._id } }; // добавить _id в массив, если его там нет
  return updateCardLike(req, res, newLike, OK_CREATED_STATUS);
};

const removeLike = (req, res) => {
  const likeToRemove = { $pull: { likes: req.user._id } }; // убрать _id из массива
  return updateCardLike(req, res, likeToRemove, OK_STATUS);
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  setLike,
  removeLike,
};
