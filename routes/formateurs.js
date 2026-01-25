const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('formateurs/index', { title: 'Liste des formateurs' });
});

router.get('/ajouter', (req, res) => {
  res.render('formateurs/ajouter', { title: 'Ajouter un formateur' });
});

router.get('/modifier/:id', (req, res) => {
  res.render('formateurs/modifier', { title: 'Modifier un formateur', formateurId: req.params.id });
});

module.exports = router;
