const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Presence = sequelize.define(
  'Presence',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    inscription_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'inscriptions',
        key: 'id',
      },
    },
    statut: {
      type: DataTypes.ENUM('present', 'absent'),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'presences',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['inscription_id', 'date'],
      },
    ],
  }
);

module.exports = Presence;
