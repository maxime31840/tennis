const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Session = sequelize.define(
  'Session',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
      allowNull: false,
    },
    date_fin: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isAfterStart() {
          if (this.date_debut && this.date_fin && new Date(this.date_fin) < new Date(this.date_debut)) {
            throw new Error('La date de fin doit etre posterieure a la date de debut.');
          }
        },
      },
    },
    lieu: {
<<<<<<< HEAD
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  },
  {
    tableName: 'sessions',
    timestamps: false,
  }
);
=======
        type: DataTypes.STRING,
        allowNull: false
    }

}, {
  tableName: 'sessions',
  timestamps: false,
});
>>>>>>> d047430d198dd8a6774cb1a1badb9d212d5c473d

module.exports = Session;
