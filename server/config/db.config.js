const dotenv = require('dotenv').config();
const environment = process.env.NODE_ENV || 'development';

module.exports = {
  [environment]: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'mysql',
  },
};
