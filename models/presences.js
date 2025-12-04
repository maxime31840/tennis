const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Presence = sequelize.define('Presence', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true 
        },
    inscription_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
        model: 'users',
        key: 'id',
        },
    },
    statut: {
        type: DataTypes.ENUM('present', 'absent'), 
        allowNull: false, 
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
  tableName: 'presences',
  timestamps: false,
});

module.exports = Presence;
