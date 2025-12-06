const express = require('express');
const User = require('../models/users')

const router = express.Router();
const bcrypt = require('bcrypt');

router.post('/user', async (req, res) => {
  try {
    const { nom, prenom, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      nom, prenom, email, password: hashedPassword, role
    });

    res.status(201).json({ success: true, message: 'Utilisateur créé', user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json({ success: true, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

router.delete('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const deleted = await User.destroy({ where: { id: userId } });
    if (deleted) {
      res.json({ success: true, message: 'Utilisateur supprimé.' });
    } else {
      res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

router.put('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const { nom, prenom, email, role } = req.body;
    const [updated] = await User.update(
      { nom, prenom, email, role },
      { where: { id: userId } }
    );

    if (updated) {
      const updatedUser = await User.findOne({ where: { id: userId } });
      res.json({ success: true, message: 'Utilisateur mis à jour.', user: updatedUser });
    } else {
      res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

module.exports = router;