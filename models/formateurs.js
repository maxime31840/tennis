const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

<<<<<<< HEAD
const Formateur = sequelize.define(
  'Formateur',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    specialite: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: 'formateurs',
    timestamps: false,
  }
);
=======
const Formateur = sequelize.define('Formateur', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  specialite: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'formateurs',
  timestamps: false,
});
>>>>>>> d047430d198dd8a6774cb1a1badb9d212d5c473d

module.exports = Formateur;
