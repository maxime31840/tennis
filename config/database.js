const { Sequelize } = require('sequelize');

<<<<<<< HEAD
const sequelize = new Sequelize(
  process.env.DB_NAME || 'tennis',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    dialect: 'mysql',
    logging: false,
  }
);
=======
const sequelize = new Sequelize('tennis', 'root', '', {
  host: '127.0.0.1',
  port: 3306,
  dialect: 'mysql',
  logging: false,
});
>>>>>>> d047430d198dd8a6774cb1a1badb9d212d5c473d

module.exports = sequelize;
