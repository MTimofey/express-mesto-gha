const express = require('express');
const mongoose = require('mongoose');

const app = express();

const { NOT_FOUND_STATUS } = require('./errors/errors');
const { userRouter, cardRouter } = require('./routes');

const { PORT = 3000 } = process.env;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
}).then(() => {
  console.log('Connected to MongoDB');
});

app.use((req, res, next) => {
  req.user = {
    _id: '6557887deb90bd26d2f6199e',
  };

  next();
});

app.use(userRouter);
app.use(cardRouter);

app.use('*', (req, res) => {
  res.status(NOT_FOUND_STATUS).send({ message: 'Такой страницы не существует' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
