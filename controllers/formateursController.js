const express = require('express');
const Formateur = require('../models/formateurs');

const router = express.Router();

router.post('/formateurs', async (req, res) => {
  try {
    const { user_id, specialite } = req.body;
    const newFormateur = await Formateur.create({ user_id, specialite });
    res.status(201).json({ success: true, message: 'Formateur cree', formateur: newFormateur });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

router.get('/formateurs', async (req, res) => {
  try {
    const formateurs = await Formateur.findAll();
    res.json({ success: true, formateurs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

router.get('/formateurs/:id', async (req, res) => {
  try {
    const formateur = await Formateur.findByPk(req.params.id);
    if (!formateur) {
      return res.status(404).json({ success: false, message: 'Formateur non trouve.' });
    }
    res.json({ success: true, formateur });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

router.delete('/formateurs/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Formateur.destroy({ where: { id } });
    if (deleted) res.json({ success: true, message: 'Formateur supprime.' });
    else res.status(404).json({ success: false, message: 'Formateur non trouve.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

router.put('/formateurs/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { user_id, specialite } = req.body;
    const [updated] = await Formateur.update(
      { user_id, specialite },
      { where: { id } }
    );

    if (updated) {
      const updatedFormateur = await Formateur.findByPk(id);
      res.json({ success: true, message: 'Formateur mis a jour.', formateur: updatedFormateur });
    } else {
      res.status(404).json({ success: false, message: 'Formateur non trouve.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;
