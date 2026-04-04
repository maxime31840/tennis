const express = require('express');
<<<<<<< HEAD
const { Formateur, User } = require('../models');
const { parseId, pickDefined, handleApiError } = require('./helpers');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const formateurs = await Formateur.findAll({
      include: [
        {
          model: User,
          as: 'user',
        },
      ],
      order: [['id', 'ASC']],
    });

    res.json(formateurs);
  } catch (error) {
    handleApiError(res, error, 500);
  }
});

router.get('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'Identifiant formateur invalide.' });
  }

  try {
    const formateur = await Formateur.findByPk(id, {
      include: [{ model: User, as: 'user' }],
    });

    if (!formateur) {
      return res.status(404).json({ message: 'Formateur introuvable.' });
    }

    return res.json(formateur);
  } catch (error) {
    return handleApiError(res, error, 500);
  }
});

router.post('/', async (req, res) => {
  try {
    const payload = pickDefined(req.body, ['user_id', 'specialite']);
    const user = await User.findByPk(payload.user_id);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur associe introuvable.' });
    }

    if (user.role !== 'formateur') {
      return res.status(400).json({ message: "L'utilisateur doit avoir le role formateur." });
    }

    const formateur = await Formateur.create(payload);
    return res.status(201).json(formateur);
  } catch (error) {
    return handleApiError(res, error);
  }
});

router.put('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'Identifiant formateur invalide.' });
  }

  try {
    const formateur = await Formateur.findByPk(id);
    if (!formateur) {
      return res.status(404).json({ message: 'Formateur introuvable.' });
    }

    const payload = pickDefined(req.body, ['user_id', 'specialite']);
    if (payload.user_id) {
      const user = await User.findByPk(payload.user_id);
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur associe introuvable.' });
      }
      if (user.role !== 'formateur') {
        return res.status(400).json({ message: "L'utilisateur doit avoir le role formateur." });
      }
    }

    await formateur.update(payload);
    return res.json(formateur);
  } catch (error) {
    return handleApiError(res, error);
  }
});

router.delete('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'Identifiant formateur invalide.' });
  }

  try {
    const formateur = await Formateur.findByPk(id);
    if (!formateur) {
      return res.status(404).json({ message: 'Formateur introuvable.' });
    }

    await formateur.destroy();
    return res.status(204).send();
  } catch (error) {
    return handleApiError(res, error, 500);
  }
=======
const router = express.Router();

router.get('/', (req, res) => {
  res.render('formateurs/index', { title: 'Liste des formateurs' });
});

router.get('/ajouter', (req, res) => {
  res.render('formateurs/ajouter', { title: 'Ajouter un formateur' });
});

router.get('/modifier/:id', (req, res) => {
  res.render('formateurs/modifier', { title: 'Modifier un formateur', formateurId: req.params.id });
>>>>>>> d047430d198dd8a6774cb1a1badb9d212d5c473d
});

module.exports = router;
