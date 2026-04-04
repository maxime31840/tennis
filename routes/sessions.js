const express = require('express');
const { Session, Formation, Formateur, User } = require('../models');
const { parseId, pickDefined, handleApiError } = require('./helpers');

const router = express.Router();

const sessionIncludes = [
  { model: Formation, as: 'formation' },
  {
    model: Formateur,
    as: 'formateur',
    include: [{ model: User, as: 'user' }],
  },
];

router.get('/', async (req, res) => {
  try {
    const sessions = await Session.findAll({
      include: sessionIncludes,
      order: [['date_debut', 'ASC']],
    });

    res.json(sessions);
  } catch (error) {
    handleApiError(res, error, 500);
  }
});

router.get('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'Identifiant session invalide.' });
  }

  try {
    const session = await Session.findByPk(id, {
      include: sessionIncludes,
    });

    if (!session) {
      return res.status(404).json({ message: 'Session introuvable.' });
    }

    return res.json(session);
  } catch (error) {
    return handleApiError(res, error, 500);
  }
});

router.post('/', async (req, res) => {
  try {
    const payload = pickDefined(req.body, ['formation_id', 'formateur_id', 'date_debut', 'date_fin', 'lieu']);

    const [formation, formateur] = await Promise.all([
      Formation.findByPk(payload.formation_id),
      Formateur.findByPk(payload.formateur_id),
    ]);

    if (!formation) {
      return res.status(404).json({ message: 'Formation associee introuvable.' });
    }

    if (!formateur) {
      return res.status(404).json({ message: 'Formateur associe introuvable.' });
    }

    const session = await Session.create(payload);
    return res.status(201).json(session);
  } catch (error) {
    return handleApiError(res, error);
  }
});

router.put('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'Identifiant session invalide.' });
  }

  try {
    const session = await Session.findByPk(id);
    if (!session) {
      return res.status(404).json({ message: 'Session introuvable.' });
    }

    const payload = pickDefined(req.body, ['formation_id', 'formateur_id', 'date_debut', 'date_fin', 'lieu']);

    if (payload.formation_id) {
      const formation = await Formation.findByPk(payload.formation_id);
      if (!formation) {
        return res.status(404).json({ message: 'Formation associee introuvable.' });
      }
    }

    if (payload.formateur_id) {
      const formateur = await Formateur.findByPk(payload.formateur_id);
      if (!formateur) {
        return res.status(404).json({ message: 'Formateur associe introuvable.' });
      }
    }

    await session.update(payload);
    return res.json(session);
  } catch (error) {
    return handleApiError(res, error);
  }
});

router.delete('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'Identifiant session invalide.' });
  }

  try {
    const session = await Session.findByPk(id);
    if (!session) {
      return res.status(404).json({ message: 'Session introuvable.' });
    }

    await session.destroy();
    return res.status(204).send();
  } catch (error) {
    return handleApiError(res, error, 500);
  }
});

module.exports = router;
