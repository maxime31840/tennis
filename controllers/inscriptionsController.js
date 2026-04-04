const express = require('express');
const Inscription = require('../models/inscriptions');

const router = express.Router();

router.post('/inscriptions', async (req, res) => {
  try {
    const { user_id, session_id, date_inscription } = req.body;
    const newInscription = await Inscription.create({ user_id, session_id, date_inscription });
    res.status(201).json({ success: true, message: 'Inscription creee', inscription: newInscription });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

router.get('/inscriptions', async (req, res) => {
  try {
    const inscriptions = await Inscription.findAll();
    res.json({ success: true, inscriptions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

router.get('/inscriptions/:id', async (req, res) => {
  try {
    const inscription = await Inscription.findByPk(req.params.id);
    if (!inscription) {
      return res.status(404).json({ success: false, message: 'Inscription non trouvee.' });
    }
    res.json({ success: true, inscription });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

router.delete('/inscriptions/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Inscription.destroy({ where: { id } });
    if (deleted) res.json({ success: true, message: 'Inscription supprimee.' });
    else res.status(404).json({ success: false, message: 'Inscription non trouvee.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

router.put('/inscriptions/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { user_id, session_id, date_inscription } = req.body;
    const [updated] = await Inscription.update(
      { user_id, session_id, date_inscription },
      { where: { id } }
    );

    if (updated) {
      const updatedInscription = await Inscription.findByPk(id);
      res.json({ success: true, message: 'Inscription mise a jour.', inscription: updatedInscription });
    } else {
      res.status(404).json({ success: false, message: 'Inscription non trouvee.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;
