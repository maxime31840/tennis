const { DataTypes, DATE } = require('sequelize');
const sequelize = require('../config/db');

const Avis = sequelize.define('Avis', {
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
        allowNull: false
    },
    commentaire: {
        type: DataTypes.STRING,
        allowNull: true
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    }

}, {
  tableName: 'avis',
  timestamps: false,
});

module.exports = Avis;
