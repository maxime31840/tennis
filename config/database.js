const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('tennis', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
});

module.exports = sequelize;
