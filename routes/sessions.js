const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('sessions/index', { title: 'Liste des sessions' });
});

router.get('/ajouter', (req, res) => {
  res.render('sessions/ajouter', { title: 'Ajouter une session' });
});

router.get('/modifier/:id', (req, res) => {
  res.render('sessions/modifier', { title: 'Modifier une session', sessionId: req.params.id });
});

module.exports = router;
