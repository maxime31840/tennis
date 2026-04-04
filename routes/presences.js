const express = require('express');
const { Presence, Inscription, User, Session } = require('../models');
const { parseId, pickDefined, handleApiError } = require('./helpers');

const router = express.Router();

const presenceIncludes = [
  {
    model: Inscription,
    as: 'inscription',
    include: [
      { model: User, as: 'user' },
      { model: Session, as: 'session' },
    ],
  },
];

router.get('/', async (req, res) => {
  try {
    const presences = await Presence.findAll({
      include: presenceIncludes,
      order: [['date', 'DESC']],
    });

    res.json(presences);
  } catch (error) {
    handleApiError(res, error, 500);
  }
});

router.get('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'Identifiant presence invalide.' });
  }

  try {
    const presence = await Presence.findByPk(id, {
      include: presenceIncludes,
    });

    if (!presence) {
      return res.status(404).json({ message: 'Presence introuvable.' });
    }

    return res.json(presence);
  } catch (error) {
    return handleApiError(res, error, 500);
  }
});

router.post('/', async (req, res) => {
  try {
    const payload = pickDefined(req.body, ['inscription_id', 'statut', 'date']);
    const inscription = await Inscription.findByPk(payload.inscription_id);

    if (!inscription) {
      return res.status(404).json({ message: 'Inscription associee introuvable.' });
    }

    const presence = await Presence.create(payload);
    return res.status(201).json(presence);
  } catch (error) {
    return handleApiError(res, error);
  }
});

router.put('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'Identifiant presence invalide.' });
  }

  try {
    const presence = await Presence.findByPk(id);
    if (!presence) {
      return res.status(404).json({ message: 'Presence introuvable.' });
    }

    const payload = pickDefined(req.body, ['inscription_id', 'statut', 'date']);
    if (payload.inscription_id) {
      const inscription = await Inscription.findByPk(payload.inscription_id);
      if (!inscription) {
        return res.status(404).json({ message: 'Inscription associee introuvable.' });
      }
    }

    await presence.update(payload);
    return res.json(presence);
  } catch (error) {
    return handleApiError(res, error);
  }
});

router.delete('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'Identifiant presence invalide.' });
  }

  try {
    const presence = await Presence.findByPk(id);
    if (!presence) {
      return res.status(404).json({ message: 'Presence introuvable.' });
    }

    await presence.destroy();
    return res.status(204).send();
  } catch (error) {
    return handleApiError(res, error, 500);
  }
});

module.exports = router;
