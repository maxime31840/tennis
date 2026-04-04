const express = require('express');
<<<<<<< HEAD
const { Inscription, User, Session, Formation, Formateur } = require('../models');
const { parseId, pickDefined, handleApiError } = require('./helpers');

const router = express.Router();

const inscriptionIncludes = [
  { model: User, as: 'user' },
  {
    model: Session,
    as: 'session',
    include: [
      { model: Formation, as: 'formation' },
      {
        model: Formateur,
        as: 'formateur',
        include: [{ model: User, as: 'user' }],
      },
    ],
  },
];

router.get('/', async (req, res) => {
  try {
    const inscriptions = await Inscription.findAll({
      include: inscriptionIncludes,
      order: [['date_inscription', 'DESC']],
    });

    res.json(inscriptions);
  } catch (error) {
    handleApiError(res, error, 500);
  }
});

router.get('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'Identifiant inscription invalide.' });
  }

  try {
    const inscription = await Inscription.findByPk(id, {
      include: inscriptionIncludes,
    });

    if (!inscription) {
      return res.status(404).json({ message: 'Inscription introuvable.' });
    }

    return res.json(inscription);
  } catch (error) {
    return handleApiError(res, error, 500);
  }
});

router.post('/', async (req, res) => {
  try {
    const payload = pickDefined(req.body, ['user_id', 'session_id', 'date_inscription']);

    const [user, session] = await Promise.all([
      User.findByPk(payload.user_id),
      Session.findByPk(payload.session_id),
    ]);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    if (!session) {
      return res.status(404).json({ message: 'Session introuvable.' });
    }

    const inscription = await Inscription.create(payload);
    return res.status(201).json(inscription);
  } catch (error) {
    return handleApiError(res, error);
  }
});

router.put('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'Identifiant inscription invalide.' });
  }

  try {
    const inscription = await Inscription.findByPk(id);
    if (!inscription) {
      return res.status(404).json({ message: 'Inscription introuvable.' });
    }

    const payload = pickDefined(req.body, ['user_id', 'session_id', 'date_inscription']);

    if (payload.user_id) {
      const user = await User.findByPk(payload.user_id);
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur introuvable.' });
      }
    }

    if (payload.session_id) {
      const session = await Session.findByPk(payload.session_id);
      if (!session) {
        return res.status(404).json({ message: 'Session introuvable.' });
      }
    }

    await inscription.update(payload);
    return res.json(inscription);
  } catch (error) {
    return handleApiError(res, error);
  }
});

router.delete('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'Identifiant inscription invalide.' });
  }

  try {
    const inscription = await Inscription.findByPk(id);
    if (!inscription) {
      return res.status(404).json({ message: 'Inscription introuvable.' });
    }

    await inscription.destroy();
    return res.status(204).send();
  } catch (error) {
    return handleApiError(res, error, 500);
  }
=======
const router = express.Router();

router.get('/', (req, res) => {
  res.render('inscriptions/index', { title: 'Liste des inscriptions' });
});

router.get('/ajouter', (req, res) => {
  res.render('inscriptions/ajouter', { title: 'Ajouter une inscription' });
});

router.get('/modifier/:id', (req, res) => {
  res.render('inscriptions/modifier', { title: 'Modifier une inscription', inscriptionId: req.params.id });
>>>>>>> d047430d198dd8a6774cb1a1badb9d212d5c473d
});

module.exports = router;
