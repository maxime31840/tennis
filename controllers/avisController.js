const express = require('express');
const Avis = require('../models/avis');

const router = express.Router();

router.post('/avis', async (req, res) => {
  try {
    const { user_id, formation_id, note, commentaire, date } = req.body;
    const newAvis = await Avis.create({ user_id, formation_id, note, commentaire, date });
    res.status(201).json({ success: true, message: 'Avis cree', avis: newAvis });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

router.get('/avis', async (req, res) => {
  try {
    const avis = await Avis.findAll();
    res.json({ success: true, avis });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

router.get('/avis/:id', async (req, res) => {
  try {
    const avis = await Avis.findByPk(req.params.id);
    if (!avis) {
      return res.status(404).json({ success: false, message: 'Avis non trouve.' });
    }
    res.json({ success: true, avis });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

router.delete('/avis/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Avis.destroy({ where: { id } });
    if (deleted) res.json({ success: true, message: 'Avis supprime.' });
    else res.status(404).json({ success: false, message: 'Avis non trouve.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

router.put('/avis/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { user_id, formation_id, note, commentaire, date } = req.body;
    const [updated] = await Avis.update(
      { user_id, formation_id, note, commentaire, date },
      { where: { id } }
    );

    if (updated) {
      const updatedAvis = await Avis.findByPk(id);
      res.json({ success: true, message: 'Avis mis a jour.', avis: updatedAvis });
    } else {
      res.status(404).json({ success: false, message: 'Avis non trouve.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;
