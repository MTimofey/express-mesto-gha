const mongoose = require('mongoose');
const Card = require('../models/cards');
const NotFound = require('../errors/notFound');
const NotOwner = require('../errors/notOwner');
const {
  OK_STATUS,
  OK_CREATED_STATUS,
  BAD_REQUEST_STATUS,
  NOT_OWNER_STATUS,
  NOT_FOUND_STATUS,
} = require('../errors/errors');

const getCards = (req, res, next) => {
  Card.find({})
    .populate(['owner', 'likes'])
    .then((cards) => {
      res.status(OK_STATUS).send({ data: cards });
    })
    .catch(next);
};

const createCard = (req, res, next) => {
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
        next(e);
      }
    });
};

const deleteCard = (req, res, next) => {
  const { cardId } = req.params;
  const ownerId = req.user._id;
  Card
    .findByIdAndRemove(cardId)
    .orFail(() => {
      throw new NotFound();
    })
    .populate(['owner', 'likes'])
    .then((card) => {
      if (!card.owner.equals(ownerId)) {
        throw new NotOwner();
      } else {
        res.status(OK_STATUS).send({ data: card });
      }
    })
    .catch((e) => {
      if (e instanceof NotFound) {
        res.status(NOT_FOUND_STATUS).send({ message: 'Карточка не найдена' });
      } else if (e instanceof mongoose.Error.CastError) {
        res.status(BAD_REQUEST_STATUS).send({ message: 'Переданы некорректные данные о карточке' });
      } else if (e instanceof NotOwner) {
        res.status(NOT_OWNER_STATUS).send({ message: 'Невозможно удалить чужую карточку' });
      } else {
        next(e);
      }
    });
};

const updateCardLike = (req, res, next, newData, statusCode) => {
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
        next(e);
      }
    });
};

const setLike = (req, res, next) => {
  const newLike = { $addToSet: { likes: req.user._id } };
  return updateCardLike(req, res, next, newLike, OK_CREATED_STATUS);
};

const removeLike = (req, res, next) => {
  const likeToRemove = { $pull: { likes: req.user._id } };
  return updateCardLike(req, res, next, likeToRemove, OK_STATUS);
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  setLike,
  removeLike,
};
