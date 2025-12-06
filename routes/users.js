var express = require('express');
var router = express.Router();
const User = require('../models/users');

/* GET users listing. */

router.get('/ajouter', (req, res) => {
  res.render('users/ajouter', { title: 'Ajouter un utilisateur' });
});

router.get('/', (req,res) => {
  res.render('users/index', { title: 'Liste des utilisateurs' });
})

router.get('/modifier/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).send('Utilisateur non trouvé');

    res.render('users/modifier', { user, title: 'Modifier l\'utilisateur' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});

module.exports = router;
