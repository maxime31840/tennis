const sequelize = require('../config/database');
const User = require('./users');
const Formateur = require('./formateurs');
const Formation = require('./formations');
const Session = require('./sessions');
const Inscription = require('./inscriptions');
const Presence = require('./presences');
const Avis = require('./avis');

User.hasOne(Formateur, {
  foreignKey: 'user_id',
  as: 'profilFormateur',
});
Formateur.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

Formation.hasMany(Session, {
  foreignKey: 'formation_id',
  as: 'sessions',
});
Session.belongsTo(Formation, {
  foreignKey: 'formation_id',
  as: 'formation',
});

Formateur.hasMany(Session, {
  foreignKey: 'formateur_id',
  as: 'sessions',
});
Session.belongsTo(Formateur, {
  foreignKey: 'formateur_id',
  as: 'formateur',
});

User.hasMany(Inscription, {
  foreignKey: 'user_id',
  as: 'inscriptions',
});
Inscription.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

Session.hasMany(Inscription, {
  foreignKey: 'session_id',
  as: 'inscriptions',
});
Inscription.belongsTo(Session, {
  foreignKey: 'session_id',
  as: 'session',
});

Inscription.hasMany(Presence, {
  foreignKey: 'inscription_id',
  as: 'presences',
});
Presence.belongsTo(Inscription, {
  foreignKey: 'inscription_id',
  as: 'inscription',
});

User.hasMany(Avis, {
  foreignKey: 'user_id',
  as: 'avis',
});
Avis.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

Formation.hasMany(Avis, {
  foreignKey: 'formation_id',
  as: 'avis',
});
Avis.belongsTo(Formation, {
  foreignKey: 'formation_id',
  as: 'formation',
});

async function initializeDatabase() {
  try {
    await sequelize.authenticate();

    if (process.env.DB_SYNC === 'true') {
      await sequelize.sync();
    }

    return true;
  } catch (error) {
    console.error('Connexion MySQL indisponible:', error.message);
    return false;
  }
}

module.exports = {
  sequelize,
  User,
  Formateur,
  Formation,
  Session,
  Inscription,
  Presence,
  Avis,
  initializeDatabase,
};
