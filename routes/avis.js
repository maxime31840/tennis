const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('avis/index', { title: 'Liste des avis' });
});

router.get('/ajouter', (req, res) => {
  res.render('avis/ajouter', { title: 'Ajouter un avis' });
});

router.get('/modifier/:id', (req, res) => {
  res.render('avis/modifier', { title: 'Modifier un avis', avisId: req.params.id });
});

module.exports = router;
