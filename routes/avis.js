const express = require('express');
const { Avis, User, Formation } = require('../models');
const { parseId, pickDefined, handleApiError } = require('./helpers');

const router = express.Router();

const avisIncludes = [
  { model: User, as: 'user' },
  { model: Formation, as: 'formation' },
];

router.get('/', async (req, res) => {
  try {
    const avis = await Avis.findAll({
      include: avisIncludes,
      order: [['date', 'DESC']],
    });

    res.json(avis);
  } catch (error) {
    handleApiError(res, error, 500);
  }
});

router.get('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'Identifiant avis invalide.' });
  }

  try {
    const avis = await Avis.findByPk(id, {
      include: avisIncludes,
    });

    if (!avis) {
      return res.status(404).json({ message: 'Avis introuvable.' });
    }

    return res.json(avis);
  } catch (error) {
    return handleApiError(res, error, 500);
  }
});

router.post('/', async (req, res) => {
  try {
    const payload = pickDefined(req.body, ['user_id', 'formation_id', 'note', 'commentaire', 'date']);

    const [user, formation] = await Promise.all([
      User.findByPk(payload.user_id),
      Formation.findByPk(payload.formation_id),
    ]);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    if (!formation) {
      return res.status(404).json({ message: 'Formation introuvable.' });
    }

    const avis = await Avis.create(payload);
    return res.status(201).json(avis);
  } catch (error) {
    return handleApiError(res, error);
  }
});

router.put('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'Identifiant avis invalide.' });
  }

  try {
    const avis = await Avis.findByPk(id);
    if (!avis) {
      return res.status(404).json({ message: 'Avis introuvable.' });
    }

    const payload = pickDefined(req.body, ['user_id', 'formation_id', 'note', 'commentaire', 'date']);

    if (payload.user_id) {
      const user = await User.findByPk(payload.user_id);
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur introuvable.' });
      }
    }

    if (payload.formation_id) {
      const formation = await Formation.findByPk(payload.formation_id);
      if (!formation) {
        return res.status(404).json({ message: 'Formation introuvable.' });
      }
    }

    await avis.update(payload);
    return res.json(avis);
  } catch (error) {
    return handleApiError(res, error);
  }
});

router.delete('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ message: 'Identifiant avis invalide.' });
  }

  try {
    const avis = await Avis.findByPk(id);
    if (!avis) {
      return res.status(404).json({ message: 'Avis introuvable.' });
    }

    await avis.destroy();
    return res.status(204).send();
  } catch (error) {
    return handleApiError(res, error, 500);
  }
});

module.exports = router;
