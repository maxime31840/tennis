<<<<<<< HEAD
const { DataTypes } = require('sequelize');
=======
const { DataTypes, DATE } = require('sequelize');
>>>>>>> d047430d198dd8a6774cb1a1badb9d212d5c473d
const sequelize = require('../config/database');

const Avis = sequelize.define(
  'Avis',
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
    formation_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'formations',
        key: 'id',
      },
    },
    note: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    commentaire: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'avis',
    timestamps: false,
  }
);

module.exports = Avis;
