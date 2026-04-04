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
<<<<<<< HEAD
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
=======
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
  tableName: 'inscriptions',
  timestamps: false,
});
>>>>>>> d047430d198dd8a6774cb1a1badb9d212d5c473d

module.exports = Inscription;
