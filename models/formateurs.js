const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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

module.exports = Formateur;
