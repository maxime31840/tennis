const express = require('express');
const Formateur = require('../models/formateurs');

const router = express.Router();

// 📌 Créer un formateur
router.post('/formateurs', async (req, res) => {
  try {
    const { specialite} = req.body;

    const newFormateur = await Formateur.create({ specialite});
    res.status(201).json({ success: true, message: 'Formateur créé', formateur: newFormateur });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// 📌 Récupérer tous les formateurs
router.get('/formateurs', async (req, res) => {
  try {
    const formateurs = await Formateur.findAll();
    res.json({ success: true, formateurs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// 📌 Supprimer un formateur
router.delete('/formateurs/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Formateur.destroy({ where: { id } });
    if (deleted) res.json({ success: true, message: 'Formateur supprimé.' });
    else res.status(404).json({ success: false, message: 'Formateur non trouvé.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

// 📌 Modifier un formateur
router.put('/formateurs/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { specialite} = req.body;

    const [updated] = await Formateur.update(
      { specialite},
      { where: { id } }
    );

    if (updated) {
      const updatedFormateur = await Formateur.findOne({ where: { id } });
      res.json({ success: true, message: 'Formateur mis à jour.', formateur: updatedFormateur });
    } else {
      res.status(404).json({ success: false, message: 'Formateur non trouvé.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;
