const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('formations/index', { title: 'Liste des formations' });
});

router.get('/ajouter', (req, res) => {
  res.render('formations/ajouter', { title: 'Ajouter une formation' });
});

router.get('/modifier/:id', (req, res) => {
  res.render('formations/modifier', { title: 'Modifier une formation', formationId: req.params.id });
});

module.exports = router;
