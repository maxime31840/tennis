const express = require('express');
const { User } = require('../models');
const { getHomeStats, requireAuth } = require('../middleware/auth');
const {
  TABLE_ROUTE_PATTERN,
  handleCreate,
  handleDelete,
  handleUpdate,
  renderTablePage,
} = require('./adminTables');

const router = express.Router();

function renderHome(res, dataError = null, statItems = []) {
  return res.render('index', {
    title: 'Tennis Academy',
    statItems,
    dataError,
  });
}

router.get('/', async (req, res) => {
  try {
    const statItems = req.currentUser ? await getHomeStats(req.currentUser) : [];
    return renderHome(res, null, statItems);
  } catch (error) {
    return renderHome(res, error.message);
  }
});

router.get(`/${TABLE_ROUTE_PATTERN}`, renderTablePage);
router.post(`/${TABLE_ROUTE_PATTERN}/create`, requireAuth, handleCreate);
router.post(`/${TABLE_ROUTE_PATTERN}/:id/update`, requireAuth, handleUpdate);
router.post(`/${TABLE_ROUTE_PATTERN}/:id/delete`, requireAuth, handleDelete);

router.get('/login', (req, res) => {
  if (req.currentUser) {
    return res.redirect('/');
  }

  return res.render('login', {
    title: 'Connexion',
    error: null,
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (req.currentUser) {
      return res.redirect('/');
    }

    const user = await User.scope('withPassword').findOne({
      where: { email, password },
    });

    if (!user) {
      return res.status(401).render('login', {
        title: 'Connexion',
        error: 'Email ou mot de passe invalide.',
      });
    }

    res.cookie('auth_user_id', String(user.id), {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 8,
      sameSite: 'lax',
    });

    return res.redirect('/');
  } catch (error) {
    return res.status(500).render('login', {
      title: 'Connexion',
      error: error.message,
    });
  }
});

router.get('/logout', (req, res) => {
  res.clearCookie('auth_user_id');
  res.redirect('/');
});

module.exports = router;
