const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUserInfo,
  updateUserAvatar,
} = require('../controllers/users');

const userRouter = express.Router();

userRouter.get('/users', getUsers);
userRouter.get('/users/:userId', getUser);
userRouter.post('/users', createUser);
userRouter.patch('/users/me', updateUserInfo);
userRouter.patch('/users/me/avatar', updateUserAvatar);

module.exports = userRouter;
