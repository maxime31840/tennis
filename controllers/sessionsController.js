const express = require('express');
const Session = require('../models/sessions');

const router = express.Router();

router.post('/sessions', async (req, res) => {
  try {
    const { formation_id, formateur_id, date_debut, date_fin, lieu } = req.body;
    const newSession = await Session.create({ formation_id, formateur_id, date_debut, date_fin, lieu });
    res.status(201).json({ success: true, message: 'Session creee', session: newSession });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

router.get('/sessions', async (req, res) => {
  try {
    const sessions = await Session.findAll();
    res.json({ success: true, sessions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

router.get('/sessions/:id', async (req, res) => {
  try {
    const session = await Session.findByPk(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session non trouvee.' });
    }
    res.json({ success: true, session });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

router.delete('/sessions/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Session.destroy({ where: { id } });
    if (deleted) res.json({ success: true, message: 'Session supprimee.' });
    else res.status(404).json({ success: false, message: 'Session non trouvee.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

router.put('/sessions/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { formation_id, formateur_id, date_debut, date_fin, lieu } = req.body;
    const [updated] = await Session.update(
      { formation_id, formateur_id, date_debut, date_fin, lieu },
      { where: { id } }
    );

    if (updated) {
      const updatedSession = await Session.findByPk(id);
      res.json({ success: true, message: 'Session mise a jour.', session: updatedSession });
    } else {
      res.status(404).json({ success: false, message: 'Session non trouvee.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;
