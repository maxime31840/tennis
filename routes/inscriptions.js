const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('inscriptions/index', { title: 'Liste des inscriptions' });
});

router.get('/ajouter', (req, res) => {
  res.render('inscriptions/ajouter', { title: 'Ajouter une inscription' });
});

router.get('/modifier/:id', (req, res) => {
  res.render('inscriptions/modifier', { title: 'Modifier une inscription', inscriptionId: req.params.id });
});

module.exports = router;
