const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('tennis', 'root', '', {
  host: '127.0.0.1',
  port: 3306,
  dialect: 'mysql',
  logging: false,
});

module.exports = sequelize;
