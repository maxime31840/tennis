const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Session = sequelize.define('Session', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true 
        },

    formation_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
        model: 'formations',
        key: 'id',
        },
    },
    formateur_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
        model: 'formateurs',
        key: 'id',
        },
    },
    date_debut: {
        type: DataTypes.DATE,
        allowNull: false
    },
    date_fin: {
        type: DataTypes.DATE,
        allowNull: false
    },
    lieu: {
        type: DataTypes.STRING,
        allowNull: false
    }

}, {
  tableName: 'sessions',
});

module.exports = Session;
