const express = require('express');
const {
  getCards,
  createCard,
  deleteCard,
  setLike,
  removeLike,
} = require('../controllers/cards');

const cardRouter = express.Router();

cardRouter.get('/cards', getCards);
cardRouter.post('/cards', createCard);
cardRouter.delete('/cards/:cardId', deleteCard);
cardRouter.put('/cards/:cardId/likes', setLike);
cardRouter.delete('/cards/:cardId/likes', removeLike);

module.exports = cardRouter;
