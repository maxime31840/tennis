const express = require('express');
const { Formation, Session, Avis } = require('../models');
const { parseId, pickDefined, handleApiError } = require('./helpers');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const formations = await Formation.findAll({
      include: [
        { model: Session, as: 'sessions' },
        { model: Avis, as: 'avis' },
      ],
      order: [['id', 'ASC']],
    });

    res.json(formations);
  } catch (error) {
    handleApiError(res, error, 500);
  }
});

router.get('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'Identifiant formation invalide.' });
  }

  try {
    const formation = await Formation.findByPk(id, {
      include: [
        { model: Session, as: 'sessions' },
        { model: Avis, as: 'avis' },
      ],
    });

    if (!formation) {
      return res.status(404).json({ message: 'Formation introuvable.' });
    }

    return res.json(formation);
  } catch (error) {
    return handleApiError(res, error, 500);
  }
});

router.post('/', async (req, res) => {
  try {
    const payload = pickDefined(req.body, ['titre', 'description']);
    const formation = await Formation.create(payload);

    res.status(201).json(formation);
  } catch (error) {
    handleApiError(res, error);
  }
});

router.put('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'Identifiant formation invalide.' });
  }

  try {
    const formation = await Formation.findByPk(id);
    if (!formation) {
      return res.status(404).json({ message: 'Formation introuvable.' });
    }

    const payload = pickDefined(req.body, ['titre', 'description']);
    await formation.update(payload);

    return res.json(formation);
  } catch (error) {
    return handleApiError(res, error);
  }
});

router.delete('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'Identifiant formation invalide.' });
  }

  try {
    const formation = await Formation.findByPk(id);
    if (!formation) {
      return res.status(404).json({ message: 'Formation introuvable.' });
    }

    await formation.destroy();
    return res.status(204).send();
  } catch (error) {
    return handleApiError(res, error, 500);
  }
});

module.exports = router;
