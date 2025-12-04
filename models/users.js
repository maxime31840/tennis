const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true 
        },

    nom: { 
        type: DataTypes.STRING,
        allowNull: false, 
        },
    prenom: {
        type: DataTypes.STRING,
        allowNull: false
        },
    email: {
        type: DataTypes.STRING,
        allowNull: false, 
        unique: true 
    },
    password: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    role: { 
        type: DataTypes.ENUM('admin', 'formateur', 'apprenant'), 
        allowNull: false,
    },
}, {
  tableName: 'users',
  timestamps: false,
});

module.exports = User;
