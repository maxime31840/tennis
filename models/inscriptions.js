const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Inscription = sequelize.define(
  'Inscription',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    session_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'sessions',
        key: 'id',
      },
    },
    date_inscription: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'inscriptions',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'session_id'],
      },
    ],
  }
);

module.exports = Inscription;
