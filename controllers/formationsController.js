const express = require('express');
const Formation = require('../models/formations');

const router = express.Router();

router.post('/formations', async (req, res) => {
  try {
    const { titre, description } = req.body;
    const newFormation = await Formation.create({ titre, description });
    res.status(201).json({ success: true, message: 'Formation creee', formation: newFormation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

router.get('/formations', async (req, res) => {
  try {
    const formations = await Formation.findAll();
    res.json({ success: true, formations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

router.get('/formations/:id', async (req, res) => {
  try {
    const formation = await Formation.findByPk(req.params.id);
    if (!formation) {
      return res.status(404).json({ success: false, message: 'Formation non trouvee.' });
    }
    res.json({ success: true, formation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

router.delete('/formations/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Formation.destroy({ where: { id } });
    if (deleted) res.json({ success: true, message: 'Formation supprimee.' });
    else res.status(404).json({ success: false, message: 'Formation non trouvee.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

router.put('/formations/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { titre, description } = req.body;
    const [updated] = await Formation.update(
      { titre, description },
      { where: { id } }
    );

    if (updated) {
      const updatedFormation = await Formation.findByPk(id);
      res.json({ success: true, message: 'Formation mise a jour.', formation: updatedFormation });
    } else {
      res.status(404).json({ success: false, message: 'Formation non trouvee.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;
