const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      default: 'Жак-Ив Кусто',
      validate: {
        validator: ({ length }) => length >= 2 && length <= 30,
        message: 'Имя не может быть короче 2 символов и длиннее 30 символов',
      },
    },

    about: {
      type: String,
      default: 'Исследователь',
      validate: {
        validator: ({ length }) => length >= 2 && length <= 30,
        message: 'Информация о пользователе не может быть короче 2 символов и длиннее 30 символов',
      },
    },

    avatar: {
      type: String,
      default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
      validate: {
        validator: (url) => /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/.test(url),
        message: 'Введите URL',
      },
    },

    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (email) => validator.isEmail(email),
        message: 'Введите корректный адрес электронной почты',
      },
    },

    password: {
      type: String,
      required: true,
      select: false,
      validate: {
        validator: ({ length }) => length >= 4,
        message: 'Пароль не может быть короче 4 символов',
      },
    },
  },
);

userSchema.statics.findUserByCredentials = function (email, password) {
  return this
    .findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error('Некорректные данные! Перепроверьте почту и/или пароль'));
      }

      return bcrypt
        .compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new Error('Некорректные данные! Перепроверьте почту и/или пароль'));
          }

          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
