const Formation = require('./models/formations');
const sequelize = require('./config/database');
(async () => {
  try {
    await sequelize.authenticate();
    const count = await Formation.count();
    const all = await Formation.findAll();
    console.log('formations count=', count);
    console.log(all.map(f => ({ id: f.id, titre: f.titre })));
  } catch (err) {
    console.error('err', err);
  } finally {
    await sequelize.close();
  }
})();