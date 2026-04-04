const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Formation = sequelize.define(
  'Formation',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    titre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    description: {
<<<<<<< HEAD
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: 'formations',
    timestamps: false,
  }
);
=======
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    }

}, {
  tableName: 'formations',
  timestamps: false,
});
>>>>>>> d047430d198dd8a6774cb1a1badb9d212d5c473d

module.exports = Formation;
