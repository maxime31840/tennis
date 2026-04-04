<<<<<<< HEAD
const express = require('express');
const { User, Formateur } = require('../models');
const { parseId, pickDefined, handleApiError } = require('./helpers');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        {
          model: Formateur,
          as: 'profilFormateur',
        },
      ],
      order: [['id', 'ASC']],
    });

    res.json(users);
  } catch (error) {
    handleApiError(res, error, 500);
  }
});

router.get('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'Identifiant utilisateur invalide.' });
  }

  try {
    const user = await User.findByPk(id, {
      include: [
        {
          model: Formateur,
          as: 'profilFormateur',
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    return res.json(user);
  } catch (error) {
    return handleApiError(res, error, 500);
  }
});

router.post('/', async (req, res) => {
  try {
    const payload = pickDefined(req.body, ['nom', 'prenom', 'email', 'password', 'role']);
    const user = await User.create(payload);

    res.status(201).json(user);
  } catch (error) {
    handleApiError(res, error);
  }
});

router.put('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'Identifiant utilisateur invalide.' });
  }

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    const payload = pickDefined(req.body, ['nom', 'prenom', 'email', 'password', 'role']);
    await user.update(payload);

    return res.json(user);
  } catch (error) {
    return handleApiError(res, error);
  }
});

router.delete('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'Identifiant utilisateur invalide.' });
  }

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    await user.destroy();
    return res.status(204).send();
  } catch (error) {
    return handleApiError(res, error, 500);
=======
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
>>>>>>> d047430d198dd8a6774cb1a1badb9d212d5c473d
  }
});

module.exports = router;
