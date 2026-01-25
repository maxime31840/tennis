const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('presences/index', { title: 'Liste des presences' });
});

router.get('/ajouter', (req, res) => {
  res.render('presences/ajouter', { title: 'Ajouter une presence' });
});

router.get('/modifier/:id', (req, res) => {
  res.render('presences/modifier', { title: 'Modifier une presence', presenceId: req.params.id });
});

module.exports = router;
