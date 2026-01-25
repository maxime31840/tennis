const express = require('express');
const Presence = require('../models/presences');

const router = express.Router();

router.post('/presences', async (req, res) => {
  try {
    const { inscription_id, statut, date } = req.body;
    const newPresence = await Presence.create({ inscription_id, statut, date });
    res.status(201).json({ success: true, message: 'Presence creee', presence: newPresence });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

router.get('/presences', async (req, res) => {
  try {
    const presences = await Presence.findAll();
    res.json({ success: true, presences });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

router.get('/presences/:id', async (req, res) => {
  try {
    const presence = await Presence.findByPk(req.params.id);
    if (!presence) {
      return res.status(404).json({ success: false, message: 'Presence non trouvee.' });
    }
    res.json({ success: true, presence });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

router.delete('/presences/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Presence.destroy({ where: { id } });
    if (deleted) res.json({ success: true, message: 'Presence supprimee.' });
    else res.status(404).json({ success: false, message: 'Presence non trouvee.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

router.put('/presences/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { inscription_id, statut, date } = req.body;
    const [updated] = await Presence.update(
      { inscription_id, statut, date },
      { where: { id } }
    );

    if (updated) {
      const updatedPresence = await Presence.findByPk(id);
      res.json({ success: true, message: 'Presence mise a jour.', presence: updatedPresence });
    } else {
      res.status(404).json({ success: false, message: 'Presence non trouvee.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;
