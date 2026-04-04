const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Formation = sequelize.define(
  'Formation',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    titre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: 'formations',
    timestamps: false,
  }
);

module.exports = Formation;
